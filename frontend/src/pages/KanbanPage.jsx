import { PlaceholderPage } from '../components/PlaceholderPage.jsx'

export function KanbanPage() {
  return (
    <PlaceholderPage
      title="Kanban"
      description="See your work move forward, from the first idea to the final checkmark."
      icon="kanban"
      features={['To do', 'In progress', 'Done']}
    />
  )
}
