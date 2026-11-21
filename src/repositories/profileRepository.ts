import { supabase } from '@/lib/supabase'
import type { UserProfile, User } from '@/types'
import { PUBLIC_PROFILE_FIELDS } from './profileFields'

const privateProfilesEnabled = import.meta.env.VITE_LEGACY_PRIVATE_PROFILES_ENABLED === 'true'

export const profileRepository = {
  async getProfileByUserId(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select(PUBLIC_PROFILE_FIELDS)
      .eq('id', userId)
      .single()

    if (error || !data) return null

    const { data: { session } } = await supabase.auth.getSession()
    let privateData: { birth_date: string | null; phone_number: string | null } | null = null
    if (privateProfilesEnabled && session?.user.id === userId) {
      const result = await supabase.from('profiles_private')
        .select('birth_date,phone_number').eq('user_id', userId).maybeSingle()
      if (result.error) throw new Error('Không thể tải thông tin riêng tư của hồ sơ.')
      privateData = result.data
    }

    return {
      id: data.id,
      userId: data.id,
      fullName: data.display_name,
      avatarUrl: data.avatar_url,
      coverUrl: data.cover_url,
      bio: data.bio,
      website: data.website,
      location: data.location,
      birthDate: privateData?.birth_date ?? undefined,
      phoneNumber: privateData?.phone_number ?? undefined,
      followerCount: data.follower_count ?? 0,
      followingCount: data.following_count ?? 0,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }
  },

  async getProfileByUsername(username: string): Promise<{ profile: UserProfile; user: User } | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select(PUBLIC_PROFILE_FIELDS)
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
      .select(PUBLIC_PROFILE_FIELDS)
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
    if (!privateProfilesEnabled && (data.birthDate !== undefined || data.phoneNumber !== undefined)) {
      throw new Error('Chưa thể cập nhật thông tin liên hệ. Vui lòng thử lại sau.')
    }
    const dbUpdate: Record<string, unknown> = {}
    if (data.fullName !== undefined) dbUpdate.display_name = data.fullName
    if (data.avatarUrl !== undefined) dbUpdate.avatar_url = data.avatarUrl
    if (data.coverUrl !== undefined) dbUpdate.cover_url = data.coverUrl
    if (data.bio !== undefined) dbUpdate.bio = data.bio
    if (data.website !== undefined) dbUpdate.website = data.website
    if (data.location !== undefined) dbUpdate.location = data.location
    dbUpdate.updated_at = new Date().toISOString()

    const { data: updated, error } = await supabase
      .from('profiles')
      .update(dbUpdate)
      .eq('id', userId)
      .select(PUBLIC_PROFILE_FIELDS)
      .single()

    if (error || !updated) {
      throw new Error(error?.message || 'Failed to update profile')
    }

    if (data.birthDate !== undefined || data.phoneNumber !== undefined) {
      // Separate table keeps contact data out of all public profile joins.
      const existing = await supabase.from('profiles_private').select('user_id').eq('user_id', userId).maybeSingle()
      if (existing.error) throw new Error('Không thể tải thông tin riêng tư của hồ sơ.')
      const values = {
        ...(data.birthDate !== undefined ? { birth_date: data.birthDate } : {}),
        ...(data.phoneNumber !== undefined ? { phone_number: data.phoneNumber } : {}),
        updated_at: new Date().toISOString(),
      }
      const result = existing.data
        ? await supabase.from('profiles_private').update(values).eq('user_id', userId)
        : await supabase.from('profiles_private').insert({ user_id: userId, ...values })
      if (result.error) throw new Error('Hồ sơ công khai đã lưu, nhưng thông tin riêng tư chưa lưu được. Vui lòng thử lại.')
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
      birthDate: data.birthDate,
      phoneNumber: data.phoneNumber,
      followerCount: updated.follower_count ?? 0,
      followingCount: updated.following_count ?? 0,
      createdAt: updated.created_at,
      updatedAt: updated.updated_at,
    }
  },
}

export default profileRepository
