import { NavLink } from 'react-router-dom'
import { ROUTES } from '@/routes/paths'

const adminLinks = [
  { to: ROUTES.admin, label: 'Dashboard', end: true },
  { to: ROUTES.destinations, label: 'Destinations' },
  { to: ROUTES.reviews, label: 'Reviews' },
]

export function AdminSidebar() {
  return (
    <aside className="w-full border-b border-gray-200 bg-white md:w-56 md:border-b-0 md:border-r">
      <div className="p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Admin</p>
      </div>
      <nav className="flex gap-1 overflow-x-auto px-2 pb-3 md:flex-col md:px-3 md:pb-0">
        {adminLinks.map(({ to, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              [
                'whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600 hover:bg-gray-50',
              ].join(' ')
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
