import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Plus, MessageSquare, Settings2, Bell, ChevronRight,
  LogOut, Shield, User, Phone, Video, Lock, Trash2, X
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useChat } from '@/context/ChatContext'
import { chatApi } from '@/api/chat'
import Avatar from '@/components/Avatar'
import ChatListItem from '@/components/ChatListItem'
import MessageBubble from '@/components/MessageBubble'
import MessageInput from '@/components/MessageInput'
import NewChatModal from '@/components/NewChatModal'
import type { Conversation } from '@/types'

// ─────────────────────────────────────────────────────────────────────────────
// DashboardPage: Layout principal de 3 columnas
// ─────────────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const { 
    conversations, 
    activeConversation, 
    selectConversation, 
    isLoadingConversations,
    refreshConversations 
  } = useChat()

  const [isNewChatOpen, setIsNewChatOpen] = useState(false)
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true)
  const [invitations, setInvitations] = useState<any[]>([])
  const prevInvitationsCount = useRef(0)

  // Sonido de notificación
  const playPing = () => {
    try {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3')
      audio.volume = 0.5
      audio.play()
    } catch (err) {
      console.warn('No se pudo reproducir el sonido:', err)
    }
  }

  const fetchInvitations = async () => {
    try {
      const response = await chatApi.getInvitations()
      // response.data es el ApiResponse
      // response.data.data es la lista (any[])
      const list = response.data?.data || []
      
      if (list.length > prevInvitationsCount.current) {
        playPing()
      }
      prevInvitationsCount.current = list.length
      setInvitations(list)
    } catch (err) {
      console.error('Error cargando invitaciones:', err)
    }
  }

  useEffect(() => {
    fetchInvitations()
    // Polling más frecuente (5s) para sensación de tiempo real sin WS global
    const interval = setInterval(fetchInvitations, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleAcceptInvitation = async (id: string) => {
    try {
      await chatApi.acceptInvitation(id)
      // Actualizar todo inmediatamente
      await Promise.all([refreshConversations(), fetchInvitations()])
    } catch (err) {
      console.error('Error aceptando invitación:', err)
    }
  }

  const handleRejectInvitation = async (id: string) => {
    try {
      await chatApi.rejectInvitation(id)
      await fetchInvitations()
    } catch (err) {
      console.error('Error rechazando invitación:', err)
    }
  }

  const handleDeleteChat = async () => {
    if (!activeConversation) return
    
    try {
      await chatApi.deleteConversation(activeConversation.id)
      selectConversation(null as any)
      await refreshConversations()
      setIsDeleteConfirmOpen(false)
    } catch (err) {
      console.error('Error al eliminar conversación:', err)
    }
  }

  const handleLogout = async () => {
    await logout()
    setIsLogoutConfirmOpen(false)
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
        invitations={invitations}
        onAcceptInvitation={handleAcceptInvitation}
        onRejectInvitation={handleRejectInvitation}
        onToggleSettings={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
        isSettingsOpen={isRightSidebarOpen}
      />

      {/* ── Centro: ventana de chat ────────────────────────────────────── */}
      <ChatWindow onDeleteChat={() => setIsDeleteConfirmOpen(true)} />

      {/* ── Sidebar derecho: settings ──────────────────────────────────── */}
      <AnimatePresence mode="popLayout">
        {isRightSidebarOpen && (
          <motion.div
            key="right-sidebar"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 260, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            style={{ flexShrink: 0, overflow: 'hidden', background: '#0b0b0b' }}
          >
            <RightSidebar onLogoutClick={() => setIsLogoutConfirmOpen(true)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Modales ────────────────────────────────────────────────────── */}
      <NewChatModal
        isOpen={isNewChatOpen}
        onClose={() => setIsNewChatOpen(false)}
        onInvitationSent={() => fetchInvitations()}
      />

      <AnimatePresence>
        {/* Modal de Borrado de Chat */}
        {isDeleteConfirmOpen && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.85)',
              backdropFilter: 'blur(8px)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20,
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{
                width: '100%',
                maxWidth: 340,
                background: '#0b0b0b',
                border: '1px solid rgba(255, 60, 60, 0.3)',
                borderRadius: 20,
                padding: '32px 24px',
                textAlign: 'center',
                boxShadow: '0 0 40px rgba(255, 60, 60, 0.1)',
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: 'rgba(255, 60, 60, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                }}
              >
                <Trash2 size={24} color="#ff6060" />
              </div>
              <h3 style={{ margin: '0 0 12px', color: '#fff', fontSize: 18, fontWeight: 600 }}>
                ¿Eliminar Conversación?
              </h3>
              <p style={{ margin: '0 0 28px', color: 'rgba(255,255,255,0.4)', fontSize: 13, lineHeight: 1.5 }}>
                Esta acción es irreversible. Se borrarán todos los mensajes cifrados de este bunker para ambos participantes.
              </p>
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  onClick={() => setIsDeleteConfirmOpen(false)}
                  style={{
                    flex: 1,
                    padding: '12px 0',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 12,
                    color: '#fff',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteChat}
                  style={{
                    flex: 1,
                    padding: '12px 0',
                    background: '#ff6060',
                    border: 'none',
                    borderRadius: 12,
                    color: '#fff',
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Confirmar
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {isLogoutConfirmOpen && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.85)',
              backdropFilter: 'blur(8px)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20,
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{
                width: '100%',
                maxWidth: 340,
                background: '#0b0b0b',
                border: '1px solid rgba(255, 60, 60, 0.3)',
                borderRadius: 20,
                padding: '32px 24px',
                textAlign: 'center',
                boxShadow: '0 0 40px rgba(255, 60, 60, 0.1)',
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: 'rgba(255, 60, 60, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                }}
              >
                <LogOut size={24} color="#ff6060" />
              </div>
              <h3 style={{ margin: '0 0 12px', color: '#fff', fontSize: 18, fontWeight: 600 }}>
                ¿Cerrar Sesión?
              </h3>
              <p style={{ margin: '0 0 28px', color: 'rgba(255,255,255,0.4)', fontSize: 13, lineHeight: 1.5 }}>
                Estás a punto de abandonar el Bunker. Tendrás que volver a autenticarte para acceder a tus mensajes.
              </p>
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  onClick={() => setIsLogoutConfirmOpen(false)}
                  style={{
                    flex: 1,
                    padding: '12px 0',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 12,
                    color: '#fff',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleLogout}
                  style={{
                    flex: 1,
                    padding: '12px 0',
                    background: '#ff6060',
                    border: 'none',
                    borderRadius: 12,
                    color: '#fff',
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Abandonar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
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
  invitations,
  onAcceptInvitation,
  onRejectInvitation,
  onToggleSettings,
  isSettingsOpen,
}: {
  conversations: Conversation[]
  activeConversation: Conversation | null
  onSelect: (c: Conversation) => void
  currentUserId: string
  isLoading: boolean
  onNewChat: () => void
  invitations: any[]
  onAcceptInvitation: (id: string) => void
  onRejectInvitation: (id: string) => void
  onToggleSettings: () => void
  isSettingsOpen: boolean
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
            <IconBtn 
              onClick={onToggleSettings}
              style={{ color: isSettingsOpen ? '#bc00ff' : 'rgba(255,255,255,0.4)', background: isSettingsOpen ? 'rgba(188, 0, 255, 0.08)' : 'none' }}
            >
              <Settings2 size={16} />
            </IconBtn>
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

      {/* Invitaciones Pendientes */}
      {invitations.length > 0 && (
        <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(0, 243, 255, 0.1)' }}>
          <p style={{ margin: '0 0 10px', fontSize: 10, color: '#00f3ff', fontFamily: 'Space Mono', letterSpacing: '0.1em' }}>SOLICITUDES PENDIENTES</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {invitations.map((inv) => (
              <div key={inv.id} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(0, 243, 255, 0.03)', padding: 8, borderRadius: 8, border: '1px solid rgba(0, 243, 255, 0.1)' }}>
                <Avatar name={inv.sender.full_name} size="sm" />
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: '#e0e0e0' }}>{inv.sender.full_name}</p>
                  <p style={{ margin: 0, fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>Quiere conectar</p>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button 
                    onClick={() => onAcceptInvitation(inv.id)}
                    style={{ background: '#00f3ff', border: 'none', borderRadius: 4, padding: '4px 8px', color: '#000', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}
                  >
                    ACEPTAR
                  </button>
                  <button 
                    onClick={() => onRejectInvitation(inv.id)}
                    style={{ background: 'rgba(255, 60, 60, 0.2)', border: '1px solid #ff606040', borderRadius: 4, padding: '4px 8px', color: '#ff6060', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}
                  >
                    RECHAZAR
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista de chats */}
      <div style={{ flex: 1, overflowY: 'auto', paddingTop: 4 }}>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
            <NeonSpinner color="#00f3ff" />
          </div>
        ) : (conversations.length === 0 && invitations.length === 0) ? (
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

function ChatWindow({ 
  onDeleteChat 
}: { 
  onDeleteChat: () => void; 
}) {
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
          <IconBtn 
            onClick={onDeleteChat}
            style={{ color: 'rgba(255, 60, 60, 0.6)' }}
          >
            <Trash2 size={16} />
          </IconBtn>
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
        disabled={!isEncrypted}
      />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Sidebar Derecho (Settings / Perfil)
// ─────────────────────────────────────────────────────────────────────────────

function RightSidebar({ onLogoutClick }: { onLogoutClick: () => void }) {
  const { user } = useAuth()
  const [activeView, setActiveView] = useState<'menu' | 'profile' | 'notifications' | 'privacy' | 'settings'>('menu')

  const name = user?.full_name || user?.email || 'Cypher_Dev'

  const renderContent = () => {
    switch (activeView) {
      case 'profile':
        return (
          <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} style={{ padding: 20 }}>
            <h4 style={{ color: '#bc00ff', fontSize: 12, marginBottom: 16, fontFamily: 'Space Mono' }}>DATOS PERSONALES</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <ProfileItem label="Email" value={user?.email ?? ''} />
              <ProfileItem label="Nombre" value={user?.full_name ?? ''} isEditable />
              <ProfileItem label="Teléfono" value={user?.phone_number ?? 'No registrado'} isEditable />
              <ProfileItem label="Rol" value={user?.role ?? 'Usuario'} />
            </div>
            <button 
              onClick={() => setActiveView('menu')}
              style={{ marginTop: 24, background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 12 }}
            >
              ← Volver al menú
            </button>
          </motion.div>
        )
      case 'notifications':
        return (
          <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} style={{ padding: 20 }}>
            <h4 style={{ color: '#00f3ff', fontSize: 12, marginBottom: 16, fontFamily: 'Space Mono' }}>NOTIFICACIONES</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <ToggleItem label="Sonidos de mensaje" defaultChecked />
              <ToggleItem label="Notificaciones de escritorio" />
              <ToggleItem label="Vista previa en banner" defaultChecked />
            </div>
            <button 
              onClick={() => setActiveView('menu')}
              style={{ marginTop: 24, background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 12 }}
            >
              ← Volver al menú
            </button>
          </motion.div>
        )
      case 'privacy':
        return (
          <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} style={{ padding: 20 }}>
            <h4 style={{ color: '#39ff14', fontSize: 12, marginBottom: 16, fontFamily: 'Space Mono' }}>SEGURIDAD E2EE</h4>
            <div style={{ background: 'rgba(57, 255, 20, 0.05)', border: '1px solid rgba(57, 255, 20, 0.2)', borderRadius: 12, padding: 12, marginBottom: 16 }}>
              <p style={{ margin: 0, fontSize: 11, color: '#39ff14', lineHeight: 1.4 }}>
                Tus mensajes están protegidos por el protocolo Double Ratchet. Las llaves se almacenan localmente.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: 0 }}>ID DE DISPOSITIVO:</p>
              <code style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', background: '#1a1a1a', padding: 8, borderRadius: 6, wordBreak: 'break-all' }}>
                BUNKER-NODE-{user?.id.slice(0, 18).toUpperCase()}
              </code>
            </div>
            <button 
              onClick={() => setActiveView('menu')}
              style={{ marginTop: 24, background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 12 }}
            >
              ← Volver al menú
            </button>
          </motion.div>
        )
      case 'settings':
        return (
          <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} style={{ padding: 20 }}>
            <h4 style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginBottom: 16, fontFamily: 'Space Mono' }}>AJUSTES GENERALES</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <SettingsActionItem label="Cambiar Contraseña" />
              <SettingsActionItem label="Sesiones Activas" />
              <SettingsActionItem label="Exportar Claves" />
              <SettingsActionItem label="Eliminar Cuenta" isDanger />
            </div>
            <button 
              onClick={() => setActiveView('menu')}
              style={{ marginTop: 24, background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 12 }}
            >
              ← Volver al menú
            </button>
          </motion.div>
        )
      default:
        return (
          <>
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
                <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#e0e0e0', fontFamily: '"Space Mono", monospace' }}>
                  {name}
                </p>
                <p style={{ margin: '4px 0 0', fontSize: 11, color: '#bc00ff', fontFamily: '"Space Mono", monospace', letterSpacing: '0.15em' }}>
                  {user?.role?.toUpperCase() ?? 'USUARIO'}
                </p>

                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 8, background: 'rgba(57, 255, 20, 0.08)', border: '1px solid rgba(57, 255, 20, 0.3)', borderRadius: 20, padding: '3px 10px' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#39ff14', boxShadow: '0 0 6px rgba(57, 255, 20, 0.8)', display: 'inline-block' }} />
                  <span style={{ fontSize: 10, color: '#39ff14', fontFamily: '"Space Mono", monospace' }}>Online</span>
                </div>
              </div>
            </div>

            <div style={{ flex: 1, padding: '8px 0' }}>
              <SettingsMenuItem icon={<User size={15} />} label="Perfil" onClick={() => setActiveView('profile')} />
              <SettingsMenuItem icon={<Bell size={15} />} label="Notificaciones" onClick={() => setActiveView('notifications')} />
              <SettingsMenuItem icon={<Lock size={15} />} label="Privacidad" onClick={() => setActiveView('privacy')} />
              <SettingsMenuItem icon={<Settings2 size={15} />} label="Ajustes" onClick={() => setActiveView('settings')} />
            </div>
          </>
        )
    }
  }

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
          {activeView === 'menu' ? 'BUNKER CORE' : activeView.toUpperCase()}
        </span>
        {activeView !== 'menu' && (
          <IconBtn onClick={() => setActiveView('menu')}>
            <X size={15} />
          </IconBtn>
        )}
      </div>

      {renderContent()}

      {/* Logout */}
      <div style={{ padding: '12px 0', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <motion.button
          onClick={onLogoutClick}
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

// ─── Sub-componentes para vistas de ajustes ──────────────────────────────────

function ProfileItem({ label, value, isEditable }: { label: string; value: string; isEditable?: boolean }) {
  return (
    <div>
      <p style={{ margin: '0 0 4px', fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>{label}</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ margin: 0, fontSize: 13, color: '#fff' }}>{value}</p>
        {isEditable && (
          <button style={{ background: 'none', border: 'none', color: '#bc00ff', fontSize: 11, cursor: 'pointer' }}>Editar</button>
        )}
      </div>
    </div>
  )
}

function ToggleItem({ label, defaultChecked }: { label: string; defaultChecked?: boolean }) {
  const [checked, setChecked] = useState(defaultChecked)
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{label}</span>
      <button 
        onClick={() => setChecked(!checked)}
        style={{
          width: 32, height: 16, borderRadius: 10,
          background: checked ? '#00f3ff' : 'rgba(255,255,255,0.1)',
          border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s'
        }}
      >
        <motion.div 
          animate={{ x: checked ? 16 : 2 }}
          style={{ width: 12, height: 12, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2 }}
        />
      </button>
    </div>
  )
}

function SettingsActionItem({ label, isDanger }: { label: string; isDanger?: boolean }) {
  return (
    <button
      style={{
        width: '100%', textAlign: 'left', padding: '10px 0', background: 'none', border: 'none',
        borderBottom: '1px solid rgba(255,255,255,0.05)', color: isDanger ? '#ff6060' : 'rgba(255,255,255,0.7)',
        fontSize: 13, cursor: 'pointer'
      }}
    >
      {label}
    </button>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Componentes de UI reutilizables
// ─────────────────────────────────────────────────────────────────────────────

function IconBtn({ children, onClick, style }: { children: React.ReactNode; onClick?: () => void; style?: React.CSSProperties }) {
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
        ...style
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

function SettingsMenuItem({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick?: () => void }) {
  return (
    <motion.button
      onClick={onClick}
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
