import { Link } from 'react-router-dom'
import { ROUTES } from '@/routes/paths'

const footerLinks = {
  explore: [
    { to: ROUTES.destinations, label: 'Destinations' },
    { to: ROUTES.map, label: 'Vietnam Map' },
    { to: ROUTES.reviews, label: 'Reviews' },
    { to: ROUTES.search, label: 'Search' },
  ],
  community: [
    { to: ROUTES.feed, label: 'Community Feed' },
    { to: ROUTES.favorites, label: 'Favorites' },
    { to: ROUTES.profile, label: 'Traveler Profiles' },
  ],
  account: [
    { to: ROUTES.login, label: 'Login' },
    { to: ROUTES.register, label: 'Sign Up' },
  ],
}

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to={ROUTES.home} className="flex items-center gap-2 text-lg font-bold text-white">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 text-sm font-extrabold text-white">
                VT
              </span>
              Vietnam Tourism
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-gray-400">
              Your trusted guide to discovering Vietnam — from iconic landmarks to hidden gems
              loved by travelers worldwide.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Explore</h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.explore.map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-sm hover:text-amber-400 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Community
            </h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.community.map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-sm hover:text-amber-400 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Account</h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.account.map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-sm hover:text-amber-400 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-gray-800 pt-8 sm:flex-row">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Vietnam Tourism Platform. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-gray-500">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Contact Us</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
