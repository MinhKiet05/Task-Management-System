import { apiClient } from './client.js'
import { createProjectsApi } from './projectRequests.js'

export const projectsApi = createProjectsApi(apiClient)
