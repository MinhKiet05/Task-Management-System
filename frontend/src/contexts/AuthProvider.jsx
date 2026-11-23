import { useMemo, useSyncExternalStore } from 'react'
import { AuthContext } from './AuthContext.js'
import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
  subscribeToToken,
} from '../api/tokenStore.js'

export function AuthProvider({ children }) {
  const accessToken = useSyncExternalStore(
    subscribeToToken,
    getAccessToken,
    () => null,
  )
  const value = useMemo(
    () => ({
      hasAccessToken: Boolean(accessToken),
      setAccessToken,
      clearAccessToken,
    }),
    [accessToken],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
