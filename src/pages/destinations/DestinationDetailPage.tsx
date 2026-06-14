import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { LoadingSpinner, Card, ReviewList, ReviewForm } from '@/components'
import { destinationService, provinceService, reviewService } from '@/services'
import { ROUTES } from '@/routes/paths'
import type { Destination, Province, Review } from '@/types'

export function DestinationDetailPage() {
  const { slug } = useParams<{ slug: string }>()

  const [destination, setDestination] = useState<Destination | null>(null)
  const [province, setProvince] = useState<Province | null>(null)
  const [related, setRelated] = useState<Destination[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return

    let active = true

    const loadData = async () => {
      setLoading(true)
      try {
        const dest = await destinationService.getDestinationBySlug(slug)
        if (!dest) {
          if (active) {
            setDestination(null)
            setLoading(false)
          }
          return
        }

        // Fetch province info
        const provincesList = await provinceService.getAllProvinces()
        const prov = provincesList.find((p) => p.id === dest.provinceId) || null

        // Fetch related destinations in same province
        let relatedDests = await destinationService.getDestinationsByProvince(dest.provinceId)
        // Filter out current destination
        relatedDests = relatedDests.filter((r) => r.id !== dest.id).slice(0, 3)

        // Fetch reviews for this destination
        const destReviews = await reviewService.getReviewsByDestination(dest.id)

        if (active) {
          setDestination(dest)
          setProvince(prov)
          setRelated(relatedDests)
          setReviews(destReviews)
        }
      } catch (err) {
        console.error('Error loading destination details:', err)
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadData()

    return () => {
      active = false
    }
  }, [slug])

  if (loading) {
    return (
      <div className="py-12">
        <LoadingSpinner label="Loading destination details..." />
      </div>
    )
  }

  if (!destination) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-16 text-center shadow-sm">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h3 className="mt-4 text-lg font-semibold text-gray-900">Destination Not Found</h3>
        <p className="mt-1 text-sm text-gray-500 max-w-xs">
          The destination you are looking for does not exist or has been moved.
        </p>
        <Link
          to={ROUTES.destinations}
          className="mt-6 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 focus:outline-none"
        >
          Back to Destinations
        </Link>
      </div>
    )
  }

  const provinceName = destination.province || province?.name || 'Unknown Province'

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Back button */}
      <div>
        <Link
          to={ROUTES.destinations}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700 hover:text-teal-800 hover:underline"
        >
          ← Back to all destinations
        </Link>
      </div>

      {/* Hero Banner Section */}
      <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-gray-100 shadow-md">
        <div className="aspect-[21/9] w-full max-h-[420px] overflow-hidden">
          <img
            src={destination.image}
            alt={destination.name}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white sm:p-8">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="rounded-full bg-teal-600/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider border border-teal-500/20">
              {destination.category}
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            {destination.name}
          </h1>
          <p className="mt-2 text-sm text-gray-200 flex items-center gap-1.5 font-medium">
            <svg className="h-4 w-4 text-teal-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {provinceName}
          </p>
        </div>
      </div>

      {/* Content Layout */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4">
              Overview
            </h2>
            <p className="text-base leading-relaxed text-gray-700 whitespace-pre-line">
              {destination.description}
            </p>
          </div>

          {/* Quick Info Grid for Mobile/Desktop */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm">
              <span className="block text-xs font-semibold uppercase tracking-wider text-gray-400">Rating</span>
              <span className="mt-1 block text-2xl font-bold text-amber-500 flex items-center justify-center gap-1">
                ⭐ {destination.rating.toFixed(1)}
              </span>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm">
              <span className="block text-xs font-semibold uppercase tracking-wider text-gray-400">Category</span>
              <span className="mt-1 block text-lg font-bold text-teal-700 uppercase tracking-wide">
                {destination.category}
              </span>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm">
              <span className="block text-xs font-semibold uppercase tracking-wider text-gray-400">Coordinates</span>
              <span className="mt-1 block text-sm font-semibold text-gray-600">
                {destination.latitude.toFixed(4)}° N <br />
                {destination.longitude.toFixed(4)}° E
              </span>
            </div>
          </div>
        </div>

        {/* Sidebar Info Card */}
        <div className="space-y-6">
          <Card padding="lg" className="space-y-6">
            <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
              Location Details
            </h3>

            <div className="space-y-4">
              <div>
                <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Province</span>
                <span className="text-sm font-bold text-gray-800">{provinceName}</span>
                {province && (
                  <p className="mt-1 text-xs text-gray-500 italic leading-relaxed">
                    {province.description}
                  </p>
                )}
              </div>

              <div>
                <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Region</span>
                <span className="text-sm font-bold text-gray-800 capitalize">
                  {destination.region || province?.region || 'Vietnam'}
                </span>
              </div>

              <div>
                <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Geographic Coordinates</span>
                <div className="mt-1 text-xs text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-100 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Latitude:</span>
                    <span className="font-mono font-medium">{destination.latitude}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Longitude:</span>
                    <span className="font-mono font-medium">{destination.longitude}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="border-t border-gray-200 pt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xl font-bold text-gray-900 sm:text-2xl">
            Traveler Reviews ({reviews.length})
          </h3>
          <ReviewList reviews={reviews} />
        </div>
        <div>
          <ReviewForm
            destinationId={destination.id}
            onReviewSubmitted={(newReview) => {
              setReviews((prev) => [newReview, ...prev])
            }}
          />
        </div>
      </div>

      {/* Related Destinations Section */}
      <div className="border-t border-gray-200 pt-8">
        <h2 className="text-xl font-bold text-gray-900 sm:text-2xl mb-4">
          Other Places to Explore in {provinceName}
        </h2>
        {related.length === 0 ? (
          <p className="text-sm text-gray-500 italic">
            No other famous destinations found in this province yet. Keep exploring!
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((rel) => (
              <Link
                key={rel.slug}
                to={ROUTES.destinationDetail(rel.slug)}
                className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                  <img
                    src={rel.image}
                    alt={rel.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  <span className="absolute left-2.5 top-2.5 rounded-full bg-white/95 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-teal-800 shadow-sm border border-gray-50">
                    {rel.category}
                  </span>
                </div>
                <div className="flex flex-1 flex-col justify-between p-3.5">
                  <h4 className="font-bold text-sm text-gray-900 group-hover:text-teal-600 transition-colors line-clamp-1">
                    {rel.name}
                  </h4>
                  <div className="mt-2.5 flex items-center justify-between border-t border-gray-50 pt-2 text-[11px]">
                    <span className="text-teal-700 font-semibold">View guide →</span>
                    <span className="font-bold text-amber-600">★ {rel.rating.toFixed(1)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
