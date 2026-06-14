import type { User } from './user'
import type { Destination } from './destination'

export type FeedPostType = 'review' | 'photo' | 'tip' | 'check-in'

export interface FeedPost {
  id: string
  type: FeedPostType
  userId: string
  destinationId?: string
  content: string
  imageUrl?: string
  likeCount: number
  commentCount: number
  createdAt: string
  author: {
    username: string
    displayName: string
    avatarUrl?: string
  }
}

export type FeedActivityType = 'review' | 'favorite'

export interface FeedActivity {
  id: string
  type: FeedActivityType
  userId: string
  destinationId: string
  createdAt: string
  user?: User
  destination?: Destination
  rating?: number
  reviewContent?: string
}
