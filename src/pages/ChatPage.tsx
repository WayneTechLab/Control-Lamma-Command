import { useCallback, useMemo, useState, type FormEvent } from 'react'
import { AlertTriangle, Download, Save } from 'lucide-react'
import { ChatBox } from '@/components/ChatBox'
import { StatusPill } from '@/components/StatusPill'
import { db } from '@/config/firebase'
import { useAuth } from '@/context/AuthContext'
import { useSettings } from '@/context/SettingsContext'
import { useOllamaStatus } from '@/hooks/useOllamaStatus'
import {
  downloadText,
  exportConversationMarkdown,
  saveConversation,
} from '@/services/conversationStore'
import {
  generateWithControlEndpoint,
  generateWithOllama,
} from '@/services/ollamaApi'
import type { ChatMessage } from '@/types/ollama'

function newMessage(role: ChatMessage['role'], content: string): ChatMessage {
  return {
    id: crypto.randomUUID(),
    role,
    content,
    createdAt: new Date().toISOString(),
  }
}

export function ChatPage() {
  const { user } = useAuth()
  const { settings } = useSettings()
  const getIdToken = useCallback(
    () => (user ? user.getIdToken() : Promise.resolve(undefined)),
    [user],
  )
  const status = useOllamaStatus(settings, 0, getIdToken)
  const [selectedModel, setSelectedModel] = useState(settings.defaultModel)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [prompt, setPrompt] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [title, setTitle] = useState('MOLC-AI conversation')
  const [saveNotice, setSaveNotice] = useState<string | null>(null)

  const modelOptions = useMemo(() => {
    const running = status.runningModels.map((model) => model.name)
    const installed = status.installedModels.map((model) => model.name)
    return Array.from(new Set([...running, ...installed]))
  }, [status.installedModels, status.runningModels])

  const activeModel = selectedModel || modelOptions[0] || ''

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!activeModel || !prompt.trim()) return

    const userMessage = newMessage('user', prompt.trim())
    const assistantMessage = newMessage('assistant', '')
    setMessages((current) => [...current, userMessage, assistantMessage])
    setPrompt('')
    setError(null)
    setStreaming(true)

    try {
      const appendToken = (token: string) => {
        setMessages((current) =>
          current.map((message) =>
            message.id === assistantMessage.id
              ? { ...message, content: message.content + token }
              : message,
          ),
        )
      }
      const options = {
        temperature: settings.temperature,
        num_ctx: settings.contextLength,
      }

      if (settings.controlPlaneMode === 'direct-localhost') {
        await generateWithOllama(
          settings.ollamaApiBaseUrl,
          activeModel,
          userMessage.content,
          options,
          appendToken,
        )
      } else {
        const controlBaseUrl =
          settings.controlPlaneMode === 'cloud-relay'
            ? settings.cloudControlBaseUrl
            : settings.localAgentBaseUrl
        const idToken = user ? await user.getIdToken() : undefined
        await generateWithControlEndpoint(
          controlBaseUrl,
          activeModel,
          userMessage.content,
          options,
          appendToken,
          idToken,
        )
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Generation failed.'
      setError(message)
      setMessages((current) =>
        current.map((item) =>
          item.id === assistantMessage.id
            ? {
                ...item,
                content:
                  'Unable to stream from Ollama. Check that the Ollama service is running and reachable from this browser.',
              }
            : item,
        ),
      )
    } finally {
      setStreaming(false)
    }
  }

  async function handleSave() {
    setError(null)
    try {
      const result = await saveConversation({
        db,
        ownerUid: user?.uid,
        title,
        model: activeModel,
        messages,
        options: {
          temperature: settings.temperature,
          num_ctx: settings.contextLength,
        },
      })
      setSaveNotice(`Saved to ${result.storage}.`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save conversation.')
    }
  }

  function handleExport(format: 'json' | 'markdown') {
    if (format === 'json') {
      downloadText(
        'molc-ai-conversation.json',
        JSON.stringify({ title, model: activeModel, messages }, null, 2),
        'application/json',
      )
      return
    }

    downloadText(
      'molc-ai-conversation.md',
      exportConversationMarkdown(title, activeModel, messages),
      'text/markdown',
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 dark:border-slate-800 lg:flex-row lg:items-end">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill tone={status.mode === 'live' ? 'green' : 'amber'}>
              {status.mode === 'live' ? 'Ollama live' : 'Sample data'}
            </StatusPill>
            <StatusPill tone="blue">Chat</StatusPill>
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight">Model chat</h1>
        </div>
        <label className="w-full max-w-sm text-sm font-medium lg:text-right">
          Active model
          <select
            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-900 dark:focus:ring-sky-950"
            value={activeModel}
            onChange={(event) => setSelectedModel(event.target.value)}
          >
            {modelOptions.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
        </label>
      </div>

      <section className="mb-5 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-end">
          <label className="text-sm font-medium">
            Conversation title
            <input
              value={title}
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-950"
              onChange={(event) => setTitle(event.target.value)}
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-md bg-sky-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
              disabled={messages.length === 0}
              onClick={() => void handleSave()}
            >
              <Save className="h-4 w-4" />
              Save memory
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"
              disabled={messages.length === 0}
              onClick={() => handleExport('markdown')}
            >
              <Download className="h-4 w-4" />
              Export MD
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"
              disabled={messages.length === 0}
              onClick={() => handleExport('json')}
            >
              Export JSON
            </button>
          </div>
        </div>
        {saveNotice && (
          <p className="mt-3 text-sm font-medium text-emerald-600 dark:text-emerald-400">
            {saveNotice}
          </p>
        )}
      </section>

      {error && (
        <div className="mb-5 flex gap-3 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <ChatBox
        model={activeModel}
        messages={messages}
        prompt={prompt}
        streaming={streaming}
        temperature={settings.temperature}
        contextLength={settings.contextLength}
        onPromptChange={setPrompt}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
