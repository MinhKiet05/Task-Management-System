import { PlaceholderPage } from '../components/PlaceholderPage.jsx'

export function DashboardPage() {
  return (
    <PlaceholderPage
      title="Tổng quan"
      description="Theo dõi dự án và công việc trong không gian cá nhân của bạn."
      icon="dashboard"
      features={['Tiến độ công việc', 'Hạn chót sắp tới', 'Công việc quá hạn']}
    />
  )
}
