import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Card } from '@/components'
import { ROUTES } from '@/routes/paths'
import { useAuth } from '@/context/AuthContext'

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [apiError, setApiError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validate = () => {
    const newErrors: Record<string, string> = {}
    setErrors({})
    setApiError('')

    const usernameRegex = /^[a-zA-Z0-9]+$/
    if (!username.trim()) {
      newErrors.username = 'Username is required.'
    } else if (username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters.'
    } else if (!usernameRegex.test(username)) {
      newErrors.username = 'Username can only contain alphanumeric characters.'
    }

    if (!displayName.trim()) {
      newErrors.displayName = 'Display name is required.'
    } else if (displayName.length < 2) {
      newErrors.displayName = 'Display name must be at least 2 characters.'
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email.trim()) {
      newErrors.email = 'Email is required.'
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Please enter a valid email address.'
    }

    if (!password) {
      newErrors.password = 'Password is required.'
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.'
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    try {
      await register({
        username: username.toLowerCase().trim(),
        displayName: displayName.trim(),
        email: email.trim(),
        password,
      })
      // Navigate to homepage after successful register
      navigate(ROUTES.home, { replace: true })
    } catch (err) {
      const error = err as Error
      setApiError(error.message || 'Registration failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card padding="lg" className="max-w-md w-full mx-auto shadow-md border border-gray-200">
      <h1 className="text-2xl font-bold text-gray-900">Create account</h1>
      <p className="mt-1 text-sm text-gray-600">Join the Vietnam Tourism community</p>

      {apiError && (
        <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-100 flex gap-2">
          <svg className="h-5 w-5 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{apiError}</span>
        </div>
      )}

      <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
        <div>
          <label htmlFor="username" className="block text-xs font-semibold uppercase tracking-wider text-gray-500">
            Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            disabled={isSubmitting}
            onChange={(e) => setUsername(e.target.value)}
            className={[
              'mt-1 w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-1',
              errors.username
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-teal-500 focus:ring-teal-500',
            ].join(' ')}
            placeholder="e.g. johndoe"
          />
          {errors.username && <p className="mt-1 text-xs text-red-600">{errors.username}</p>}
        </div>

        <div>
          <label htmlFor="displayName" className="block text-xs font-semibold uppercase tracking-wider text-gray-500">
            Display name
          </label>
          <input
            id="displayName"
            type="text"
            value={displayName}
            disabled={isSubmitting}
            onChange={(e) => setDisplayName(e.target.value)}
            className={[
              'mt-1 w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-1',
              errors.displayName
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-teal-500 focus:ring-teal-500',
            ].join(' ')}
            placeholder="e.g. John Doe"
          />
          {errors.displayName && <p className="mt-1 text-xs text-red-600">{errors.displayName}</p>}
        </div>

        <div>
          <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-gray-500">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            disabled={isSubmitting}
            onChange={(e) => setEmail(e.target.value)}
            className={[
              'mt-1 w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-1',
              errors.email
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-teal-500 focus:ring-teal-500',
            ].join(' ')}
            placeholder="you@example.com"
          />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-gray-500">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            disabled={isSubmitting}
            onChange={(e) => setPassword(e.target.value)}
            className={[
              'mt-1 w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-1',
              errors.password
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-teal-500 focus:ring-teal-500',
            ].join(' ')}
          />
          {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-xs font-semibold uppercase tracking-wider text-gray-500">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            disabled={isSubmitting}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={[
              'mt-1 w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-1',
              errors.confirmPassword
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-teal-500 focus:ring-teal-500',
            ].join(' ')}
          />
          {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>}
        </div>

        <Button type="submit" fullWidth disabled={isSubmitting} className="bg-teal-600 hover:bg-teal-700 text-white font-semibold">
          {isSubmitting ? 'Creating account...' : 'Create account'}
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link to={ROUTES.login} className="font-semibold text-teal-700 hover:underline">
          Sign in
        </Link>
      </p>
    </Card>
  )
}
