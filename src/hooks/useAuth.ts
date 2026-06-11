import { useCallback, useEffect, useState } from 'react'
import { authService } from '@/services'
import type { AuthSession, User } from '@/types'

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  })

  useEffect(() => {
    authService
      .getSession()
      .then((session: AuthSession | null) => {
        setState({
          user: session?.user ?? null,
          isLoading: false,
          isAuthenticated: Boolean(session),
        })
      })
      .catch(() => {
        setState({ user: null, isLoading: false, isAuthenticated: false })
      })
  }, [])

  const logout = useCallback(async () => {
    await authService.logout()
    setState({ user: null, isLoading: false, isAuthenticated: false })
  }, [])

  return { ...state, logout }
}
