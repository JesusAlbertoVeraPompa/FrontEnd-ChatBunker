import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Plus, MessageSquare, Settings2, Bell, ChevronRight,
  LogOut, Shield, User, MoreVertical, Phone, Video, Lock
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useChat } from '@/context/ChatContext'
import { chatApi } from '@/api/chat'
import Avatar from '@/components/Avatar'
import ChatListItem from '@/components/ChatListItem'
import MessageBubble from '@/components/MessageBubble'
import MessageInput from '@/components/MessageInput'
import NewChatModal from '@/components/NewChatModal'
import type { Conversation, User as UserType } from '@/types'

// ─────────────────────────────────────────────────────────────────────────────
// DashboardPage: Layout principal de 3 columnas
// ─────────────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useAuth()
  const { 
    conversations, 
    activeConversation, 
    selectConversation, 
    isLoadingConversations,
    refreshConversations 
  } = useChat()

  const [isNewChatOpen, setIsNewChatOpen] = useState(false)

  const handleCreateChat = async (targetUser: UserType) => {
    try {
      const { data: newConv } = await chatApi.createConversation(targetUser.id)
      await refreshConversations()
      // Enriquecer la conversación para que tenga el 'contact' (necesario para selectConversation)
      const enriched = {
        ...newConv,
        contact: newConv.participants.find((p) => p.id !== user?.id) ?? newConv.participants[0],
      }
      selectConversation(enriched)
      setIsNewChatOpen(false)
    } catch (err) {
      console.error('Error al crear conversación:', err)
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        background: '#000',
        overflow: 'hidden',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {/* ── Sidebar izquierdo: lista de chats ─────────────────────────── */}
      <LeftSidebar
        conversations={conversations}
        activeConversation={activeConversation}
        onSelect={selectConversation}
        currentUserId={user?.id ?? ''}
        isLoading={isLoadingConversations}
        onNewChat={() => setIsNewChatOpen(true)}
      />

      {/* ── Centro: ventana de chat ────────────────────────────────────── */}
      <ChatWindow />

      {/* ── Sidebar derecho: settings ──────────────────────────────────── */}
      <RightSidebar />

      {/* ── Modales ────────────────────────────────────────────────────── */}
      <NewChatModal
        isOpen={isNewChatOpen}
        onClose={() => setIsNewChatOpen(false)}
        onSelectUser={handleCreateChat}
      />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Sidebar Izquierdo
// ─────────────────────────────────────────────────────────────────────────────

function LeftSidebar({
  conversations,
  activeConversation,
  onSelect,
  currentUserId,
  isLoading,
  onNewChat,
}: {
  conversations: Conversation[]
  activeConversation: Conversation | null
  onSelect: (c: Conversation) => void
  currentUserId: string
  isLoading: boolean
  onNewChat: () => void
}) {
  return (
    <div
      style={{
        width: 300,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        background: '#0b0b0b',
        borderRight: '1px solid rgba(0, 243, 255, 0.1)',
        position: 'relative',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '18px 16px 12px',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <span
            style={{
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: '0.12em',
              background: 'linear-gradient(90deg, #00f3ff, #bc00ff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            CHATBUNKER
          </span>
          <div style={{ display: 'flex', gap: 4 }}>
            <IconBtn><Search size={16} /></IconBtn>
            <IconBtn onClick={onNewChat}><Plus size={16} /></IconBtn>
          </div>
        </div>

        {/* Barra de búsqueda */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 10,
            padding: '7px 12px',
          }}
        >
          <Search size={13} color="rgba(255,255,255,0.3)" />
          <input
            placeholder="Buscar conversación..."
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              outline: 'none',
              color: '#e0e0e0',
              fontSize: 13,
              fontFamily: 'Inter, sans-serif',
            }}
          />
        </div>
      </div>

      {/* Lista de chats */}
      <div style={{ flex: 1, overflowY: 'auto', paddingTop: 4 }}>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
            <NeonSpinner color="#00f3ff" />
          </div>
        ) : conversations.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '40px 24px',
              color: 'rgba(255,255,255,0.3)',
              fontSize: 13,
            }}
          >
            <MessageSquare size={32} style={{ marginBottom: 12, opacity: 0.3 }} />
            <p style={{ margin: 0 }}>Sin conversaciones aún</p>
          </div>
        ) : (
          <AnimatePresence>
            {conversations.map((conv) => (
              <motion.div
                key={conv.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChatListItem
                  conversation={conv}
                  isActive={activeConversation?.id === conv.id}
                  currentUserId={currentUserId}
                  onClick={() => onSelect(conv)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Ventana de Chat Central
// ─────────────────────────────────────────────────────────────────────────────

function ChatWindow() {
  const { user } = useAuth()
  const { activeConversation, messages, isLoadingMessages, isEncrypted, sendMessage, requestDelete } = useChat()
  const bottomRef = useRef<HTMLDivElement>(null)

  // Auto-scroll al último mensaje
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (!activeConversation) {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          background: '#000',
          color: 'rgba(255,255,255,0.2)',
        }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            border: '1px solid rgba(0, 243, 255, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MessageSquare size={32} color="rgba(0, 243, 255, 0.3)" />
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: 16, color: 'rgba(255,255,255,0.3)' }}>
            Selecciona una conversación
          </p>
          <p style={{ margin: '6px 0 0', fontSize: 12, fontFamily: '"Space Mono", monospace', color: 'rgba(255,255,255,0.15)' }}>
            CIFRADO E2EE ACTIVADO
          </p>
        </div>
      </div>
    )
  }

  const contact = activeConversation.contact
  const contactName = contact?.full_name || contact?.email || 'Usuario'

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#000' }}>
      {/* Header de la conversación */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 20px',
          background: 'rgba(11, 11, 11, 0.9)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0, 243, 255, 0.1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar name={contactName} size="md" isOnline={contact?.is_active} />
          <div>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#e0e0e0' }}>
              {contactName}
            </p>
            <p
              style={{
                margin: 0,
                fontSize: 11,
                fontFamily: '"Space Mono", monospace',
                color: contact?.is_active ? '#39ff14' : 'rgba(255,255,255,0.3)',
              }}
            >
              {contact?.is_active ? 'Online' : 'Offline'}
              {isEncrypted && (
                <span style={{ marginLeft: 8, color: '#39ff14' }}>
                  · <Lock size={9} style={{ display: 'inline', verticalAlign: 'middle' }} /> E2EE
                </span>
              )}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 4 }}>
          <IconBtn><Phone size={16} /></IconBtn>
          <IconBtn><Video size={16} /></IconBtn>
          <IconBtn><MoreVertical size={16} /></IconBtn>
        </div>
      </div>

      {/* Área de mensajes */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 8px',
          display: 'flex',
          flexDirection: 'column',
          background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(0, 243, 255, 0.02) 0%, transparent 60%)',
        }}
      >
        {isLoadingMessages ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
            <NeonSpinner color="#00f3ff" />
          </div>
        ) : messages.length === 0 ? (
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'rgba(255,255,255,0.2)',
              gap: 8,
            }}
          >
            <Shield size={28} style={{ opacity: 0.3 }} />
            <p style={{ margin: 0, fontSize: 13, fontFamily: '"Space Mono", monospace' }}>
              CANAL SEGURO ESTABLECIDO
            </p>
            <p style={{ margin: 0, fontSize: 11, opacity: 0.5 }}>
              Los mensajes están cifrados de extremo a extremo
            </p>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={{ ...msg, is_mine: msg.sender === user?.id || msg.is_mine }}
                onDelete={requestDelete}
              />
            ))}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <MessageInput
        onSend={sendMessage}
        isEncrypted={isEncrypted}
      />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Sidebar Derecho (Settings / Perfil)
// ─────────────────────────────────────────────────────────────────────────────

function RightSidebar() {
  const { user, logout } = useAuth()

  const name = user?.full_name || user?.email || 'Cypher_Dev'

  return (
    <div
      style={{
        width: 260,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        background: '#0b0b0b',
        borderLeft: '1px solid rgba(188, 0, 255, 0.1)',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '18px 16px 14px',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontFamily: '"Space Mono", monospace',
            letterSpacing: '0.2em',
            color: 'rgba(188, 0, 255, 0.8)',
          }}
        >
          PERFIL
        </span>
        <IconBtn><Settings2 size={15} /></IconBtn>
      </div>

      {/* Avatar de perfil */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '28px 16px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          gap: 10,
        }}
      >
        <div style={{ position: 'relative' }}>
          <Avatar name={name} size="lg" color="violet" />
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{
              position: 'absolute',
              inset: -4,
              borderRadius: '50%',
              border: '1px solid rgba(188, 0, 255, 0.4)',
              pointerEvents: 'none',
            }}
          />
        </div>

        <div style={{ textAlign: 'center' }}>
          <p
            style={{
              margin: 0,
              fontSize: 15,
              fontWeight: 700,
              color: '#e0e0e0',
              fontFamily: '"Space Mono", monospace',
            }}
          >
            {name}
          </p>
          <p
            style={{
              margin: '4px 0 0',
              fontSize: 11,
              color: '#bc00ff',
              fontFamily: '"Space Mono", monospace',
              letterSpacing: '0.15em',
            }}
          >
            {user?.role?.toUpperCase() ?? 'USUARIO'}
          </p>

          {/* Indicador online */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              marginTop: 8,
              background: 'rgba(57, 255, 20, 0.08)',
              border: '1px solid rgba(57, 255, 20, 0.3)',
              borderRadius: 20,
              padding: '3px 10px',
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#39ff14',
                boxShadow: '0 0 6px rgba(57, 255, 20, 0.8)',
                display: 'inline-block',
              }}
            />
            <span
              style={{
                fontSize: 10,
                color: '#39ff14',
                fontFamily: '"Space Mono", monospace',
              }}
            >
              Online
            </span>
          </div>
        </div>
      </div>

      {/* Menú */}
      <div style={{ flex: 1, padding: '8px 0' }}>
        <SettingsMenuItem icon={<User size={15} />} label="Perfil" />
        <SettingsMenuItem icon={<Bell size={15} />} label="Notificaciones" />
        <SettingsMenuItem icon={<Lock size={15} />} label="Privacidad" />
        <SettingsMenuItem icon={<Settings2 size={15} />} label="Ajustes" />
      </div>

      {/* Logout */}
      <div style={{ padding: '12px 0', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <motion.button
          onClick={logout}
          whileTap={{ scale: 0.97 }}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '10px 20px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'rgba(255, 60, 60, 0.7)',
            fontSize: 13,
            fontFamily: 'Inter, sans-serif',
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = '#ff4444')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = 'rgba(255, 60, 60, 0.7)')}
        >
          <LogOut size={15} />
          <span>Cerrar sesión</span>
        </motion.button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Componentes de UI reutilizables
// ─────────────────────────────────────────────────────────────────────────────

function IconBtn({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.9 }}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: 'rgba(255,255,255,0.4)',
        padding: 6,
        borderRadius: 8,
        display: 'flex',
        alignItems: 'center',
        transition: 'color 0.2s, background 0.2s',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLButtonElement
        el.style.color = '#00f3ff'
        el.style.background = 'rgba(0, 243, 255, 0.08)'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLButtonElement
        el.style.color = 'rgba(255,255,255,0.4)'
        el.style.background = 'none'
      }}
    >
      {children}
    </motion.button>
  )
}

function SettingsMenuItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '11px 20px',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: 'rgba(255,255,255,0.6)',
        fontSize: 13,
        fontFamily: 'Inter, sans-serif',
        transition: 'color 0.2s, background 0.2s',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLButtonElement
        el.style.color = '#bc00ff'
        el.style.background = 'rgba(188, 0, 255, 0.05)'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLButtonElement
        el.style.color = 'rgba(255,255,255,0.6)'
        el.style.background = 'none'
      }}
    >
      <span style={{ color: 'inherit' }}>{icon}</span>
      <span style={{ flex: 1, textAlign: 'left' }}>{label}</span>
      <ChevronRight size={14} style={{ opacity: 0.4 }} />
    </motion.button>
  )
}

function NeonSpinner({ color }: { color: string }) {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      style={{
        width: 28,
        height: 28,
        borderRadius: '50%',
        border: `2px solid rgba(255,255,255,0.08)`,
        borderTopColor: color,
        boxShadow: `0 0 8px ${color}60`,
      }}
    />
  )
}
