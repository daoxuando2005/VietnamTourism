import type { Destination, PaginatedResponse } from '@/types'
import { apiClient } from './api/client'

export const destinationsService = {
  getAll(page = 1, pageSize = 12): Promise<PaginatedResponse<Destination>> {
    return apiClient.get(`/destinations?page=${page}&pageSize=${pageSize}`)
  },

  getBySlug(slug: string): Promise<Destination> {
    return apiClient.get(`/destinations/${slug}`)
  },

  getByRegion(region: string): Promise<Destination[]> {
    return apiClient.get(`/destinations?region=${region}`)
  },
}
