import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'
import { tasksApi } from '../api/tasks.js'
import { getAccessToken, subscribeToToken } from '../api/tokenStore.js'
import { columnQuery, mergeTasks } from '../components/kanban/kanbanModel.js'
import { startReadResource } from './readResource.js'

const initial = {
  status: 'loading',
  tasks: [],
  total: null,
  totalPages: 0,
  page: 0,
  error: null,
  loadingMore: false,
  moreError: null,
}

export function useKanbanColumn(projectId, status, search, priority, revision) {
  const token = useSyncExternalStore(
    subscribeToToken,
    getAccessToken,
    () => null,
  )
  const [stored, setStored] = useState(null)
  const [retryId, setRetryId] = useState(0)
  const more = useRef(null)
  const key = JSON.stringify([
    token,
    projectId,
    status,
    search,
    priority,
    revision,
    retryId,
  ])
  const state = stored?.key === key ? stored : initial
  const load = useCallback(
    (signal) =>
      tasksApi.list(projectId, columnQuery(status, search, priority), signal),
    [projectId, status, search, priority],
  )
  useEffect(() => {
    if (!token) return
    const controller = new AbortController()
    void startReadResource(load, controller.signal, (result) => {
      if (result.status === 'success')
        setStored({
          ...initial,
          key,
          status: 'success',
          tasks: mergeTasks([], result.data.content),
          total: result.data.totalElements,
          totalPages: result.data.totalPages,
        })
      else
        setStored({
          ...initial,
          key,
          status: result.status,
          error: result.error,
        })
    })
    return () => {
      controller.abort()
      more.current?.abort()
      more.current = null
    }
  }, [token, key, load])

  async function loadMore() {
    if (
      more.current ||
      state.status !== 'success' ||
      state.page + 1 >= state.totalPages
    )
      return
    const controller = new AbortController()
    const requestedPage = state.page + 1
    more.current = controller
    setStored((previous) =>
      previous?.key === key
        ? { ...previous, loadingMore: true, moreError: null }
        : previous,
    )
    try {
      const data = await tasksApi.list(
        projectId,
        columnQuery(status, search, priority, requestedPage),
        controller.signal,
      )
      if (!controller.signal.aborted && token === getAccessToken())
        setStored((previous) =>
          previous?.key === key
            ? {
                ...previous,
                tasks: mergeTasks(previous.tasks, data.content),
                total: data.totalElements,
                totalPages: data.totalPages,
                page: requestedPage,
                loadingMore: false,
              }
            : previous,
        )
    } catch (error) {
      if (!controller.signal.aborted && token === getAccessToken())
        setStored((previous) =>
          previous?.key === key
            ? { ...previous, loadingMore: false, moreError: error }
            : previous,
        )
    } finally {
      if (more.current === controller) more.current = null
    }
  }
  return { ...state, loadMore, retry: () => setRetryId((value) => value + 1) }
}
