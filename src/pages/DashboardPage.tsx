import { useCallback, useMemo, useState } from 'react'
import {
  Activity,
  AlertTriangle,
  Boxes,
  CheckCircle2,
  Cpu,
  RefreshCw,
  Server,
} from 'lucide-react'
import { ModelCard } from '@/components/ModelCard'
import { StatusPill } from '@/components/StatusPill'
import { useAuth } from '@/context/AuthContext'
import { useSettings } from '@/context/SettingsContext'
import { callLocalAgent } from '@/services/ollamaApi'
import { useOllamaStatus } from '@/hooks/useOllamaStatus'
import { formatBytes, formatDateTime } from '@/lib/format'
import type { InstalledModel } from '@/types/ollama'

type ModelAction = 'start' | 'stop' | 'pull' | 'remove'

export function DashboardPage() {
  const { accountLevel, canControlModels, firebaseReady, user } = useAuth()
  const { settings } = useSettings()
  const getIdToken = useCallback(
    () => (user ? user.getIdToken() : Promise.resolve(undefined)),
    [user],
  )
  const status = useOllamaStatus(settings, settings.autoRefreshSeconds, getIdToken)
  const [selectedModel, setSelectedModel] = useState<InstalledModel | null>(null)
  const [busy, setBusy] = useState<{ model: string; action: ModelAction } | null>(
    null,
  )
  const [actionError, setActionError] = useState<string | null>(null)
  const [actionNotice, setActionNotice] = useState<string | null>(null)

  const runningNames = useMemo(
    () => new Set(status.runningModels.map((model) => model.name)),
    [status.runningModels],
  )
  const vramTotal = status.runningModels.reduce(
    (total, model) => total + (model.size_vram ?? 0),
    0,
  )
  const commandBaseUrl =
    settings.controlPlaneMode === 'cloud-relay'
      ? settings.cloudControlBaseUrl
      : settings.localAgentBaseUrl
  const commandEnabled = Boolean(commandBaseUrl.trim())

  function getConfirmationMessage(action: ModelAction, modelName: string) {
    switch (action) {
      case 'start':
        return `Start ${modelName}? This asks the local agent to load the model in Ollama.`
      case 'stop':
        return `Stop ${modelName}? This unloads the model from memory.`
      case 'pull':
        return `Pull ${modelName}? This downloads or updates the local model files.`
      case 'remove':
        return `Remove ${modelName}? This deletes the local model copy and cannot be undone.`
    }
  }

  async function handleAction(action: ModelAction, model: InstalledModel) {
    setActionError(null)
    setActionNotice(null)

    const confirmed = window.confirm(getConfirmationMessage(action, model.name))
    if (!confirmed) return

    setBusy({ model: model.name, action })
    try {
      const idToken = user ? await user.getIdToken() : undefined
      await callLocalAgent(commandBaseUrl, action, model.name, idToken)
      await status.refresh()
      setActionNotice(`${action} request confirmed and sent for ${model.name}.`)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Command failed.')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 dark:border-slate-800 lg:flex-row lg:items-end">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill tone={status.mode === 'live' ? 'green' : 'amber'}>
              {status.mode === 'live' ? 'Ollama live' : 'Sample data'}
            </StatusPill>
            <StatusPill tone={firebaseReady ? 'green' : 'amber'}>
              {firebaseReady ? 'Firebase ready' : 'Firebase setup'}
            </StatusPill>
            <StatusPill tone={accountLevel.id >= 4 ? 'blue' : 'slate'}>
              {accountLevel.label}
            </StatusPill>
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight">
            MOLC-AI Dashboard
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-300">
            Local Ollama model operations with Firebase-backed identity,
            settings, and history.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
          disabled={status.loading}
          onClick={() => void status.refresh()}
        >
          <RefreshCw
            className={status.loading ? 'h-4 w-4 animate-spin' : 'h-4 w-4'}
          />
          Refresh
        </button>
      </div>

      {(status.error || actionError) && (
        <div className="mt-5 flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-semibold">Runtime warning</p>
            <p className="mt-1">{actionError ?? status.error}</p>
          </div>
        </div>
      )}

      {actionNotice && (
        <div className="mt-5 flex gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{actionNotice}</p>
        </div>
      )}

      <section className="mt-6 grid gap-4 md:grid-cols-4">
        {[
          {
            icon: Boxes,
            label: 'Installed models',
            value: status.installedModels.length.toString(),
          },
          {
            icon: Activity,
            label: 'Running models',
            value: status.runningModels.length.toString(),
          },
          {
            icon: Cpu,
            label: 'VRAM loaded',
            value: formatBytes(vramTotal),
          },
          {
            icon: Server,
            label: 'Last refresh',
            value: status.lastUpdated ? formatDateTime(status.lastUpdated.toISOString()) : 'Pending',
          },
        ].map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
              <Icon className="h-4 w-4 text-sky-600 dark:text-sky-400" />
            </div>
            <p className="mt-2 text-2xl font-bold">{value}</p>
          </div>
        ))}
      </section>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">Installed models</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {settings.ollamaApiBaseUrl}
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {status.installedModels.map((model) => (
            <ModelCard
              key={model.name}
              model={model}
              isRunning={runningNames.has(model.name)}
              accountLevel={accountLevel}
              canControlModels={canControlModels}
              commandEnabled={commandEnabled}
              busyAction={
                busy?.model === model.name ? busy.action : null
              }
              onAction={(action, selected) => void handleAction(action, selected)}
              onDetails={setSelectedModel}
            />
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">Running models</h2>
        <div className="mt-4 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-900/70 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">Model</th>
                <th className="px-4 py-3">Processor</th>
                <th className="px-4 py-3">VRAM</th>
                <th className="px-4 py-3">Expires</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {status.runningModels.map((model) => (
                <tr key={`${model.name}-${model.expires_at ?? 'running'}`}>
                  <td className="px-4 py-3 font-medium">{model.name}</td>
                  <td className="px-4 py-3">{model.processor ?? 'CPU/GPU'}</td>
                  <td className="px-4 py-3">{formatBytes(model.size_vram)}</td>
                  <td className="px-4 py-3">{formatDateTime(model.expires_at)}</td>
                </tr>
              ))}
              {status.runningModels.length === 0 && (
                <tr>
                  <td
                    className="px-4 py-8 text-center text-slate-500 dark:text-slate-400"
                    colSpan={4}
                  >
                    No loaded models reported.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {selectedModel && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4">
          <div className="w-full max-w-xl rounded-lg border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">{selectedModel.name}</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {selectedModel.digest ?? 'No digest available'}
                </p>
              </div>
              <button
                type="button"
                className="rounded-md px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                onClick={() => setSelectedModel(null)}
              >
                Close
              </button>
            </div>
            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                ['Model', selectedModel.model ?? selectedModel.name],
                ['Family', selectedModel.details?.family ?? 'Unknown'],
                ['Parameters', selectedModel.details?.parameter_size ?? 'Unknown'],
                [
                  'Quantization',
                  selectedModel.details?.quantization_level ?? 'Unknown',
                ],
                ['Format', selectedModel.details?.format ?? 'Unknown'],
                ['Size', formatBytes(selectedModel.size)],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    {label}
                  </dt>
                  <dd className="mt-1 font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      )}
    </div>
  )
}
