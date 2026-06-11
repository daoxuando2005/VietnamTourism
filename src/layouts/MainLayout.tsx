import { Outlet, useLocation } from 'react-router-dom'
import { Footer, Header, MobileNav } from '@/components'
import { ROUTES } from '@/routes/paths'

export function MainLayout() {
  const { pathname } = useLocation()
  const isHome = pathname === ROUTES.home

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />
      <main
        className={[
          'w-full flex-1',
          isHome ? '' : 'mx-auto max-w-7xl px-4 py-6 pb-20 sm:px-6 sm:py-8 md:pb-8 lg:px-8',
        ].join(' ')}
      >
        <Outlet />
      </main>
      <Footer />
      <MobileNav />
    </div>
  )
}
