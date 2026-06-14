import { supabase } from '@/lib/supabase'
import type { Favorite, DestinationCategory } from '@/types'

interface FavoriteRow {
  id: string
  user_id: string
  destination_id: string
  created_at: string
  profiles?: {
    id: string
    username: string
    display_name: string | null
    avatar_url: string | null
    bio: string | null
    created_at: string
  } | null
  destinations?: {
    id: string
    name: string
    slug: string
    province_id: string
    description: string
    rating: number | null
    image: string
    category: DestinationCategory
    latitude: number
    longitude: number
    created_at: string
    provinces?: {
      name: string
      region: string
    } | null
  } | null
}

// Helper to map DB row to frontend Favorite interface
function mapFavorite(row: FavoriteRow): Favorite {
  const user = row.profiles ? {
    id: row.profiles.id,
    username: row.profiles.username,
    displayName: row.profiles.display_name || row.profiles.username,
    avatarUrl: row.profiles.avatar_url || undefined,
    bio: row.profiles.bio || undefined,
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
    userId: row.user_id,
    destinationId: row.destination_id,
    createdAt: row.created_at,
    user,
    destination: dest,
  }
}

export const favoriteRepository = {
  async getFavoritesByUser(userId: string): Promise<Favorite[]> {
    const { data, error } = await supabase
      .from('favorites')
      .select('*, profiles(*), destinations(*, provinces(name, region))')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error || !data) return []
    return data.map(mapFavorite)
  },

  async getAllFavorites(): Promise<Favorite[]> {
    const { data, error } = await supabase
      .from('favorites')
      .select('*, profiles(*), destinations(*, provinces(name, region))')
      .order('created_at', { ascending: false })

    if (error || !data) return []
    return data.map(mapFavorite)
  },

  async addFavorite(userId: string, destinationId: string): Promise<Favorite> {
    const newId = `fav-${Date.now()}`
    const dbData = {
      id: newId,
      user_id: userId,
      destination_id: destinationId,
    }

    const { error } = await supabase
      .from('favorites')
      .insert(dbData)

    if (error) {
      throw new Error(error.message)
    }

    // Retrieve hydrated record
    const { data: inserted, error: fetchError } = await supabase
      .from('favorites')
      .select('*, profiles(*), destinations(*, provinces(name, region))')
      .eq('id', newId)
      .single()

    if (fetchError || !inserted) {
      throw new Error(fetchError?.message || 'Failed to retrieve favorited destination')
    }

    return mapFavorite(inserted)
  },

  async removeFavorite(userId: string, destinationId: string): Promise<void> {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('destination_id', destinationId)

    if (error) {
      throw new Error(error.message)
    }
  },

  async isFavorite(userId: string, destinationId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('destination_id', destinationId)

    if (error || !data) return false
    return data.length > 0
  },
}

export default favoriteRepository
