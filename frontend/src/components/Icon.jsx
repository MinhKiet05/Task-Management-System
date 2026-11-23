const paths = {
  menu: 'M4 6h16 M4 12h16 M4 18h16',
  close: 'm6 6 12 12 M6 18 18 6',
  chevron: 'm6 9 6 6 6-6',
  logout: 'M9 4H4v16h5 M10 12h11 m-5-5 5 5-5 5',
  dashboard: 'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',
  projects:
    'M3 7V5a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z',
  tasks: 'm3 6 2 2 4-4 M12 6h9 M3 13h5 M12 13h9 M3 20h5 M12 20h9',
  kanban: 'M4 4h4v12H4z M10 4h4v17h-4z M16 4h4v8h-4z',
  arrow: 'M5 12h14 m-6-6 6 6-6 6',
}

export function Icon({ name, className = 'size-5' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name] || paths.tasks} />
    </svg>
  )
}
