import { apiClient } from './client'
import type { Conversation, Message } from '@/types'

export const chatApi = {
  getConversations() {
    return apiClient.get<Conversation[]>('/chat/conversations/')
  },

  createConversation(userId: string) {
    return apiClient.post<Conversation>('/chat/conversations/', { user_id: userId })
  },

  getChatHistory(conversationId: string) {
    return apiClient.get<Message[]>(`/chat/conversations/${conversationId}/history/`)
  },

  searchUsers(query: string) {
    return apiClient.get<User[]>(`/users/search/?q=${query}`)
  },

  getMediaSignedUrl(mediaId: string) {
    return apiClient.get<{ download_url: string }>(`/chat/media/${mediaId}/sign/`)
  },
}

// ─── WebSocket URL builder ────────────────────────────────────────────────────

export function buildWSUrl(conversationId: string, accessToken: string): string {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const host = window.location.host
  return `${protocol}//${host}/ws/chat/${conversationId}/?token=${accessToken}`
}
