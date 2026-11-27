import { afterEach, expect, it, vi } from 'vitest'
import { readEmailVerificationLink, safeReturnTo } from '@/lib/authNavigation'
import { authStorage, AUTH_STORAGE_KEY, clearStoredSession } from '@/lib/authStorage'
import { clearPersonalCache, queryClient } from '@/lib/queryClient'
afterEach(() => { vi.unstubAllGlobals(); clearPersonalCache() })

it('preserves application URL, query and hash and rejects redirect escapes', () => {
  expect(safeReturnTo('/destinations?region=north&page=2#map')).toBe('/destinations?region=north&page=2#map')
  for (const value of ['https://evil.test', '//evil.test', '/\\evil.test', '/auth/login', '/\n/evil.test', null]) expect(safeReturnTo(value)).toBe('/profile')
})

it('limits email verification to this project and its application callback', () => {
  const provider = 'https://fixture.supabase.test'
  const app = 'http://localhost:3000'
  const callback = app + '/auth/callback?next=%2Fauth%2Freset-password'
  const verify = new URL('/auth/v1/verify', provider)
  verify.search = new URLSearchParams({ token: 'fixture-token', type: 'recovery', redirect_to: callback }).toString()
  expect(readEmailVerificationLink(verify.href, provider, app)).toEqual({ href: verify.href, recovery: true })

  for (const value of [
    verify.href.replace('fixture.supabase.test', 'other.supabase.test'),
    verify.href.replace('/verify?', '/user?'),
    verify.href.replace('type=recovery', 'type=email'),
    verify.href.replace(encodeURIComponent(callback), encodeURIComponent('https://other.test/auth/callback')),
    verify.href.replace(encodeURIComponent(callback), encodeURIComponent(app + '/profile')),
    verify.href + '&type=email',
    verify.href + '&redirect_to=' + encodeURIComponent('https://other.test/auth/callback'),
  ]) expect(readEmailVerificationLink(value, provider, app)).toBeNull()

  verify.searchParams.set('type', 'email')
  verify.searchParams.set('redirect_to', app + '/auth/callback?next=%2Fprofile%3Fsource%3Dmail')
  expect(readEmailVerificationLink(verify.href, provider, app)).toEqual({ href: verify.href, recovery: false })
})
it('clears stored credentials even when browser storage is unavailable', () => {
  vi.stubGlobal('localStorage', { getItem() { throw new Error('denied') }, setItem() { throw new Error('denied') }, removeItem() { throw new Error('denied') } })
  authStorage.setItem(AUTH_STORAGE_KEY, 'fixture-session')
  expect(authStorage.getItem(AUTH_STORAGE_KEY)).toBe('fixture-session')
  clearStoredSession()
  expect(authStorage.getItem(AUTH_STORAGE_KEY)).toBeNull()
})
it('removes personal cache and cancels requests before another account loads', async () => {
  queryClient.setQueryData(['me', 'A'], { phoneNumber: 'A-private' })
  let aborted = false
  const pending = queryClient.fetchQuery({ queryKey: ['private', 'A'], queryFn: ({ signal }) => new Promise(resolve => {
    signal.addEventListener('abort', () => { aborted = true; resolve({ phoneNumber: 'late-A-private' }) })
  }) }).catch(() => null)
  clearPersonalCache()
  await pending
  expect(aborted).toBe(true)
  expect(queryClient.getQueryData(['me', 'A'])).toBeUndefined()
  expect(queryClient.getQueryData(['private', 'A'])).toBeUndefined()
})
