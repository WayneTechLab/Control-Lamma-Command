import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Download,
  HardDrive,
  Play,
  RefreshCw,
  ServerCog,
  Terminal,
  Wrench,
} from 'lucide-react'
import { StatusPill } from '@/components/StatusPill'
import { useAuth } from '@/context/AuthContext'
import { useSettings } from '@/context/SettingsContext'
import { formatBytes } from '@/lib/format'
import { getMachineStatus, runAgentCommand } from '@/services/ollamaApi'
import type { AgentCommand, AgentCommandResult, MachineStatus } from '@/types/ollama'

const commandButtons: Array<{
  command: AgentCommand
  label: string
  needsModel?: boolean
  dangerous?: boolean
}> = [
  { command: 'version', label: 'Version' },
  { command: 'list', label: 'List' },
  { command: 'ps', label: 'Running' },
  { command: 'show', label: 'Show', needsModel: true },
  { command: 'start', label: 'Start', needsModel: true },
  { command: 'stop', label: 'Stop', needsModel: true },
  { command: 'pull', label: 'Pull', needsModel: true },
  { command: 'remove', label: 'Remove', needsModel: true, dangerous: true },
]

function stringifyResult(result: AgentCommandResult | null) {
  if (!result) return 'No command output yet.'
  return JSON.stringify(result, null, 2)
}

export function LocalMachinePage() {
  const { canControlModels, user } = useAuth()
  const { settings } = useSettings()
  const [status, setStatus] = useState<MachineStatus | null>(null)
  const [model, setModel] = useState(settings.defaultModel)
  const [destination, setDestination] = useState('')
  const [commandResult, setCommandResult] = useState<AgentCommandResult | null>(
    null,
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const controlBaseUrl = useMemo(
    () =>
      settings.controlPlaneMode === 'cloud-relay'
        ? settings.cloudControlBaseUrl
        : settings.localAgentBaseUrl,
    [settings.cloudControlBaseUrl, settings.controlPlaneMode, settings.localAgentBaseUrl],
  )
  const getIdToken = useCallback(
    () => (user ? user.getIdToken() : Promise.resolve(undefined)),
    [user],
  )

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const idToken = await getIdToken()
      setStatus(await getMachineStatus(controlBaseUrl, idToken))
    } catch (err) {
      setStatus(null)
      setError(err instanceof Error ? err.message : 'Unable to read machine state.')
    } finally {
      setLoading(false)
    }
  }, [controlBaseUrl, getIdToken])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void refresh()
    }, 0)

    return () => window.clearTimeout(timeout)
  }, [refresh])

  async function runCommand(command: AgentCommand, dangerous = false) {
    if (!canControlModels && command !== 'version' && command !== 'list' && command !== 'ps') {
      setError('Level 4+ is required for machine control commands.')
      return
    }

    if (dangerous) {
      const confirmed = window.confirm(`Run ${command}? This can modify local Ollama state.`)
      if (!confirmed) return
    }

    setLoading(true)
    setError(null)
    try {
      const idToken = await getIdToken()
      const payload =
        command === 'copy'
          ? { source: model, destination }
          : commandButtons.find((item) => item.command === command)?.needsModel
            ? { model }
            : {}
      const result = await runAgentCommand(controlBaseUrl, command, payload, idToken)
      setCommandResult(result)
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : `Command ${command} failed.`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 dark:border-slate-800 lg:flex-row lg:items-end">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill tone={status?.agent.online ? 'green' : 'amber'}>
              Agent {status?.agent.online ? 'online' : 'pending'}
            </StatusPill>
            <StatusPill tone={status?.ollamaApi.online ? 'green' : 'red'}>
              Ollama API {status?.ollamaApi.online ? 'online' : 'offline'}
            </StatusPill>
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight">
            Local machine
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-300">
            Detect the local host, required tooling, Ollama service state, and
            run allowlisted Ollama commands through the MOLC-AI local agent.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-60 dark:bg-white dark:text-slate-950"
          disabled={loading}
          onClick={() => void refresh()}
        >
          <RefreshCw className={loading ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100">
          {error}
        </div>
      )}

      <section className="mt-6 grid gap-4 lg:grid-cols-4">
        {[
          {
            icon: ServerCog,
            label: 'Host',
            value: status?.machine.hostname ?? 'Unknown',
          },
          {
            icon: HardDrive,
            label: 'Memory',
            value: status
              ? `${formatBytes(status.machine.freeMemory)} free / ${formatBytes(status.machine.totalMemory)}`
              : 'Unknown',
          },
          {
            icon: Wrench,
            label: 'Ollama',
            value: status?.requirements.ollama.version || 'Not detected',
          },
          {
            icon: Terminal,
            label: 'Models',
            value: status
              ? `${status.modelSummary.installedCount} installed, ${status.modelSummary.runningCount} running`
              : 'Unknown',
          },
        ].map(({ icon: Icon, label, value }) => (
          <article
            key={label}
            className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
              <Icon className="h-4 w-4 text-sky-600 dark:text-sky-400" />
            </div>
            <p className="mt-2 text-sm font-semibold">{value}</p>
          </article>
        ))}
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_420px]">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="font-semibold">Installed parts</h2>
          <div className="mt-4 overflow-hidden rounded-md border border-slate-200 dark:border-slate-800">
            <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-950 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3">Part</th>
                  <th className="px-4 py-3">State</th>
                  <th className="px-4 py-3">Path / version</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {Object.entries(status?.requirements ?? {}).map(([key, value]) => (
                  <tr key={key}>
                    <td className="px-4 py-3 font-medium">{key}</td>
                    <td className="px-4 py-3">
                      <StatusPill tone={value.installed ? 'green' : 'amber'}>
                        {value.installed ? 'Installed' : 'Missing'}
                      </StatusPill>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                      {value.version || value.path || 'Not found'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-5 rounded-md border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-950">
            <h3 className="font-semibold">Install / update info</h3>
            <dl className="mt-3 grid gap-2">
              <div>
                <dt className="text-slate-500 dark:text-slate-400">Download</dt>
                <dd>{status?.install.macApp ?? 'https://ollama.com/download/mac'}</dd>
              </div>
              <div>
                <dt className="text-slate-500 dark:text-slate-400">Install</dt>
                <dd className="font-mono text-xs">{status?.install.brewInstall ?? 'brew install ollama'}</dd>
              </div>
              <div>
                <dt className="text-slate-500 dark:text-slate-400">Update</dt>
                <dd className="font-mono text-xs">{status?.install.brewUpdate ?? 'brew upgrade ollama'}</dd>
              </div>
              <div>
                <dt className="text-slate-500 dark:text-slate-400">Firebase CLI</dt>
                <dd className="font-mono text-xs">
                  {status?.install.firebaseInstall ?? 'npm install -g firebase-tools'}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500 dark:text-slate-400">Google Cloud SDK</dt>
                <dd className="font-mono text-xs">
                  {status?.install.gcloudInstall ?? 'brew install --cask google-cloud-sdk'}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500 dark:text-slate-400">Swift tools</dt>
                <dd className="font-mono text-xs">
                  {status?.install.swiftTools ?? 'xcode-select --install'}
                </dd>
              </div>
            </dl>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
                onClick={() => void runCommand('startService', true)}
              >
                <Play className="h-3.5 w-3.5" />
                Start Ollama service
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
                onClick={() => void runCommand('updateOllama', true)}
              >
                <Download className="h-3.5 w-3.5" />
                Update Ollama
              </button>
            </div>
          </div>

          <div className="mt-5 rounded-md border border-slate-200 bg-white p-4 text-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-wrap items-center gap-2">
              <StatusPill tone={status?.localRuntime.menuAppInstalled ? 'green' : 'amber'}>
                Menu app {status?.localRuntime.menuAppInstalled ? 'installed' : 'not installed'}
              </StatusPill>
              <StatusPill tone={status?.localRuntime.webOnline ? 'green' : 'amber'}>
                Local web {status?.localRuntime.webOnline ? 'online' : 'offline'}
              </StatusPill>
              <StatusPill tone={status?.localRuntime.launchAgentLoaded ? 'blue' : 'slate'}>
                Login item {status?.localRuntime.launchAgentLoaded ? 'loaded' : 'off'}
              </StatusPill>
            </div>

            <h3 className="mt-4 font-semibold">Mac menu bar install</h3>
            <p className="mt-2 text-slate-600 dark:text-slate-300">
              Install MOLC-AI as a native menu bar controller that starts the
              local web runtime, local agent, and optionally launches at login.
            </p>

            <dl className="mt-4 grid gap-2 text-xs">
              <div>
                <dt className="text-slate-500 dark:text-slate-400">Menu app path</dt>
                <dd className="font-mono">{status?.localRuntime.menuAppPath ?? '~/Applications/MOLC-AI Menu.app'}</dd>
              </div>
              <div>
                <dt className="text-slate-500 dark:text-slate-400">Runtime folder</dt>
                <dd className="font-mono">{status?.localRuntime.runtimeDir ?? '~/Library/Application Support/MOLC-AI/runtime'}</dd>
              </div>
              <div>
                <dt className="text-slate-500 dark:text-slate-400">LaunchAgent</dt>
                <dd className="font-mono">
                  {status?.localRuntime.launchAgentPath ?? '~/Library/LaunchAgents/com.waynetechlab.molc-ai.menubar.plist'}
                </dd>
              </div>
            </dl>

            <div className="mt-4 space-y-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Installer
                </p>
                <pre className="mt-1 overflow-auto rounded-md bg-slate-950 p-3 text-xs text-slate-100">
{status?.install.menuBarInstaller ?? 'npm run install:mac'}
                </pre>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Install + launch at login
                </p>
                <pre className="mt-1 overflow-auto rounded-md bg-slate-950 p-3 text-xs text-slate-100">
{status?.install.menuBarInstallerLogin ?? 'npm run install:mac:login'}
                </pre>
              </div>
            </div>
          </div>
        </div>

        <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="font-semibold">Command runner</h2>
          <label className="mt-4 block text-sm font-medium">
            Model
            <input
              value={model}
              placeholder="llama3.2:latest"
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-950"
              onChange={(event) => setModel(event.target.value)}
            />
          </label>
          <label className="mt-3 block text-sm font-medium">
            Copy destination
            <input
              value={destination}
              placeholder="my-model-copy"
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-950"
              onChange={(event) => setDestination(event.target.value)}
            />
          </label>

          <div className="mt-4 grid grid-cols-2 gap-2">
            {commandButtons.map((item) => (
              <button
                key={item.command}
                type="button"
                className="rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"
                disabled={loading || (item.needsModel && !model.trim())}
                onClick={() => void runCommand(item.command, item.dangerous)}
              >
                {item.label}
              </button>
            ))}
            <button
              type="button"
              className="rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"
              disabled={loading || !model.trim() || !destination.trim()}
              onClick={() => void runCommand('copy', true)}
            >
              Copy
            </button>
          </div>

          <pre className="mt-4 max-h-[420px] overflow-auto rounded-md bg-slate-950 p-4 text-xs leading-5 text-slate-100">
            {stringifyResult(commandResult)}
          </pre>
        </aside>
      </section>
    </div>
  )
}
