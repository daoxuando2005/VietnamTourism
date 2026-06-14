import type { Favorite } from '@/types'
import { mockFavorites, destinations } from '@/data'

/**
 * Service to manage favorite operations.
 * Prepared for future Supabase integration.
 */
export const favoriteService = {
  /**
   * Fetch all favorites for a specific user.
   * Supabase query: await supabase.from('favorites').select('*, destination:destinations(*)').eq('userId', userId)
   */
  async getFavoritesByUser(userId: string): Promise<Favorite[]> {
    const favorites = mockFavorites.filter((f) => f.userId === userId)

    // Hydrate destination relation
    const hydratedFavorites = favorites.map((favorite) => {
      const destination = destinations.find((d) => d.id === favorite.destinationId)
      return {
        ...favorite,
        destination,
      }
    })

    return Promise.resolve(hydratedFavorites)
  },
}
