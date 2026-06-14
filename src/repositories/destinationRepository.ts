import { supabase } from '@/lib/supabase'
import type { Destination, DestinationCategory } from '@/types'

interface DestinationRow {
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
}

// Helper to map DB row to frontend Destination interface
function mapDestination(row: DestinationRow): Destination {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    provinceId: row.province_id,
    description: row.description,
    rating: row.rating ?? 0.0,
    image: row.image,
    category: row.category,
    latitude: row.latitude,
    longitude: row.longitude,
    // Hydrated / compatibility fields
    province: row.provinces?.name || '',
    region: row.provinces?.region || '',
    imageUrl: row.image,
    createdAt: row.created_at,
  }
}

export const destinationRepository = {
  async getDestinations(): Promise<Destination[]> {
    const { data, error } = await supabase
      .from('destinations')
      .select('*, provinces(name, region)')
      .order('name')

    if (error || !data) return []
    return data.map(mapDestination)
  },

  async getDestinationBySlug(slug: string): Promise<Destination | null> {
    const { data, error } = await supabase
      .from('destinations')
      .select('*, provinces(name, region)')
      .eq('slug', slug)
      .single()

    if (error || !data) return null
    return mapDestination(data)
  },

  async getDestinationsByProvince(provinceId: string): Promise<Destination[]> {
    const { data, error } = await supabase
      .from('destinations')
      .select('*, provinces(name, region)')
      .eq('province_id', provinceId)

    if (error || !data) return []
    return data.map(mapDestination)
  },

  async searchDestinations(query: string): Promise<Destination[]> {
    if (!query) return []
    const { data, error } = await supabase
      .from('destinations')
      .select('*, provinces(name, region)')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`)

    if (error || !data) return []
    return data.map(mapDestination)
  },
}

export default destinationRepository
