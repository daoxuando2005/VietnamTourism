export type VietnamRegion = 'north' | 'central' | 'south'

export interface Province {
  id: string
  name: string
  region: VietnamRegion
  /** Map marker position as percentage (0–100) within the map container */
  mapX: number
  mapY: number
}

export interface Place {
  id: string
  provinceId: string
  name: string
  description: string
  imageUrl: string
  rating: number
  reviewCount: number
  ticketPrice: number
  currency: string
}

export interface RegionGroup {
  id: VietnamRegion
  label: string
  provinces: Province[]
}
