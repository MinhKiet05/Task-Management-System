import { PlaceholderPage } from '../components/PlaceholderPage.jsx'

export function KanbanPage() {
  return (
    <PlaceholderPage
      title="Bảng Kanban"
      description="Sắp xếp công việc theo trạng thái để tập trung vào bước tiếp theo."
      icon="kanban"
      features={['Cần làm', 'Đang thực hiện', 'Đã hoàn thành']}
    />
  )
}
