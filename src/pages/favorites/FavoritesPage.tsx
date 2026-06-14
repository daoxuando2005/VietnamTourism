import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader, LoadingSpinner, FavoriteButton } from '@/components'
import { useAuth } from '@/context/AuthContext'
import { favoriteService } from '@/services'
import { ROUTES } from '@/routes/paths'
import type { Favorite } from '@/types'

export function FavoritesPage() {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    let active = true

    const fetchFavorites = async () => {
      setLoading(true)
      try {
        const data = await favoriteService.getFavoritesByUser(user.id)
        if (active) {
          setFavorites(data)
        }
      } catch (err) {
        console.error('Failed to load favorites:', err)
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    fetchFavorites()

    return () => {
      active = false
    }
  }, [user])

  const handleUnfavoriteOptimistic = (destinationId: string) => {
    // Optimistic removal from the list instantly
    setFavorites((prev) => prev.filter((f) => f.destinationId !== destinationId))
  }

  if (loading) {
    return (
      <div className="py-12">
        <LoadingSpinner label="Loading saved destinations..." />
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      <PageHeader
        title="Saved Favorites"
        description="Here are the beautiful destinations you have saved for your upcoming journeys in Vietnam."
      />

      {favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 py-16 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <h3 className="mt-4 text-sm font-semibold text-gray-900">Your favorites is empty</h3>
          <p className="mt-1 text-xs text-gray-500 max-w-xs leading-relaxed">
            You haven't saved any destinations yet. Explore Vietnam and click the heart icon on any destination card to save it!
          </p>
          <Link
            to={ROUTES.destinations}
            className="mt-6 rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-teal-700 focus:outline-none"
          >
            Explore Destinations
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((fav) => {
            const dest = fav.destination
            if (!dest) return null

            return (
              <div key={dest.id} className="relative group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                <Link
                  to={ROUTES.destinationDetail(dest.slug)}
                  className="flex flex-col flex-1"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                    <img
                      src={dest.image}
                      alt={dest.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-teal-800 shadow-sm border border-gray-100">
                      {dest.category}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col justify-between p-4 pr-12">
                    <div className="space-y-1">
                      <h3 className="font-bold text-gray-900 group-hover:text-teal-600 transition-colors line-clamp-1">
                        {dest.name}
                      </h3>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <svg className="h-3.5 w-3.5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {dest.province}
                      </p>
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-gray-50 pt-3 text-xs">
                      <span className="text-teal-700 font-semibold group-hover:underline">
                        Explore Details →
                      </span>
                      <span className="font-bold text-amber-600">★ {dest.rating.toFixed(1)}</span>
                    </div>
                  </div>
                </Link>
                {/* Favorite toggle floating on the card, updates UI instantly on unfavorite */}
                <div onClick={() => handleUnfavoriteOptimistic(dest.id)}>
                  <FavoriteButton
                    destinationId={dest.id}
                    className="absolute right-3 bottom-3 shadow-md border-gray-100 bg-white"
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
export default FavoritesPage
