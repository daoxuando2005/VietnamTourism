import { lazy, Suspense, type ComponentType } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { LoadingSpinner } from '@/components'
import { AdminLayout, AuthLayout, MainLayout } from '@/layouts'
import { ROUTES } from './paths'

const HomePage = lazy(() => import('@/pages/home/HomePage').then((m) => ({ default: m.HomePage })))
const VietnamMapPage = lazy(() =>
  import('@/pages/VietnamMapPage').then((m) => ({ default: m.VietnamMapPage })),
)
const DestinationsPage = lazy(() =>
  import('@/pages/destinations/DestinationsPage').then((m) => ({ default: m.DestinationsPage })),
)
const DestinationDetailPage = lazy(() =>
  import('@/pages/destinations/DestinationDetailPage').then((m) => ({
    default: m.DestinationDetailPage,
  })),
)
const ReviewsPage = lazy(() =>
  import('@/pages/reviews/ReviewsPage').then((m) => ({ default: m.ReviewsPage })),
)
const LoginPage = lazy(() => import('@/pages/auth/LoginPage').then((m) => ({ default: m.LoginPage })))
const RegisterPage = lazy(() =>
  import('@/pages/auth/RegisterPage').then((m) => ({ default: m.RegisterPage })),
)
const ProfilePage = lazy(() =>
  import('@/pages/profile/ProfilePage').then((m) => ({ default: m.ProfilePage })),
)
const EditProfilePage = lazy(() =>
  import('@/pages/profile/EditProfilePage').then((m) => ({ default: m.EditProfilePage })),
)
const FeedPage = lazy(() => import('@/pages/feed/FeedPage').then((m) => ({ default: m.FeedPage })))
const SearchPage = lazy(() =>
  import('@/pages/search/SearchPage').then((m) => ({ default: m.SearchPage })),
)
const FavoritesPage = lazy(() =>
  import('@/pages/favorites/FavoritesPage').then((m) => ({ default: m.FavoritesPage })),
)
const AdminDashboardPage = lazy(() =>
  import('@/pages/admin/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })),
)
const NotFoundPage = lazy(() =>
  import('@/pages/not-found/NotFoundPage').then((m) => ({ default: m.NotFoundPage })),
)

function PageLoader() {
  return <LoadingSpinner />
}

function withSuspense(Component: ComponentType) {
  return (
    <Suspense fallback={<PageLoader />}>
      <Component />
    </Suspense>
  )
}

const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      { path: ROUTES.home, element: withSuspense(HomePage) },
      { path: ROUTES.map, element: withSuspense(VietnamMapPage) },
      { path: ROUTES.destinations, element: withSuspense(DestinationsPage) },
      { path: '/destinations/:slug', element: withSuspense(DestinationDetailPage) },
      { path: ROUTES.reviews, element: withSuspense(ReviewsPage) },
      { path: ROUTES.feed, element: withSuspense(FeedPage) },
      { path: ROUTES.search, element: withSuspense(SearchPage) },
      { path: ROUTES.favorites, element: withSuspense(FavoritesPage) },
      { path: ROUTES.profile, element: withSuspense(ProfilePage) },
      { path: '/profile/:username', element: withSuspense(ProfilePage) },
      { path: ROUTES.profileEdit, element: withSuspense(EditProfilePage) },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      { path: ROUTES.login, element: withSuspense(LoginPage) },
      { path: ROUTES.register, element: withSuspense(RegisterPage) },
    ],
  },
  {
    element: <AdminLayout />,
    children: [{ path: ROUTES.admin, element: withSuspense(AdminDashboardPage) }],
  },
  { path: '*', element: withSuspense(NotFoundPage) },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
