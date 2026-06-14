import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Card, LoadingSpinner, FeedCard } from '@/components'
import { useAuth } from '@/context/AuthContext'
import { userService, reviewService, favoriteService, feedService } from '@/services'
import type { UserProfile, User, Favorite, FeedActivity } from '@/types'
import { ROUTES } from '@/routes/paths'

export function ProfilePage() {
  const { username } = useParams<{ username: string }>()
  const { user: currentUser } = useAuth()

  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [reviewsCount, setReviewsCount] = useState(0)
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [activities, setActivities] = useState<FeedActivity[]>([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'activities' | 'favorites'>('activities')

  useEffect(() => {
    let active = true

    const loadProfileData = async () => {
      setLoading(true)
      setError(null)
      try {
        let resolvedUser: User | null = null
        let resolvedProfile: UserProfile | null = null

        if (username) {
          // View profile by username
          const result = await userService.getUserProfileByUsername(username)
          if (result) {
            resolvedUser = result.user
            resolvedProfile = result.profile
          }
        } else if (currentUser) {
          // View own profile
          resolvedUser = currentUser
          resolvedProfile = await userService.getUserProfile(currentUser.id)
        }

        if (!resolvedUser) {
          if (active) {
            setError('User profile not found.')
          }
          return
        }

        // Fetch related stats & activities
        const [userReviews, userFavorites, userActivities] = await Promise.all([
          reviewService.getReviewsByUser(resolvedUser.id),
          favoriteService.getFavoritesByUser(resolvedUser.id),
          feedService.getUserFeed(resolvedUser.id),
        ])

        if (active) {
          setUser(resolvedUser)
          setProfile(resolvedProfile)
          setReviewsCount(userReviews.length)
          setFavorites(userFavorites)
          setActivities(userActivities)
        }
      } catch (err) {
        console.error('Failed to load profile details:', err)
        if (active) {
          setError('An error occurred while loading the profile.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadProfileData()

    return () => {
      active = false
    }
  }, [username, currentUser])

  const handleUnfavoriteOptimistic = (destinationId: string) => {
    // If own profile, we can optimistically remove the item from favorites list
    if (!username || (currentUser && user && currentUser.id === user.id)) {
      setFavorites((prev) => prev.filter((f) => f.destinationId !== destinationId))
    }
  }

  if (loading) {
    return (
      <div className="py-12">
        <LoadingSpinner label="Loading traveler profile..." />
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-4">
        <div className="text-red-500 text-5xl">⚠️</div>
        <h3 className="text-lg font-bold text-gray-900">{error || 'Profile Not Found'}</h3>
        <p className="text-sm text-gray-500">
          The traveler profile you are trying to view does not exist or has been removed.
        </p>
        <Link
          to={ROUTES.home}
          className="inline-flex rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-teal-700"
        >
          Go Back Home
        </Link>
      </div>
    )
  }

  const initials = (user.displayName || user.username)
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const isOwnProfile = currentUser?.id === user.id

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Cover and Avatar Section */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-teal-500 to-emerald-600 h-40 sm:h-52 shadow-sm border border-gray-100">
        {profile?.coverUrl && (
          <img
            src={profile.coverUrl}
            alt="Profile cover"
            className="w-full h-full object-cover opacity-80"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      </div>

      {/* Profile Info Summary */}
      <div className="relative -mt-16 sm:-mt-24 px-4 sm:px-8 pb-4 border-b border-gray-100 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          {/* Avatar with offset */}
          <div className="relative h-28 w-28 sm:h-36 sm:w-36 rounded-full overflow-hidden border-4 border-white bg-white shadow-md shrink-0">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex w-full h-full items-center justify-center bg-teal-50 text-3xl font-extrabold text-teal-800">
                {initials}
              </div>
            )}
          </div>

          {/* Action Button: Edit Profile or Social Info */}
          <div className="flex items-center gap-2 pt-2 sm:pt-0">
            {isOwnProfile ? (
              <Link
                to={ROUTES.profileEdit}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
              >
                ⚙️ Edit Profile
              </Link>
            ) : (
              <button className="rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-teal-700 transition-colors focus:outline-none">
                Follow Traveler
              </button>
            )}
          </div>
        </div>

        {/* Name and Handle */}
        <div className="space-y-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900">{user.displayName}</h2>
            <p className="text-sm text-gray-400">@{user.username}</p>
          </div>

          {/* Bio & Location info */}
          {profile?.bio && (
            <p className="text-sm text-gray-600 max-w-xl leading-relaxed">{profile.bio}</p>
          )}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-500">
            {profile?.location && (
              <span className="flex items-center gap-1">
                📍 {profile.location}
              </span>
            )}
            <span className="flex items-center gap-1">
              📅 Member since {new Date(user.createdAt || profile?.createdAt || '2026-01-01').getFullYear()}
            </span>
            {profile?.website && (
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-teal-600 hover:underline"
              >
                🔗 Website
              </a>
            )}
          </div>

          {/* Followers / Following Counts */}
          <div className="flex gap-4 text-xs font-medium text-gray-600">
            <span>
              <strong className="text-gray-900">{profile?.followerCount ?? 0}</strong> Followers
            </span>
            <span>
              <strong className="text-gray-900">{profile?.followingCount ?? 0}</strong> Following
            </span>
          </div>
        </div>
      </div>

      {/* Stats Counter Dashboard */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm">
          <span className="block text-2xl font-extrabold text-teal-600">{reviewsCount}</span>
          <span className="text-[10px] sm:text-xs font-medium text-gray-400 uppercase tracking-wider">Reviews</span>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm">
          <span className="block text-2xl font-extrabold text-rose-500">{favorites.length}</span>
          <span className="text-[10px] sm:text-xs font-medium text-gray-400 uppercase tracking-wider">Favorites</span>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm">
          <span className="block text-2xl font-extrabold text-indigo-500">{activities.length}</span>
          <span className="text-[10px] sm:text-xs font-medium text-gray-400 uppercase tracking-wider">Activities</span>
        </div>
      </div>

      {/* Tabs area */}
      <div className="space-y-4">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('activities')}
            className={[
              'pb-3 px-4 text-sm font-semibold transition-colors border-b-2',
              activeTab === 'activities'
                ? 'border-teal-500 text-teal-600'
                : 'border-transparent text-gray-400 hover:text-gray-600',
            ].join(' ')}
          >
            Recent Activities ({activities.length})
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={[
              'pb-3 px-4 text-sm font-semibold transition-colors border-b-2',
              activeTab === 'favorites'
                ? 'border-teal-500 text-teal-600'
                : 'border-transparent text-gray-400 hover:text-gray-600',
            ].join(' ')}
          >
            Favorites ({favorites.length})
          </button>
        </div>

        {/* Tab Content Panels */}
        {activeTab === 'activities' ? (
          activities.length === 0 ? (
            <Card className="py-12 text-center">
              <p className="text-sm text-gray-500">No recent activities found for this traveler.</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => (
                <FeedCard key={activity.id} activity={activity} />
              ))}
            </div>
          )
        ) : favorites.length === 0 ? (
          <Card className="py-12 text-center">
            <p className="text-sm text-gray-500">No favorite destinations saved yet.</p>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {favorites.map((fav) => {
              const dest = fav.destination
              if (!dest) return null

              return (
                <div
                  key={dest.id}
                  className="relative group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                >
                  <Link to={ROUTES.destinationDetail(dest.slug)} className="flex flex-col flex-1">
                    <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                      <img
                        src={dest.image}
                        alt={dest.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-102"
                        loading="lazy"
                      />
                      <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-teal-800 shadow-sm border border-gray-100">
                        {dest.category}
                      </span>
                    </div>
                    <div className="flex-1 p-4 pr-10">
                      <h4 className="font-bold text-sm text-gray-900 group-hover:text-teal-600 transition-colors line-clamp-1">
                        {dest.name}
                      </h4>
                      <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                        <span>📍 {dest.province}</span>
                        <span>•</span>
                        <span className="text-amber-600 font-bold">★ {dest.rating.toFixed(1)}</span>
                      </p>
                    </div>
                  </Link>

                  {/* Optional favorite button for own profile to toggle favorite */}
                  {isOwnProfile && (
                    <div
                      className="absolute right-3 bottom-3"
                    >
                      <button
                        className="rounded-full bg-white/90 backdrop-blur-sm border border-gray-100 p-1.5 text-red-500 shadow-sm hover:scale-105 transition-all"
                        onClick={async (e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          try {
                            await favoriteService.removeFavorite(user.id, dest.id)
                            handleUnfavoriteOptimistic(dest.id)
                          } catch (err) {
                            console.error('Failed to remove favorite:', err)
                          }
                        }}
                        aria-label="Remove from favorites"
                      >
                        <svg className="h-4 w-4 fill-current" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default ProfilePage
