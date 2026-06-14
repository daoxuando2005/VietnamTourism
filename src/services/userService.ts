import type { UserProfile, User } from '@/types'
import { profileRepository } from '@/repositories/profileRepository'

/**
 * Service to manage user operations.
 * Prepared for future Supabase integration.
 */
export const userService = {
  /**
   * Fetch a user profile by user ID.
   * Supabase query: await supabase.from('profiles').select('*').eq('userId', userId).single()
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    return profileRepository.getProfileByUserId(userId)
  },

  /**
   * Fetch a user profile by username.
   */
  async getUserProfileByUsername(username: string): Promise<{ profile: UserProfile; user: User } | null> {
    return profileRepository.getProfileByUsername(username)
  },

  /**
   * Fetch user details by user ID.
   */
  async getUserById(userId: string): Promise<User | null> {
    return profileRepository.getUserById(userId)
  },
}

export default userService
