import type { Destination, FeedPost, PaginatedResponse } from '@/types'
import { apiClient } from './api/client'

export interface SearchResults {
  destinations: Destination[]
  posts: FeedPost[]
}

export const searchService = {
  search(query: string, page = 1): Promise<PaginatedResponse<SearchResults>> {
    return apiClient.get(`/search?q=${encodeURIComponent(query)}&page=${page}`)
  },
}
