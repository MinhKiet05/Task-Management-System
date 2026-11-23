import { Link, Outlet } from 'react-router'
import { Brand } from '../components/Brand.jsx'

export function AuthLayout() {
  return (
    <div className="min-h-dvh bg-white lg:grid lg:grid-cols-2">
      <aside className="flex flex-col bg-blue-50 p-8 sm:p-12 lg:p-16">
        <Brand />
        <div className="my-auto py-12 lg:py-20">
          <p className="eyebrow">Less noise. More progress.</p>
          <h2 className="mt-5 max-w-md text-4xl leading-tight font-semibold tracking-tight text-slate-950 sm:text-5xl">
            Good work starts
            <br />
            with a clear plan.
          </h2>
          <p className="mt-6 max-w-sm leading-7 text-slate-600">
            One place for your projects, your priorities, and your next big
            idea.
          </p>
        </div>
        <Link
          to="/dashboard"
          className="text-sm font-medium text-blue-700 hover:underline"
        >
          Explore the workspace &rarr;
        </Link>
      </aside>
      <main className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
