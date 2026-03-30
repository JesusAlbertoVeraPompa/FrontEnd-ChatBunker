/**
 * NewChatModal.tsx — Modal para buscar usuarios e iniciar nuevas conversaciones.
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, UserPlus, Loader2, MessageSquare } from 'lucide-react'
import { chatApi } from '@/api/chat'
import type { User } from '@/types'
import Avatar from './Avatar'

interface NewChatModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectUser: (user: User) => void
}

export default function NewChatModal({ isOpen, onClose, onSelectUser }: NewChatModalProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Búsqueda con debounce simple
  useEffect(() => {
    if (query.length < 3) {
      setResults([])
      return
    }

    const timer = setTimeout(async () => {
      setIsLoading(true)
      try {
        const { data } = await chatApi.searchUsers(query)
        setResults(data)
      } catch (err) {
        console.error('Error buscando usuarios:', err)
      } finally {
        setIsLoading(false)
      }
    }, 400)

    return () => clearTimeout(timer)
  }, [query])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
        }}
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(4px)',
          }}
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: 440,
            background: '#0b0b0b',
            border: '1px solid rgba(0, 243, 255, 0.2)',
            borderRadius: 20,
            boxShadow: '0 0 40px rgba(0, 243, 255, 0.1)',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span
              style={{
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: '0.1em',
                color: '#00f3ff',
                fontFamily: '"Space Mono", monospace',
              }}
            >
              NUEVA CONVERSACIÓN
            </span>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(255,255,255,0.3)',
                cursor: 'pointer',
                padding: 4,
              }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Search Input */}
          <div style={{ padding: 20 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(0, 243, 255, 0.1)',
                borderRadius: 12,
                padding: '10px 14px',
                marginBottom: 10,
              }}
            >
              <Search size={18} color="rgba(0, 243, 255, 0.4)" />
              <input
                autoFocus
                placeholder="Buscar por email (min. 3 caracteres)..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{
                  flex: 1,
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                  color: '#e0e0e0',
                  fontSize: 14,
                  fontFamily: 'Inter, sans-serif',
                }}
              />
              {isLoading && (
                <Loader2 size={16} className="animate-spin" color="#00f3ff" />
              )}
            </div>

            {/* Results List */}
            <div
              style={{
                maxHeight: 300,
                overflowY: 'auto',
                marginTop: 10,
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
              }}
            >
              {results.length > 0 ? (
                results.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => onSelectUser(user)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '10px 12px',
                      background: 'transparent',
                      border: 'none',
                      borderRadius: 10,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0, 243, 255, 0.05)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <Avatar name={user.full_name} size="sm" />
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#e0e0e0' }}>
                        {user.full_name}
                      </p>
                      <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                        {user.email}
                      </p>
                    </div>
                    <UserPlus size={16} color="#00f3ff" style={{ opacity: 0.6 }} />
                  </button>
                ))
              ) : query.length >= 3 && !isLoading ? (
                <div style={{ textAlign: 'center', padding: '32px 0', color: 'rgba(255,255,255,0.2)' }}>
                  <p style={{ margin: 0, fontSize: 13 }}>No se encontraron usuarios</p>
                </div>
              ) : !isLoading && (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(255,255,255,0.15)' }}>
                  <MessageSquare size={32} style={{ marginBottom: 12, opacity: 0.3, margin: '0 auto' }} />
                  <p style={{ margin: 0, fontSize: 12, fontFamily: '"Space Mono", monospace' }}>
                    INGRESA UN EMAIL PARA BUSCAR
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
