import { useEffect, useRef, useState } from 'react'
import { getAccessToken } from '../api/tokenStore.js'
import {
  projectError,
  projectFieldErrors,
} from '../components/projects/projectModel.js'

export function useProjectMutation(onSuccess) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const request = useRef(null)
  useEffect(() => () => request.current?.abort(), [])

  async function run(action) {
    if (request.current) return
    const controller = new AbortController()
    const token = getAccessToken()
    request.current = controller
    setPending(true)
    setError('')
    setFieldErrors({})
    try {
      const result = await action(controller.signal)
      if (!controller.signal.aborted && getAccessToken() === token)
        onSuccess(result)
    } catch (failure) {
      if (!controller.signal.aborted && getAccessToken() === token) {
        setError(projectError(failure))
        setFieldErrors(projectFieldErrors(failure))
      }
    } finally {
      if (!controller.signal.aborted) setPending(false)
      request.current = null
    }
  }
  return { pending, error, fieldErrors, run }
}
