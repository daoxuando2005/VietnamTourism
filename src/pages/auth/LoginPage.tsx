import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Button, Card } from '@/components'
import { ROUTES } from '@/routes/paths'
import { useAuth } from '@/context/AuthContext'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [apiError, setApiError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Determine redirection target (default is home page '/')
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || ROUTES.home

  const validate = () => {
    let isValid = true
    setEmailError('')
    setPasswordError('')
    setApiError('')

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email.trim()) {
      setEmailError('Email is required.')
      isValid = false
    } else if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address.')
      isValid = false
    }

    if (!password) {
      setPasswordError('Password is required.')
      isValid = false
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters.')
      isValid = false
    }

    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    try {
      await login(email, password)
      // Redirect back to request origin or home
      navigate(from, { replace: true })
    } catch (err) {
      const error = err as Error
      setApiError(error.message || 'Incorrect email or password. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card padding="lg" className="max-w-md w-full mx-auto shadow-md border border-gray-200">
      <h1 className="text-2xl font-bold text-gray-900">Sign in</h1>
      <p className="mt-1 text-sm text-gray-600">Welcome back to Vietnam Tourism</p>

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
          <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-gray-500">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            disabled={isSubmitting}
            onChange={(e) => setEmail(e.target.value)}
            className={[
              'mt-1 w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-1',
              emailError
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-teal-500 focus:ring-teal-500',
            ].join(' ')}
            placeholder="you@example.com"
          />
          {emailError && <p className="mt-1 text-xs text-red-600">{emailError}</p>}
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
              passwordError
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-teal-500 focus:ring-teal-500',
            ].join(' ')}
          />
          {passwordError && <p className="mt-1 text-xs text-red-600">{passwordError}</p>}
        </div>

        <Button type="submit" fullWidth disabled={isSubmitting} className="bg-teal-600 hover:bg-teal-700 text-white font-semibold">
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-600">
        Don&apos;t have an account?{' '}
        <Link to={ROUTES.register} className="font-semibold text-teal-700 hover:underline">
          Create one
        </Link>
      </p>
    </Card>
  )
}
