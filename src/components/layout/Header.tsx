import { Link, NavLink, useLocation } from 'react-router-dom'
import { ROUTES } from '@/routes/paths'

const navLinks = [
  { to: ROUTES.home, label: 'Home', end: true },
  { to: ROUTES.destinations, label: 'Destinations' },
  { to: ROUTES.reviews, label: 'Reviews' },
  { to: ROUTES.feed, label: 'Community' },
]

export function Header() {
  const { pathname } = useLocation()
  const isHome = pathname === ROUTES.home

  return (
    <header
      className={[
        'z-50 w-full transition-colors',
        isHome
          ? 'absolute top-0 border-b border-white/10 bg-black/20 backdrop-blur-md'
          : 'sticky top-0 border-b border-gray-200 bg-white/95 backdrop-blur',
      ].join(' ')}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:h-16 sm:px-6 lg:px-8">
        <Link
          to={ROUTES.home}
          className={[
            'flex items-center gap-2 text-lg font-bold sm:text-xl',
            isHome ? 'text-white' : 'text-teal-700',
          ].join(' ')}
        >
          <span
            className={[
              'flex h-8 w-8 items-center justify-center rounded-lg text-sm font-extrabold',
              isHome ? 'bg-amber-500 text-white' : 'bg-teal-700 text-white',
            ].join(' ')}
          >
            VT
          </span>
          Vietnam Tourism
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                [
                  'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isHome
                    ? isActive
                      ? 'bg-white/20 text-white'
                      : 'text-white/90 hover:bg-white/10 hover:text-white'
                    : isActive
                      ? 'bg-teal-50 text-teal-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                ].join(' ')
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <Link
          to={ROUTES.login}
          className={[
            'rounded-lg px-4 py-2 text-sm font-semibold transition-colors',
            isHome
              ? 'bg-amber-500 text-white hover:bg-amber-600'
              : 'bg-teal-700 text-white hover:bg-teal-800',
          ].join(' ')}
        >
          Login
        </Link>
      </div>
    </header>
  )
}
