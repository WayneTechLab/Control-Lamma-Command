import {
  Cpu,
  Download,
  Info,
  Play,
  Square,
  Trash2,
  type LucideIcon,
} from 'lucide-react'
import { classNames, formatBytes, formatDateTime } from '@/lib/format'
import type { AccountLevel } from '@/types/account'
import type { InstalledModel } from '@/types/ollama'
import { StatusPill } from './StatusPill'

type ModelAction = 'start' | 'stop' | 'pull' | 'remove'

type ModelCardProps = {
  model: InstalledModel
  isRunning: boolean
  accountLevel: AccountLevel
  canControlModels: boolean
  commandEnabled: boolean
  busyAction?: ModelAction | null
  onAction: (action: ModelAction, model: InstalledModel) => void
  onDetails: (model: InstalledModel) => void
}

const controls: Array<{
  action: ModelAction
  icon: LucideIcon
  label: string
  actionText: string
}> = [
  { action: 'start', icon: Play, label: 'Start', actionText: 'Load model' },
  { action: 'stop', icon: Square, label: 'Stop', actionText: 'Unload model' },
  { action: 'pull', icon: Download, label: 'Pull', actionText: 'Download/update' },
  { action: 'remove', icon: Trash2, label: 'Remove', actionText: 'Delete local copy' },
]

function getDisabledReason(
  accountLevel: AccountLevel,
  hasControlAccess: boolean,
  commandEnabled: boolean,
) {
  if (!commandEnabled) return 'Control endpoint missing'
  if (!hasControlAccess) return `Level 4+ required; current level is ${accountLevel.id}`
  return null
}

export function ModelCard({
  model,
  isRunning,
  accountLevel,
  canControlModels,
  commandEnabled,
  busyAction,
  onAction,
  onDetails,
}: ModelCardProps) {
  const details = model.details
  const controlsSummary = isRunning
    ? 'Running confirmed. Stop sends an unload request; Start refreshes keep-alive.'
    : 'Idle confirmed. Start loads this model; Stop sends a safe unload request.'
  const accessSummary = commandEnabled
    ? canControlModels
      ? 'Local agent ready. Commands will ask for confirmation first.'
      : `Local agent configured, but ${accountLevel.label} cannot execute model commands.`
    : 'Set a local-agent or cloud-relay endpoint in Settings before commands can run.'

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold">{model.name}</h3>
            {isRunning ? (
              <StatusPill tone="green">Running</StatusPill>
            ) : (
              <StatusPill tone="slate">Idle</StatusPill>
            )}
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {details?.parameter_size ?? 'Unknown params'} ·{' '}
            {details?.quantization_level ?? 'Unknown quant'}
          </p>
        </div>
        <button
          type="button"
          className="rounded-md p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          aria-label={`Show details for ${model.name}`}
          onClick={() => onDetails(model)}
        >
          <Info className="h-4 w-4" />
        </button>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-slate-500 dark:text-slate-400">Size</dt>
          <dd className="font-medium">{formatBytes(model.size)}</dd>
        </div>
        <div>
          <dt className="text-slate-500 dark:text-slate-400">Modified</dt>
          <dd className="font-medium">{formatDateTime(model.modified_at)}</dd>
        </div>
        <div>
          <dt className="text-slate-500 dark:text-slate-400">Family</dt>
          <dd className="font-medium">{details?.family ?? 'Unknown'}</dd>
        </div>
        <div>
          <dt className="text-slate-500 dark:text-slate-400">Format</dt>
          <dd className="font-medium">{details?.format ?? 'Unknown'}</dd>
        </div>
      </dl>

      <div className="mt-5 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-800 dark:bg-slate-950">
        <p className="font-medium text-slate-800 dark:text-slate-100">
          {controlsSummary}
        </p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {accessSummary}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {controls.map(({ action, icon: Icon, label, actionText }) => {
          const disabledReason = getDisabledReason(
            accountLevel,
            canControlModels,
            commandEnabled,
          )
          const disabled = Boolean(disabledReason) || busyAction === action
          const buttonTitle = disabledReason
            ? `${label} unavailable: ${disabledReason}`
            : `${label}: ${actionText}. Confirmation required.`
          return (
            <button
              key={action}
              type="button"
              className={classNames(
                'inline-flex min-w-28 items-center gap-2 rounded-md border px-3 py-2 text-left text-xs font-semibold transition',
                disabled
                  ? 'cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-600'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800',
              )}
              disabled={disabled}
              title={buttonTitle}
              aria-label={buttonTitle}
              onClick={() => onAction(action, model)}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="flex flex-col leading-tight">
                <span>{busyAction === action ? 'Working' : label}</span>
                <span className="font-normal">{disabledReason ?? actionText}</span>
              </span>
            </button>
          )
        })}
      </div>

      {!commandEnabled && (
        <p className="mt-3 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Cpu className="h-3.5 w-3.5" />
          Control endpoint required for shell-backed controls.
        </p>
      )}
    </article>
  )
}
