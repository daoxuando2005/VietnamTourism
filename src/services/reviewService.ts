import type { Review } from '@/types'
import { mockReviews, mockUsers } from '@/data'

/**
 * Service to manage review operations.
 * Prepared for future Supabase integration.
 */
export const reviewService = {
  /**
   * Fetch reviews for a specific destination.
   * Supabase query: await supabase.from('reviews').select('*, user:profiles(*)').eq('destinationId', destinationId)
   */
  async getReviewsByDestination(destinationId: string): Promise<Review[]> {
    const reviews = mockReviews.filter((r) => r.destinationId === destinationId)

    // Hydrate user (author) relation
    const hydratedReviews = reviews.map((review) => {
      const user = mockUsers.find((u) => u.id === review.userId)
      return {
        ...review,
        user,
        // Maintain fallback compatibility field
        author: {
          username: user?.username || 'anonymous',
          displayName: user?.displayName || 'Anonymous Traveler',
          avatarUrl: user?.avatarUrl,
        },
      }
    })

    return Promise.resolve(hydratedReviews)
  },
}
