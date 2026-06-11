import { Link, Outlet } from 'react-router-dom'
import { ROUTES } from '@/routes/paths'

export function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-emerald-50 to-white">
      <header className="px-4 py-6 sm:px-6">
        <Link to={ROUTES.home} className="text-lg font-bold text-emerald-700">
          Vietnam Tourism
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 pb-12 sm:px-6">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
