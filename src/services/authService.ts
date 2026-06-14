import { supabase } from '@/lib/supabase'
import type { User, RegisterPayload } from '@/types'
import type { User as SupabaseUser } from '@supabase/supabase-js'

// Helper function to query/create profiles for mapped auth users
async function ensureUserProfile(supabaseUser: SupabaseUser): Promise<User> {
  const userId = supabaseUser.id
  const email = supabaseUser.email || ''
  const metadata = supabaseUser.user_metadata || {}
  const username = metadata.username || email.split('@')[0] || 'user'
  const displayName = metadata.displayName || username

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (profile) {
    return {
      id: profile.id,
      username: profile.username,
      displayName: profile.display_name || profile.username,
      avatarUrl: profile.avatar_url,
      bio: profile.bio,
      createdAt: profile.created_at,
    }
  }

  // Create profile fallback (if Postgres trigger hasn't fired yet)
  const cleanUsername = username.toLowerCase().replace(/[^a-z0-9]/g, '')
  const newProfile = {
    id: userId,
    username: cleanUsername,
    display_name: displayName,
    avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    bio: 'Explorer of Vietnam.',
  }

  const { data: inserted } = await supabase
    .from('profiles')
    .insert(newProfile)
    .select()
    .single()

  if (inserted) {
    return {
      id: inserted.id,
      username: inserted.username,
      displayName: inserted.display_name || inserted.username,
      avatarUrl: inserted.avatar_url,
      bio: inserted.bio,
      createdAt: inserted.created_at,
    }
  }

  return {
    id: userId,
    username: cleanUsername,
    displayName: displayName,
    createdAt: new Date().toISOString(),
  }
}

export const authService = {
  async login(email: string, password: string): Promise<User> {
    if (!email || !password) {
      throw new Error('Email and password are required.')
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error || !data.user) {
      throw new Error(error?.message || 'Login failed')
    }

    return ensureUserProfile(data.user)
  },

  async register(data: RegisterPayload): Promise<User> {
    const { email, password, username, displayName } = data

    if (!email || !password || !username || !displayName) {
      throw new Error('All fields are required.')
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters.')
    }

    const cleanUsername = username.toLowerCase().trim().replace(/[^a-z0-9]/g, '')

    const { data: signUpData, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: cleanUsername,
          displayName: displayName.trim(),
        },
      },
    })

    if (error || !signUpData.user) {
      throw new Error(error?.message || 'Registration failed')
    }

    return ensureUserProfile(signUpData.user)
  },

  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw new Error(error.message)
    }
  },

  async getCurrentUser(): Promise<User | null> {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) return null
    return ensureUserProfile(user)
  },
}

export type { User }
export default authService
