/**
 * MessageBubble.tsx — Burbuja de mensaje con estética neon/glassmorphism.
 *
 * Receptor (is_mine=false): borde cyan, glow azul
 * Emisor  (is_mine=true):   borde violet/rosa, glow violeta
 */

import { motion } from 'framer-motion'
import { Check, CheckCheck, Trash2 } from 'lucide-react'
import type { Message } from '@/types'

interface MessageBubbleProps {
  message: Message
  onDelete?: (id: string) => void
}

function formatTime(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function MessageBubble({ message, onDelete }: MessageBubbleProps) {
  const isMine = message.is_mine
  const displayText = message.decrypted_content ?? message.encrypted_content

  const bgColor = isMine
    ? 'rgba(188, 0, 255, 0.08)'
    : 'rgba(0, 243, 255, 0.06)'

  const borderColor = isMine ? '#bc00ff' : '#00f3ff'
  const glowColor = isMine
    ? 'rgba(188, 0, 255, 0.3)'
    : 'rgba(0, 243, 255, 0.3)'

  const textColor = isMine ? '#e8b4ff' : '#b3f5ff'
  const timeColor = isMine ? 'rgba(188, 0, 255, 0.6)' : 'rgba(0, 243, 255, 0.6)'

  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      style={{
        display: 'flex',
        justifyContent: isMine ? 'flex-end' : 'flex-start',
        marginBottom: 4,
        paddingLeft: isMine ? 48 : 8,
        paddingRight: isMine ? 8 : 48,
      }}
    >
      <div style={{ position: 'relative', maxWidth: '72%' }}>
        {/* Burbuja */}
        <div
          style={{
            background: bgColor,
            backdropFilter: 'blur(8px)',
            border: `1px solid ${borderColor}40`,
            borderRadius: isMine ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
            padding: '8px 12px 6px',
            boxShadow: `0 0 12px ${glowColor}, inset 0 0 8px ${glowColor}20`,
            position: 'relative',
          }}
        >
          {/* Texto */}
          <p
            style={{
              margin: 0,
              color: textColor,
              fontSize: 14,
              lineHeight: 1.5,
              wordBreak: 'break-word',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            {displayText}
          </p>

          {/* Footer: hora + estado */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              justifyContent: 'flex-end',
              marginTop: 4,
            }}
          >
            <span
              style={{
                fontSize: 10,
                color: timeColor,
                fontFamily: '"Space Mono", monospace',
              }}
            >
              {formatTime(message.timestamp)}
            </span>

            {isMine && (
              <StatusIcon status={message.status} color={borderColor} />
            )}
          </div>
        </div>

        {/* Botón de borrado (hover) */}
        {onDelete && (
          <button
            onClick={() => onDelete(message.id)}
            title="Solicitar borrado"
            style={{
              position: 'absolute',
              top: '50%',
              transform: 'translateY(-50%)',
              [isMine ? 'left' : 'right']: -32,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'rgba(255,255,255,0.2)',
              padding: 4,
              display: 'flex',
              alignItems: 'center',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = '#ff4444')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.2)')}
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </motion.div>
  )
}

function StatusIcon({ status, color }: { status?: Message['status']; color: string }) {
  if (!status || status === 'sending') {
    return <Check size={12} style={{ color: 'rgba(255,255,255,0.3)' }} />
  }
  if (status === 'sent') {
    return <Check size={12} style={{ color }} />
  }
  return <CheckCheck size={12} style={{ color }} />
}
