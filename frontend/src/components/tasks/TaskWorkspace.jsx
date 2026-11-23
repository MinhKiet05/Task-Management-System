import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { tasksApi } from '../../api/tasks.js'
import { useApiResource } from '../../hooks/useApiResource.js'
import { usePageTitle } from '../../hooks/usePageTitle.js'
import { useTaskMutation } from '../../hooks/useTaskMutation.js'
import {
  priorityLabels,
  statusLabels,
  formatCount,
} from '../dashboard/presentation.js'
import { TaskEditor } from './TaskEditor.jsx'
import { TaskDeleteDialog } from './TaskDeleteDialog.jsx'
import { TaskTable } from './TaskTable.jsx'
import {
  defaultTaskQuery,
  taskError,
  taskPriorities,
  taskStatuses,
} from './taskModel.js'
import '../projects/projects.css'
import './tasks.css'

function TaskState({ resource, children }) {
  if (resource.status === 'loading')
    return (
      <div className="task-state" role="status">
        <div className="task-skeleton" />
        <div className="task-skeleton" />
        <span>Đang tải công việc…</span>
      </div>
    )
  if (resource.status === 'error')
    return (
      <div className="task-state" role="alert">
        <p>{taskError(resource.error)}</p>
        <button className="project-button-secondary" onClick={resource.retry}>
          Thử lại
        </button>
      </div>
    )
  return children
}

function TaskScope({
  project,
  projects,
  selectProject,
  refreshProjects,
  notice,
  setNotice,
}) {
  const [query, setQuery] = useState(defaultTaskQuery)
  const [search, setSearch] = useState('')
  const [dialog, setDialog] = useState(null)
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])
  useEffect(() => {
    const timer = setTimeout(
      () =>
        setQuery((previous) =>
          previous.search === search
            ? previous
            : { ...previous, search, page: 0 },
        ),
      350,
    )
    return () => clearTimeout(timer)
  }, [search])
  const loadTasks = useCallback(
    (signal) => tasksApi.list(project.id, query, signal),
    [project.id, query],
  )
  const loadSummary = useCallback(
    (signal) => tasksApi.summary(project.id, signal),
    [project.id],
  )
  const loadOverdue = useCallback(
    (signal) => tasksApi.overdue(project.id, signal),
    [project.id],
  )
  const tasks = useApiResource(loadTasks, JSON.stringify([project.id, query]))
  const summary = useApiResource(loadSummary, `task-summary-${project.id}`)
  const overdue = useApiResource(loadOverdue, `task-overdue-${project.id}`)
  const locked = project.status !== 'ACTIVE'
  const refresh = () => {
    tasks.retry()
    summary.retry()
    overdue.retry()
  }
  const quickStatus = useTaskMutation(() => {
    setNotice('Đã cập nhật trạng thái công việc.')
    refresh()
  })
  const change = (name, value) =>
    setQuery((previous) => ({ ...previous, search, [name]: value, page: 0 }))
  const reset = () => {
    setSearch('')
    setQuery({ ...defaultTaskQuery, size: query.size })
  }
  const searching = search !== query.search
  const filtered = Boolean(query.search || query.status || query.priority)
  const page = tasks.data
  const stats = [
    {
      label: 'Cần thực hiện',
      value: summary.data?.todoTasks,
      resource: summary,
      kind: 'todo',
    },
    {
      label: 'Đang tiến hành',
      value: summary.data?.inProgressTasks,
      resource: summary,
      kind: 'progress',
    },
    {
      label: 'Đã hoàn thành',
      value: summary.data?.doneTasks,
      resource: summary,
      kind: 'done',
    },
    {
      label: 'Quá hạn',
      value: overdue.data?.totalElements,
      resource: overdue,
      kind: 'late',
    },
  ]
  function saved(result) {
    const creating = dialog?.type === 'create'
    const deleting = dialog?.type === 'delete'
    setDialog(null)
    setNotice(
      deleting
        ? 'Đã xóa công việc.'
        : creating
          ? 'Đã thêm công việc.'
          : 'Đã lưu công việc.',
    )
    if (result?.projectId && result.projectId !== project.id) {
      selectProject(result.projectId)
      return
    }
    if (creating) {
      setSearch('')
      setQuery({ ...defaultTaskQuery, size: query.size })
    } else if (deleting && page?.content.length === 1 && query.page > 0)
      setQuery((previous) => ({ ...previous, page: previous.page - 1 }))
    refresh()
  }
  return (
    <>
      <header className="tasks-heading">
        <div>
          <p className="tasks-eyebrow">Không gian làm việc / Việc của tôi</p>
          <h1>Công việc của tôi</h1>
          <p>
            Quản lý, phân loại và cập nhật tiến độ công việc theo từng dự án.
          </p>
        </div>
        <button
          className="project-button-primary"
          disabled={locked || quickStatus.pending}
          onClick={() => setDialog({ type: 'create' })}
        >
          + Thêm công việc
        </button>
      </header>
      <section className="tasks-scope" aria-label="Phạm vi dự án">
        <label htmlFor="task-project-scope">Dự án đang xem</label>
        <select
          id="task-project-scope"
          value={project.id}
          onChange={(event) => selectProject(event.target.value)}
        >
          {projects.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
              {item.status === 'ARCHIVED' ? ' (Đã lưu trữ)' : ''}
            </option>
          ))}
        </select>
        <button
          className="project-button-secondary"
          onClick={refreshProjects}
          disabled={quickStatus.pending}
        >
          Tải lại dự án
        </button>
        <p>Danh sách và thống kê chỉ thuộc dự án đã chọn.</p>
      </section>
      {locked && (
        <p className="task-archive-notice" role="status">
          Dự án đã lưu trữ: chỉ có thể xem công việc. Không thể thêm, sửa,
          chuyển, đổi trạng thái hoặc xóa.
        </p>
      )}
      {notice && (
        <p className="task-success" role="status">
          {notice}
        </p>
      )}
      <section className="task-statistics" aria-label="Thống kê toàn bộ dự án">
        {stats.map((item) => (
          <article
            key={item.kind}
            className={`task-stat task-stat-${item.kind}`}
          >
            <h2>{item.label}</h2>
            <strong>
              {item.resource.status === 'success'
                ? formatCount(item.value)
                : '—'}
            </strong>
            <span>công việc</span>
            {item.resource.status === 'loading' && (
              <p role="status">Đang tải…</p>
            )}
            {item.resource.status === 'error' && (
              <button onClick={item.resource.retry}>Tải lại thống kê</button>
            )}
          </article>
        ))}
      </section>
      <p className="tasks-scope-note">
        Thống kê toàn bộ dự án, không theo bộ lọc. Quá hạn được tính theo múi
        giờ máy chủ; nhãn ngày trên từng công việc theo ngày địa phương của bạn.
      </p>
      <section className="task-filters" aria-label="Tìm kiếm và lọc công việc">
        <div className="task-search">
          <label htmlFor="task-search">Tìm theo tên công việc</label>
          <div>
            <input
              id="task-search"
              type="search"
              maxLength={255}
              value={search}
              placeholder="Nhập tên công việc…"
              onChange={(event) => setSearch(event.target.value)}
            />
            <button
              className="project-button-secondary"
              disabled={!search}
              onClick={() => {
                setSearch('')
                setQuery((previous) => ({ ...previous, search: '', page: 0 }))
              }}
            >
              Xóa tìm kiếm
            </button>
          </div>
        </div>
        <div className="task-filter-row">
          <label>
            Trạng thái
            <select
              aria-label="Trạng thái"
              value={query.status}
              onChange={(event) => change('status', event.target.value)}
            >
              <option value="">Tất cả trạng thái</option>
              {taskStatuses.map((value) => (
                <option key={value} value={value}>
                  {statusLabels[value]}
                </option>
              ))}
            </select>
          </label>
          <label>
            Ưu tiên
            <select
              aria-label="Ưu tiên"
              value={query.priority}
              onChange={(event) => change('priority', event.target.value)}
            >
              <option value="">Tất cả ưu tiên</option>
              {taskPriorities.map((value) => (
                <option key={value} value={value}>
                  {priorityLabels[value]}
                </option>
              ))}
            </select>
          </label>
          <label>
            Sắp xếp
            <select
              aria-label="Sắp xếp"
              value={query.sort}
              onChange={(event) => change('sort', event.target.value)}
            >
              <option value="dueDate,asc">Hạn hoàn thành gần nhất</option>
              <option value="dueDate,desc">Hạn hoàn thành xa nhất</option>
              <option value="createdAt,desc">Mới tạo gần nhất</option>
              <option value="createdAt,asc">Tạo lâu nhất</option>
              <option value="title,asc">Tên A → Z</option>
              <option value="priority,desc">Ưu tiên cao trước</option>
            </select>
          </label>
          <button className="project-button-secondary" onClick={reset}>
            Xóa bộ lọc
          </button>
        </div>
      </section>
      {quickStatus.error && (
        <p className="project-error" role="alert">
          {quickStatus.error}{' '}
          <button onClick={refresh}>Tải lại công việc</button>
        </p>
      )}
      {searching && (
        <p className="task-search-pending" role="status">
          Đang chờ tìm kiếm…
        </p>
      )}
      <TaskState resource={tasks}>
        {page && (
          <>
            {page.content.length ? (
              <TaskTable
                tasks={page.content}
                project={project}
                now={now}
                pending={quickStatus.pending}
                onEdit={(task) => setDialog({ type: 'edit', task })}
                onDelete={(task) => setDialog({ type: 'delete', task })}
                onStatus={(task, status) => {
                  if (!locked && status !== task.status)
                    void quickStatus.run((signal) =>
                      tasksApi.status(task.id, status, signal),
                    )
                }}
              />
            ) : (
              <div className="task-state">
                <h2>
                  {locked
                    ? 'Dự án đã lưu trữ chỉ cho phép xem công việc.'
                    : filtered
                      ? 'Không có kết quả phù hợp'
                      : 'Chưa có công việc trên trang này'}
                </h2>
                <p>
                  {filtered
                    ? 'Thử tên khác hoặc xóa bộ lọc.'
                    : 'Thêm công việc đầu tiên để bắt đầu quản lý dự án.'}
                </p>
                {filtered && (
                  <button className="project-button-secondary" onClick={reset}>
                    Xóa bộ lọc
                  </button>
                )}
                {query.page > 0 && (
                  <button
                    className="project-button-secondary"
                    onClick={() =>
                      setQuery((previous) => ({ ...previous, page: 0 }))
                    }
                  >
                    Về trang đầu
                  </button>
                )}
              </div>
            )}
            <nav className="task-pagination" aria-label="Phân trang công việc">
              <span>
                {formatCount(page.totalElements)} công việc phù hợp · Trang{' '}
                {page.totalPages ? query.page + 1 : 0} / {page.totalPages}
              </span>
              <label>
                Mỗi trang
                <select
                  aria-label="Mỗi trang"
                  value={query.size}
                  onChange={(event) =>
                    change('size', Number(event.target.value))
                  }
                >
                  {[10, 20, 50, 100].map((size) => (
                    <option value={size} key={size}>
                      {size} công việc
                    </option>
                  ))}
                </select>
              </label>
              <div>
                <button
                  className="project-button-secondary"
                  disabled={
                    query.page === 0 || searching || quickStatus.pending
                  }
                  onClick={() =>
                    setQuery((previous) => ({
                      ...previous,
                      page: previous.page - 1,
                    }))
                  }
                >
                  Trước
                </button>
                <button
                  className="project-button-secondary"
                  disabled={
                    query.page + 1 >= page.totalPages ||
                    searching ||
                    quickStatus.pending
                  }
                  onClick={() =>
                    setQuery((previous) => ({
                      ...previous,
                      page: previous.page + 1,
                    }))
                  }
                >
                  Sau
                </button>
              </div>
            </nav>
          </>
        )}
      </TaskState>
      {dialog?.type === 'delete' && (
        <TaskDeleteDialog
          task={dialog.task}
          onClose={() => setDialog(null)}
          onSuccess={saved}
        />
      )}
      {(dialog?.type === 'create' || dialog?.type === 'edit') && (
        <TaskEditor
          task={dialog.task}
          project={project}
          projects={projects}
          onClose={() => setDialog(null)}
          onSuccess={saved}
        />
      )}
    </>
  )
}

export function TaskWorkspace({ fixedProjectId }) {
  const navigate = useNavigate()
  const [notice, setNotice] = useState('')
  const [params, setParams] = useSearchParams()
  const loadProjects = useCallback((signal) => tasksApi.projects(signal), [])
  const catalog = useApiResource(loadProjects, 'task-owned-projects')
  usePageTitle('Việc của tôi', 'TaskFlow')
  const projects = catalog.data || []
  const requested = fixedProjectId || params.get('projectId')
  const project = requested
    ? projects.find((item) => item.id === requested)
    : projects.find((item) => item.status === 'ACTIVE') || projects[0]
  function selectProject(id) {
    if (fixedProjectId) navigate(`/projects/${encodeURIComponent(id)}/tasks`)
    else setParams({ projectId: id }, { replace: true })
  }
  return (
    <div className="tasks-page">
      <Link className="project-back" to="/projects">
        ← Về dự án của tôi
      </Link>
      <TaskState resource={catalog}>
        {!projects.length ? (
          <div className="task-state">
            <h1>Công việc của tôi</h1>
            <p>Bạn cần tạo dự án trước khi thêm công việc.</p>
            <Link className="project-button-primary" to="/projects">
              Đến trang dự án
            </Link>
          </div>
        ) : !project ? (
          <div className="task-state" role="alert">
            <h1>Không tìm thấy dự án</h1>
            <p>Dự án không tồn tại hoặc bạn không có quyền truy cập.</p>
            <Link to="/tasks">Chọn lại dự án</Link>
          </div>
        ) : (
          <TaskScope
            key={project.id}
            project={project}
            projects={projects}
            selectProject={selectProject}
            refreshProjects={catalog.retry}
            notice={notice}
            setNotice={setNotice}
          />
        )}
      </TaskState>
    </div>
  )
}
