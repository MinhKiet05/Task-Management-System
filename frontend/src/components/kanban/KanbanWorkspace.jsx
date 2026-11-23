import { useCallback, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { DragDropProvider } from '@dnd-kit/react'
import { Accessibility } from '@dnd-kit/dom'
import { tasksApi } from '../../api/tasks.js'
import { useApiResource } from '../../hooks/useApiResource.js'
import { usePageTitle } from '../../hooks/usePageTitle.js'
import { useTaskMutation } from '../../hooks/useTaskMutation.js'
import { TaskEditor } from '../tasks/TaskEditor.jsx'
import { taskError, taskPriorities, taskStatuses } from '../tasks/taskModel.js'
import { priorityLabels } from '../dashboard/presentation.js'
import { canMove, columnTitles } from './kanbanModel.js'
import { KanbanColumn } from './KanbanColumn.jsx'
import { TaskDrawer } from './TaskDrawer.jsx'
import '../projects/projects.css'
import '../tasks/tasks.css'
import './kanban.css'

const configurePlugins = (defaults) =>
  defaults.map((plugin) =>
    plugin === Accessibility
      ? Accessibility.configure({
          screenReaderInstructions: {
            draggable:
              'Nhấn dấu cách hoặc Enter để nhấc công việc. Dùng phím mũi tên để chọn cột, nhấn dấu cách để thả hoặc Escape để hủy. Bạn cũng có thể dùng ô Chuyển sang trên mỗi thẻ.',
          },
          announcements: {
            dragstart: ({ operation }) =>
              `Đã nhấc công việc ${operation.source?.data.task?.title || ''}.`,
            dragover: ({ operation }) =>
              operation.target
                ? `Cột đích: ${columnTitles[operation.target.id] || ''}.`
                : 'Chưa chọn cột đích.',
            dragend: ({ canceled, operation }) =>
              canceled
                ? 'Đã hủy kéo công việc.'
                : operation.target
                  ? 'Đã thả công việc. Đang kiểm tra thay đổi trạng thái.'
                  : 'Không thay đổi trạng thái.',
          },
        })
      : plugin,
  )

function ProjectBoard({
  project,
  projects,
  selectProject,
  refreshProjects,
  revision,
  onChanged,
  onOpen,
  notice,
  setNotice,
}) {
  const [search, setSearch] = useState('')
  const [debounced, setDebounced] = useState('')
  const [priority, setPriority] = useState('')
  const [createStatus, setCreateStatus] = useState(null)
  const [optimistic, setOptimistic] = useState(null)
  const [now, setNow] = useState(() => new Date())
  const locked = project.status !== 'ACTIVE'
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(search), 350)
    return () => clearTimeout(timer)
  }, [search])
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])
  const mutation = useTaskMutation((task) => {
    setOptimistic(null)
    onChanged(task, 'status')
  })
  function move(task, status) {
    if (!canMove(task, status, locked, mutation.pending || optimistic)) return
    setNotice('')
    void mutation.run(async (signal) => {
      setOptimistic({ task, status })
      try {
        return await tasksApi.status(task.id, status, signal)
      } catch (error) {
        if (!signal.aborted) setOptimistic(null)
        throw error
      }
    })
  }
  function reset() {
    setSearch('')
    setDebounced('')
    setPriority('')
  }
  const pending = mutation.pending
  return (
    <>
      <header className="kanban-heading">
        <div>
          <p className="tasks-eyebrow">Không gian làm việc / Bảng Kanban</p>
          <h1>Bảng Kanban</h1>
          <p>Quản lý tiến độ công việc trực quan theo từng dự án.</p>
        </div>
        <button
          className="project-button-primary"
          disabled={locked || pending}
          onClick={() => setCreateStatus('TODO')}
        >
          + Thêm công việc
        </button>
      </header>
      <section
        className="kanban-controls"
        aria-label="Phạm vi và bộ lọc Kanban"
      >
        <div className="kanban-project-control">
          <label htmlFor="kanban-project">Dự án đang xem</label>
          <select
            id="kanban-project"
            value={project.id}
            disabled={pending}
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
            disabled={pending}
            onClick={refreshProjects}
          >
            Tải lại dự án
          </button>
        </div>
        <div className="kanban-filter-controls">
          <label htmlFor="kanban-search">
            Tìm theo tên công việc
            <input
              id="kanban-search"
              type="search"
              maxLength={255}
              value={search}
              disabled={pending}
              placeholder="Tìm công việc trên bảng…"
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          <label htmlFor="kanban-priority">
            Ưu tiên
            <select
              id="kanban-priority"
              aria-label="Ưu tiên"
              value={priority}
              disabled={pending}
              onChange={(event) => setPriority(event.target.value)}
            >
              <option value="">Tất cả ưu tiên</option>
              {taskPriorities.map((value) => (
                <option value={value} key={value}>
                  {priorityLabels[value]}
                </option>
              ))}
            </select>
          </label>
          <button
            className="project-button-secondary"
            disabled={pending || (!search && !priority)}
            onClick={reset}
          >
            Xóa bộ lọc
          </button>
        </div>
      </section>
      <p className="kanban-scope-note">
        Chỉ hiển thị dự án đã chọn. Mỗi cột tải 20 công việc mỗi lần; tổng số
        phù hợp do máy chủ trả về. Thứ tự theo ngày tạo mới nhất, không lưu vị
        trí kéo thủ công.
      </p>
      <p id="kanban-drag-help" className="kanban-scope-note">
        Kéo bằng nút ⠿ để đổi cột. Bàn phím: dấu cách để nhấc, phím mũi tên để
        chọn cột, dấu cách để thả, Escape để hủy; hoặc dùng ô “Chuyển sang”.
      </p>
      {locked && (
        <p className="task-archive-notice" role="status">
          Dự án đã lưu trữ: chỉ xem chi tiết. Không thể thêm, sửa, chuyển trạng
          thái hoặc xóa công việc.
        </p>
      )}
      {notice && (
        <p className="task-success" role="status">
          {notice}
        </p>
      )}
      {pending && (
        <p className="kanban-pending" role="status">
          Đang lưu trạng thái… Các số đếm sẽ được tải lại sau khi lưu.
        </p>
      )}
      {search !== debounced && (
        <p role="status" className="kanban-scope-note">
          Đang chờ tìm kiếm…
        </p>
      )}
      {mutation.error && (
        <p className="project-error" role="alert">
          {mutation.error} Bảng hiển thị dữ liệu trước thao tác; thay đổi chưa
          được xác nhận.{' '}
          <button disabled={pending} onClick={() => onChanged(null, 'reload')}>
            Tải lại bảng
          </button>
        </p>
      )}
      <DragDropProvider
        plugins={configurePlugins}
        onBeforeDragStart={(event) => {
          if (locked || pending) event.preventDefault()
        }}
        onDragEnd={(event) => {
          if (!event.canceled)
            move(event.operation.source?.data.task, event.operation.target?.id)
        }}
      >
        <div
          className="kanban-board"
          role="region"
          aria-label="Các cột công việc"
          tabIndex={0}
        >
          {taskStatuses.map((status) => (
            <KanbanColumn
              key={status}
              projectId={project.id}
              status={status}
              search={debounced}
              priority={priority}
              revision={revision}
              locked={locked}
              pending={pending}
              optimistic={optimistic}
              now={now}
              onOpen={onOpen}
              onStatus={move}
              onCreate={setCreateStatus}
            />
          ))}
        </div>
      </DragDropProvider>
      {createStatus && (
        <TaskEditor
          project={project}
          projects={projects}
          initialStatus={createStatus}
          onClose={() => setCreateStatus(null)}
          onSuccess={(task) => {
            setCreateStatus(null)
            reset()
            onChanged(task, 'create')
          }}
        />
      )}
    </>
  )
}

export function KanbanWorkspace() {
  usePageTitle('Bảng Kanban', 'TaskFlow')
  const [params, setParams] = useSearchParams()
  const [revision, setRevision] = useState(0)
  const [taskId, setTaskId] = useState(null)
  const [notice, setNotice] = useState('')
  const loadProjects = useCallback((signal) => tasksApi.projects(signal), [])
  const catalog = useApiResource(loadProjects, 'kanban-owned-projects')
  const projects = catalog.data || []
  const requested = params.get('projectId')
  const project = requested
    ? projects.find((item) => item.id === requested)
    : projects.find((item) => item.status === 'ACTIVE') || projects[0]
  const selectProject = (id) => setParams({ projectId: id }, { replace: true })
  function changed(task, action) {
    setRevision((value) => value + 1)
    setNotice(
      {
        create: 'Đã thêm công việc.',
        edit: 'Đã lưu thay đổi công việc.',
        status: 'Đã cập nhật trạng thái.',
        delete: 'Đã xóa công việc.',
      }[action] || '',
    )
    if (task?.projectId && task.projectId !== project?.id)
      selectProject(task.projectId)
  }
  return (
    <div className="kanban-page">
      {catalog.status === 'loading' ? (
        <div className="task-state" role="status">
          <h1>Bảng Kanban</h1>
          <div className="task-skeleton" />
          Đang tải dự án…
        </div>
      ) : catalog.status === 'error' ? (
        <div className="task-state" role="alert">
          <h1>Bảng Kanban</h1>
          <p>{taskError(catalog.error)}</p>
          <button className="project-button-secondary" onClick={catalog.retry}>
            Thử lại dự án
          </button>
        </div>
      ) : !projects.length ? (
        <div className="task-state">
          <h1>Bảng Kanban</h1>
          <p>Bạn cần tạo dự án trước khi thêm công việc.</p>
          <Link className="project-button-primary" to="/projects">
            Đến trang dự án
          </Link>
        </div>
      ) : !project ? (
        <div className="task-state" role="alert">
          <h1>Không tìm thấy dự án</h1>
          <p>Dự án không tồn tại hoặc bạn không có quyền truy cập.</p>
          <Link to="/kanban">Chọn lại dự án</Link>
        </div>
      ) : (
        <ProjectBoard
          key={project.id}
          project={project}
          projects={projects}
          selectProject={selectProject}
          refreshProjects={catalog.retry}
          revision={revision}
          onChanged={changed}
          onOpen={setTaskId}
          notice={notice}
          setNotice={setNotice}
        />
      )}
      {taskId && catalog.status === 'success' && (
        <TaskDrawer
          key={taskId}
          taskId={taskId}
          projects={projects}
          onClose={() => setTaskId(null)}
          onChanged={changed}
          onDeleted={() => {
            setTaskId(null)
            changed(null, 'delete')
          }}
        />
      )}
    </div>
  )
}
