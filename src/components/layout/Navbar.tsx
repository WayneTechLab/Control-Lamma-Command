import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Bot, LogOut, Menu, X } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { StatusPill } from '@/components/StatusPill'

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/chat', label: 'Chat' },
  { to: '/local-machine', label: 'Machine' },
  { to: '/tools', label: 'Tools' },
  { to: '/settings', label: 'Settings' },
  { to: '/logs', label: 'Logs' },
]

export function Navbar() {
  const [open, setOpen] = useState(false)
  const { accountLevel, canManageUsers, firebaseReady, isSetupPreview, signOut, user } =
    useAuth()
  const visibleLinks = canManageUsers
    ? [...links, { to: '/admin/users', label: 'Users' }]
    : links

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
      isActive
        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
    }`

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <NavLink to="/" className="flex items-center gap-2 font-bold">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-slate-900 text-white dark:bg-white dark:text-slate-950">
            <Bot className="h-5 w-5" />
          </span>
          <span>MOLC-AI</span>
        </NavLink>

        <div className="hidden items-center gap-1 md:flex">
          {visibleLinks.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
          <div className="ml-3 flex items-center gap-2 border-l border-slate-200 pl-3 dark:border-slate-800">
            <StatusPill tone={accountLevel.id >= 4 ? 'blue' : 'slate'}>
              L{accountLevel.id}
              {isSetupPreview ? ' setup' : ''}
            </StatusPill>
            {firebaseReady && user ? (
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                onClick={() => void signOut()}
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            ) : (
              <NavLink to="/login" className={linkClass}>
                Login
              </NavLink>
            )}
          </div>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 text-slate-600 hover:bg-slate-100 md:hidden dark:text-slate-300 dark:hover:bg-slate-800"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-slate-200 px-4 pb-3 md:hidden dark:border-slate-800">
          <div className="flex flex-col gap-1 pt-2">
            {visibleLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={linkClass}
                onClick={() => setOpen(false)}
              >
                {l.label}
              </NavLink>
            ))}
            {firebaseReady && user ? (
              <button
                type="button"
                className="rounded-md px-3 py-2 text-left text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                onClick={() => {
                  setOpen(false)
                  void signOut()
                }}
              >
                Sign out
              </button>
            ) : (
              <NavLink
                to="/login"
                className={linkClass}
                onClick={() => setOpen(false)}
              >
                Login
              </NavLink>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
