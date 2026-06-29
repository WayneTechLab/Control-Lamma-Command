import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import type { AccountLevelId } from '@/types/account'

type ProtectedRouteProps = {
  children: ReactNode
  minLevel?: AccountLevelId
}

export function ProtectedRoute({ children, minLevel = 1 }: ProtectedRouteProps) {
  const { accountLevel, firebaseReady, isSetupPreview, loading, user } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="grid min-h-[420px] place-items-center text-sm text-slate-500 dark:text-slate-400">
        Checking session...
      </div>
    )
  }

  if (firebaseReady && !user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (!isSetupPreview && accountLevel.id < minLevel) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
