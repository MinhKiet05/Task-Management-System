import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'
import { getAccessToken, subscribeToToken } from '../api/tokenStore.js'
import { startReadResource } from './readResource.js'

const loading = { status: 'loading', data: null, error: null }

export function useApiResource(load, resourceKey) {
  const token = useSyncExternalStore(
    subscribeToToken,
    getAccessToken,
    () => null,
  )
  const [revision, setRevision] = useState(0)
  const [result, setResult] = useState(null)
  const key = JSON.stringify([token, resourceKey, revision])
  const retry = useCallback(() => setRevision((value) => value + 1), [])

  useEffect(() => {
    if (!token) return
    const controller = new AbortController()
    void startReadResource(load, controller.signal, (value) =>
      setResult({ key, ...value }),
    )
    return () => controller.abort()
  }, [token, key, load])

  return { ...(result?.key === key ? result : loading), retry }
}
