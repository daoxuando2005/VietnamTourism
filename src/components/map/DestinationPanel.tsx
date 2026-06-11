import { Link } from 'react-router-dom'
import { ROUTES } from '@/routes/paths'
import type { Place, Province } from '@/types/place'

interface DestinationPanelProps {
  province: Province | undefined
  place: Place | undefined
}

function formatPrice(price: number, currency: string): string {
  if (price === 0) return 'Free'
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(price)
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }, (_, i) => (
          <svg
            key={i}
            className={`h-4 w-4 ${i < Math.round(rating) ? 'text-amber-400' : 'text-gray-200'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <span className="text-sm font-semibold text-gray-900">{rating}</span>
    </div>
  )
}

export function DestinationPanel({ province, place }: DestinationPanelProps) {
  if (!province || !place) {
    return (
      <aside className="flex h-full flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white p-6 text-center">
        <p className="text-sm font-medium text-gray-500">Select a province to view destination details</p>
      </aside>
    )
  }

  return (
    <aside className="flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="relative aspect-[16/10] shrink-0 overflow-hidden">
        <img
          src={place.imageUrl}
          alt={place.name}
          className="h-full w-full object-cover"
        />
        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-teal-800 shadow-sm">
          {province.name}
        </span>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto p-4">
        <h2 className="text-lg font-bold text-gray-900">{place.name}</h2>

        <div className="mt-2 flex items-center justify-between">
          <StarRating rating={place.rating} />
          <span className="text-xs text-gray-500">
            {place.reviewCount.toLocaleString()} reviews
          </span>
        </div>

        <p className="mt-3 flex-1 text-sm leading-relaxed text-gray-600">{place.description}</p>

        <div className="mt-4 rounded-lg bg-gray-50 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Ticket Price</p>
          <p className="mt-0.5 text-xl font-bold text-teal-700">
            {formatPrice(place.ticketPrice, place.currency)}
          </p>
        </div>

        <Link
          to={ROUTES.destinations}
          className="mt-4 block w-full rounded-lg bg-teal-700 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-teal-800"
        >
          View more destinations
        </Link>
      </div>
    </aside>
  )
}
