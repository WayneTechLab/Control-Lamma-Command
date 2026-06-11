import { Check } from 'lucide-react'

const features = [
  { title: 'Routing', body: 'Client-side routing with a shared layout and a 404 fallback.' },
  { title: 'Theming', body: 'Tailwind 4 with system light/dark color scheme.' },
  { title: 'Auth-ready', body: 'Firebase Auth + Firestore + Storage client initialized.' },
  { title: 'CI/CD', body: 'GitHub Actions pipeline: lint, typecheck, and build on every PR.' },
  { title: 'Type-safe', body: 'Strict TypeScript across the app with path aliases.' },
  { title: 'Deploy-ready', body: 'Firebase Hosting config + security headers included.' },
]

export function FeaturesPage() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-16">
      <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Features</h1>
      <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
        Everything you need to go from empty repo to deployed product.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {features.map((f) => (
          <div
            key={f.title}
            className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
          >
            <span className="mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400">
              <Check className="h-4 w-4" />
            </span>
            <div>
              <h3 className="font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                {f.body}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
