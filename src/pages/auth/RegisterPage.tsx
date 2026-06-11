import { Link } from 'react-router-dom'
import { Button, Card } from '@/components'
import { ROUTES } from '@/routes/paths'

export function RegisterPage() {
  return (
    <Card padding="lg">
      <h1 className="text-2xl font-bold text-gray-900">Create account</h1>
      <p className="mt-1 text-sm text-gray-600">Join the Vietnam Tourism community</p>

      <form className="mt-6 space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
            Display name
          </label>
          <input
            id="displayName"
            type="text"
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
        <Button type="submit" fullWidth>
          Create account
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link to={ROUTES.login} className="font-medium text-emerald-700 hover:underline">
          Sign in
        </Link>
      </p>
    </Card>
  )
}
