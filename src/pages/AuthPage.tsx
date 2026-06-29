import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { Lock, LogIn } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { StatusPill } from '@/components/StatusPill'

export function AuthPage() {
  const { accountLevel, firebaseReady, loading, signIn, signUp, user } = useAuth()
  const location = useLocation()
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const from = (location.state as { from?: { pathname?: string } } | null)?.from
    ?.pathname

  if (!loading && user) {
    return <Navigate to={from ?? '/dashboard'} replace />
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    try {
      if (mode === 'sign-in') {
        await signIn(email, password)
      } else {
        await signUp(email, password)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed.')
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-160px)] max-w-md items-center px-4 py-10">
      <section className="w-full rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Sign in</h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Firebase identity gates account levels and model control.
            </p>
          </div>
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-950">
            <Lock className="h-5 w-5" />
          </span>
        </div>

        {!firebaseReady ? (
          <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100">
            <StatusPill tone="amber">Setup mode</StatusPill>
            <p className="mt-3">
              Add Firebase web config to `.env.local` to enable sign-in and route
              protection.
            </p>
            <Link
              to="/dashboard"
              className="mt-4 inline-flex items-center rounded-md bg-amber-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-amber-800 dark:bg-amber-200 dark:text-amber-950"
            >
              Continue as {accountLevel.label}
            </Link>
          </div>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <label className="block text-sm font-medium">
              Email
              <input
                type="email"
                required
                value={email}
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-950"
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>
            <label className="block text-sm font-medium">
              Password
              <input
                type="password"
                required
                minLength={6}
                value={password}
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-950"
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>
            {error && <p className="text-sm text-rose-600">{error}</p>}
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-500"
            >
              <LogIn className="h-4 w-4" />
              {mode === 'sign-in' ? 'Sign in' : 'Create account'}
            </button>
            <button
              type="button"
              className="w-full text-sm font-semibold text-sky-700 dark:text-sky-300"
              onClick={() =>
                setMode((current) =>
                  current === 'sign-in' ? 'sign-up' : 'sign-in',
                )
              }
            >
              {mode === 'sign-in' ? 'Create an account' : 'Use existing account'}
            </button>
          </form>
        )}
      </section>
    </div>
  )
}
