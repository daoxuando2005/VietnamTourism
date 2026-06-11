export interface Review {
  id: string
  destinationId: string
  userId: string
  rating: number
  title: string
  content: string
  createdAt: string
  author: {
    username: string
    displayName: string
    avatarUrl?: string
  }
}
