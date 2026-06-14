import { useState, useEffect } from 'react'
import { PageHeader, LoadingSpinner, ReviewList } from '@/components'
import { reviewService } from '@/services'
import type { Review } from '@/types'

export function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    const loadReviews = async () => {
      setLoading(true)
      try {
        const data = await reviewService.getAllReviews()
        if (active) {
          setReviews(data)
        }
      } catch (err) {
        console.error('Failed to load reviews:', err)
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadReviews()

    return () => {
      active = false
    }
  }, [])

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      <PageHeader
        title="Traveler Reviews"
        description="Read honest reviews and ratings from travelers who have explored beautiful places across Vietnam."
      />

      {loading ? (
        <LoadingSpinner label="Loading traveler reviews..." />
      ) : (
        <div className="max-w-3xl mx-auto">
          <ReviewList reviews={reviews} />
        </div>
      )}
    </div>
  )
}
export default ReviewsPage
