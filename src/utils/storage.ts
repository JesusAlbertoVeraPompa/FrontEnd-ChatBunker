/**
 * storage.ts - Manejo seguro de tokens JWT en memoria.
 *
 * Los tokens se guardan en variables de modulo (no localStorage/sessionStorage)
 * para reducir exposicion ante XSS. El refresh token persiste solo en
 * sessionStorage para sobrevivir recargas dentro de la misma pestana/sesion.
 */

import type { AuthTokens } from '@/types'

// Access token SOLO en memoria (mas seguro contra XSS)
let accessToken: string | null = null

const REFRESH_KEY = 'cb_rt' // Clave de sessionStorage para el refresh token

export const TokenStorage = {
  setTokens(tokens: AuthTokens): void {
    accessToken = tokens.access
    try {
      sessionStorage.setItem(REFRESH_KEY, tokens.refresh)
      // Limpieza defensiva por si existia en versiones previas.
      localStorage.removeItem(REFRESH_KEY)
    } catch {
      // sessionStorage no disponible
    }
  },

  getAccessToken(): string | null {
    return accessToken
  },

  getRefreshToken(): string | null {
    try {
      const current = sessionStorage.getItem(REFRESH_KEY)
      if (current) return current

      // Migracion temporal: mover token legacy de localStorage.
      const legacy = localStorage.getItem(REFRESH_KEY)
      if (!legacy) return null

      sessionStorage.setItem(REFRESH_KEY, legacy)
      localStorage.removeItem(REFRESH_KEY)
      return legacy
    } catch {
      return null
    }
  },

  setAccessToken(token: string): void {
    accessToken = token
  },

  clearTokens(): void {
    accessToken = null
    try {
      sessionStorage.removeItem(REFRESH_KEY)
      localStorage.removeItem(REFRESH_KEY)
    } catch {
      // silencioso
    }
  },

  hasTokens(): boolean {
    return accessToken !== null || TokenStorage.getRefreshToken() !== null
  },
}
