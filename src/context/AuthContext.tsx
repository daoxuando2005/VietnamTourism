/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import type { User, RegisterPayload } from '@/types'
import { authService } from '@/services'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterPayload) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // On mount, check if there is an active session
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser()
        setUser(currentUser)
      } catch (err) {
        console.error('Failed to restore auth session:', err)
      } finally {
        setLoading(false)
      }
    }
    initializeAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const loggedUser = await authService.login(email, password)
      setUser(loggedUser)
    } catch (err) {
      setUser(null)
      throw err
    }
  }

  const register = async (data: RegisterPayload) => {
    try {
      const registeredUser = await authService.register(data)
      setUser(registeredUser)
    } catch (err) {
      setUser(null)
      throw err
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
      setUser(null)
    } catch (err) {
      console.error('Error during logout:', err)
      throw err
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
export default AuthContext
