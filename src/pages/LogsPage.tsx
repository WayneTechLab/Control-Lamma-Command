import { useState } from 'react'
import { StatusPill } from '@/components/StatusPill'
import { useAuth } from '@/context/AuthContext'
import { LogsViewer } from '@/components/LogsViewer'
import { useSettings } from '@/context/SettingsContext'

const fallbackLogs = [
  '[control] local agent not connected',
  '[ollama] expected API: http://localhost:11434',
  '[ollama] macOS logs commonly live under ~/Library/Logs/Ollama',
  '[firebase] long-term command audit logs will write to logs/{logId}',
]

export function LogsPage() {
  const { settings } = useSettings()
  const { user } = useAuth()
  const [lines, setLines] = useState(fallbackLogs)
  const [loading, setLoading] = useState(false)
  const logsBaseUrl =
    settings.controlPlaneMode === 'cloud-relay'
      ? settings.cloudControlBaseUrl
      : settings.localAgentBaseUrl

  async function refreshLogs() {
    if (!logsBaseUrl.trim()) {
      setLines(fallbackLogs)
      return
    }

    setLoading(true)
    try {
      const idToken = user ? await user.getIdToken() : undefined
      const response = await fetch(`${logsBaseUrl.replace(/\/$/, '')}/logs`, {
        headers: {
          ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
        },
      })
      const text = await response.text()
      setLines(text.split('\n').filter(Boolean))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to read logs.'
      setLines([...fallbackLogs, `[agent] ${message}`])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 border-b border-slate-200 pb-6 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          <StatusPill tone={logsBaseUrl ? 'green' : 'amber'}>
            {logsBaseUrl ? 'Control endpoint configured' : 'Control endpoint pending'}
          </StatusPill>
          <StatusPill tone="slate">Audit trail</StatusPill>
        </div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight">Logs</h1>
      </div>
      <LogsViewer lines={lines} loading={loading} onRefresh={() => void refreshLogs()} />
    </div>
  )
}
