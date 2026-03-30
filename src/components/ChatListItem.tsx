/**
 * ChatListItem.tsx — Ítem de conversación en el sidebar izquierdo.
 */

import { motion } from 'framer-motion'
import Avatar from './Avatar'
import type { Conversation } from '@/types'

interface ChatListItemProps {
  conversation: Conversation
  isActive: boolean
  currentUserId: string
  onClick: () => void
}

function formatTime(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()

  if (isToday) {
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  }
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })
}

function getPreview(conversation: Conversation, currentUserId: string): string {
  const last = conversation.last_message
  if (!last) return 'Sin mensajes aún...'
  if ('detail' in last) return last.detail
  const prefix = last.sender === currentUserId ? 'Tú: ' : ''
  const text = last.decrypted_content ?? last.encrypted_content
  const preview = text.length > 40 ? text.slice(0, 40) + '…' : text
  return `${prefix}${preview}`
}

export default function ChatListItem({
  conversation,
  isActive,
  currentUserId,
  onClick,
}: ChatListItemProps) {
  const contact = conversation.contact
  const name = contact?.full_name || contact?.email || 'Usuario'
  const preview = getPreview(conversation, currentUserId)
  const timestamp = conversation.last_message && !('detail' in conversation.last_message)
    ? conversation.last_message.timestamp
    : conversation.created_at

  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 14px',
        background: isActive
          ? 'rgba(0, 243, 255, 0.06)'
          : 'transparent',
        border: 'none',
        borderLeft: isActive
          ? '2px solid #00f3ff'
          : '2px solid transparent',
        cursor: 'pointer',
        transition: 'background 0.2s, border-color 0.2s',
        textAlign: 'left',
        boxShadow: isActive
          ? 'inset 0 0 20px rgba(0, 243, 255, 0.04)'
          : undefined,
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.03)'
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
        }
      }}
    >
      <Avatar name={name} size="md" isOnline={contact?.is_active} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span
            style={{
              color: isActive ? '#00f3ff' : '#e0e0e0',
              fontSize: 14,
              fontWeight: 600,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: 140,
              display: 'block',
              transition: 'color 0.2s',
            }}
          >
            {name}
          </span>
          <span
            style={{
              fontSize: 10,
              color: 'rgba(255,255,255,0.3)',
              fontFamily: '"Space Mono", monospace',
              flexShrink: 0,
            }}
          >
            {formatTime(timestamp)}
          </span>
        </div>

        <span
          style={{
            color: 'rgba(255,255,255,0.4)',
            fontSize: 12,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            display: 'block',
            marginTop: 2,
          }}
        >
          {preview}
        </span>
      </div>
    </motion.button>
  )
}
