import type { ReactNode } from 'react'
import { classNames } from '@/lib/format'

type StatusPillProps = {
  tone: 'green' | 'amber' | 'blue' | 'red' | 'slate'
  children: ReactNode
}

const toneClasses: Record<StatusPillProps['tone'], string> = {
  green: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300',
  amber: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300',
  blue: 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-300',
  red: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300',
  slate:
    'border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200',
}

export function StatusPill({ tone, children }: StatusPillProps) {
  return (
    <span
      className={classNames(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold',
        toneClasses[tone],
      )}
    >
      {children}
    </span>
  )
}
