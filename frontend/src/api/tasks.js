import { apiClient } from './client.js'
import { createTasksApi } from './taskRequests.js'

export const tasksApi = createTasksApi(apiClient)
