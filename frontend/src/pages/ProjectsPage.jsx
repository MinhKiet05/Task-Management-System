import { PlaceholderPage } from '../components/PlaceholderPage.jsx'

export function ProjectsPage() {
  return (
    <PlaceholderPage
      title="Dự án"
      description="Tổ chức ý tưởng và công việc của bạn theo từng dự án."
      icon="projects"
      features={[
        'Danh sách dự án',
        'Ngày bắt đầu và hạn chót',
        'Dự án đã lưu trữ',
      ]}
    />
  )
}
