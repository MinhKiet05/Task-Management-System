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
