import type { Destination } from '@/types'
import { destinationRepository } from '@/repositories/destinationRepository'

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
    return destinationRepository.getDestinations()
  },

  /**
   * Fetch a destination by its slug.
   * Supabase query: await supabase.from('destinations').select('*').eq('slug', slug).single()
   */
  async getDestinationBySlug(slug: string): Promise<Destination | null> {
    return destinationRepository.getDestinationBySlug(slug)
  },

  /**
   * Fetch destinations located in a specific province.
   * Supabase query: await supabase.from('destinations').select('*').eq('provinceId', provinceId)
   */
  async getDestinationsByProvince(provinceId: string): Promise<Destination[]> {
    return destinationRepository.getDestinationsByProvince(provinceId)
  },

  /**
   * Search destinations by name, province name, or description.
   * Supabase query: await supabase.from('destinations').select('*').ilike('name', `%${keyword}%`)
   */
  async searchDestinations(keyword: string): Promise<Destination[]> {
    return destinationRepository.searchDestinations(keyword)
  },

  /**
   * Fetch featured destinations (e.g. rating >= 4.8).
   * Supabase query: await supabase.from('destinations').select('*').order('rating', { ascending: false }).limit(6)
   */
  async getFeaturedDestinations(): Promise<Destination[]> {
    const list = await destinationRepository.getDestinations()
    return list.filter((d) => d.rating >= 4.8)
  },
}
