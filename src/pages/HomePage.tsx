import { Link } from 'react-router-dom'
import { ArrowRight, Bot, KeyRound, ServerCog, ShieldCheck } from 'lucide-react'
import { StatusPill } from '@/components/StatusPill'
import { useAuth } from '@/context/AuthContext'
import { ACCOUNT_LEVELS } from '@/types/account'

export function HomePage() {
  const { accountLevel, firebaseReady, user } = useAuth()

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill tone={firebaseReady ? 'green' : 'amber'}>
              {firebaseReady ? 'Firebase ready' : 'Setup preview'}
            </StatusPill>
            <StatusPill tone={accountLevel.id >= 4 ? 'blue' : 'slate'}>
              {accountLevel.label}
            </StatusPill>
          </div>
          <h1 className="mt-6 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
            Secure local AI control, managed from the web.
          </h1>
          <p className="mt-5 max-w-2xl text-base text-slate-600 dark:text-slate-300">
            MOLC-AI separates public account management from
            same-machine Ollama control. Users sign in through Firebase, then the
            dashboard talks to a local agent or cloud relay based on the machine
            they are allowed to manage.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to={user || !firebaseReady ? '/dashboard' : '/login'}
              className="inline-flex items-center gap-2 rounded-md bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-500"
            >
              {user || !firebaseReady ? 'Open dashboard' : 'Login'}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/api-control"
              className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Control API
            </Link>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
            <span className="grid h-11 w-11 place-items-center rounded-md bg-slate-900 text-white dark:bg-white dark:text-slate-950">
              <Bot className="h-6 w-6" />
            </span>
            <div>
              <h2 className="font-semibold">Request path</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Home → Login → Dashboard → Local control
              </p>
            </div>
          </div>
          <div className="mt-5 grid gap-3">
            {[
              {
                icon: KeyRound,
                title: 'Firebase identity',
                body: 'Auth, account level claims, and user profile state.',
              },
              {
                icon: ShieldCheck,
                title: 'Account gates',
                body: 'Free, paid, employee, and owner levels unlock specific routes.',
              },
              {
                icon: ServerCog,
                title: 'Local agent',
                body: 'Same-machine API executes Ollama commands after token checks.',
              },
            ].map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="flex gap-3 rounded-md border border-slate-200 p-3 dark:border-slate-800"
              >
                <Icon className="mt-0.5 h-4 w-4 text-sky-600 dark:text-sky-400" />
                <div>
                  <h3 className="text-sm font-semibold">{title}</h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Account levels</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {Object.values(ACCOUNT_LEVELS).map((level) => (
            <article
              key={level.id}
              className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold">{level.label}</h3>
                <StatusPill tone={level.plan === 'paid' ? 'blue' : 'slate'}>
                  {level.plan}
                </StatusPill>
              </div>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                {level.audience}
              </p>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                {level.description}
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
