import { apiClient } from './client'
import type { AuthTokens, LoginPayload, RegisterPayload, User, ApiResponse } from '@/types'

export const authApi = {
  login(payload: LoginPayload) {
    return apiClient.post<ApiResponse<{ tokens: AuthTokens; user: User }>>('/auth/login/', payload)
  },

  register(payload: RegisterPayload) {
    return apiClient.post<ApiResponse<User>>('/auth/register/', payload)
  },

  socialLogin(accessToken: string, provider: 'google' | 'facebook') {
    // El backend espera /api/v1/auth/google/ o /api/v1/auth/facebook/
    return apiClient.post<ApiResponse<{ tokens: AuthTokens; user: User }>>(`/auth/${provider}/`, {
      access_token: accessToken,
    })
  },

  refreshToken(refresh: string) {
    return apiClient.post<ApiResponse<{ access: string }>>('/auth/token/refresh/', { refresh })
  },

  logout(refresh: string) {
    return apiClient.post('/auth/logout/', { refresh })
  },
}

export const usersApi = {
  me() {
    return apiClient.get<ApiResponse<User>>('/auth/me/')
  },
}
