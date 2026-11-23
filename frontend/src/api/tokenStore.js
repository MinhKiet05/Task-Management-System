let accessToken = null
const listeners = new Set()

export function getAccessToken() {
  return accessToken
}

export function setAccessToken(token) {
  if (typeof token !== 'string' || !token.trim() || /\s/.test(token)) {
    throw new TypeError(
      'An access token must be a nonempty string without whitespace.',
    )
  }
  updateToken(token)
}

export function clearAccessToken() {
  updateToken(null)
}

export function subscribeToToken(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function updateToken(token) {
  if (accessToken === token) return
  accessToken = token
  listeners.forEach((listener) => listener())
}
