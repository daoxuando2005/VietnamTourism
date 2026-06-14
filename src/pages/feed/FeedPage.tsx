import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader, FeedCard } from '@/components'
import { feedService } from '@/services'
import type { FeedActivity } from '@/types'
import { ROUTES } from '@/routes/paths'

export function FeedPage() {
  const [activities, setActivities] = useState<FeedActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    const fetchFeed = async () => {
      setLoading(true)
      try {
        const data = await feedService.getFeed()
        if (active) {
          setActivities(data)
        }
      } catch (err) {
        console.error('Failed to fetch social feed:', err)
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    fetchFeed()

    return () => {
      active = false
    }
  }, [])

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in max-w-2xl mx-auto">
      <PageHeader
        title="Social Feed"
        description="See what other travelers are saying and loving in the Vietnam travel community."
      />

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse rounded-xl border border-gray-200 bg-white p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gray-200" />
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-32" />
                    <div className="h-3 bg-gray-200 rounded w-24" />
                  </div>
                </div>
                <div className="h-3 bg-gray-200 rounded w-16" />
              </div>
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-14 bg-gray-100 rounded w-full" />
            </div>
          ))}
        </div>
      ) : activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 py-16 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 className="mt-4 text-sm font-semibold text-gray-900">No activity yet</h3>
          <p className="mt-1 text-xs text-gray-500 max-w-xs leading-relaxed">
            There is currently no social activity on the platform. Be the first to add a favorite or write a review!
          </p>
          <Link
            to={ROUTES.destinations}
            className="mt-6 rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-teal-700 focus:outline-none"
          >
            Browse Destinations
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <FeedCard key={activity.id} activity={activity} />
          ))}
        </div>
      )}
    </div>
  )
}

export default FeedPage
