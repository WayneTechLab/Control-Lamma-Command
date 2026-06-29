import { Cloud, Laptop, RadioTower, ShieldCheck } from 'lucide-react'
import { StatusPill } from '@/components/StatusPill'
import { useSettings } from '@/context/SettingsContext'

const modes = [
  {
    id: 'direct-localhost',
    icon: Laptop,
    title: 'Direct localhost',
    body: 'The browser reads Ollama on this machine. Best for development and single-user local dashboards.',
  },
  {
    id: 'local-agent',
    icon: RadioTower,
    title: 'Local agent',
    body: 'The deployed webapp calls a same-machine agent that verifies Firebase tokens before Ollama commands.',
  },
  {
    id: 'cloud-relay',
    icon: Cloud,
    title: 'Cloud relay',
    body: 'The local agent keeps an outbound connection or polls Firestore for approved commands from the webapp.',
  },
]

export function ControlApiPage() {
  const { settings } = useSettings()

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="border-b border-slate-200 pb-6 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          <StatusPill tone="blue">API ready</StatusPill>
          <StatusPill tone="slate">{settings.controlPlaneMode}</StatusPill>
        </div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight">
          Control API architecture
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-300">
          A deployed webapp cannot safely run local shell commands. The browser
          handles account management, while model control goes through a local
          agent or relay that validates Firebase identity and account level.
        </p>
      </div>

      <section className="mt-6 grid gap-4 lg:grid-cols-3">
        {modes.map(({ id, icon: Icon, title, body }) => (
          <article
            key={id}
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-center justify-between gap-3">
              <Icon className="h-5 w-5 text-sky-600 dark:text-sky-400" />
              {settings.controlPlaneMode === id && (
                <StatusPill tone="green">Selected</StatusPill>
              )}
            </div>
            <h2 className="mt-4 font-semibold">{title}</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              {body}
            </p>
          </article>
        ))}
      </section>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          <div>
            <h2 className="font-semibold">Minimum API contract</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Every command request should include a Firebase ID token. The agent
              verifies the token, reads account level claims, requires Level 4+
              for shell-backed controls, validates the model name, runs bounded
              Ollama commands, and writes an audit log.
            </p>
          </div>
        </div>
        <div className="mt-5 overflow-hidden rounded-md border border-slate-200 dark:border-slate-800">
          <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-950 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">Endpoint</th>
                <th className="px-4 py-3">Level</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {[
                ['/health', '0+', 'Agent readiness'],
                ['/models', '1+', 'List installed/running models'],
                ['/generate', '1+', 'Proxy streaming chat'],
                ['/models/start', '4+', 'Load a model'],
                ['/models/stop', '4+', 'Unload a model'],
                ['/models/pull', '4+', 'Download or update a model'],
                ['/models/remove', '4+', 'Delete a local model'],
                ['/users/:uid/level', '5', 'Owner account-level changes'],
              ].map(([endpoint, level, action]) => (
                <tr key={endpoint}>
                  <td className="px-4 py-3 font-mono text-xs">{endpoint}</td>
                  <td className="px-4 py-3">{level}</td>
                  <td className="px-4 py-3">{action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
