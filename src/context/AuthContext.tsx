import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { authApi, usersApi } from '@/api/auth'
import { TokenStorage } from '@/utils/storage'
import type { User } from '@/types'

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  socialLogin: (accessToken: string, provider: 'google' | 'facebook') => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Al montar: si hay refresh token, restaurar sesión
  useEffect(() => {
    const restore = async () => {
      const refreshToken = TokenStorage.getRefreshToken()
      if (!refreshToken) {
        setIsLoading(false)
        return
      }
      try {
        const { data } = await authApi.refreshToken(refreshToken)
        TokenStorage.setAccessToken(data.access)
        const { data: me } = await usersApi.me()
        setUser(me)
      } catch {
        TokenStorage.clearTokens()
      } finally {
        setIsLoading(false)
      }
    }
    restore()
  }, [])

  const socialLogin = useCallback(async (accessToken: string, provider: 'google' | 'facebook') => {
    const { data: tokens } = await authApi.socialLogin(accessToken, provider)
    TokenStorage.setTokens(tokens)
    const { data: me } = await usersApi.me()
    setUser(me)
  }, [])

  const logout = useCallback(async () => {
    const refreshToken = TokenStorage.getRefreshToken()
    if (refreshToken) {
      try {
        await authApi.logout(refreshToken)
      } catch {
        // silencioso
      }
    }
    TokenStorage.clearTokens()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, isLoading, socialLogin, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
