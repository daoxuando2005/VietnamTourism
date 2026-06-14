import { Link } from 'react-router-dom'
import type { FeedActivity } from '@/types'
import { ROUTES } from '@/routes/paths'

interface FeedCardProps {
  activity: FeedActivity
}

export function FeedCard({ activity }: FeedCardProps) {
  const { type, user, destination, createdAt, rating, reviewContent } = activity

  const authorName = user?.displayName || 'Traveler'
  const authorUsername = user?.username || 'anonymous'
  const avatarUrl = user?.avatarUrl

  const initials = authorName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const formattedDate = new Date(createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow duration-200 space-y-4">
      {/* Top Header Row: User info and Action */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={authorName}
              className="h-10 w-10 shrink-0 rounded-full object-cover border border-gray-100 shadow-sm"
            />
          ) : (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-50 text-sm font-bold text-teal-700 border border-teal-100">
              {initials}
            </div>
          )}

          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <Link
                to={ROUTES.profileByUsername(authorUsername)}
                className="text-sm font-bold text-gray-900 hover:text-teal-600 transition-colors"
              >
                {authorName}
              </Link>
              <span className="text-xs text-gray-400">@{authorUsername}</span>
            </div>
            {/* Action text */}
            <p className="text-xs text-gray-500 mt-0.5">
              {type === 'review' ? (
                <span className="inline-flex items-center gap-1">
                  ✍️ reviewed a destination
                </span>
              ) : (
                <span className="inline-flex items-center gap-1">
                  ❤️ favorited a destination
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Timestamp */}
        <span className="text-[11px] text-gray-400 shrink-0">{formattedDate}</span>
      </div>

      {/* Main Body Section */}
      <div className="space-y-2">
        {/* Rating Stars for Review */}
        {type === 'review' && typeof rating === 'number' && (
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <svg
                key={i}
                className={[
                  'h-3.5 w-3.5',
                  i < rating ? 'text-amber-400 fill-current' : 'text-gray-200',
                ].join(' ')}
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
        )}

        {/* Review Content text */}
        {type === 'review' && reviewContent && (
          <p className="text-sm text-gray-600 italic border-l-2 border-teal-100 pl-3 leading-relaxed">
            &ldquo;{reviewContent}&rdquo;
          </p>
        )}
      </div>

      {/* Destination Card Preview */}
      {destination && (
        <Link
          to={ROUTES.destinationDetail(destination.slug)}
          className="group block rounded-lg border border-gray-100 bg-gray-50/50 p-3 hover:bg-teal-50/20 hover:border-teal-100 transition-all duration-200"
        >
          <div className="flex gap-3">
            <img
              src={destination.image}
              alt={destination.name}
              className="h-14 w-20 shrink-0 rounded-md object-cover border border-gray-100"
            />
            <div className="min-w-0 flex-1 flex flex-col justify-center">
              <h5 className="text-xs font-bold text-gray-800 group-hover:text-teal-700 transition-colors truncate">
                {destination.name}
              </h5>
              <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
                <span>📍 {destination.province}</span>
                <span>•</span>
                <span className="uppercase font-semibold text-[8px] text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-100">
                  {destination.category}
                </span>
              </p>
            </div>
            <div className="flex items-center text-teal-600 group-hover:translate-x-1 transition-transform">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Link>
      )}
    </div>
  )
}

export default FeedCard
