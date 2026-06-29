import { Send, SlidersHorizontal } from 'lucide-react'
import type { FormEvent } from 'react'
import type { ChatMessage } from '@/types/ollama'

type ChatBoxProps = {
  model: string
  messages: ChatMessage[]
  prompt: string
  streaming: boolean
  temperature: number
  contextLength: number
  onPromptChange: (value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

export function ChatBox({
  model,
  messages,
  prompt,
  streaming,
  temperature,
  contextLength,
  onPromptChange,
  onSubmit,
}: ChatBoxProps) {
  return (
    <div className="flex min-h-[620px] flex-col rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
        <div>
          <h2 className="font-semibold">{model || 'No model selected'}</h2>
          <p className="mt-1 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            temp {temperature.toFixed(2)} · ctx {contextLength.toLocaleString()}
          </p>
        </div>
        {streaming && (
          <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            Streaming
          </span>
        )}
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
        {messages.map((message) => (
          <div
            key={message.id}
            className={
              message.role === 'user'
                ? 'ml-auto max-w-[82%] rounded-lg bg-sky-600 px-4 py-3 text-sm text-white'
                : 'max-w-[82%] rounded-lg bg-slate-100 px-4 py-3 text-sm text-slate-800 dark:bg-slate-800 dark:text-slate-100'
            }
          >
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>
        ))}
        {messages.length === 0 && (
          <div className="grid h-full place-items-center text-center text-sm text-slate-500 dark:text-slate-400">
            Select a running model and send a prompt.
          </div>
        )}
      </div>

      <form
        onSubmit={onSubmit}
        className="border-t border-slate-200 p-4 dark:border-slate-800"
      >
        <label htmlFor="prompt" className="sr-only">
          Prompt
        </label>
        <div className="flex gap-3">
          <textarea
            id="prompt"
            value={prompt}
            rows={3}
            className="min-h-24 flex-1 resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:ring-sky-950"
            placeholder="Ask the selected model..."
            onChange={(event) => onPromptChange(event.target.value)}
          />
          <button
            type="submit"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-sky-600 text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!model || !prompt.trim() || streaming}
            aria-label="Send prompt"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  )
}
