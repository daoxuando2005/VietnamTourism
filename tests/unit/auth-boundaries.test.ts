import { afterEach, expect, it, vi } from 'vitest'
import { safeReturnTo } from '@/lib/authNavigation'
import { authStorage, AUTH_STORAGE_KEY, clearStoredSession } from '@/lib/authStorage'
import { clearPersonalCache, queryClient } from '@/lib/queryClient'
afterEach(() => { vi.unstubAllGlobals(); clearPersonalCache() })

it('preserves application URL, query and hash and rejects redirect escapes', () => {
  expect(safeReturnTo('/destinations?region=north&page=2#map')).toBe('/destinations?region=north&page=2#map')
  for (const value of ['https://evil.test', '//evil.test', '/\\evil.test', '/auth/login', '/\n/evil.test', null]) expect(safeReturnTo(value)).toBe('/profile')
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
