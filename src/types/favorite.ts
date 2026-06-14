import type { Destination } from './destination'
import type { User } from './user'

export interface Favorite {
  id: string
  userId: string
  destinationId: string
  createdAt: string
  user?: User
  destination?: Destination
}
