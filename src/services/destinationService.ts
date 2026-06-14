import type { Destination } from '@/types'
import { destinations } from '@/data'

/**
 * Service to manage destination operations.
 * Prepared for future Supabase integration.
 */
export const destinationService = {
  /**
   * Fetch all destinations.
   * Supabase query: await supabase.from('destinations').select('*')
   */
  async getAllDestinations(): Promise<Destination[]> {
    // Simulating asynchronous API call
    return Promise.resolve(destinations)
  },

  /**
   * Fetch a destination by its slug.
   * Supabase query: await supabase.from('destinations').select('*').eq('slug', slug).single()
   */
  async getDestinationBySlug(slug: string): Promise<Destination | null> {
    const destination = destinations.find((d) => d.slug === slug)
    return Promise.resolve(destination || null)
  },

  /**
   * Fetch destinations located in a specific province.
   * Supabase query: await supabase.from('destinations').select('*').eq('provinceId', provinceId)
   */
  async getDestinationsByProvince(provinceId: string): Promise<Destination[]> {
    const filtered = destinations.filter((d) => d.provinceId === provinceId)
    return Promise.resolve(filtered)
  },

  /**
   * Search destinations by name, province name, or description.
   * Supabase query: await supabase.from('destinations').select('*').ilike('name', `%${keyword}%`)
   */
  async searchDestinations(keyword: string): Promise<Destination[]> {
    const cleanKeyword = keyword.toLowerCase().trim()
    if (!cleanKeyword) return Promise.resolve([])

    const filtered = destinations.filter(
      (d) =>
        d.name.toLowerCase().includes(cleanKeyword) ||
        d.description.toLowerCase().includes(cleanKeyword) ||
        d.province?.toLowerCase().includes(cleanKeyword)
    )
    return Promise.resolve(filtered)
  },

  /**
   * Fetch featured destinations (e.g. rating >= 4.8).
   * Supabase query: await supabase.from('destinations').select('*').order('rating', { ascending: false }).limit(6)
   */
  async getFeaturedDestinations(): Promise<Destination[]> {
    // Return high-rated destinations as featured
    const featured = destinations.filter((d) => d.rating >= 4.8)
    return Promise.resolve(featured)
  },
}
