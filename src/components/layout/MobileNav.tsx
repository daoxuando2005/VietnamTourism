import { NavLink } from 'react-router-dom'
import { ROUTES } from '@/routes/paths'

const navItems = [
  { to: ROUTES.home, label: 'Home', icon: '🏠' },
  { to: ROUTES.destinations, label: 'Places', icon: '📍' },
  { to: ROUTES.feed, label: 'Community', icon: '💬' },
  { to: ROUTES.search, label: 'Search', icon: '🔍' },
  { to: ROUTES.profile, label: 'Profile', icon: '👤' },
]

export function MobileNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white md:hidden">
      <ul className="flex items-center justify-around px-2 py-2">
        {navItems.map(({ to, label, icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={to === ROUTES.home}
              className={({ isActive }) =>
                [
                  'flex flex-col items-center gap-0.5 rounded-lg px-3 py-1 text-xs font-medium',
                  isActive ? 'text-teal-700' : 'text-gray-500',
                ].join(' ')
              }
            >
              <span className="text-base" aria-hidden="true">
                {icon}
              </span>
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
