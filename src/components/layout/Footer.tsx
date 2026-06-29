import { Link } from 'react-router-dom'

export function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 text-sm text-slate-500 sm:flex-row sm:px-6 lg:px-8 dark:text-slate-400">
        <p>&copy; {year} MOLC-AI · My Ollama Local Cloud AI.</p>
        <div className="flex gap-4">
          <Link to="/" className="hover:text-slate-900 dark:hover:text-white">
            Home
          </Link>
          <Link to="/dashboard" className="hover:text-slate-900 dark:hover:text-white">
            Dashboard
          </Link>
          <Link to="/chat" className="hover:text-slate-900 dark:hover:text-white">
            Chat
          </Link>
          <Link to="/local-machine" className="hover:text-slate-900 dark:hover:text-white">
            Machine
          </Link>
          <Link to="/settings" className="hover:text-slate-900 dark:hover:text-white">
            Settings
          </Link>
        </div>
      </div>
    </footer>
  )
}
