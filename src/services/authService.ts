import type { User, RegisterPayload } from '@/types'
import { mockUsers } from '@/data/users'

const SESSION_KEY = 'vietnam_tourism_auth_user'

/**
 * Service to manage authentication.
 * Prepared for future Supabase Auth integration.
 */
export const authService = {
  /**
   * Sign in a user.
   * Supabase query: await supabase.auth.signInWithPassword({ email, password })
   */
  async login(email: string, password: string): Promise<User> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 600))

    if (!email || !password) {
      throw new Error('Email and password are required.')
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters.')
    }

    // Lookup matching mock user by email (e.g. user1@example.com)
    let matchedUser = mockUsers.find((u) => {
      const emailPrefix = email.split('@')[0].toLowerCase()
      return (
        u.username.toLowerCase() === emailPrefix ||
        u.id.toLowerCase() === emailPrefix ||
        email.toLowerCase().startsWith(u.username.toLowerCase())
      )
    })

    if (!matchedUser) {
      // Create user on the fly based on email
      const username = email.split('@')[0]
      matchedUser = {
        id: `user-${Date.now()}`,
        username: username.toLowerCase().replace(/[^a-z0-9]/g, ''),
        displayName: username.charAt(0).toUpperCase() + username.slice(1),
        bio: 'Explorer of Vietnam.',
        createdAt: new Date().toISOString(),
      }
    }

    localStorage.setItem(SESSION_KEY, JSON.stringify(matchedUser))
    return matchedUser
  },

  /**
   * Register a new user.
   * Supabase query: await supabase.auth.signUp({ email, password, options: { data: { username, displayName } } })
   */
  async register(data: RegisterPayload): Promise<User> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 600))

    const { email, password, username, displayName } = data

    if (!email || !password || !username || !displayName) {
      throw new Error('All fields are required.')
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters.')
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      username: username.toLowerCase().trim().replace(/[^a-z0-9]/g, ''),
      displayName: displayName.trim(),
      bio: 'New explorer of Vietnam.',
      createdAt: new Date().toISOString(),
    }

    localStorage.setItem(SESSION_KEY, JSON.stringify(newUser))
    return newUser
  },

  /**
   * Log out user session.
   * Supabase query: await supabase.auth.signOut()
   */
  async logout(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300))
    localStorage.removeItem(SESSION_KEY)
  },

  /**
   * Get current authenticated user session.
   * Supabase query: const { data: { user } } = await supabase.auth.getUser()
   */
  async getCurrentUser(): Promise<User | null> {
    const session = localStorage.getItem(SESSION_KEY)
    if (!session) return null

    try {
      return JSON.parse(session)
    } catch {
      return null
    }
  },
}
export type { User }
export default authService
