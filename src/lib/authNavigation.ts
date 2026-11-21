export function safeReturnTo(value: unknown, fallback = '/profile') {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//') || value.includes('\\') || [...value].some(char => char.charCodeAt(0) < 32)) return fallback
  try {
    const origin = 'https://app.invalid'
    const url = new URL(value, origin)
    if (url.origin !== origin || url.pathname.startsWith('/auth/')) return fallback
    return url.pathname + url.search + url.hash
  } catch { return fallback }
}
