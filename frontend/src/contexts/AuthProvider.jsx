import { useEffect, useMemo, useSyncExternalStore } from 'react'
import { AuthContext } from './AuthContext.js'
import { clearAccessToken, setAccessToken } from '../api/tokenStore.js'
import { authSession } from './authSession.js'

export function AuthProvider({ children }) {
  const session = useSyncExternalStore(
    authSession.subscribe,
    authSession.getSnapshot,
    authSession.getSnapshot,
  )
  useEffect(() => {
    if (session.status === 'checking') void authSession.ensureUser()
  }, [session.status])

  useEffect(() => {
    if (!session.expiresAt) return
    const remaining = Date.parse(session.expiresAt) - Date.now()
    if (!Number.isFinite(remaining)) return
    const timer = setTimeout(
      clearAccessToken,
      Math.max(0, Math.min(remaining, 2147483647)),
    )
    return () => clearTimeout(timer)
  }, [session.expiresAt])

  const value = useMemo(
    () => ({
      ...session,
      hasAccessToken: session.status !== 'anonymous',
      setAccessToken,
      clearAccessToken,
      completeAuthentication: authSession.completeAuthentication,
      retryUser: authSession.ensureUser,
      logout: authSession.logout,
    }),
    [session],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
