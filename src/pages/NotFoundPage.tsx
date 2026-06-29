import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <section className="mx-auto flex max-w-3xl flex-col items-center px-4 py-24 text-center">
      <p className="text-6xl font-extrabold text-sky-600">404</p>
      <h1 className="mt-4 text-2xl font-bold">Page not found</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-300">
        The page you're looking for doesn't exist or has moved.
      </p>
      <Link
        to="/"
        className="mt-8 inline-flex items-center rounded-md bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-500"
      >
        Back to dashboard
      </Link>
    </section>
  )
}
