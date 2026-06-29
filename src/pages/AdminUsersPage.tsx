import { ShieldAlert, Users } from 'lucide-react'
import { StatusPill } from '@/components/StatusPill'
import { useAuth } from '@/context/AuthContext'
import { ACCOUNT_LEVELS } from '@/types/account'

export function AdminUsersPage() {
  const { accountLevel, canManageSystem } = useAuth()

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="border-b border-slate-200 pb-6 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          <StatusPill tone="blue">User management</StatusPill>
          <StatusPill tone={canManageSystem ? 'green' : 'amber'}>
            {canManageSystem ? 'Owner controls' : 'Employee controls'}
          </StatusPill>
        </div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight">Users</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-300">
          This route is reserved for Level 4 and Level 5 accounts. The next
          backend step is a callable/agent endpoint that lets owners assign
          account levels through verified Firebase custom claims.
        </p>
      </div>

      <section className="mt-6 grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-950 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">Level</th>
                <th className="px-4 py-3">Audience</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Management rule</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {Object.values(ACCOUNT_LEVELS).map((level) => (
                <tr key={level.id}>
                  <td className="px-4 py-3 font-semibold">{level.label}</td>
                  <td className="px-4 py-3">{level.audience}</td>
                  <td className="px-4 py-3">{level.plan}</td>
                  <td className="px-4 py-3">
                    {level.id >= 4
                      ? 'Owner only'
                      : 'Employee support or owner'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <aside className="space-y-4">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-sky-600 dark:text-sky-400" />
              <h2 className="font-semibold">Current access</h2>
            </div>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              You are operating as {accountLevel.label}. Level 5 is required to
              promote or demote private accounts.
            </p>
          </section>
          <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100">
            <div className="flex gap-3">
              <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
              <p>
                Account changes must be made by a trusted server using the
                Firebase Admin SDK, never from browser-only code.
              </p>
            </div>
          </section>
        </aside>
      </section>
    </div>
  )
}
