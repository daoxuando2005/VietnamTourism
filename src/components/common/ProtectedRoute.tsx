import type { ReactNode } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ROUTES } from '@/routes/paths'

interface ProtectedRouteProps {
  children: ReactNode
  requireAdmin?: boolean
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, session, loading, needsProfileSetup, authError, refreshProfile, logout } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-48 items-center justify-center">
        <LoadingSpinner label="Đang kiểm tra phiên..." />
      </div>
    )
  }

  if (!user) {
    if (needsProfileSetup) return <Navigate to="/auth/complete-profile" state={{ from: location }} replace />
    if (session && authError) return <section className="py-8"><p role="alert">{authError}</p><button className="mr-5 min-h-11 text-teal-800 underline" onClick={() => void refreshProfile().catch(() => {})}>Thử lại</button><button className="min-h-11 text-teal-800 underline" onClick={() => void logout().catch(() => {})}>Đăng xuất</button></section>
    // Redirect to login page while preserving target path
    return <Navigate to={ROUTES.login} state={{ from: location }} replace />
  }

  if (requireAdmin && user.role !== 'ADMIN') return <section className="py-8"><h1 className="text-2xl font-bold">Bạn không có quyền truy cập</h1><Link className="mt-4 inline-block text-teal-800 underline" to="/">Về trang chủ</Link></section>

  return <>{children}</>
}
