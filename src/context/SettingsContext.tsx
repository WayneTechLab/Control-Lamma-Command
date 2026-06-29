/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { ControlPlaneMode, RuntimeSettings } from '@/types/ollama'

const STORAGE_KEY = 'control-llama-command.settings'
const DEFAULT_LOCAL_AGENT_BASE_URL = 'http://127.0.0.1:8787'

function readControlPlaneMode(): ControlPlaneMode {
  const value = import.meta.env.VITE_CONTROL_PLANE_MODE
  if (
    value === 'direct-localhost' ||
    value === 'local-agent' ||
    value === 'cloud-relay'
  ) {
    return value
  }

  return 'local-agent'
}

const defaultSettings: RuntimeSettings = {
  controlPlaneMode: readControlPlaneMode(),
  ollamaApiBaseUrl:
    import.meta.env.VITE_OLLAMA_API_BASE_URL || 'http://localhost:11434',
  localAgentBaseUrl:
    import.meta.env.VITE_LOCAL_AGENT_BASE_URL || DEFAULT_LOCAL_AGENT_BASE_URL,
  cloudControlBaseUrl: import.meta.env.VITE_CLOUD_CONTROL_BASE_URL || '',
  defaultModel: import.meta.env.VITE_DEFAULT_MODEL || '',
  temperature: 0.7,
  contextLength: 4096,
  autoRefreshSeconds: 5,
  remoteAccessEnabled: false,
}

type SettingsContextValue = {
  settings: RuntimeSettings
  updateSettings: (patch: Partial<RuntimeSettings>) => void
  resetSettings: () => void
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

function normalizeSettings(settings: RuntimeSettings) {
  if (
    settings.controlPlaneMode !== 'cloud-relay' &&
    !settings.localAgentBaseUrl.trim()
  ) {
    return {
      ...settings,
      localAgentBaseUrl: DEFAULT_LOCAL_AGENT_BASE_URL,
    }
  }

  return settings
}

function readSettings() {
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return defaultSettings

  try {
    return normalizeSettings({
      ...defaultSettings,
      ...(JSON.parse(raw) as Partial<RuntimeSettings>),
    })
  } catch {
    return defaultSettings
  }
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<RuntimeSettings>(() => readSettings())
  const effectiveSettings = useMemo(() => normalizeSettings(settings), [settings])

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(effectiveSettings))
  }, [effectiveSettings])

  const updateSettings = useCallback((patch: Partial<RuntimeSettings>) => {
    setSettings((current) => ({ ...current, ...patch }))
  }, [])

  const resetSettings = useCallback(() => {
    setSettings(defaultSettings)
  }, [])

  const value = useMemo(
    () => ({ settings: effectiveSettings, updateSettings, resetSettings }),
    [effectiveSettings, resetSettings, updateSettings],
  )

  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (!context) throw new Error('useSettings must be used inside SettingsProvider.')
  return context
}
