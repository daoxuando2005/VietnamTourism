import type { Review } from '@/types'
import { reviewRepository } from '@/repositories/reviewRepository'

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
    return reviewRepository.getAllReviews()
  },

  /**
   * Fetch reviews for a specific destination.
   * Supabase query: await supabase.from('reviews').select('*, user:profiles(*)').eq('destinationId', destinationId)
   */
  async getReviewsByDestination(destinationId: string): Promise<Review[]> {
    return reviewRepository.getReviewsByDestination(destinationId)
  },

  /**
   * Fetch reviews written by a specific user.
   * Supabase query: await supabase.from('reviews').select('*, destination:destinations(*)').eq('userId', userId)
   */
  async getReviewsByUser(userId: string): Promise<Review[]> {
    return reviewRepository.getReviewsByUser(userId)
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
    return reviewRepository.createReview(reviewData)
  },

  /**
   * Update an existing review.
   * Supabase query: await supabase.from('reviews').update(reviewData).eq('id', id).select().single()
   */
  async updateReview(id: string, reviewData: Partial<Review>): Promise<Review> {
    return reviewRepository.updateReview(id, reviewData)
  },

  /**
   * Delete a review.
   * Supabase query: await supabase.from('reviews').delete().eq('id', id)
   */
  async deleteReview(id: string): Promise<void> {
    return reviewRepository.deleteReview(id)
  },
}

export default reviewService
