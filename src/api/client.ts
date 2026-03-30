/**
 * client.ts — Instancia de Axios con interceptores para JWT automático.
 *
 * - Añade el header Authorization en cada request.
 * - En 401, intenta refrescar el token y reintenta la request original.
 * - Si el refresh falla, limpia la sesión y redirige al login.
 */

import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'
import { TokenStorage } from '@/utils/storage'

const BASE_URL = '/api/v1'

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

// ─── Request interceptor: adjunta el access token ────────────────────────────

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = TokenStorage.getAccessToken()
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ─── Response interceptor: refresca el token en 401 ─────────────────────────

let isRefreshing = false
let refreshQueue: Array<(token: string) => void> = []

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error)
    }

    original._retry = true

    if (isRefreshing) {
      return new Promise((resolve) => {
        refreshQueue.push((token: string) => {
          original.headers.Authorization = `Bearer ${token}`
          resolve(apiClient(original))
        })
      })
    }

    isRefreshing = true
    const refreshToken = TokenStorage.getRefreshToken()

    if (!refreshToken) {
      isRefreshing = false
      TokenStorage.clearTokens()
      window.location.href = '/login'
      return Promise.reject(error)
    }

    try {
      const { data } = await axios.post(`${BASE_URL}/auth/token/refresh/`, {
        refresh: refreshToken,
      })

      const newAccess: string = data.access
      TokenStorage.setAccessToken(newAccess)

      // Resolver la cola de requests pendientes
      refreshQueue.forEach((cb) => cb(newAccess))
      refreshQueue = []

      original.headers.Authorization = `Bearer ${newAccess}`
      return apiClient(original)
    } catch {
      TokenStorage.clearTokens()
      refreshQueue = []
      window.location.href = '/login'
      return Promise.reject(error)
    } finally {
      isRefreshing = false
    }
  }
)
