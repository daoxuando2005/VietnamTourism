import type { Favorite } from '@/types'
import { apiClient } from './api/client'

export const favoritesService = {
  getByUser(userId: string): Promise<Favorite[]> {
    return apiClient.get(`/users/${userId}/favorites`)
  },

  add(userId: string, destinationId: string): Promise<Favorite> {
    return apiClient.post(`/users/${userId}/favorites`, { destinationId })
  },

  remove(userId: string, destinationId: string): Promise<void> {
    return apiClient.delete(`/users/${userId}/favorites/${destinationId}`)
  },
}
