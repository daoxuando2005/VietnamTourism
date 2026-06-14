import { supabase } from '@/lib/supabase'
import type { UserProfile, User } from '@/types'

export const profileRepository = {
  async getProfileByUserId(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error || !data) return null

    return {
      id: data.id,
      userId: data.id,
      fullName: data.display_name,
      avatarUrl: data.avatar_url,
      coverUrl: data.cover_url,
      bio: data.bio,
      website: data.website,
      location: data.location,
      birthDate: data.birth_date,
      phoneNumber: data.phone_number,
      followerCount: data.follower_count ?? 0,
      followingCount: data.following_count ?? 0,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }
  },

  async getProfileByUsername(username: string): Promise<{ profile: UserProfile; user: User } | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username.toLowerCase())
      .single()

    if (error || !data) return null

    const profile: UserProfile = {
      id: data.id,
      userId: data.id,
      fullName: data.display_name,
      avatarUrl: data.avatar_url,
      coverUrl: data.cover_url,
      bio: data.bio,
      website: data.website,
      location: data.location,
      birthDate: data.birth_date,
      phoneNumber: data.phone_number,
      followerCount: data.follower_count ?? 0,
      followingCount: data.following_count ?? 0,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }

    const user: User = {
      id: data.id,
      username: data.username,
      displayName: data.display_name || data.username,
      avatarUrl: data.avatar_url,
      bio: data.bio,
      createdAt: data.created_at,
    }

    return { profile, user }
  },

  async getUserById(userId: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error || !data) return null

    return {
      id: data.id,
      username: data.username,
      displayName: data.display_name || data.username,
      avatarUrl: data.avatar_url,
      bio: data.bio,
      createdAt: data.created_at,
    }
  },

  async updateProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile> {
    const dbUpdate: Record<string, unknown> = {}
    if (data.fullName !== undefined) dbUpdate.display_name = data.fullName
    if (data.avatarUrl !== undefined) dbUpdate.avatar_url = data.avatarUrl
    if (data.coverUrl !== undefined) dbUpdate.cover_url = data.coverUrl
    if (data.bio !== undefined) dbUpdate.bio = data.bio
    if (data.website !== undefined) dbUpdate.website = data.website
    if (data.location !== undefined) dbUpdate.location = data.location
    if (data.birthDate !== undefined) dbUpdate.birth_date = data.birthDate
    if (data.phoneNumber !== undefined) dbUpdate.phone_number = data.phoneNumber
    dbUpdate.updated_at = new Date().toISOString()

    const { data: updated, error } = await supabase
      .from('profiles')
      .update(dbUpdate)
      .eq('id', userId)
      .select()
      .single()

    if (error || !updated) {
      throw new Error(error?.message || 'Failed to update profile')
    }

    return {
      id: updated.id,
      userId: updated.id,
      fullName: updated.display_name,
      avatarUrl: updated.avatar_url,
      coverUrl: updated.cover_url,
      bio: updated.bio,
      website: updated.website,
      location: updated.location,
      birthDate: updated.birth_date,
      phoneNumber: updated.phone_number,
      followerCount: updated.follower_count ?? 0,
      followingCount: updated.following_count ?? 0,
      createdAt: updated.created_at,
      updatedAt: updated.updated_at,
    }
  },
}

export default profileRepository
