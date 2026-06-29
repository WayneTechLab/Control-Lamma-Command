import { createBrowserRouter } from 'react-router-dom'
import type { ReactNode } from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Layout } from '@/components/layout/Layout'
import { AdminUsersPage } from '@/pages/AdminUsersPage'
import { AuthPage } from '@/pages/AuthPage'
import { ChatPage } from '@/pages/ChatPage'
import { ControlApiPage } from '@/pages/ControlApiPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { HomePage } from '@/pages/HomePage'
import { LocalMachinePage } from '@/pages/LocalMachinePage'
import { LogsPage } from '@/pages/LogsPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { ToolsPage } from '@/pages/ToolsPage'
import type { AccountLevelId } from '@/types/account'

function protectedPage(element: ReactNode, minLevel?: AccountLevelId) {
  return <ProtectedRoute minLevel={minLevel}>{element}</ProtectedRoute>
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'dashboard', element: protectedPage(<DashboardPage />, 1) },
      { path: 'chat', element: protectedPage(<ChatPage />) },
      { path: 'local-machine', element: protectedPage(<LocalMachinePage />, 1) },
      { path: 'tools', element: protectedPage(<ToolsPage />, 1) },
      { path: 'settings', element: protectedPage(<SettingsPage />) },
      { path: 'logs', element: protectedPage(<LogsPage />) },
      { path: 'api-control', element: protectedPage(<ControlApiPage />, 1) },
      { path: 'admin/users', element: protectedPage(<AdminUsersPage />, 4) },
      { path: 'login', element: <AuthPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
