import { Outlet } from 'react-router-dom'
import { AdminSidebar } from '@/components'

export function AdminLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-100 md:flex-row">
      <AdminSidebar />
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  )
}
