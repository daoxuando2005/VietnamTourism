import type { Province } from '@/types'
import { provinces } from '@/data'

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
    return Promise.resolve(provinces)
  },

  /**
   * Fetch a province by its slug.
   * Supabase query: await supabase.from('provinces').select('*').eq('slug', slug).single()
   */
  async getProvinceBySlug(slug: string): Promise<Province | null> {
    const province = provinces.find((p) => p.slug === slug)
    return Promise.resolve(province || null)
  },
}
