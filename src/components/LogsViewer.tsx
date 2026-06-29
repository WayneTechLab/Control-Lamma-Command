import { RefreshCw, Terminal } from 'lucide-react'

type LogsViewerProps = {
  lines: string[]
  loading: boolean
  onRefresh: () => void
}

export function LogsViewer({ lines, loading, onRefresh }: LogsViewerProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-slate-950 text-slate-100 shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-slate-800 px-5 py-4">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-emerald-300" />
          <h2 className="font-semibold">Ollama logs</h2>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-md border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-800"
          onClick={onRefresh}
        >
          <RefreshCw className={loading ? 'h-3.5 w-3.5 animate-spin' : 'h-3.5 w-3.5'} />
          Refresh
        </button>
      </div>
      <pre className="max-h-[520px] overflow-auto p-5 text-xs leading-6">
        {lines.join('\n')}
      </pre>
    </section>
  )
}
