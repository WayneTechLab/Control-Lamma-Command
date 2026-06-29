/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  createUserWithEmailAndPassword,
  getIdTokenResult,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth'
import { auth } from '@/config/firebase'
import {
  PUBLIC_LEVEL,
  SETUP_PREVIEW_LEVEL,
  canControlModels,
  canManageSystem,
  canManageUsers,
  getAccountLevelFromClaims,
  type AccountLevel,
} from '@/types/account'

type AuthContextValue = {
  user: User | null
  accountLevel: AccountLevel
  isSetupPreview: boolean
  canControlModels: boolean
  canManageUsers: boolean
  canManageSystem: boolean
  firebaseReady: boolean
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [accountLevel, setAccountLevel] = useState<AccountLevel>(
    auth ? PUBLIC_LEVEL : SETUP_PREVIEW_LEVEL,
  )
  const [loading, setLoading] = useState(Boolean(auth))
  const firebaseReady = Boolean(auth)
  const isSetupPreview = !firebaseReady

  useEffect(() => {
    if (!auth) {
      return undefined
    }

    return onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser)
      if (!nextUser) {
        setAccountLevel(PUBLIC_LEVEL)
        setLoading(false)
        return
      }

      const token = await getIdTokenResult(nextUser, true)
      setAccountLevel(getAccountLevelFromClaims(token.claims))
      setLoading(false)
    })
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      accountLevel,
      isSetupPreview,
      canControlModels: canControlModels(accountLevel.id),
      canManageUsers: canManageUsers(accountLevel.id),
      canManageSystem: canManageSystem(accountLevel.id),
      firebaseReady,
      loading,
      async signIn(email, password) {
        if (!auth) throw new Error('Firebase Auth is not configured.')
        await signInWithEmailAndPassword(auth, email, password)
      },
      async signUp(email, password) {
        if (!auth) throw new Error('Firebase Auth is not configured.')
        await createUserWithEmailAndPassword(auth, email, password)
      },
      async signOut() {
        if (!auth) return
        await firebaseSignOut(auth)
      },
    }),
    [accountLevel, firebaseReady, isSetupPreview, loading, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider.')
  return context
}
