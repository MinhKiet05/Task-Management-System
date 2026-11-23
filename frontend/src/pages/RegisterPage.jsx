import { Link } from 'react-router'
import { usePageTitle } from '../hooks/usePageTitle.js'

export function RegisterPage() {
  usePageTitle('Create an account')
  return (
    <>
      <p className="eyebrow">A fresh start</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">
        Make space for your best work
      </h1>
      <p className="mt-5 leading-7 text-slate-500">
        Account creation will be available soon. Your organized workspace is
        taking shape.
      </p>
      <Link to="/dashboard" className="button-primary mt-8">
        Explore workspace
      </Link>
      <p className="mt-7 text-sm text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-blue-700 hover:underline">
          Sign in
        </Link>
      </p>
    </>
  )
}
