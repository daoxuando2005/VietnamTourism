import type { Province, VietnamRegion } from './province'

export type { Province, VietnamRegion }


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
