import type { Province } from '@/types'
import { provinceRepository } from '@/repositories/provinceRepository'

/**
 * Service to manage province operations.
 * Prepared for future Supabase integration.
 */
export const provinceService = {
  /**
   * Fetch all provinces.
   * Supabase query: await supabase.from('provinces').select('*').order('name')
   */
  async getAllProvinces(): Promise<Province[]> {
    return provinceRepository.getAllProvinces()
  },

  /**
   * Fetch a province by its slug.
   * Supabase query: await supabase.from('provinces').select('*').eq('slug', slug).single()
   */
  async getProvinceBySlug(slug: string): Promise<Province | null> {
    return provinceRepository.getProvinceBySlug(slug)
  },
}
