import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { Button, Card, LoadingSpinner } from '@/components'
import { useAuth } from '@/context/AuthContext'
import { readEmailVerificationLink, safeReturnTo } from '@/lib/authNavigation'
import { AUTH_STORAGE_KEY, authStorage } from '@/lib/authStorage'
import { authErrorMessage, authService } from '@/services/authService'
import { ApiClientError } from '@/services/api/client'

type Mode = 'login' | 'register' | 'forgot' | 'reset' | 'complete'
type Field = 'email' | 'password' | 'confirm' | 'username' | 'displayName'
const labels: Record<Field, string> = { email: 'Email', password: 'Mật khẩu', confirm: 'Nhập lại mật khẩu', username: 'Tên người dùng', displayName: 'Tên hiển thị' }
const titles: Record<Mode, string> = { login: 'Đăng nhập', register: 'Tạo tài khoản', forgot: 'Quên mật khẩu', reset: 'Đặt lại mật khẩu', complete: 'Hoàn tất hồ sơ' }

function AuthForm({ mode }: { mode: Mode }) {
  const auth = useAuth(), navigate = useNavigate(), location = useLocation()
  const [params] = useSearchParams()
  const from = (location.state as { from?: { pathname?: string; search?: string; hash?: string } })?.from
  const next = safeReturnTo(params.get('returnTo') || (from?.pathname ? from.pathname + (from.search || '') + (from.hash || '') : null))
  const [values, setValues] = useState<Record<Field, string>>({ email: '', password: '', confirm: '', username: '', displayName: '' })
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({})
  const [error, setError] = useState(''), [notice, setNotice] = useState(''), [busy, setBusy] = useState(false)
  const fields: Field[] = mode === 'login' ? ['email', 'password'] : mode === 'register' ? ['username', 'displayName', 'email', 'password', 'confirm']
    : mode === 'forgot' ? ['email'] : mode === 'reset' ? ['password', 'confirm'] : ['username', 'displayName']
  function fieldError(field: Field) {
    const value = values[field]
    if (!value.trim()) return `Vui lòng nhập ${labels[field].toLowerCase()}.`
    if (field === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return 'Email không hợp lệ.'
    if (field === 'username' && !/^[a-z0-9_]{3,40}$/.test(value.trim())) return 'Dùng 3–40 chữ thường, chữ số hoặc dấu gạch dưới.'
    if (field === 'displayName' && value.trim().length > 100) return 'Tên hiển thị tối đa 100 ký tự.'
    if (field === 'password' && mode !== 'login' && value.length < 8) return 'Mật khẩu cần ít nhất 8 ký tự.'
    if (field === 'confirm' && value !== values.password) return 'Mật khẩu nhập lại chưa khớp.'
    return undefined
  }
  async function submit(event: FormEvent) {
    event.preventDefault()
    if (busy) return
    const invalid = Object.fromEntries(fields.map(field => [field, fieldError(field)]))
    setErrors(invalid); setError('')
    const first = fields.find(field => invalid[field])
    if (first) { document.getElementById(`auth-${first}`)?.focus(); return }
    setBusy(true)
    try {
      if (mode === 'login') { await auth.login(values.email, values.password); navigate(next, { replace: true }) }
      else if (mode === 'register') {
        const confirmation = await auth.register({ email: values.email, password: values.password, username: values.username.trim(), displayName: values.displayName.trim() }, next)
        if (confirmation) setNotice('Vui lòng mở email để xác nhận tài khoản. Bạn chưa đăng nhập; sau khi xác nhận, hãy quay lại ứng dụng.')
        else navigate(next, { replace: true })
      } else if (mode === 'forgot') {
        await authService.requestPasswordReset(values.email)
        setNotice('Yêu cầu đã được tiếp nhận. Nếu email đã đăng ký, bạn sẽ nhận được liên kết đặt lại mật khẩu.')
      } else if (mode === 'reset') {
        await authService.resetPassword(values.password)
        await auth.logout().catch(() => {})
        navigate('/auth/login?reset=success', { replace: true })
      } else {
        await auth.completeProfile({ username: values.username.trim(), displayName: values.displayName.trim() })
        navigate(next, { replace: true })
      }
    } catch (failure) {
      if (failure instanceof ApiClientError && ['USERNAME_TAKEN', 'PROFILE_SETUP_REQUIRED'].includes(failure.code) && mode !== 'complete') {
        navigate(`/auth/complete-profile?returnTo=${encodeURIComponent(next)}`, { replace: true })
      } else {
        setError(authErrorMessage(failure))
        if (failure instanceof ApiClientError && failure.code === 'USERNAME_TAKEN') setErrors({ username: 'Tên người dùng này đã được sử dụng. Vui lòng chọn tên khác.' })
      }
    } finally { setBusy(false) }
  }
  if (['reset', 'complete'].includes(mode) && !auth.session) {
    if (auth.loading) return <LoadingSpinner label="Đang kiểm tra phiên..." />
    if (mode === 'complete') return <Navigate to="/auth/login" state={{ from: { pathname: next } }} replace />
    return <Card><h1 className="text-xl font-semibold">Liên kết không hợp lệ hoặc đã hết hạn</h1><Link className="mt-4 inline-block text-teal-800 underline" to="/auth/forgot-password">Yêu cầu liên kết mới</Link></Card>
  }
  return <Card padding="lg" className="w-full border border-gray-200 shadow-sm">
    <h1 className="text-2xl font-bold text-gray-900">{titles[mode]}</h1>
    <p className="mt-2 text-sm text-gray-700">{mode === 'complete' ? 'Chọn tên người dùng riêng để tiếp tục.' : 'Tài khoản của bạn tại Vietnam Tourism.'}</p>
    {params.get('reset') === 'success' && <p role="status" className="mt-4 rounded-lg bg-teal-50 p-3 text-teal-900">Đã đổi mật khẩu. Vui lòng đăng nhập lại.</p>}
    {(error || (mode === 'login' && auth.authError)) && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">{error || auth.authError}</p>}
    {notice ? <p role="status" className="mt-5 rounded-lg bg-teal-50 p-4 text-teal-900">{notice}</p> : <form className="mt-6 space-y-4" onSubmit={submit} noValidate aria-busy={busy}>
      {fields.map(field => <div key={field}>
        <label htmlFor={`auth-${field}`} className="block text-sm font-medium text-gray-800">{labels[field]}</label>
        <input id={`auth-${field}`} name={field} type={field === 'password' || field === 'confirm' ? 'password' : field === 'email' ? 'email' : 'text'}
          required disabled={busy} value={values[field]} aria-invalid={!!errors[field]} aria-describedby={errors[field] ? `auth-${field}-error` : undefined}
          autoComplete={field === 'password' ? mode === 'login' ? 'current-password' : 'new-password' : field === 'confirm' ? 'new-password' : field === 'displayName' ? 'nickname' : field}
          onChange={event => { setValues(old => ({ ...old, [field]: event.target.value })); setErrors(old => ({ ...old, [field]: undefined })); setError('') }}
          onBlur={() => setErrors(old => ({ ...old, [field]: fieldError(field) }))}
          className="mt-1 min-h-11 w-full rounded-lg border border-gray-400 bg-white px-3 py-2 text-base text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 disabled:opacity-60" />
        {errors[field] && <p id={`auth-${field}-error`} className="mt-1 text-sm text-red-800">{errors[field]}</p>}
      </div>)}
      <Button type="submit" fullWidth disabled={busy} className="min-h-11 bg-teal-700 hover:bg-teal-800">{busy ? 'Đang xử lý...' : titles[mode]}</Button>
    </form>}
    <nav className="mt-5 flex flex-wrap gap-x-5 gap-y-3 text-sm" aria-label="Liên kết tài khoản">
      {mode !== 'login' && <Link className="text-teal-800 underline focus-visible:outline-2" to={`/auth/login?returnTo=${encodeURIComponent(next)}`}>Đăng nhập</Link>}
      {mode === 'login' && <><Link className="text-teal-800 underline" to={`/auth/register?returnTo=${encodeURIComponent(next)}`}>Tạo tài khoản</Link><Link className="text-teal-800 underline" to="/auth/forgot-password">Quên mật khẩu?</Link></>}
      {auth.session && <button type="button" className="min-h-11 text-teal-800 underline" onClick={() => void auth.logout().catch(() => {})}>Đăng xuất</button>}
    </nav>
  </Card>
}
export function LoginPage() { return <AuthForm mode="login" /> }
export function RegisterPage() { return <AuthForm mode="register" /> }
export function ForgotPasswordPage() { return <AuthForm mode="forgot" /> }
export function ResetPasswordPage() { return <AuthForm mode="reset" /> }
export function CompleteProfilePage() { return <AuthForm mode="complete" /> }

export function CallbackPage() {
  const [params] = useSearchParams()
  if (params.has('confirmation_url')) {
    return <EmailLinkConfirmation value={params.get('confirmation_url')} />
  }
  return <CallbackExchange />
}

function EmailLinkConfirmation({ value }: { value: string | null }) {
  const link = readEmailVerificationLink(value, import.meta.env.VITE_SUPABASE_URL, window.location.origin)
  const hasVerifier = Boolean(authStorage.getItem(`${AUTH_STORAGE_KEY}-code-verifier`))
  const title = link?.recovery ? 'Tiếp tục đặt lại mật khẩu' : 'Xác nhận email'

  return <Card>
    <h1 className="text-xl font-bold">{title}</h1>
    {!link || !hasVerifier ? <>
      <p role="alert" className="mt-3 text-sm text-red-800">
        {link ? 'Hãy mở liên kết trong trình duyệt đã yêu cầu email. Bạn cũng có thể yêu cầu thư mới tại đây.' : 'Địa chỉ xác nhận email không hợp lệ.'}
      </p>
      <Link className="mt-4 inline-flex min-h-11 items-center text-teal-800 underline focus-visible:outline-2"
        to={link?.recovery ? '/auth/forgot-password' : '/auth/login'}>
        {link?.recovery ? 'Yêu cầu liên kết mới' : 'Quay lại đăng nhập'}
      </Link>
    </> : <>
      <p className="mt-3 text-sm text-gray-700">Bấm nút bên dưới để xác minh liên kết từ email của bạn.</p>
      <Button className="mt-5 min-h-11" type="button" onClick={() => window.location.replace(link.href)}>{title}</Button>
    </>}
  </Card>
}

function CallbackExchange() {
  const auth = useAuth(), navigate = useNavigate(), location = useLocation()
  const [error, setError] = useState('')
  const { refreshProfile } = auth
  const candidate = new URLSearchParams(location.search).get('next')
  const recovery = candidate === '/auth/reset-password'
  useEffect(() => {
    let active = true
    const url = window.location.href
    const next = recovery ? '/auth/reset-password' : safeReturnTo(candidate)
    void authService.completeCallback(url).then(async () => {
      if (!recovery) await refreshProfile()
      if (active) navigate(next, { replace: true })
    }).catch(failure => {
      if (!active) return
      if (failure instanceof ApiClientError && ['USERNAME_TAKEN', 'PROFILE_SETUP_REQUIRED'].includes(failure.code)) navigate(`/auth/complete-profile?returnTo=${encodeURIComponent(safeReturnTo(candidate))}`, { replace: true })
      else setError(authErrorMessage(failure))
    })
    return () => { active = false }
  }, [candidate, recovery, location.key, navigate, refreshProfile])
  return <Card>{error ? <>
    <h1 className="text-xl font-bold">Chưa thể xác nhận phiên</h1>
    <p role="alert" className="mt-3 text-red-800">{error}</p>
    <Link className="mt-4 inline-flex min-h-11 items-center text-teal-800 underline focus-visible:outline-2"
      to={recovery ? '/auth/forgot-password' : '/auth/login'}>
      {recovery ? 'Yêu cầu liên kết mới' : 'Quay lại đăng nhập'}
    </Link>
  </> : <LoadingSpinner label="Đang xác nhận email và phiên đăng nhập..." />}</Card>
}
