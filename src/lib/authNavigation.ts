export function safeReturnTo(value: unknown, fallback = '/profile') {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//') || value.includes('\\') || [...value].some(char => char.charCodeAt(0) < 32)) return fallback
  try {
    const origin = 'https://app.invalid'
    const url = new URL(value, origin)
    if (url.origin !== origin || url.pathname.startsWith('/auth/')) return fallback
    return url.pathname + url.search + url.hash
  } catch { return fallback }
}

export function readEmailVerificationLink(value: string | null, supabaseUrl: string, appOrigin: string) {
  if (!value) return null
  try {
    const url = new URL(value)
    if (url.origin !== new URL(supabaseUrl).origin || url.pathname !== '/auth/v1/verify' ||
        url.username || url.password || url.hash) return null

    const [type, token, redirectTo] = ['type', 'token', 'redirect_to'].map(key => {
      const values = url.searchParams.getAll(key)
      return values.length === 1 ? values[0] : null
    })
    if (!token || !redirectTo || (type !== 'signup' && type !== 'email' && type !== 'recovery')) return null

    const callback = new URL(redirectTo)
    if (callback.origin !== appOrigin || callback.pathname !== '/auth/callback' ||
        callback.username || callback.password || callback.hash || callback.searchParams.has('confirmation_url')) return null

    const recovery = type === 'recovery'
    if (recovery !== (callback.searchParams.get('next') === '/auth/reset-password')) return null
    return { href: url.href, recovery }
  } catch {
    return null
  }
}
