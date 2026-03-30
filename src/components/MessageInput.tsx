/**
 * MessageInput.tsx — Barra de entrada de mensaje con estilo neon flotante.
 */

import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Send, Paperclip, Lock, LockOpen } from 'lucide-react'

interface MessageInputProps {
  onSend: (text: string) => void
  isEncrypted: boolean
  disabled?: boolean
}

export default function MessageInput({ onSend, isEncrypted, disabled }: MessageInputProps) {
  const [text, setText] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = () => {
    const trimmed = text.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setText('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value)
    // Auto-resize
    const el = e.target
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`
  }

  const borderColor = isFocused ? '#00f3ff' : 'rgba(255,255,255,0.1)'
  const glowColor = isFocused ? 'rgba(0, 243, 255, 0.2)' : 'transparent'

  return (
    <div
      style={{
        padding: '12px 16px',
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(16px)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Indicador E2EE */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          marginBottom: 8,
        }}
      >
        {isEncrypted ? (
          <Lock size={11} style={{ color: '#39ff14' }} />
        ) : (
          <LockOpen size={11} style={{ color: 'rgba(255,255,255,0.3)' }} />
        )}
        <span
          style={{
            fontSize: 10,
            fontFamily: '"Space Mono", monospace',
            color: isEncrypted ? '#39ff14' : 'rgba(255,255,255,0.3)',
          }}
        >
          {isEncrypted ? 'CIFRADO E2EE ACTIVO' : 'Esperando intercambio de claves...'}
        </span>
      </div>

      {/* Contenedor del input */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 10,
          background: 'rgba(255,255,255,0.04)',
          border: `1px solid ${borderColor}`,
          borderRadius: 16,
          padding: '8px 12px',
          boxShadow: `0 0 12px ${glowColor}`,
          transition: 'border-color 0.2s, box-shadow 0.2s',
        }}
      >
        {/* Botón adjuntar */}
        <button
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'rgba(255,255,255,0.3)',
            padding: 4,
            display: 'flex',
            alignItems: 'center',
            flexShrink: 0,
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = '#00f3ff')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.3)')}
        >
          <Paperclip size={18} />
        </button>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Escribe un mensaje..."
          disabled={disabled}
          rows={1}
          style={{
            flex: 1,
            background: 'none',
            border: 'none',
            outline: 'none',
            color: '#e0e0e0',
            fontSize: 14,
            fontFamily: 'Inter, sans-serif',
            resize: 'none',
            lineHeight: 1.5,
            maxHeight: 120,
            overflow: 'auto',
          }}
        />

        {/* Botón enviar */}
        <motion.button
          onClick={handleSend}
          disabled={!text.trim() || disabled}
          whileTap={{ scale: 0.9 }}
          style={{
            background: text.trim() && !disabled
              ? 'linear-gradient(135deg, #00f3ff, #bc00ff)'
              : 'rgba(255,255,255,0.08)',
            border: 'none',
            borderRadius: '50%',
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: text.trim() && !disabled ? 'pointer' : 'default',
            flexShrink: 0,
            boxShadow: text.trim() && !disabled ? 'var(--shadow-cyan)' : undefined,
            transition: 'background 0.2s, box-shadow 0.2s',
          }}
        >
          <Send size={16} color={text.trim() && !disabled ? '#000' : 'rgba(255,255,255,0.3)'} />
        </motion.button>
      </div>
    </div>
  )
}
