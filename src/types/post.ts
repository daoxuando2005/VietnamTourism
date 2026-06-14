import type { User } from './user'
import type { Comment } from './comment'
import type { Destination } from './destination'

export interface Post {
  id: string
  userId: string
  title?: string
  content: string
  image?: string
  imageUrl?: string
  images?: string[]
  likeCount: number
  commentCount: number
  destinationId?: string
  createdAt: string
  updatedAt?: string
  
  // Relations
  user?: User
  comments?: Comment[]
  destination?: Destination
}
