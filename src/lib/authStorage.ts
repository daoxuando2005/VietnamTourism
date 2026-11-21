export const AUTH_STORAGE_KEY = 'vietnam-tourism-auth-v1'
const memory = new Map<string, string>()
export const authStorage = {
  getItem(key: string) {
    try { return localStorage.getItem(key) } catch { return memory.get(key) ?? null }
  },
  setItem(key: string, value: string) {
    memory.set(key, value)
    try { localStorage.setItem(key, value) } catch { /* in-memory sessions for restricted storage */ }
  },
  removeItem(key: string) {
    memory.delete(key)
    try { localStorage.removeItem(key) } catch { /* memory was cleared too */ }
  },
}
export function clearStoredSession() {
  for (const suffix of ['', '-user', '-code-verifier']) authStorage.removeItem(AUTH_STORAGE_KEY + suffix)
}
