export const navigation = [
  { to: '/dashboard', label: 'Tổng quan', icon: 'dashboard' },
  { to: '/tasks', label: 'Việc của tôi', icon: 'tasks' },
  { to: '/projects', label: 'Dự án', icon: 'projects' },
  { to: '/kanban', label: 'Bảng Kanban', icon: 'kanban' },
]

export function pageContext(pathname) {
  return (
    navigation.find(
      ({ to }) => pathname === to || pathname.startsWith(to + '/'),
    )?.label || 'Không tìm thấy trang'
  )
}
