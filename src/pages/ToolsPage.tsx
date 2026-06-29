import { Code2, FileJson, Globe2, NotebookText, Play } from 'lucide-react'
import { StatusPill } from '@/components/StatusPill'

const tools = [
  {
    icon: Code2,
    title: 'Coding prompt workspace',
    body: 'Draft code tasks, pair them with a selected local model, and save outputs to your profile memory.',
  },
  {
    icon: NotebookText,
    title: 'Memory notes',
    body: 'Keep reusable project context and prompt notes attached to your Firebase user profile.',
  },
  {
    icon: FileJson,
    title: 'Export center',
    body: 'Export conversations, model metadata, and run logs as JSON or Markdown.',
  },
  {
    icon: Globe2,
    title: 'Cloud-to-local bridge',
    body: 'Use the webapp from anywhere while the local agent safely controls your machine endpoint.',
  },
]

export function ToolsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="border-b border-slate-200 pb-6 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          <StatusPill tone="blue">Browser tools</StatusPill>
          <StatusPill tone="slate">MOLC-AI workspace</StatusPill>
        </div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight">
          Coding and cloud memory tools
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-300">
          This workspace is the landing zone for browser-based coding,
          reusable memory, exports, and cloud-to-local workflows.
        </p>
      </div>

      <section className="mt-6 grid gap-4 md:grid-cols-2">
        {tools.map(({ icon: Icon, title, body }) => (
          <article
            key={title}
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-md bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-semibold">{title}</h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  {body}
                </p>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start gap-3">
          <Play className="mt-1 h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          <div>
            <h2 className="font-semibold">Next tool build</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Add a code task runner that sends a saved prompt, selected model,
              repo context, and output format into the chat pipeline, then stores
              the result as profile memory.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
