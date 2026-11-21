import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { notifySessionExpired } from '@/lib/authEvents'

const base = (import.meta.env.VITE_API_URL || '/api/v1').replace(/\/$/, '')
type RequestOptions = RequestInit & { auth?: 'required' | 'optional' | 'none' }

export class ApiClientError extends Error {
  readonly status: number
  readonly code: string
  readonly requestId?: string
  constructor(status: number, code: string, message: string, requestId?: string) {
    super(message)
    this.name = 'ApiClientError'
    this.status = status
    this.code = code
    this.requestId = requestId
  }
}

let refresh: Promise<Session | null> | null = null
async function refreshedSession() {
  refresh ??= supabase.auth.refreshSession().then(({ data, error }) => error ? null : data.session).catch(() => null)
    .finally(() => { refresh = null })
  return refresh
}
function changed() { return new ApiClientError(401, 'SESSION_CHANGED', 'Phiên tài khoản đã thay đổi.') }

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  if (!endpoint.startsWith('/') || endpoint.startsWith('//')) throw new Error('API endpoint must be an application path')
  const { auth = 'optional', ...init } = options
  let session = auth === 'none' ? null : (await supabase.auth.getSession()).data.session
  const subject = session?.user.id
  if (auth === 'required' && !session) throw new ApiClientError(401, 'UNAUTHENTICATED', 'Vui lòng đăng nhập.')
  for (let attempt = 0; attempt < 2; attempt++) {
    const headers = new Headers(init.headers)
    headers.set('Accept', 'application/json')
    if (init.body && !(init.body instanceof FormData)) headers.set('Content-Type', 'application/json')
    if (session) headers.set('Authorization', `Bearer ${session.access_token}`)
    const response = await fetch(`${base}${endpoint}`, { ...init, headers, signal: init.signal ?? AbortSignal.timeout(12000) })
    if (response.status === 401 && subject && attempt === 0) {
      await response.body?.cancel().catch(() => {})
      const current = (await supabase.auth.getSession()).data.session
      if (!current || current.user.id !== subject) throw changed()
      session = current.access_token !== session?.access_token ? current : await refreshedSession()
      if (!session) { notifySessionExpired(subject); throw new ApiClientError(401, 'SESSION_EXPIRED', 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.') }
      if (session.user.id !== subject) throw changed()
      continue
    }
    if (subject && auth === 'required') {
      const current = (await supabase.auth.getSession()).data.session
      if (!current || current.user.id !== subject) throw changed()
    }
    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      if (response.status === 401 && subject) notifySessionExpired(subject)
      throw new ApiClientError(response.status, error.code || 'REQUEST_FAILED', error.message || 'Không thể xử lý yêu cầu. Vui lòng thử lại.', error.requestId || response.headers.get('X-Request-ID') || undefined)
    }
    if (response.status === 204) return undefined as T
    return response.json() as Promise<T>
  }
  throw new ApiClientError(401, 'UNAUTHENTICATED', 'Vui lòng đăng nhập lại.')
}
export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) => request<T>(path, options),
  post: <T>(path: string, body: unknown, options?: RequestOptions) => request<T>(path, { ...options, method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown, options?: RequestOptions) => request<T>(path, { ...options, method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: 'DELETE' }),
}
