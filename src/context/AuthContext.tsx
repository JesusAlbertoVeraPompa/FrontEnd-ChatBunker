import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { authApi, usersApi } from '@/api/auth'
import { TokenStorage } from '@/utils/storage'
import type { LoginPayload, RegisterPayload, User } from '@/types'

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (payload: LoginPayload) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
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

  const login = useCallback(async (payload: LoginPayload) => {
    const { data: tokens } = await authApi.login(payload)
    TokenStorage.setTokens(tokens)
    const { data: me } = await usersApi.me()
    setUser(me)
  }, [])

  const register = useCallback(async (payload: RegisterPayload) => {
    await authApi.register(payload)
  }, [])

  const logout = useCallback(async () => {
    const refreshToken = TokenStorage.getRefreshToken()
    if (refreshToken) {
      try {
        await authApi.logout(refreshToken)
      } catch {
        // silencioso — limpiar igual
      }
    }
    TokenStorage.clearTokens()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, isLoading, login, register, logout }}
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
