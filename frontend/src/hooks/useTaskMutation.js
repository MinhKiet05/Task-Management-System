import { useEffect, useRef, useState } from 'react'
import { getAccessToken } from '../api/tokenStore.js'
import { taskError, taskFieldErrors } from '../components/tasks/taskModel.js'

export function useTaskMutation(onSuccess) {
  const [state, setState] = useState({
    pending: false,
    error: '',
    fieldErrors: {},
  })
  const request = useRef(null)
  useEffect(() => () => request.current?.abort(), [])
  async function run(action) {
    if (request.current) return
    const controller = new AbortController()
    const token = getAccessToken()
    request.current = controller
    setState({ pending: true, error: '', fieldErrors: {} })
    try {
      const result = await action(controller.signal)
      if (!controller.signal.aborted && token === getAccessToken())
        onSuccess(result)
    } catch (error) {
      if (!controller.signal.aborted && token === getAccessToken())
        setState({
          pending: false,
          error: taskError(error),
          fieldErrors: taskFieldErrors(error),
        })
    } finally {
      if (!controller.signal.aborted)
        setState((previous) => ({ ...previous, pending: false }))
      request.current = null
    }
  }
  return { ...state, run }
}
