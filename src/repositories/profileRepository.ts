import type { OwnProfile, PublicProfile } from '@/api/generated/types.gen'
import type { User, UserProfile } from '@/types'
import { supabase } from '@/lib/supabase'
import { ApiClientError } from '@/services/api/client'
import { profileApi } from '@/services/profileApi'

function view(data: PublicProfile | OwnProfile): UserProfile {
  return { id: data.id, userId: data.id, fullName: data.displayName, bio: data.bio ?? undefined,
    avatarUrl: data.avatarUrl ?? undefined, coverUrl: data.coverUrl ?? undefined, website: data.website ?? undefined,
    location: data.location ?? undefined, createdAt: data.createdAt,
    ...('phoneNumber' in data ? { phoneNumber: data.phoneNumber ?? undefined, birthDate: data.birthDate ?? undefined } : {}),
    followerCount: 0, followingCount: 0 }
}
function user(data: PublicProfile): User {
  return { id: data.id, username: data.username, displayName: data.displayName, avatarUrl: data.avatarUrl ?? undefined, bio: data.bio ?? undefined, createdAt: data.createdAt }
}
async function found<T>(read: () => Promise<T>) {
  try { return await read() } catch (error) {
    if (error instanceof ApiClientError && error.status === 404) return null
    throw error
  }
}
export const profileRepository = {
  async getProfileByUserId(id: string): Promise<UserProfile | null> {
    const session = (await supabase.auth.getSession()).data.session
    const data = await found(() => session?.user.id === id ? profileApi.own() : profileApi.byId(id))
    return data ? view(data) : null
  },
  async getProfileByUsername(username: string): Promise<{ profile: UserProfile; user: User } | null> {
    const data = await found(() => profileApi.byUsername(username))
    return data ? { profile: view(data), user: user(data) } : null
  },
  async getUserById(id: string): Promise<User | null> {
    const data = await found(() => profileApi.byId(id))
    return data ? user(data) : null
  },
}
export default profileRepository
