import { useEffect, useRef, useState } from 'react'
import { getAccessToken } from '../api/tokenStore.js'
import { notify } from '../lib/notify.js'
import { startOperationNotification } from '../lib/operationNotification.js'
import { mutationRecovery } from '../lib/apiErrorMessage.js'

export function useNotifiedMutation(onSuccess, fieldsFor, operation) {
  const [state, setState] = useState({
    pending: false,
    error: '',
    fieldErrors: {},
  })
  const request = useRef(null)
  useEffect(
    () => () => {
      request.current?.controller.abort()
      request.current?.feedback.cancel()
    },
    [],
  )
  async function run(action) {
    if (request.current) return
    const controller = new AbortController()
    const token = getAccessToken()
    const feedback = startOperationNotification(notify, operation)
    request.current = { controller, feedback }
    setState({ pending: true, error: '', fieldErrors: {} })
    try {
      const result = await action(controller.signal)
      if (!controller.signal.aborted && token === getAccessToken()) {
        feedback.success()
        onSuccess(result)
      }
    } catch (error) {
      if (!controller.signal.aborted && token === getAccessToken()) {
        feedback.error(error)
        setState({
          pending: false,
          error: mutationRecovery(error),
          fieldErrors: fieldsFor(error),
        })
      }
    } finally {
      feedback.cancel()
      if (!controller.signal.aborted)
        setState((previous) => ({ ...previous, pending: false }))
      request.current = null
    }
  }
  return { ...state, run }
}
