import { Link } from 'react-router-dom'
import type { Review } from '@/types'
import { ROUTES } from '@/routes/paths'

interface ReviewCardProps {
  review: Review
}

export function ReviewCard({ review }: ReviewCardProps) {
  const authorName = review.user?.displayName || review.author?.displayName || 'Anonymous Traveler'
  const authorUsername = review.user?.username || review.author?.username || 'anonymous'
  const avatarUrl = review.user?.avatarUrl || review.author?.avatarUrl
  const initials = authorName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const formattedDate = new Date(review.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-3">
      {/* Header Profile Section */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={authorName}
              className="h-10 w-10 shrink-0 rounded-full object-cover border border-gray-100"
            />
          ) : (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-100 text-sm font-bold text-teal-800 border border-teal-200">
              {initials}
            </div>
          )}
          <div>
            <h4 className="text-sm font-bold text-gray-900 leading-none">{authorName}</h4>
            <span className="text-xs text-gray-400">@{authorUsername}</span>
          </div>
        </div>

        {/* Rating Stars */}
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <svg
              key={i}
              className={[
                'h-4 w-4',
                i < review.rating ? 'text-amber-400 fill-current' : 'text-gray-200',
              ].join(' ')}
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
      </div>

      {/* Review Content */}
      <div className="space-y-1">
        {review.title && (
          <h5 className="text-sm font-bold text-gray-900">{review.title}</h5>
        )}
        <p className="text-sm leading-relaxed text-gray-600 whitespace-pre-wrap">
          {review.content}
        </p>
      </div>

      {/* Footer Meta Details */}
      <div className="flex items-center justify-between border-t border-gray-50 pt-3 flex-wrap gap-2 text-xs text-gray-400">
        <span>Reviewed on {formattedDate}</span>
        {review.destination && (
          <Link
            to={ROUTES.destinationDetail(review.destination.slug)}
            className="inline-flex items-center gap-1 font-semibold text-teal-600 hover:text-teal-700 hover:underline"
          >
            <span>📍 {review.destination.name}</span>
          </Link>
        )}
      </div>
    </div>
  )
}
export default ReviewCard
