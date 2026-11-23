import { PlaceholderPage } from '../components/PlaceholderPage.jsx'

export function DashboardPage() {
  return (
    <PlaceholderPage
      title="Your work, at a glance."
      description="A clear view of your progress, upcoming deadlines, and what needs your attention."
      icon="dashboard"
      features={['Progress overview', 'Upcoming deadlines', 'Overdue tasks']}
    />
  )
}
