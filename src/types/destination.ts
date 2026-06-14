export type DestinationRegion =
  | 'north'
  | 'central'
  | 'south'
  | 'highlands'
  | 'coastal'

export type DestinationCategory =
  | 'Beach'
  | 'Mountain'
  | 'Historical'
  | 'Cultural'
  | 'Nature'
  | 'City'

export interface Destination {
  id: string
  name: string
  slug: string
  provinceId: string
  description: string
  rating: number
  image: string
  category: DestinationCategory
  latitude: number
  longitude: number
  
  // Backward compatibility fields
  province?: string
  region?: DestinationRegion | string
  imageUrl?: string
  reviewCount?: number
  createdAt?: string
}
