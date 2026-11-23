import { PlaceholderPage } from '../components/PlaceholderPage.jsx'

export function TasksPage() {
  return (
    <PlaceholderPage
      title="Tasks"
      description="Find your next step. Keep your priorities and deadlines together in one focused view."
      icon="tasks"
      features={['Search and filters', 'Task priorities', 'Due dates']}
    />
  )
}
