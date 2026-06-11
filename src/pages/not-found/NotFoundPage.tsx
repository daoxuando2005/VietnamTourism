import { Link } from 'react-router-dom'
import { Button } from '@/components'
import { ROUTES } from '@/routes/paths'

export function NotFoundPage() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
      <p className="text-6xl font-bold text-emerald-600">404</p>
      <h1 className="mt-4 text-2xl font-bold text-gray-900">Page not found</h1>
      <p className="mt-2 text-sm text-gray-600">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link to={ROUTES.home} className="mt-6">
        <Button>Back to Home</Button>
      </Link>
    </div>
  )
}
