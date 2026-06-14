import type { Favorite } from '@/types'
import { favoriteRepository } from '@/repositories/favoriteRepository'

/**
 * Service to manage user favorite destinations.
 * Prepared for future Supabase Database integration.
 */
export const favoriteService = {
  /**
   * Fetch all favorites for a specific user.
   * Supabase query: await supabase.from('favorites').select('*, destination:destinations(*)').eq('userId', userId)
   */
  async getFavoritesByUser(userId: string): Promise<Favorite[]> {
    return favoriteRepository.getFavoritesByUser(userId)
  },

  /**
   * Add a destination to user favorites.
   * Supabase query: await supabase.from('favorites').insert({ userId, destinationId }).select().single()
   */
  async addFavorite(userId: string, destinationId: string): Promise<Favorite> {
    return favoriteRepository.addFavorite(userId, destinationId)
  },

  /**
   * Remove a destination from user favorites.
   * Supabase query: await supabase.from('favorites').delete().eq('userId', userId).eq('destinationId', destinationId)
   */
  async removeFavorite(userId: string, destinationId: string): Promise<void> {
    return favoriteRepository.removeFavorite(userId, destinationId)
  },

  /**
   * Check if a destination is favorited by a user.
   * Supabase query: const { data } = await supabase.from('favorites').select('id').eq('userId', userId).eq('destinationId', destinationId).single()
   */
  async isFavorite(userId: string, destinationId: string): Promise<boolean> {
    return favoriteRepository.isFavorite(userId, destinationId)
  },

  /**
   * Fetch all favorites across all users.
   */
  async getAllFavorites(): Promise<Favorite[]> {
    return favoriteRepository.getAllFavorites()
  },
}

export default favoriteService
