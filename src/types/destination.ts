export type DestinationRegion =
  | 'north'
  | 'central'
  | 'south'
  | 'highlands'
  | 'coastal'

export interface Destination {
  id: string
  name: string
  slug: string
  region: DestinationRegion
  description: string
  imageUrl: string
  latitude: number
  longitude: number
  rating: number
  reviewCount: number
}
