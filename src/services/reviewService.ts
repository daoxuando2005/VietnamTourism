import type { Review } from '@/types'
import { mockReviews, mockUsers, destinations } from '@/data'

const REVIEWS_KEY = 'vietnam_tourism_reviews'

// Helper to get local reviews or seed with default mock data
const getLocalReviews = (): Review[] => {
  const local = localStorage.getItem(REVIEWS_KEY)
  if (!local) {
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(mockReviews))
    return mockReviews
  }
  try {
    return JSON.parse(local)
  } catch {
    return mockReviews
  }
}

const saveLocalReviews = (reviews: Review[]) => {
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews))
}

/**
 * Service to manage reviews.
 * Prepared for future Supabase Database integration.
 */
export const reviewService = {
  /**
   * Fetch all reviews.
   * Supabase query: await supabase.from('reviews').select('*, user:profiles(*), destination:destinations(*)')
   */
  async getAllReviews(): Promise<Review[]> {
    const list = getLocalReviews()
    const hydrated = list.map((review) => {
      const user = mockUsers.find((u) => u.id === review.userId)
      const dest = destinations.find((d) => d.id === review.destinationId)
      return {
        ...review,
        user,
        destination: dest,
        author: {
          username: user?.username || 'anonymous',
          displayName: user?.displayName || 'Anonymous Traveler',
          avatarUrl: user?.avatarUrl,
        },
      }
    })
    return Promise.resolve(hydrated)
  },

  /**
   * Fetch reviews for a specific destination.
   * Supabase query: await supabase.from('reviews').select('*, user:profiles(*)').eq('destinationId', destinationId)
   */
  async getReviewsByDestination(destinationId: string): Promise<Review[]> {
    const list = getLocalReviews()
    const reviews = list.filter((r) => r.destinationId === destinationId)

    const hydrated = reviews.map((review) => {
      const user = mockUsers.find((u) => u.id === review.userId)
      const dest = destinations.find((d) => d.id === review.destinationId)
      return {
        ...review,
        user,
        destination: dest,
        author: {
          username: user?.username || 'anonymous',
          displayName: user?.displayName || 'Anonymous Traveler',
          avatarUrl: user?.avatarUrl,
        },
      }
    })

    return Promise.resolve(hydrated)
  },

  /**
   * Create a new review.
   * Supabase query: await supabase.from('reviews').insert(reviewData).select().single()
   */
  async createReview(reviewData: {
    destinationId: string
    userId: string
    rating: number
    title?: string
    content: string
  }): Promise<Review> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    const list = getLocalReviews()
    const newReview: Review = {
      id: `rev-${Date.now()}`,
      destinationId: reviewData.destinationId,
      userId: reviewData.userId,
      rating: reviewData.rating,
      title: reviewData.title || '',
      content: reviewData.content,
      createdAt: new Date().toISOString(),
    }

    list.unshift(newReview)
    saveLocalReviews(list)

    // Hydrate relations
    const user = mockUsers.find((u) => u.id === newReview.userId)
    const dest = destinations.find((d) => d.id === newReview.destinationId)
    return {
      ...newReview,
      user,
      destination: dest,
      author: {
        username: user?.username || 'anonymous',
        displayName: user?.displayName || 'Anonymous Traveler',
        avatarUrl: user?.avatarUrl,
      },
    }
  },

  /**
   * Update an existing review.
   * Supabase query: await supabase.from('reviews').update(reviewData).eq('id', id).select().single()
   */
  async updateReview(id: string, reviewData: Partial<Review>): Promise<Review> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    const list = getLocalReviews()
    const index = list.findIndex((r) => r.id === id)
    if (index === -1) {
      throw new Error('Review not found')
    }

    const updatedReview = {
      ...list[index],
      ...reviewData,
      updatedAt: new Date().toISOString(),
    }

    list[index] = updatedReview
    saveLocalReviews(list)

    // Hydrate relations
    const user = mockUsers.find((u) => u.id === updatedReview.userId)
    const dest = destinations.find((d) => d.id === updatedReview.destinationId)
    return {
      ...updatedReview,
      user,
      destination: dest,
      author: {
        username: user?.username || 'anonymous',
        displayName: user?.displayName || 'Anonymous Traveler',
        avatarUrl: user?.avatarUrl,
      },
    }
  },

  /**
   * Delete a review.
   * Supabase query: await supabase.from('reviews').delete().eq('id', id)
   */
  async deleteReview(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300))

    const list = getLocalReviews()
    const filtered = list.filter((r) => r.id !== id)
    saveLocalReviews(filtered)
  },
}
export default reviewService
