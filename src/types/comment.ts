import type { User } from './user'

export interface Comment {
  id: string
  postId: string
  userId: string
  content: string
  createdAt: string
  updatedAt?: string
  
  // Relations
  user?: User
}
