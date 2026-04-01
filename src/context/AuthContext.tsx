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
  const [user, setUser] = useState<User | null>(TokenStorage.getUser())
  const [isLoading, setIsLoading] = useState(true)

  // Al montar: restaurar sesión de forma silenciosa si hay tokens
  useEffect(() => {
    const restore = async () => {
      const refreshToken = TokenStorage.getRefreshToken()
      if (!refreshToken) {
        setIsLoading(false)
        return
      }
      try {
        const response = await authApi.refreshToken(refreshToken)
        const newAccess = response.data?.data?.access
        if (newAccess) {
          TokenStorage.setAccessToken(newAccess)
          const userResponse = await usersApi.me()
          const userData = userResponse.data?.data
          if (userData) {
            setUser(userData)
            TokenStorage.setUser(userData)
          }
        }
      } catch (err) {
        console.error('[Auth] Restauración fallida:', err)
        TokenStorage.clearTokens()
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }
    restore()
  }, [])

  const socialLogin = useCallback(async (accessToken: string, provider: 'google' | 'facebook') => {
    const response = await authApi.socialLogin(accessToken, provider)
    
    const backendData = response.data?.data
    if (backendData?.tokens) {
      TokenStorage.setTokens(backendData.tokens.access, backendData.tokens.refresh)
      setUser(backendData.user)
      TokenStorage.setUser(backendData.user)
    }
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
