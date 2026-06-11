import { Link } from 'react-router-dom'

export function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-slate-500 sm:flex-row dark:text-slate-400">
        <p>&copy; {year} WebApp Stack G One Point Zero. Built to ship fast.</p>
        <div className="flex gap-4">
          <Link to="/about" className="hover:text-slate-900 dark:hover:text-white">
            About
          </Link>
          <Link to="/features" className="hover:text-slate-900 dark:hover:text-white">
            Features
          </Link>
          <Link to="/contact" className="hover:text-slate-900 dark:hover:text-white">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  )
}
