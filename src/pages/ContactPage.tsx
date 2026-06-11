import { useState, type FormEvent } from 'react'
import { Mail, MapPin, Send } from 'lucide-react'

export function ContactPage() {
  const [sent, setSent] = useState(false)

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    // TODO: wire to a Cloud Function / email provider (see Template steps 05/06).
    setSent(true)
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-16">
      <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Contact</h1>
      <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
        Get in touch. This form is a placeholder — wire it to your backend.
      </p>

      <div className="mt-10 grid gap-10 md:grid-cols-2">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium">
              Name
            </label>
            <input
              id="name"
              name="name"
              required
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900"
            />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              rows={4}
              required
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900"
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500"
          >
            <Send className="h-4 w-4" /> Send message
          </button>
          {sent && (
            <p className="text-sm font-medium text-green-600 dark:text-green-400">
              Thanks! (Demo only — connect a backend to actually send this.)
            </p>
          )}
        </form>

        <div className="space-y-6">
          <div className="flex items-start gap-3">
            <Mail className="mt-1 h-5 w-5 text-indigo-600" />
            <div>
              <h3 className="font-semibold">Email</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                hello@example.com
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="mt-1 h-5 w-5 text-indigo-600" />
            <div>
              <h3 className="font-semibold">Location</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Anywhere on the web
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
