import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ROUTES } from '@/routes/paths'

interface ProtectedRouteProps {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
        <LoadingSpinner label="Checking credentials..." />
      </div>
    )
  }

  if (!user) {
    // Redirect to login page while preserving target path
    return <Navigate to={ROUTES.login} state={{ from: location }} replace />
  }

  return <>{children}</>
}
