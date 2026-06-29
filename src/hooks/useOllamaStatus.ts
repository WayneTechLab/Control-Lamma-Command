import { useCallback, useEffect, useState } from 'react'
import { sampleInstalledModels, sampleRunningModels } from '@/data/sampleOllama'
import {
  listInstalledModels,
  listModelsFromControlEndpoint,
  listRunningModels,
} from '@/services/ollamaApi'
import type {
  InstalledModel,
  OllamaStatusMode,
  RunningModel,
  RuntimeSettings,
} from '@/types/ollama'

type OllamaStatus = {
  installedModels: InstalledModel[]
  runningModels: RunningModel[]
  mode: OllamaStatusMode
  loading: boolean
  error: string | null
  lastUpdated: Date | null
  refresh: () => Promise<void>
}

export function useOllamaStatus(
  settings: RuntimeSettings,
  autoRefreshSeconds = 0,
  getIdToken?: () => Promise<string | undefined>,
): OllamaStatus {
  const [installedModels, setInstalledModels] = useState<InstalledModel[]>(
    sampleInstalledModels,
  )
  const [runningModels, setRunningModels] =
    useState<RunningModel[]>(sampleRunningModels)
  const [mode, setMode] = useState<OllamaStatusMode>('sample')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      if (settings.controlPlaneMode === 'direct-localhost') {
        const [installed, running] = await Promise.all([
          listInstalledModels(settings.ollamaApiBaseUrl),
          listRunningModels(settings.ollamaApiBaseUrl),
        ])
        setInstalledModels(installed)
        setRunningModels(running)
      } else {
        const controlBaseUrl =
          settings.controlPlaneMode === 'cloud-relay'
            ? settings.cloudControlBaseUrl
            : settings.localAgentBaseUrl
        const idToken = getIdToken ? await getIdToken() : undefined
        const models = await listModelsFromControlEndpoint(controlBaseUrl, idToken)
        setInstalledModels(models.installedModels)
        setRunningModels(models.runningModels)
      }
      setMode('live')
      setError(null)
      setLastUpdated(new Date())
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to reach Ollama.'
      setInstalledModels(sampleInstalledModels)
      setRunningModels(sampleRunningModels)
      setMode('sample')
      setError(message)
      setLastUpdated(new Date())
    } finally {
      setLoading(false)
    }
  }, [getIdToken, settings])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void refresh()
    }, 0)

    return () => window.clearTimeout(timeout)
  }, [refresh])

  useEffect(() => {
    if (autoRefreshSeconds <= 0) return undefined
    const interval = window.setInterval(() => {
      void refresh()
    }, autoRefreshSeconds * 1000)

    return () => window.clearInterval(interval)
  }, [autoRefreshSeconds, refresh])

  return {
    installedModels,
    runningModels,
    mode,
    loading,
    error,
    lastUpdated,
    refresh,
  }
}
