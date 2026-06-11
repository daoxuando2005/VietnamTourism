import { Link } from 'react-router-dom'
import { ROUTES } from '@/routes/paths'
import { featuredDestinations } from '@/pages/home/data'

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      <svg className="h-4 w-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
      <span className="text-sm font-semibold text-gray-900">{rating}</span>
    </div>
  )
}

export function FeaturedDestinations() {
  return (
    <section className="bg-white py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-3 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">Featured Destinations</h2>
            <p className="mt-2 text-sm text-gray-600 sm:text-base">
              Hand-picked places loved by travelers across Vietnam
            </p>
          </div>
          <Link
            to={ROUTES.destinations}
            className="text-sm font-semibold text-teal-700 hover:text-teal-800 hover:underline"
          >
            View all destinations →
          </Link>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featuredDestinations.map((destination) => (
            <Link
              key={destination.slug}
              to={ROUTES.destinationDetail(destination.slug)}
              className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={destination.image}
                  alt={destination.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-teal-800 shadow-sm">
                  {destination.tag}
                </span>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{destination.name}</h3>
                    <p className="text-sm text-gray-500">{destination.region}</p>
                  </div>
                  <StarRating rating={destination.rating} />
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  {destination.reviewCount.toLocaleString()} reviews
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
