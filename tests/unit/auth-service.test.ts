import { afterEach, beforeEach, expect, it, vi } from 'vitest'
const auth = vi.hoisted(() => ({ signUp: vi.fn(), signOut: vi.fn(), exchangeCodeForSession: vi.fn(), verifyOtp: vi.fn() }))
const profiles = vi.hoisted(() => ({ own: vi.fn(), bootstrap: vi.fn() }))
vi.mock('@/lib/supabase', () => ({ supabase: { auth } }))
vi.mock('@/services/profileApi', () => ({ profileApi: profiles }))
import { authService } from '@/services/authService'
import { authStorage, AUTH_STORAGE_KEY } from '@/lib/authStorage'
beforeEach(() => { vi.clearAllMocks(); vi.stubGlobal('window', { location: { origin: 'http://localhost:3000' } }) })
afterEach(() => vi.unstubAllGlobals())
it('returns no logged-in session while registration awaits email confirmation', async () => {
  auth.signUp.mockResolvedValue({ data: { session: null, user: { id: 'pending' } }, error: null })
  expect(await authService.register({ email: 'test@example.test', password: 'fixture-password', username: 'fixture', displayName: 'Fixture' }, '//evil.test')).toBeNull()
  expect(profiles.bootstrap).not.toHaveBeenCalled()
  expect(auth.signUp.mock.calls[0][0].options.emailRedirectTo).toBe('http://localhost:3000/auth/callback?next=%2Fprofile')
})
it('consumes the same PKCE callback once across repeated effects', async () => {
  auth.exchangeCodeForSession.mockResolvedValue({ data: {}, error: null })
  await Promise.all([authService.completeCallback('http://localhost:3000/auth/callback?code=fixture-once'), authService.completeCallback('http://localhost:3000/auth/callback?code=fixture-once')])
  expect(auth.exchangeCodeForSession).toHaveBeenCalledTimes(1)
})
it('clears credentials when provider logout fails', async () => {
  authStorage.setItem(AUTH_STORAGE_KEY, 'fixture-session')
  auth.signOut.mockResolvedValue({ error: new Error('offline') })
  await expect(authService.logout()).rejects.toThrow('offline')
  expect(authStorage.getItem(AUTH_STORAGE_KEY)).toBeNull()
})
