import type { UserProfile } from '@/types'
import { mockUserProfiles } from '@/data'

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
    const profile = mockUserProfiles.find((p) => p.userId === userId)
    return Promise.resolve(profile || null)
  },
}
