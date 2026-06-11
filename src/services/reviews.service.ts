import type { PaginatedResponse, Review } from '@/types'
import { apiClient } from './api/client'

export const reviewsService = {
  getByDestination(destinationId: string, page = 1): Promise<PaginatedResponse<Review>> {
    return apiClient.get(`/destinations/${destinationId}/reviews?page=${page}`)
  },

  getRecent(page = 1): Promise<PaginatedResponse<Review>> {
    return apiClient.get(`/reviews?page=${page}`)
  },
}
