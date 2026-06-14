import { supabase } from '@/lib/supabase'
import type { Province, VietnamRegion } from '@/types'

interface ProvinceRow {
  id: string
  name: string
  slug: string
  region: string
  description: string | null
  map_x: number | null
  map_y: number | null
  created_at?: string
}

// Helper to map DB row to frontend Province interface
function mapProvince(row: ProvinceRow): Province {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    region: row.region as VietnamRegion,
    description: row.description || '',
    mapX: row.map_x ?? 0,
    mapY: row.map_y ?? 0,
  }
}

export const provinceRepository = {
  async getAllProvinces(): Promise<Province[]> {
    const { data, error } = await supabase
      .from('provinces')
      .select('*')
      .order('name')

    if (error || !data) return []
    return data.map(mapProvince)
  },

  async getProvinceBySlug(slug: string): Promise<Province | null> {
    const { data, error } = await supabase
      .from('provinces')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error || !data) return null
    return mapProvince(data)
  },
}

export default provinceRepository
