import { Link } from 'react-router'
import { usePageTitle } from '../hooks/usePageTitle.js'

export function LoginPage() {
  usePageTitle('Sign in')
  return (
    <>
      <p className="eyebrow">Welcome back</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">
        Sign in to your workspace
      </h1>
      <p className="mt-5 leading-7 text-slate-500">
        Sign-in will be available soon. In the meantime, take a look around your
        future workspace.
      </p>
      <Link to="/dashboard" className="button-primary mt-8">
        Explore workspace
      </Link>
      <p className="mt-7 text-sm text-slate-500">
        New here?{' '}
        <Link
          to="/register"
          className="font-medium text-blue-700 hover:underline"
        >
          Create an account
        </Link>
      </p>
    </>
  )
}
