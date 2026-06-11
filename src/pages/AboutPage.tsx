export function AboutPage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">About</h1>
      <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
        This is the <strong>WebApp Stack G One Point Zero</strong> starter — a
        generic, enterprise-ready foundation for building modern web
        applications quickly and consistently.
      </p>

      <div className="mt-10 space-y-6">
        <div>
          <h2 className="text-xl font-semibold">What's included</h2>
          <ul className="mt-3 list-inside list-disc space-y-1 text-slate-600 dark:text-slate-300">
            <li>TypeScript (strict) + React 19 + Vite 7</li>
            <li>Tailwind CSS 4 with light/dark support</li>
            <li>React Router with a shared layout (Navbar + Footer)</li>
            <li>Firebase client config wired and ready</li>
            <li>ESLint flat config + GitHub Actions CI</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold">How to use it</h2>
          <p className="mt-3 text-slate-600 dark:text-slate-300">
            Create a new repository from this template, fill in your Firebase
            config in <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">.env.local</code>,
            then run <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">npm install &amp;&amp; npm run dev</code>.
            Replace this content with your product and ship.
          </p>
        </div>
      </div>
    </section>
  )
}
