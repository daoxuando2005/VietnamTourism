import { Link } from 'react-router-dom'
import { ROUTES } from '@/routes/paths'
import { trendingReviews } from '@/pages/home/data'

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          className={`h-4 w-4 ${i < count ? 'text-amber-400' : 'text-gray-200'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

export function TrendingReviews() {
  return (
    <section className="bg-gray-50 py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-3 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">Trending Reviews</h2>
            <p className="mt-2 text-sm text-gray-600 sm:text-base">
              What travelers are saying about their Vietnam adventures
            </p>
          </div>
          <Link
            to={ROUTES.reviews}
            className="text-sm font-semibold text-teal-700 hover:text-teal-800 hover:underline"
          >
            Read all reviews →
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {trendingReviews.map((review) => (
            <article
              key={review.id}
              className="flex flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-teal-100 text-sm font-bold text-teal-800">
                  {review.avatar}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{review.author}</p>
                  <p className="text-xs text-gray-500">{review.date}</p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <Stars count={review.rating} />
                <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-teal-700">
                  {review.destination}
                </span>
              </div>

              <h3 className="mt-3 font-semibold text-gray-900">{review.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-600">{review.excerpt}</p>

              <Link
                to={ROUTES.reviews}
                className="mt-4 text-sm font-medium text-teal-700 hover:underline"
              >
                Read full review
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
