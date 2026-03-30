import { apiClient } from './client'
import type { AuthTokens, LoginPayload, RegisterPayload, User } from '@/types'

export const authApi = {
  login(payload: LoginPayload) {
    return apiClient.post<AuthTokens>('/auth/login/', payload)
  },

  register(payload: RegisterPayload) {
    return apiClient.post('/auth/register/', payload)
  },

  logout(refresh: string) {
    return apiClient.post('/auth/logout/', { refresh })
  },

  refreshToken(refresh: string) {
    return apiClient.post<{ access: string }>('/auth/token/refresh/', { refresh })
  },

  requestPasswordReset(email: string) {
    return apiClient.post('/auth/password/reset/', { email })
  },

  changePassword(payload: { old_password: string; new_password: string }) {
    return apiClient.post('/auth/password/change/', payload)
  },

  sendVerificationCode(phone_number: string) {
    return apiClient.post('/auth/verify/send/', { phone_number })
  },

  verifyPhone(payload: { phone_number: string; code: string }) {
    return apiClient.post('/auth/verify/confirm/', payload)
  },
}

export const usersApi = {
  me() {
    return apiClient.get<User>('/users/me/')
  },

  getUser(id: string) {
    return apiClient.get<User>(`/users/${id}/`)
  },

  updateMe(payload: Partial<User>) {
    return apiClient.patch<User>('/users/me/', payload)
  },
}
