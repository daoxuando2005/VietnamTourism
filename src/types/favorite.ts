import type { Destination } from './destination'

export interface Favorite {
  id: string
  userId: string
  destinationId: string
  createdAt: string
  destination: Destination
}
