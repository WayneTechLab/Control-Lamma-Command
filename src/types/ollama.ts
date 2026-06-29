export type ModelDetails = {
  format?: string
  family?: string
  families?: string[]
  parameter_size?: string
  quantization_level?: string
}

export type InstalledModel = {
  name: string
  model?: string
  modified_at?: string
  size?: number
  digest?: string
  details?: ModelDetails
}

export type RunningModel = InstalledModel & {
  size_vram?: number
  expires_at?: string
  processor?: string
}

export type OllamaStatusMode = 'live' | 'sample'

export type ControlPlaneMode = 'direct-localhost' | 'local-agent' | 'cloud-relay'

export type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

export type GenerationOptions = {
  temperature: number
  num_ctx: number
}

export type RuntimeSettings = {
  controlPlaneMode: ControlPlaneMode
  ollamaApiBaseUrl: string
  localAgentBaseUrl: string
  cloudControlBaseUrl: string
  defaultModel: string
  temperature: number
  contextLength: number
  autoRefreshSeconds: number
  remoteAccessEnabled: boolean
}

export type MachineStatus = {
  machine: {
    hostname: string
    platform: string
    release: string
    arch: string
    cpuCount: number
    totalMemory: number
    freeMemory: number
    homeDir: string
    nodeVersion: string
  }
  agent: {
    online: boolean
    host: string
    port: number
    allowSystemCommands: boolean
  }
  requirements: Record<
    string,
    {
      name?: string
      installed: boolean
      path?: string
      version?: string
    }
  >
  ollamaApi: {
    online: boolean
    baseUrl: string
    error: string
  }
  modelSummary: {
    installedCount: number
    runningCount: number
  }
  localRuntime: {
    installDir: string
    runtimeDir: string
    menuAppPath: string
    launchAgentPath: string
    webBaseUrl: string
    webOnline: boolean
    webError: string
    menuAppInstalled: boolean
    runtimeInstalled: boolean
    launchAgentInstalled: boolean
    launchAgentLoaded: boolean
  }
  install: {
    macApp: string
    brewInstall: string
    brewUpdate: string
    startService: string
    menuBarInstaller: string
    menuBarInstallerLogin: string
    firebaseInstall: string
    gcloudInstall: string
    swiftTools: string
  }
}

export type AgentCommand =
  | 'version'
  | 'list'
  | 'ps'
  | 'show'
  | 'start'
  | 'stop'
  | 'pull'
  | 'remove'
  | 'create'
  | 'push'
  | 'embed'
  | 'copy'
  | 'status'
  | 'startService'
  | 'updateOllama'

export type AgentCommandResult = {
  ok: boolean
  command?: AgentCommand
  result?: unknown
  error?: string
}
