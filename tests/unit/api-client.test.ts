import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const auth = vi.hoisted(() => ({ getSession: vi.fn(), refreshSession: vi.fn() }))
vi.mock('@/lib/supabase', () => ({ supabase: { auth } }))
import { apiClient } from '@/services/api/client'
import { onSessionExpired } from '@/lib/authEvents'

const old = { access_token: 'old-fixture-token', user: { id: 'A' } }
const fresh = { access_token: 'new-fixture-token', user: { id: 'A' } }
const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
beforeEach(() => { vi.clearAllMocks(); auth.getSession.mockResolvedValue({ data: { session: old } }) })
afterEach(() => vi.unstubAllGlobals())

describe('API session boundary', () => {
  it('keeps custom headers and supplies the verified-session bearer', async () => {
    const fetcher = vi.fn().mockResolvedValue(json(200, { ok: true }))
    vi.stubGlobal('fetch', fetcher)
    await apiClient.post('/me/profile', { username: 'user_a' }, { auth: 'required', headers: { 'X-Custom': 'kept', Authorization: 'forged' } })
    const headers = fetcher.mock.calls[0][1].headers as Headers
    expect(headers.get('X-Custom')).toBe('kept')
    expect(headers.get('Content-Type')).toBe('application/json')
    expect(headers.get('Authorization')).toBe('Bearer old-fixture-token')
  })
  it('shares one refresh across simultaneous 401 responses and retries once', async () => {
    let current = old
    auth.getSession.mockImplementation(async () => ({ data: { session: current } }))
    auth.refreshSession.mockImplementation(async () => { await Promise.resolve(); current = fresh; return { data: { session: fresh }, error: null } })
    vi.stubGlobal('fetch', vi.fn(async (_url, init) => (init.headers as Headers).get('Authorization')?.includes('new-fixture') ? json(200, { ok: true }) : json(401, { code: 'UNAUTHENTICATED' })))
    expect(await Promise.all([apiClient.get('/me/profile', { auth: 'required' }), apiClient.get('/me/profile', { auth: 'required' })])).toEqual([{ ok: true }, { ok: true }])
    expect(auth.refreshSession).toHaveBeenCalledTimes(1)
  })
  it('does not refresh or report logout for forbidden access', async () => {
    const expired = vi.fn(), remove = onSessionExpired(expired)
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json(403, { code: 'FORBIDDEN', message: 'Không có quyền.' })))
    await expect(apiClient.get('/admin/access', { auth: 'required' })).rejects.toMatchObject({ status: 403, code: 'FORBIDDEN' })
    expect(auth.refreshSession).not.toHaveBeenCalled(); expect(expired).not.toHaveBeenCalled(); remove()
  })
  it('reports session expiry when refresh fails without returning private data', async () => {
    const expired = vi.fn(), remove = onSessionExpired(expired)
    auth.refreshSession.mockResolvedValue({ data: { session: null }, error: new Error('fixture failure') })
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json(401, {})))
    await expect(apiClient.get('/me/profile', { auth: 'required' })).rejects.toMatchObject({ code: 'SESSION_EXPIRED' })
    expect(expired).toHaveBeenCalledWith('A'); remove()
  })
  it('rejects an old successful response after account switch without logging B out', async () => {
    const expired = vi.fn(), remove = onSessionExpired(expired)
    auth.getSession.mockResolvedValueOnce({ data: { session: old } }).mockResolvedValue({ data: { session: { access_token: 'B', user: { id: 'B' } } } })
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json(200, { phoneNumber: 'A-private' })))
    await expect(apiClient.get('/me/profile', { auth: 'required' })).rejects.toMatchObject({ code: 'SESSION_CHANGED' })
    expect(expired).not.toHaveBeenCalled(); remove()
  })
  it('stops after one retry when the refreshed token is still rejected', async () => {
    let current = old
    auth.getSession.mockImplementation(async () => ({ data: { session: current } }))
    auth.refreshSession.mockImplementation(async () => { current = fresh; return { data: { session: fresh }, error: null } })
    const fetcher = vi.fn().mockImplementation(async () => json(401, { code: 'UNAUTHENTICATED' }))
    vi.stubGlobal('fetch', fetcher)
    await expect(apiClient.get('/me/profile', { auth: 'required' })).rejects.toMatchObject({ status: 401 })
    expect(fetcher).toHaveBeenCalledTimes(2); expect(auth.refreshSession).toHaveBeenCalledTimes(1)
  })
  it('handles 204 and public calls without a session lookup', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 204 })))
    await expect(apiClient.delete('/fixture', { auth: 'none' })).resolves.toBeUndefined()
    expect(auth.getSession).not.toHaveBeenCalled()
  })
})
