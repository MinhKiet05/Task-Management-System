import { Link, NavLink, Outlet } from 'react-router'
import { Brand } from '../components/Brand.jsx'
import { Icon } from '../components/Icon.jsx'

const navigation = [
  { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { to: '/projects', label: 'Projects', icon: 'projects' },
  { to: '/tasks', label: 'Tasks', icon: 'tasks' },
  { to: '/kanban', label: 'Kanban', icon: 'kanban' },
]

export function AppLayout() {
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[250px_minmax(0,1fr)]">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <aside className="border-b border-slate-200 bg-white p-5 lg:sticky lg:top-0 lg:h-dvh lg:border-r lg:border-b-0 lg:p-7">
        <Brand />
        <p className="eyebrow mt-10 hidden lg:block">Workspace</p>
        <nav
          aria-label="Main navigation"
          className="mt-5 flex flex-wrap gap-2 lg:mt-4 lg:flex-col"
        >
          {navigation.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors ${isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`
              }
            >
              <Icon name={icon} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="min-w-0">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-6 py-4 sm:px-10">
          <p className="text-sm text-slate-500">Make room for what matters.</p>
          <div className="flex items-center gap-5 text-sm font-medium">
            <Link to="/login" className="text-slate-600 hover:text-blue-600">
              Sign in
            </Link>
            <Link to="/register" className="button-primary">
              Get started
              <Icon name="arrow" className="size-4" />
            </Link>
          </div>
        </header>
        <main
          id="main-content"
          tabIndex={-1}
          className="px-6 py-9 outline-none sm:p-10 lg:py-14"
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}
