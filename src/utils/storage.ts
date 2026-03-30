/**
 * storage.ts — Manejo seguro de tokens JWT en memoria.
 *
 * Los tokens se guardan en variables de módulo (no localStorage/sessionStorage)
 * para protegerlos de ataques XSS. El refresh token persiste en sessionStorage
 * únicamente para sobrevivir recargas de página dentro de la misma sesión.
 */

import type { AuthTokens } from '@/types'

// Access token SOLO en memoria (más seguro contra XSS)
let accessToken: string | null = null

const REFRESH_KEY = 'cb_rt'  // Clave en sessionStorage para el refresh token

export const TokenStorage = {
  setTokens(tokens: AuthTokens): void {
    accessToken = tokens.access
    try {
      sessionStorage.setItem(REFRESH_KEY, tokens.refresh)
    } catch {
      // sessionStorage no disponible (modo privado extremo)
    }
  },

  getAccessToken(): string | null {
    return accessToken
  },

  getRefreshToken(): string | null {
    try {
      return sessionStorage.getItem(REFRESH_KEY)
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
    } catch {
      // silencioso
    }
  },

  hasTokens(): boolean {
    return accessToken !== null || TokenStorage.getRefreshToken() !== null
  },
}
