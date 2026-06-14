export type VietnamRegion = 'north' | 'central' | 'south'

export interface Province {
  id: string
  name: string
  slug: string
  region: VietnamRegion
  description: string
  
  // Map coordinates for interactive map (0-100 percentage)
  mapX: number
  mapY: number
}
