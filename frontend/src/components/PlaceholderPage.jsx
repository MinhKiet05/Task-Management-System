import { Icon } from './Icon.jsx'
import { usePageTitle } from '../hooks/usePageTitle.js'

export function PlaceholderPage({ title, description, icon, features }) {
  usePageTitle(title)

  return (
    <div className="mx-auto max-w-5xl">
      <p className="eyebrow">Your workspace</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
        {title}
      </h1>
      <p className="mt-3 max-w-2xl leading-7 text-slate-500">{description}</p>
      <section
        className="mt-9 rounded-2xl border border-slate-200 bg-white p-7 sm:p-10"
        aria-label={`${title} preview`}
      >
        <div className="flex size-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <Icon name={icon} className="size-7" />
        </div>
        <span className="mt-7 inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
          Coming soon
        </span>
        <h2 className="mt-4 text-xl font-semibold text-slate-900">
          A little more focus. A lot more progress.
        </h2>
        <p className="mt-3 max-w-xl leading-7 text-slate-500">
          This space is getting ready for your work. You can explore the
          workspace using the navigation.
        </p>
        <ul className="mt-8 grid gap-4 sm:grid-cols-3">
          {features.map((feature) => (
            <li
              key={feature}
              className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-5 text-sm font-medium text-slate-600"
            >
              {feature}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
