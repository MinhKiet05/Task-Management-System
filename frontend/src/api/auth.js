import { apiClient } from './client.js'

export async function authenticate(mode, values, signal) {
  const body = {
    email: values.email.trim().toLowerCase(),
    password: values.password,
  }
  if (mode === 'register') body.name = values.name.trim()
  const path = mode === 'register' ? '/api/auth/register' : '/api/auth/login'
  const { data } = await apiClient.post(path, body, { signal })
  return data
}

export async function getCurrentUser(signal) {
  const { data } = await apiClient.get('/api/auth/me', { signal })
  return data
}

export async function revokeSession() {
  await apiClient.post('/api/auth/logout')
}
