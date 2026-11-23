import { useCallback, useState } from 'react'
import { Link, useParams } from 'react-router'
import { projectsApi } from '../api/projects.js'
import { useApiResource } from '../hooks/useApiResource.js'
import { usePageTitle } from '../hooks/usePageTitle.js'
import { projectError } from '../components/projects/projectModel.js'
import {
  formatDueDate,
  priorityLabels,
  statusLabels,
} from '../components/dashboard/presentation.js'
import '../components/projects/projects.css'

function ProjectTasksContent({ projectId }) {
  const [page, setPage] = useState(0)
  const loadProject = useCallback(
    (signal) => projectsApi.get(projectId, signal),
    [projectId],
  )
  const loadTasks = useCallback(
    (signal) => projectsApi.tasks(projectId, page, signal),
    [projectId, page],
  )
  const project = useApiResource(loadProject, `project-${projectId}`)
  const tasks = useApiResource(loadTasks, `project-tasks-${projectId}-${page}`)
  usePageTitle(project.data?.name || 'Công việc trong dự án', 'TaskFlow')
  const error = project.error || tasks.error
  return (
    <div className="projects-page">
      <Link className="project-back" to="/projects">
        ← Về dự án của tôi
      </Link>
      <header className="projects-heading">
        <div>
          <h1>{project.data?.name || 'Công việc trong dự án'}</h1>
          <p>
            {project.data?.status === 'ARCHIVED'
              ? 'Dự án đã lưu trữ. Công việc chỉ có thể xem.'
              : 'Danh sách công việc của dự án.'}
          </p>
        </div>
      </header>
      {error ? (
        <div className="project-empty" role="alert">
          <p>{projectError(error)}</p>
          <button
            className="project-button-secondary"
            onClick={() => {
              project.retry()
              tasks.retry()
            }}
          >
            Thử lại
          </button>
        </div>
      ) : tasks.status === 'loading' || project.status === 'loading' ? (
        <p className="project-empty" role="status">
          Đang tải công việc…
        </p>
      ) : (
        <>
          <ul className="project-task-list">
            {tasks.data.content.map((task) => (
              <li key={task.id}>
                <Link to={`/tasks/${encodeURIComponent(task.id)}`}>
                  {task.title}
                </Link>
                <div>
                  <span>{statusLabels[task.status]}</span>
                  <span>Ưu tiên: {priorityLabels[task.priority]}</span>
                  <span>Hạn: {formatDueDate(task.dueDate)}</span>
                </div>
              </li>
            ))}
          </ul>
          {!tasks.data.content.length && (
            <p className="project-empty">
              Dự án chưa có công việc trên trang này.
            </p>
          )}
          <nav
            className="projects-pagination"
            aria-label="Phân trang công việc dự án"
          >
            <span>
              {tasks.data.totalElements.toLocaleString('vi-VN')} công việc ·
              Trang {page + 1}
            </span>
            <div>
              <button
                className="project-button-secondary"
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
              >
                Trước
              </button>
              <button
                className="project-button-secondary"
                disabled={page + 1 >= tasks.data.totalPages}
                onClick={() => setPage(page + 1)}
              >
                Sau
              </button>
            </div>
          </nav>
        </>
      )}
    </div>
  )
}

export function ProjectTasksPage() {
  const { projectId } = useParams()
  return <ProjectTasksContent key={projectId} projectId={projectId} />
}
