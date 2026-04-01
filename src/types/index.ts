// ─── Modelos de usuario ───────────────────────────────────────────────────────

export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  full_name: string
  role: 'Admin' | 'Personal' | 'Usuario'
  is_verified: boolean
  is_active: boolean
  phone_number?: string
  birth_date?: string
  groups?: string[]
  created_at?: string
  updated_at?: string
}

// ─── Modelos de chat ──────────────────────────────────────────────────────────

export interface Message {
  id: string
  sender: string          // UUID del sender
  sender_email: string
  encrypted_content: string
  decrypted_content?: string   // Rellenado por la capa E2EE en el cliente
  message_type: 'Text' | 'Audio'
  timestamp: string
  is_mine: boolean
  // Estado local de entrega
  status?: 'sending' | 'sent' | 'delivered' | 'read'
}

export interface Conversation {
  id: string
  participants: User[]
  last_message: Message | DeletedMessage | null
  created_at: string
  // Calculado localmente
  contact?: User
  unread_count?: number
}

export interface DeletedMessage {
  detail: string
}

// ─── WebSocket ────────────────────────────────────────────────────────────────

export type WSIncoming =
  | WSChatMessage
  | WSRelayKey
  | WSDeleteNotification

export interface WSChatMessage {
  type: 'chat_message'
  message_id: string
  sender: string
  content: string       // ciphertext
  msg_type: string
  timestamp: string
}

export interface WSRelayKey {
  type: 'relay_key'
  sender: string
  public_key: string
}

export interface WSDeleteNotification {
  type: 'delete_notification'
  message_id: string
  deleted_by: string
  is_permanent: boolean
}

// ─── Autenticación ────────────────────────────────────────────────────────────

export interface AuthTokens {
  access: string
  refresh: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  email: string
  password: string
  first_name: string
  last_name: string
  birth_date: string
}

// ─── API responses ────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean
  status_code: number
  message: string
  data: T
}

export interface ApiError {
  detail?: string
  [key: string]: unknown
}
