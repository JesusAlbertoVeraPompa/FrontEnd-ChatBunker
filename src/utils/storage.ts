/**
 * storage.ts — Gestión de tokens en sessionStorage.
 * Se prefiere sessionStorage sobre localStorage para que la sesión
 * se destruya automáticamente al cerrar la pestaña.
 */

const ACCESS_TOKEN_KEY = 'chatbunker_access'
const REFRESH_TOKEN_KEY = 'chatbunker_refresh'
const USER_DATA_KEY = 'chatbunker_user'

export const TokenStorage = {
  getAccessToken: () => sessionStorage.getItem(ACCESS_TOKEN_KEY),
  getRefreshToken: () => sessionStorage.getItem(REFRESH_TOKEN_KEY),
  getUser: () => {
    const data = sessionStorage.getItem(USER_DATA_KEY)
    return data ? JSON.parse(data) : null
  },

  setTokens: (access: string, refresh: string) => {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, access)
    sessionStorage.setItem(REFRESH_TOKEN_KEY, refresh)
  },

  setAccessToken: (access: string) => {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, access)
  },

  setUser: (user: any) => {
    sessionStorage.setItem(USER_DATA_KEY, JSON.stringify(user))
  },

  clearTokens: () => {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY)
    sessionStorage.removeItem(REFRESH_TOKEN_KEY)
    sessionStorage.removeItem(USER_DATA_KEY)
  },
}
