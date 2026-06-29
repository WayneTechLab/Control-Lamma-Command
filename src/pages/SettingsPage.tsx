import { RotateCcw, Save, ShieldAlert } from 'lucide-react'
import { StatusPill } from '@/components/StatusPill'
import { useAuth } from '@/context/AuthContext'
import { useSettings } from '@/context/SettingsContext'

export function SettingsPage() {
  const { settings, updateSettings, resetSettings } = useSettings()
  const { accountLevel, firebaseReady, user } = useAuth()

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="border-b border-slate-200 pb-6 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          <StatusPill tone={firebaseReady ? 'green' : 'amber'}>
            {firebaseReady ? 'Firebase configured' : 'Firebase pending'}
          </StatusPill>
          <StatusPill tone={accountLevel.id >= 4 ? 'blue' : 'slate'}>
            {accountLevel.label}
          </StatusPill>
        </div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight">Settings</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          {user?.email ?? 'Local setup preview'}
        </p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-semibold">Runtime</h2>
          <div className="mt-5 grid gap-5">
            <label className="text-sm font-medium">
              Control plane mode
              <select
                value={settings.controlPlaneMode}
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-950"
                onChange={(event) =>
                  updateSettings({
                    controlPlaneMode: event.target.value as
                      | 'direct-localhost'
                      | 'local-agent'
                      | 'cloud-relay',
                  })
                }
              >
                <option value="direct-localhost">Direct localhost</option>
                <option value="local-agent">Local agent</option>
                <option value="cloud-relay">Cloud relay</option>
              </select>
            </label>

            <label className="text-sm font-medium">
              Ollama API base URL
              <input
                value={settings.ollamaApiBaseUrl}
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-950"
                onChange={(event) =>
                  updateSettings({ ollamaApiBaseUrl: event.target.value })
                }
              />
            </label>

            <label className="text-sm font-medium">
              Local agent base URL
              <input
                value={settings.localAgentBaseUrl}
                placeholder="http://localhost:8787"
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-950"
                onChange={(event) =>
                  updateSettings({ localAgentBaseUrl: event.target.value })
                }
              />
            </label>

            <label className="text-sm font-medium">
              Cloud control base URL
              <input
                value={settings.cloudControlBaseUrl}
                placeholder="https://<region>-<project>.cloudfunctions.net/control"
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-950"
                onChange={(event) =>
                  updateSettings({ cloudControlBaseUrl: event.target.value })
                }
              />
            </label>

            <label className="text-sm font-medium">
              Default model
              <input
                value={settings.defaultModel}
                placeholder="llama3.2:latest"
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-950"
                onChange={(event) =>
                  updateSettings({ defaultModel: event.target.value })
                }
              />
            </label>

            <div className="grid gap-5 sm:grid-cols-3">
              <label className="text-sm font-medium">
                Temperature
                <input
                  type="number"
                  min="0"
                  max="2"
                  step="0.05"
                  value={settings.temperature}
                  className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-950"
                  onChange={(event) =>
                    updateSettings({ temperature: Number(event.target.value) })
                  }
                />
              </label>
              <label className="text-sm font-medium">
                Context length
                <input
                  type="number"
                  min="1024"
                  step="1024"
                  value={settings.contextLength}
                  className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-950"
                  onChange={(event) =>
                    updateSettings({ contextLength: Number(event.target.value) })
                  }
                />
              </label>
              <label className="text-sm font-medium">
                Auto-refresh seconds
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={settings.autoRefreshSeconds}
                  className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-950"
                  onChange={(event) =>
                    updateSettings({
                      autoRefreshSeconds: Number(event.target.value),
                    })
                  }
                />
              </label>
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900 shadow-sm dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100">
            <div className="flex items-start gap-3">
              <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <h2 className="font-semibold">LAN exposure</h2>
                <p className="mt-2">
                  Enabling a non-local Ollama host can expose model control to
                  the network. Keep this behind authenticated, encrypted access.
                </p>
              </div>
            </div>
            <label className="mt-4 flex items-center gap-3 font-medium">
              <input
                type="checkbox"
                checked={settings.remoteAccessEnabled}
                className="h-4 w-4"
                onChange={(event) =>
                  updateSettings({ remoteAccessEnabled: event.target.checked })
                }
              />
              Remote access acknowledged
            </label>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="font-semibold">Persistence</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Settings are stored locally now; Firestore persistence is tracked in
              the `.SYSTEMX` plan.
            </p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-md bg-sky-600 px-3 py-2 text-sm font-semibold text-white"
              >
                <Save className="h-4 w-4" />
                Saved
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                onClick={resetSettings}
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </button>
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}
