# MOLC-AI macOS Local Install

## Purpose

Install MOLC-AI as a local macOS runtime with:

- a native menu bar app in `~/Applications/MOLC-AI Menu.app`
- a self-contained runtime in `~/Library/Application Support/MOLC-AI/runtime`
- a local web UI on `http://127.0.0.1:4173`
- a local control agent on `http://127.0.0.1:8787`
- optional launch-at-login via `~/Library/LaunchAgents/com.waynetechlab.molc-ai.menubar.plist`

## Installer commands

```bash
npm run install:mac
npm run install:mac:login
```

`npm run install:mac` builds the web app, copies the runtime payload into
Application Support, compiles the Swift menu bar app, starts the local runtime,
and opens the app.

`npm run install:mac:login` does the same and also registers the menu bar app to
launch at login.

## Runtime controls

After install, these scripts live in:

`~/Library/Application Support/MOLC-AI/runtime/scripts`

Useful commands:

```bash
bash "$HOME/Library/Application Support/MOLC-AI/runtime/scripts/status-runtime.sh"
bash "$HOME/Library/Application Support/MOLC-AI/runtime/scripts/start-runtime.sh"
bash "$HOME/Library/Application Support/MOLC-AI/runtime/scripts/stop-runtime.sh"
```

## Requirements

- macOS
- Node.js 22+
- Xcode Command Line Tools (`xcode-select --install`)
- Ollama for local model control

Optional but recommended:

- Firebase CLI: `npm install -g firebase-tools`
- Google Cloud SDK: `brew install --cask google-cloud-sdk`

## Notes

- The menu bar app is intentionally lightweight AppKit + Swift, not Electron.
- The runtime is copied out of the repo so the local install keeps working even
  when the checkout is closed.
- Cloud relay remains a separate future path; the local install is for
  same-machine control.
