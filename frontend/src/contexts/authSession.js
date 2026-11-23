import * as tokens from '../api/tokenStore.js'
import { getCurrentUser, revokeSession } from '../api/auth.js'
import { createAuthSession } from './createAuthSession.js'

export const authSession = createAuthSession({
  tokens,
  getCurrentUser,
  revokeSession,
})

if (import.meta.hot) import.meta.hot.dispose(() => authSession.dispose())
