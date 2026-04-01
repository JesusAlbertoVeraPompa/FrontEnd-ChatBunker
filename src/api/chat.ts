import { apiClient } from './client'
import type { Conversation, Message, User, ApiResponse } from '@/types'

export const chatApi = {
  getConversations() {
    return apiClient.get<ApiResponse<Conversation[]>>('/chat/conversations/')
  },

  createConversation(userId: string) {
    return apiClient.post<ApiResponse<Conversation>>('/chat/conversations/', { user_id: userId })
  },

  getInvitations() {
    return apiClient.get<ApiResponse<any[]>>('/chat/invitations/')
  },

  sendInvitation(email: string) {
    return apiClient.post<ApiResponse<any>>('/chat/invitations/', { email })
  },

  acceptInvitation(invitationId: string) {
    return apiClient.post<ApiResponse<Conversation>>(`/chat/invitations/${invitationId}/accept/`)
  },

  rejectInvitation(invitationId: string) {
    return apiClient.post<ApiResponse<any>>(`/chat/invitations/${invitationId}/reject/`)
  },

  getChatHistory(conversationId: string) {
    return apiClient.get<ApiResponse<Message[]>>(`/chat/conversations/${conversationId}/history/`)
  },

  deleteConversation(conversationId: string) {
    return apiClient.delete(`/chat/conversations/${conversationId}/history/`)
  },

  searchUsers(query: string) {
    return apiClient.get<ApiResponse<User[]>>(`/users/search/?q=${query}`)
  },

  getMediaSignedUrl(mediaId: string) {
    return apiClient.get<ApiResponse<{ download_url: string }>>(`/chat/media/${mediaId}/sign/`)
  },
}

// ─── WebSocket URL builder ────────────────────────────────────────────────────

export function buildWSUrl(conversationId: string, accessToken: string): string {
  const { protocol, host, hostname } = window.location
  const isProd = hostname !== 'localhost' && hostname !== '127.0.0.1'
  
  const wsProtocol = protocol === 'https:' ? 'wss:' : 'ws:'
  const wsHost = isProd ? 'backend-chatbunker.onrender.com' : host
  
  return `${wsProtocol}//${wsHost}/ws/chat/${conversationId}/?token=${accessToken}`
}
