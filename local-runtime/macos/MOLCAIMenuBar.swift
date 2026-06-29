import AppKit
import Foundation

private let appSupportDirectory = "\(NSHomeDirectory())/Library/Application Support/MOLC-AI"
private let runtimeDirectory = "\(appSupportDirectory)/runtime"
private let launchAgentPath = "\(NSHomeDirectory())/Library/LaunchAgents/com.waynetechlab.molc-ai.menubar.plist"
private let launchAgentLabel = "com.waynetechlab.molc-ai.menubar"
private let menuAppPath = "\(NSHomeDirectory())/Applications/MOLC-AI Menu.app"
private let startScriptPath = "\(runtimeDirectory)/scripts/start-runtime.sh"
private let stopScriptPath = "\(runtimeDirectory)/scripts/stop-runtime.sh"
private let logsPath = "\(runtimeDirectory)/logs"
private let webBaseURL = URL(string: "http://127.0.0.1:4173")!
private let webHealthURL = URL(string: "http://127.0.0.1:4173/health")!
private let agentHealthURL = URL(string: "http://127.0.0.1:8787/health")!
private let ollamaHealthURL = URL(string: "http://127.0.0.1:11434/api/tags")!
private let bundleIdentifier = "com.waynetechlab.molc-ai-menubar"

private struct ServiceState {
  var webOnline = false
  var agentOnline = false
  var ollamaOnline = false
}

final class AppDelegate: NSObject, NSApplicationDelegate {
  private let defaults = UserDefaults.standard
  private let fileManager = FileManager.default
  private let statusItem = NSStatusBar.system.statusItem(withLength: NSStatusItem.variableLength)
  private let menu = NSMenu()
  private let statusSummaryItem = NSMenuItem(title: "Checking services…", action: nil, keyEquivalent: "")
  private let webStatusItem = NSMenuItem(title: "Web runtime: checking…", action: nil, keyEquivalent: "")
  private let agentStatusItem = NSMenuItem(title: "Local agent: checking…", action: nil, keyEquivalent: "")
  private let ollamaStatusItem = NSMenuItem(title: "Ollama: checking…", action: nil, keyEquivalent: "")
  private let launchAtLoginItem = NSMenuItem(title: "Launch at Login", action: #selector(toggleLaunchAtLogin), keyEquivalent: "")
  private let autoStartItem = NSMenuItem(title: "Auto-Start Services", action: #selector(toggleAutoStart), keyEquivalent: "")
  private var launchAtLoginEnabled = false
  private var timer: Timer?

  func applicationDidFinishLaunching(_ notification: Notification) {
    NSApp.setActivationPolicy(.accessory)
    buildMenu()
    launchAtLoginEnabled = fileManager.fileExists(atPath: launchAgentPath)
    syncToggleStates()
    if autoStartServicesEnabled {
      _ = runScript(at: startScriptPath)
    }
    refreshStatus()
    timer = Timer.scheduledTimer(withTimeInterval: 8, repeats: true) { [weak self] _ in
      self?.refreshStatus()
    }
  }

  func applicationWillTerminate(_ notification: Notification) {
    timer?.invalidate()
  }

  private var autoStartServicesEnabled: Bool {
    get { defaults.object(forKey: "AutoStartServices") as? Bool ?? true }
    set { defaults.set(newValue, forKey: "AutoStartServices") }
  }

  private func buildMenu() {
    if let button = statusItem.button {
      button.title = "MOLC-AI"
      button.imagePosition = .imageLeading
      if let image = NSImage(systemSymbolName: "cpu", accessibilityDescription: "MOLC-AI") {
        button.image = image
      }
    }

    [statusSummaryItem, webStatusItem, agentStatusItem, ollamaStatusItem].forEach {
      $0.isEnabled = false
      menu.addItem($0)
    }

    menu.addItem(.separator())
    menu.addItem(item("Open Dashboard", action: #selector(openDashboard), keyEquivalent: "d"))
    menu.addItem(item("Open Chat", action: #selector(openChat), keyEquivalent: "c"))
    menu.addItem(item("Open Local Machine", action: #selector(openLocalMachine), keyEquivalent: "m"))
    menu.addItem(.separator())
    menu.addItem(item("Start Services", action: #selector(startServices), keyEquivalent: "s"))
    menu.addItem(item("Stop Services", action: #selector(stopServices), keyEquivalent: "x"))
    menu.addItem(item("Restart Services", action: #selector(restartServices), keyEquivalent: "r"))
    menu.addItem(.separator())
    launchAtLoginItem.target = self
    autoStartItem.target = self
    menu.addItem(launchAtLoginItem)
    menu.addItem(autoStartItem)
    menu.addItem(.separator())
    menu.addItem(item("Open Logs", action: #selector(openLogs), keyEquivalent: "l"))
    menu.addItem(item("Reveal Install Folder", action: #selector(revealInstallFolder), keyEquivalent: "i"))
    menu.addItem(.separator())
    menu.addItem(item("Quit", action: #selector(quitApp), keyEquivalent: "q"))

    statusItem.menu = menu
  }

  private func item(_ title: String, action: Selector, keyEquivalent: String) -> NSMenuItem {
    let menuItem = NSMenuItem(title: title, action: action, keyEquivalent: keyEquivalent)
    menuItem.target = self
    return menuItem
  }

  private func syncToggleStates() {
    launchAtLoginItem.state = launchAtLoginEnabled ? .on : .off
    autoStartItem.state = autoStartServicesEnabled ? .on : .off
  }

  private func refreshStatus() {
    let group = DispatchGroup()
    var nextState = ServiceState()

    group.enter()
    check(url: webHealthURL) { online in
      nextState.webOnline = online
      group.leave()
    }

    group.enter()
    check(url: agentHealthURL) { online in
      nextState.agentOnline = online
      group.leave()
    }

    group.enter()
    check(url: ollamaHealthURL) { online in
      nextState.ollamaOnline = online
      group.leave()
    }

    group.notify(queue: .main) { [weak self] in
      self?.apply(state: nextState)
    }
  }

  private func apply(state: ServiceState) {
    statusSummaryItem.title = summary(for: state)
    webStatusItem.title = "Web runtime: \(state.webOnline ? "online" : "offline")"
    agentStatusItem.title = "Local agent: \(state.agentOnline ? "online" : "offline")"
    ollamaStatusItem.title = "Ollama: \(state.ollamaOnline ? "online" : "offline")"

    if let button = statusItem.button {
      if let image = NSImage(
        systemSymbolName: state.webOnline && state.agentOnline ? "cpu.fill" : "cpu",
        accessibilityDescription: "MOLC-AI"
      ) {
        button.image = image
      }
    }

    syncToggleStates()
  }

  private func summary(for state: ServiceState) -> String {
    if state.webOnline && state.agentOnline && state.ollamaOnline {
      return "All local services are online."
    }
    if state.webOnline || state.agentOnline || state.ollamaOnline {
      return "Partial local runtime detected."
    }
    return "Local runtime is offline."
  }

  private func check(url: URL, completion: @escaping (Bool) -> Void) {
    var request = URLRequest(url: url)
    request.timeoutInterval = 1.5
    URLSession.shared.dataTask(with: request) { _, response, _ in
      let ok = (response as? HTTPURLResponse)?.statusCode == 200
      completion(ok)
    }.resume()
  }

  @discardableResult
  private func runScript(at path: String) -> Bool {
    guard fileManager.fileExists(atPath: path) else {
      showAlert("Missing script", "The runtime script was not found at \(path). Re-run npm run install:mac.")
      return false
    }

    do {
      let task = Process()
      task.executableURL = URL(fileURLWithPath: "/bin/bash")
      task.arguments = [path]
      try task.run()
      return true
    } catch {
      showAlert("Script failed", error.localizedDescription)
      return false
    }
  }

  private func setLaunchAtLogin(_ enabled: Bool) {
    let userID = getuid()
    let appExecutable = "\(menuAppPath)/Contents/MacOS/MOLCAIMenuBar"

    do {
      if enabled {
        let launchAgent = """
        <?xml version="1.0" encoding="UTF-8"?>
        <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
        <plist version="1.0">
        <dict>
          <key>Label</key>
          <string>\(launchAgentLabel)</string>
          <key>ProgramArguments</key>
          <array>
            <string>\(appExecutable)</string>
          </array>
          <key>RunAtLoad</key>
          <true/>
          <key>KeepAlive</key>
          <false/>
          <key>WorkingDirectory</key>
          <string>\(appSupportDirectory)</string>
        </dict>
        </plist>
        """
        try fileManager.createDirectory(
          at: URL(fileURLWithPath: "\(NSHomeDirectory())/Library/LaunchAgents"),
          withIntermediateDirectories: true
        )
        try launchAgent.write(toFile: launchAgentPath, atomically: true, encoding: .utf8)
        _ = runTask("/bin/launchctl", ["bootout", "gui/\(userID)", launchAgentPath])
        _ = runTask("/bin/launchctl", ["bootstrap", "gui/\(userID)", launchAgentPath])
      } else {
        _ = runTask("/bin/launchctl", ["bootout", "gui/\(userID)", launchAgentPath])
        try? fileManager.removeItem(atPath: launchAgentPath)
      }
      launchAtLoginEnabled = enabled
      syncToggleStates()
    } catch {
      showAlert("Launch at login failed", error.localizedDescription)
    }
  }

  @discardableResult
  private func runTask(_ executable: String, _ arguments: [String]) -> Bool {
    let task = Process()
    task.executableURL = URL(fileURLWithPath: executable)
    task.arguments = arguments
    do {
      try task.run()
      task.waitUntilExit()
      return task.terminationStatus == 0
    } catch {
      return false
    }
  }

  private func open(path: String) {
    if !fileManager.fileExists(atPath: runtimeDirectory) {
      showAlert("MOLC-AI is not installed", "Run npm run install:mac from the project checkout first.")
      return
    }

    if !runScript(at: startScriptPath) {
      return
    }

    DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
      NSWorkspace.shared.open(webBaseURL.appendingPathComponent(path))
    }
  }

  private func showAlert(_ title: String, _ message: String) {
    let alert = NSAlert()
    alert.messageText = title
    alert.informativeText = message
    alert.alertStyle = .warning
    alert.runModal()
  }

  @objc private func openDashboard() {
    open(path: "dashboard")
  }

  @objc private func openChat() {
    open(path: "chat")
  }

  @objc private func openLocalMachine() {
    open(path: "local-machine")
  }

  @objc private func startServices() {
    if runScript(at: startScriptPath) {
      DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) { [weak self] in
        self?.refreshStatus()
      }
    }
  }

  @objc private func stopServices() {
    if runScript(at: stopScriptPath) {
      DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) { [weak self] in
        self?.refreshStatus()
      }
    }
  }

  @objc private func restartServices() {
    if runScript(at: stopScriptPath) && runScript(at: startScriptPath) {
      DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) { [weak self] in
        self?.refreshStatus()
      }
    }
  }

  @objc private func toggleLaunchAtLogin() {
    setLaunchAtLogin(!launchAtLoginEnabled)
  }

  @objc private func toggleAutoStart() {
    autoStartServicesEnabled.toggle()
    syncToggleStates()
  }

  @objc private func openLogs() {
    NSWorkspace.shared.open(URL(fileURLWithPath: logsPath))
  }

  @objc private func revealInstallFolder() {
    NSWorkspace.shared.selectFile(nil, inFileViewerRootedAtPath: appSupportDirectory)
  }

  @objc private func quitApp() {
    NSApp.terminate(nil)
  }
}

@main
struct MOLCAIMenuBarApp {
  static func main() {
    let app = NSApplication.shared
    let delegate = AppDelegate()
    app.delegate = delegate
    app.run()
  }
}
