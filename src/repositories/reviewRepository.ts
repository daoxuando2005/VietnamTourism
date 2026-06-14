import { supabase } from '@/lib/supabase'
import type { Review, DestinationCategory } from '@/types'

interface ReviewRow {
  id: string
  destination_id: string
  user_id: string
  rating: number
  title: string | null
  content: string
  created_at: string
  updated_at: string | null
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

// Helper to map DB row to frontend Review interface
function mapReview(row: ReviewRow): Review {
  const authorName = row.profiles?.display_name || 'Anonymous Traveler'
  const authorUsername = row.profiles?.username || 'anonymous'

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
    destinationId: row.destination_id,
    userId: row.user_id,
    rating: row.rating,
    title: row.title || '',
    content: row.content,
    createdAt: row.created_at,
    updatedAt: row.updated_at || undefined,
    user,
    destination: dest,
    author: {
      username: authorUsername,
      displayName: authorName,
      avatarUrl: row.profiles?.avatar_url || undefined,
    },
  }
}

export const reviewRepository = {
  async getAllReviews(): Promise<Review[]> {
    const { data, error } = await supabase
      .from('reviews')
      .select('*, profiles(*), destinations(*, provinces(name, region))')
      .order('created_at', { ascending: false })

    if (error || !data) return []
    return data.map(mapReview)
  },

  async getReviewsByDestination(destinationId: string): Promise<Review[]> {
    const { data, error } = await supabase
      .from('reviews')
      .select('*, profiles(*), destinations(*, provinces(name, region))')
      .eq('destination_id', destinationId)
      .order('created_at', { ascending: false })

    if (error || !data) return []
    return data.map(mapReview)
  },

  async getReviewsByUser(userId: string): Promise<Review[]> {
    const { data, error } = await supabase
      .from('reviews')
      .select('*, profiles(*), destinations(*, provinces(name, region))')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error || !data) return []
    return data.map(mapReview)
  },

  async createReview(data: {
    destinationId: string
    userId: string
    rating: number
    title?: string
    content: string
  }): Promise<Review> {
    const newId = `rev-${Date.now()}`
    const dbData = {
      id: newId,
      destination_id: data.destinationId,
      user_id: data.userId,
      rating: data.rating,
      title: data.title || '',
      content: data.content,
    }

    const { error } = await supabase
      .from('reviews')
      .insert(dbData)

    if (error) {
      throw new Error(error.message)
    }

    // Retrieve full hydrated record
    const { data: inserted, error: fetchError } = await supabase
      .from('reviews')
      .select('*, profiles(*), destinations(*, provinces(name, region))')
      .eq('id', newId)
      .single()

    if (fetchError || !inserted) {
      throw new Error(fetchError?.message || 'Failed to retrieve created review')
    }

    return mapReview(inserted)
  },

  async updateReview(id: string, data: Partial<Review>): Promise<Review> {
    const dbUpdate: Record<string, unknown> = {}
    if (data.rating !== undefined) dbUpdate.rating = data.rating
    if (data.title !== undefined) dbUpdate.title = data.title
    if (data.content !== undefined) dbUpdate.content = data.content
    dbUpdate.updated_at = new Date().toISOString()

    const { error } = await supabase
      .from('reviews')
      .update(dbUpdate)
      .eq('id', id)

    if (error) {
      throw new Error(error.message)
    }

    // Retrieve updated hydrated record
    const { data: updated, error: fetchError } = await supabase
      .from('reviews')
      .select('*, profiles(*), destinations(*, provinces(name, region))')
      .eq('id', id)
      .single()

    if (fetchError || !updated) {
      throw new Error(fetchError?.message || 'Failed to retrieve updated review')
    }

    return mapReview(updated)
  },

  async deleteReview(id: string): Promise<void> {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(error.message)
    }
  },
}

export default reviewRepository
