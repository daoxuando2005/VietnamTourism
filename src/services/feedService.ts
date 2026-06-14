import { supabase } from '@/lib/supabase'
import type { FeedActivity } from '@/types'

export const feedService = {
  /**
   * Fetch all feed activities across the platform, sorted chronologically.
   */
  async getFeed(): Promise<FeedActivity[]> {
    const { data, error } = await supabase
      .from('feed_activities')
      .select('*, profiles(*), destinations(*, provinces(name, region))')
      .order('created_at', { ascending: false })

    if (error || !data) return []

    return data.map((row) => {
      const user = row.profiles ? {
        id: row.profiles.id,
        username: row.profiles.username,
        displayName: row.profiles.display_name || row.profiles.username,
        avatarUrl: row.profiles.avatar_url,
        bio: row.profiles.bio,
        createdAt: row.profiles.created_at,
      } : undefined

      const dest = row.destinations ? {
        id: row.destinations.id,
        name: row.destinations.name,
        slug: row.destinations.slug,
        provinceId: row.destinations.province_id,
        description: row.destinations.description,
        rating: row.destinations.rating ?? 0.0,
        image: row.destinations.image,
        category: row.destinations.category,
        latitude: row.destinations.latitude,
        longitude: row.destinations.longitude,
        province: row.destinations.provinces?.name,
        region: row.destinations.provinces?.region,
        imageUrl: row.destinations.image,
        createdAt: row.destinations.created_at,
      } : undefined

      return {
        id: row.id,
        type: row.type as 'review' | 'favorite',
        userId: row.user_id,
        destinationId: row.destination_id,
        createdAt: row.created_at,
        user,
        destination: dest,
        rating: row.rating,
        reviewContent: row.review_content,
      }
    })
  },

  /**
   * Fetch feed activities for a specific user, sorted chronologically.
   */
  async getUserFeed(userId: string): Promise<FeedActivity[]> {
    const { data, error } = await supabase
      .from('feed_activities')
      .select('*, profiles(*), destinations(*, provinces(name, region))')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error || !data) return []

    return data.map((row) => {
      const user = row.profiles ? {
        id: row.profiles.id,
        username: row.profiles.username,
        displayName: row.profiles.display_name || row.profiles.username,
        avatarUrl: row.profiles.avatar_url,
        bio: row.profiles.bio,
        createdAt: row.profiles.created_at,
      } : undefined

      const dest = row.destinations ? {
        id: row.destinations.id,
        name: row.destinations.name,
        slug: row.destinations.slug,
        provinceId: row.destinations.province_id,
        description: row.destinations.description,
        rating: row.destinations.rating ?? 0.0,
        image: row.destinations.image,
        category: row.destinations.category,
        latitude: row.destinations.latitude,
        longitude: row.destinations.longitude,
        province: row.destinations.provinces?.name,
        region: row.destinations.provinces?.region,
        imageUrl: row.destinations.image,
        createdAt: row.destinations.created_at,
      } : undefined

      return {
        id: row.id,
        type: row.type as 'review' | 'favorite',
        userId: row.user_id,
        destinationId: row.destination_id,
        createdAt: row.created_at,
        user,
        destination: dest,
        rating: row.rating,
        reviewContent: row.review_content,
      }
    })
  },
}

export default feedService
