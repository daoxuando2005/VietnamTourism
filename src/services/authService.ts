import type { Session } from '@supabase/supabase-js'
import type { BootstrapRequest, OwnProfile } from '@/api/generated/types.gen'
import type { User, RegisterPayload } from '@/types'
import { supabase } from '@/lib/supabase'
import { clearStoredSession } from '@/lib/authStorage'
import { safeReturnTo } from '@/lib/authNavigation'
import { ApiClientError } from './api/client'
import { profileApi } from './profileApi'

export function userFromProfile(p: OwnProfile): User {
  return { id: p.id, username: p.username, displayName: p.displayName, avatarUrl: p.avatarUrl ?? undefined,
    bio: p.bio ?? undefined, createdAt: p.createdAt, role: p.role }
}
export function authErrorMessage(error: unknown) {
  if (error instanceof ApiClientError) return error.message
  const code = (error as { code?: string })?.code
  const messages: Record<string, string> = {
    invalid_credentials: 'Email hoặc mật khẩu không đúng.', email_not_confirmed: 'Vui lòng xác nhận email trước khi đăng nhập.',
    user_already_exists: 'Email này đã được đăng ký.', weak_password: 'Mật khẩu chưa đủ mạnh.',
    over_email_send_rate_limit: 'Bạn đã yêu cầu quá nhiều email. Vui lòng thử lại sau.',
    otp_expired: 'Liên kết đã hết hạn. Vui lòng yêu cầu liên kết mới.',
  }
  return code && messages[code] ? messages[code] : 'Không thể hoàn tất thao tác. Vui lòng kiểm tra kết nối và thử lại.'
}
function callback(next: string) {
  const target = next === '/auth/reset-password' ? next : safeReturnTo(next)
  return `${window.location.origin}/auth/callback?next=${encodeURIComponent(target)}`
}
let callbackWork: { url: string; work: Promise<void> } | null = null

export const authService = {
  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    if (error) throw error
    if (!data.session) throw new ApiClientError(401, 'UNAUTHENTICATED', 'Chưa nhận được phiên đăng nhập hợp lệ.')
    return data.session
  },
  async register(data: RegisterPayload, next = '/profile') {
    const result = await supabase.auth.signUp({ email: data.email.trim(), password: data.password,
      options: { data: { username: data.username.trim().toLowerCase(), displayName: data.displayName.trim() }, emailRedirectTo: callback(next) } })
    if (result.error) throw result.error
    return result.data.session
  },
  async profile(session: Session, signal?: AbortSignal): Promise<User> {
    let data: OwnProfile
    try { data = await profileApi.own(signal) }
    catch (error) {
      if (!(error instanceof ApiClientError) || error.status !== 404) throw error
      const metadata = session.user.user_metadata
      const username = typeof metadata.username === 'string' ? metadata.username.toLowerCase().trim() : `user_${session.user.id.replaceAll('-', '')}`
      const displayName = typeof metadata.displayName === 'string' ? metadata.displayName.trim().slice(0, 100) : username
      if (!/^[a-z0-9_]{3,40}$/.test(username)) throw new ApiClientError(409, 'PROFILE_SETUP_REQUIRED', 'Vui lòng chọn tên người dùng hợp lệ.')
      data = await profileApi.bootstrap({ username, displayName: displayName || username })
    }
    if (data.id !== session.user.id) throw new ApiClientError(401, 'SESSION_CHANGED', 'Phiên tài khoản đã thay đổi.')
    return userFromProfile(data)
  },
  async completeProfile(data: BootstrapRequest) { return userFromProfile(await profileApi.bootstrap(data)) },
  async logout() {
    try {
      const { error } = await supabase.auth.signOut({ scope: 'local' })
      if (error) throw error
    } finally { clearStoredSession() }
  },
  async requestPasswordReset(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: callback('/auth/reset-password') })
    if (error) throw error
  },
  async resetPassword(password: string) {
    const { error } = await supabase.auth.updateUser({ password })
    if (error) throw error
  },
  completeCallback(url: string): Promise<void> {
    if (callbackWork?.url === url) return callbackWork.work
    const work = (async () => {
      const params = new URL(url).searchParams
      if (params.has('error')) throw new ApiClientError(400, 'INVALID_CALLBACK', 'Liên kết không hợp lệ hoặc đã hết hạn.')
      const code = params.get('code')
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) throw error
      } else {
        const token_hash = params.get('token_hash'), type = params.get('type')
        if (!token_hash || !['email', 'signup', 'recovery'].includes(type ?? '')) throw new ApiClientError(400, 'INVALID_CALLBACK', 'Liên kết xác nhận không hợp lệ.')
        const { error } = await supabase.auth.verifyOtp({ token_hash, type: type as 'email' | 'signup' | 'recovery' })
        if (error) throw error
      }
    })()
    callbackWork = { url, work }
    return work
  },
}
export type { User }
export default authService
