import type { AuthCredentials, AuthSession, RegisterPayload } from '@/types'

export const authService = {
  async login(credentials: AuthCredentials): Promise<AuthSession> {
    // TODO: integrate with Supabase auth
    void credentials
    throw new Error('Authentication not yet configured')
  },

  async register(payload: RegisterPayload): Promise<AuthSession> {
    // TODO: integrate with Supabase auth
    void payload
    throw new Error('Authentication not yet configured')
  },

  async logout(): Promise<void> {
    // TODO: integrate with Supabase auth
  },

  async getSession(): Promise<AuthSession | null> {
    // TODO: integrate with Supabase auth
    return null
  },
}
