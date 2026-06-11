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
