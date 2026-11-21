/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import type { RegisterPayload, User } from '@/types'
import type { BootstrapRequest } from '@/api/generated/types.gen'
import { authService, authErrorMessage } from '@/services/authService'
import { ApiClientError } from '@/services/api/client'
import { supabase } from '@/lib/supabase'
import { AUTH_STORAGE_KEY } from '@/lib/authStorage'
import { onSessionExpired } from '@/lib/authEvents'
import { clearPersonalCache, queryClient } from '@/lib/queryClient'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  authError: string | null
  needsProfileSetup: boolean
  login(email: string, password: string): Promise<void>
  register(data: RegisterPayload, next?: string): Promise<boolean>
  logout(): Promise<void>
  refreshProfile(): Promise<void>
  completeProfile(data: BootstrapRequest): Promise<void>
}
const AuthContext = createContext<AuthContextType | undefined>(undefined)
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)
  const [needsProfileSetup, setNeedsProfileSetup] = useState(false)
  const generation = useRef(0), subject = useRef<string | null>(null)
  const eventSequence = useRef(0), signingOut = useRef(false), logoutWork = useRef<Promise<void> | null>(null)
  const invalidateGeneration = useCallback(() => { generation.current++ }, [])

  const synchronize = useCallback(async (next: Session | null) => {
    const current = ++generation.current
    if (subject.current !== (next?.user.id ?? null)) { clearPersonalCache(); setUser(null) }
    subject.current = next?.user.id ?? null
    setSession(next); setAuthError(null); setNeedsProfileSetup(false)
    if (!next) { setUser(null); setLoading(false); return }
    setLoading(true)
    try {
      const value = await queryClient.fetchQuery({ queryKey: ['me', next.user.id], queryFn: ({ signal }) => authService.profile(next, signal) })
      if (current === generation.current) setUser(value)
    } catch (error) {
      if (current === generation.current) {
        setUser(null); setAuthError(authErrorMessage(error))
        setNeedsProfileSetup(error instanceof ApiClientError && ['USERNAME_TAKEN', 'PROFILE_SETUP_REQUIRED'].includes(error.code))
      }
      throw error
    } finally { if (current === generation.current) setLoading(false) }
  }, [])
  const logout = useCallback(async () => {
    if (logoutWork.current) return logoutWork.current
    signingOut.current = true; eventSequence.current++
    generation.current++; subject.current = null
    clearPersonalCache(); setUser(null); setSession(null); setLoading(false); setNeedsProfileSetup(false); setAuthError(null)
    const work = authService.logout().finally(() => { signingOut.current = false; logoutWork.current = null })
    logoutWork.current = work
    await work
  }, [])

  useEffect(() => {
    let active = true, initialized = false
    const initial = generation.current
    void supabase.auth.getSession().then(({ data }) => {
      if (active && generation.current === initial) { initialized = true; void synchronize(data.session).catch(() => {}) }
    }).catch(error => { if (active && generation.current === initial) { setAuthError(authErrorMessage(error)); setLoading(false) } })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, value) => {
      if (event === 'INITIAL_SESSION' && initialized) return
      if (signingOut.current && event !== 'SIGNED_OUT') return
      initialized = true
      const sequence = ++eventSequence.current
      queueMicrotask(() => { if (active && sequence === eventSequence.current && (!signingOut.current || event === 'SIGNED_OUT')) void synchronize(value).catch(() => {}) })
    })
    const remove = onSessionExpired((id) => {
      if (subject.current !== id) return
      void logout().catch(() => {}).finally(() => { if (active) setAuthError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.') })
    })
    const storageChanged = (event: StorageEvent) => {
      if (event.key === AUTH_STORAGE_KEY && event.newValue === null) void synchronize(null)
    }
    window.addEventListener('storage', storageChanged)
    return () => { active = false; invalidateGeneration(); subscription.unsubscribe(); remove(); window.removeEventListener('storage', storageChanged) }
  }, [logout, synchronize, invalidateGeneration])

  const login = useCallback(async (email: string, password: string) => { await logoutWork.current?.catch(() => {}); await synchronize(await authService.login(email, password)) }, [synchronize])
  const register = useCallback(async (data: RegisterPayload, next?: string) => {
    await logoutWork.current?.catch(() => {})
    if (subject.current) await logout()
    const value = await authService.register(data, next)
    if (value) { await synchronize(value); return false }
    return true
  }, [logout, synchronize])
  const refreshProfile = useCallback(async () => { await synchronize((await supabase.auth.getSession()).data.session) }, [synchronize])
  const completeProfile = useCallback(async (data: BootstrapRequest) => { await authService.completeProfile(data); await refreshProfile() }, [refreshProfile])
  return <AuthContext.Provider value={{ user, session, loading, authError, needsProfileSetup, login, register, logout, refreshProfile, completeProfile }}>{children}</AuthContext.Provider>
}
export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used within AuthProvider')
  return value
}
export default AuthContext
