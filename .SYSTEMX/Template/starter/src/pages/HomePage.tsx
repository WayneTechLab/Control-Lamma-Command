import { Link } from 'react-router-dom'
import { ArrowRight, Rocket, ShieldCheck, Gauge } from 'lucide-react'

export function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 py-20 text-center sm:py-28">
        <span className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950 dark:text-indigo-300">
          WebApp Stack G One Point Zero
        </span>
        <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-extrabold tracking-tight sm:text-6xl">
          Ship a production web app{' '}
          <span className="text-indigo-600">in record time</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
          A reusable TypeScript + React + Vite + Tailwind + Firebase starter with
          routing, layout, auth-ready config, and CI baked in. Clone it, rename
          it, deploy it.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link
            to="/features"
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500"
          >
            Explore features <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/about"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Learn more
          </Link>
        </div>
      </section>

      {/* Feature cards */}
      <section className="mx-auto max-w-6xl px-4 pb-24">
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            {
              icon: Rocket,
              title: 'Fast by default',
              body: 'Vite 7 dev server, code-split bundles, and an optimized production build out of the box.',
            },
            {
              icon: ShieldCheck,
              title: 'Secure foundation',
              body: 'Firebase config, security-header guidance, and deny-by-default rules ready to wire up.',
            },
            {
              icon: Gauge,
              title: 'Repeatable',
              body: 'A documented, ordered setup so every new project starts the exact same proven way.',
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-indigo-600 text-white">
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
