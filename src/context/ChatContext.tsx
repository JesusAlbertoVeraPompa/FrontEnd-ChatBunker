import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import { chatApi, buildWSUrl } from '@/api/chat'
import { TokenStorage } from '@/utils/storage'
import { generateKeyPair, deriveSharedKey, encryptMessage, decryptMessage, isCiphertext } from '@/utils/crypto'
import type { KeyPair } from '@/utils/crypto'
import type { Conversation, Message, WSIncoming } from '@/types'
import { useAuth } from './AuthContext'

interface ChatContextValue {
  conversations: Conversation[]
  activeConversation: Conversation | null
  messages: Message[]
  isLoadingConversations: boolean
  isLoadingMessages: boolean
  isEncrypted: boolean   // true cuando el intercambio de claves está completo
  selectConversation: (conv: Conversation) => void
  sendMessage: (text: string) => Promise<void>
  requestDelete: (messageId: string) => void
  refreshConversations: () => Promise<void>
}

const ChatContext = createContext<ChatContextValue | null>(null)

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoadingConversations, setIsLoadingConversations] = useState(false)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [isEncrypted, setIsEncrypted] = useState(false)

  const wsRef = useRef<WebSocket | null>(null)
  const keyPairRef = useRef<KeyPair | null>(null)
  const sharedKeyRef = useRef<CryptoKey | null>(null)

  // Carga de conversaciones
  const refreshConversations = useCallback(async () => {
    setIsLoadingConversations(true)
    try {
      const { data } = await chatApi.getConversations()
      // Añadir el "contact" (el participante que NO es el usuario actual)
      const enriched = data.map((conv) => ({
        ...conv,
        contact: conv.participants.find((p) => p.id !== user?.id) ?? conv.participants[0],
      }))
      setConversations(enriched)
    } catch {
      // Error de red — mantener estado anterior
    } finally {
      setIsLoadingConversations(false)
    }
  }, [user?.id])

  useEffect(() => {
    if (user) refreshConversations()
  }, [user, refreshConversations])

  // Desconectar WebSocket anterior al cambiar de conversación
  const closeWS = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    sharedKeyRef.current = null
    keyPairRef.current = null
    setIsEncrypted(false)
  }, [])

  const selectConversation = useCallback(
    async (conv: Conversation) => {
      if (activeConversation?.id === conv.id) return

      closeWS()
      setActiveConversation(conv)
      setMessages([])
      setIsEncrypted(false)

      // Cargar historial
      setIsLoadingMessages(true)
      try {
        const { data } = await chatApi.getChatHistory(conv.id)
        // Intentar descifrar mensajes del historial (si hay clave compartida)
        setMessages(data)
      } catch {
        setMessages([])
      } finally {
        setIsLoadingMessages(false)
      }

      // Abrir WebSocket
      const accessToken = TokenStorage.getAccessToken()
      if (!accessToken) {
        console.error('[WS] No hay access token')
        return
      }

      const wsUrl = buildWSUrl(conv.id, accessToken)
      console.log('[WS] Conectando a:', wsUrl)
      
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onopen = async () => {
        console.log('[WS] Conexión abierta')
        // Generar par de claves para esta sesión y enviar clave pública
        const kp = await generateKeyPair()
        keyPairRef.current = kp
        ws.send(JSON.stringify({ action: 'key_exchange', public_key: kp.publicKeyBase64 }))
      }

      ws.onmessage = async (event: MessageEvent) => {
        const msg: WSIncoming = JSON.parse(event.data as string)
        console.log('[WS] Mensaje recibido:', msg.type)

        if (msg.type === 'relay_key' && keyPairRef.current) {
          // Recibir clave del partner y derivar secreto compartido
          try {
            const hadKey = !!sharedKeyRef.current
            const shared = await deriveSharedKey(keyPairRef.current.privateKey, msg.public_key)
            sharedKeyRef.current = shared
            setIsEncrypted(true)

            // Si el mensaje viene del partner, respondemos con nuestra llave para asegurar simetría
            if (msg.sender !== user?.id && !hadKey) {
              ws.send(JSON.stringify({ action: 'key_exchange', public_key: keyPairRef.current.publicKeyBase64 }))
            }

            // Re-descifrar mensajes del historial con la nueva clave compartida
            setMessages((prev) => {
              const updated = [...prev]
              // Procesar descifrado asíncronamente para no bloquear el renderizado
              Promise.all(
                updated.map(async (m) => {
                  if (m.encrypted_content && isCiphertext(m.encrypted_content) && !m.decrypted_content) {
                    try {
                      return { ...m, decrypted_content: await decryptMessage(m.encrypted_content, shared) }
                    } catch (e) {
                      return { ...m, decrypted_content: '[Error al descifrar]' }
                    }
                  }
                  return m
                })
              ).then((decryptedList) => {
                setMessages(decryptedList)
              })
              return updated
            })
          } catch (err) {
            console.error('[WS] Error en derivación de clave:', err)
          }
        }

        if (msg.type === 'chat_message') {
          // Sonido de mensaje entrante si no es mío
          if (msg.sender !== user?.id) {
            try {
              const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3')
              audio.volume = 0.4
              audio.play()
            } catch (e) {}
          }

          let decrypted = msg.content
          if (sharedKeyRef.current && isCiphertext(msg.content)) {
            try {
              decrypted = await decryptMessage(msg.content, sharedKeyRef.current)
            } catch {
              decrypted = '[Mensaje cifrado - clave no disponible]'
            }
          }

          const newMsg: Message = {
            id: msg.message_id,
            sender: msg.sender,
            sender_email: (msg as any).sender_email || '',
            encrypted_content: msg.content,
            decrypted_content: decrypted,
            message_type: (msg.msg_type as 'Text' | 'Audio') ?? 'Text',
            timestamp: msg.timestamp,
            is_mine: msg.sender === user?.id,
            status: 'delivered',
          }

          setMessages((prev) => {
            if (prev.some((m) => m.id === msg.message_id)) return prev
            return [...prev, newMsg]
          })

          // Actualizar last_message en la lista de conversaciones con el mensaje descifrado
          setConversations((prev) =>
            prev.map((c) =>
              c.id === conv.id ? { ...c, last_message: newMsg } : c
            )
          )
        }

        if (msg.type === 'delete_notification') {
          if (msg.is_permanent) {
            setMessages((prev) => prev.filter((m) => m.id !== msg.message_id))
          }
        }
      }

      ws.onerror = (err) => {
        console.error('[WS] Error en la conexión:', err)
      }

      ws.onclose = (event) => {
        console.warn('[WS] Conexión cerrada:', event.code, event.reason)
        // Intentar reconectar solo si la conversación sigue activa y no fue un cierre intencional
        if (wsRef.current === ws) {
          console.log('[WS] Reintentando conexión en 3 segundos...')
          setTimeout(() => {
            if (activeConversation?.id === conv.id) selectConversation(conv)
          }, 3000)
        }
      }
    },
    [activeConversation?.id, closeWS, user?.id]
  )

  const sendMessage = useCallback(async (text: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return
    if (!sharedKeyRef.current) {
      console.error('[E2EE] Intento de enviar mensaje sin llave compartida')
      return
    }

    const content = await encryptMessage(text, sharedKeyRef.current)

    wsRef.current.send(
      JSON.stringify({ action: 'send_message', encrypted_content: content, type: 'Text' })
    )
  }, [])

  const requestDelete = useCallback((messageId: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return
    wsRef.current.send(JSON.stringify({ action: 'request_delete', message_id: messageId }))
  }, [])

  // Limpiar al desmontar
  useEffect(() => () => { closeWS() }, [closeWS])

  return (
    <ChatContext.Provider
      value={{
        conversations,
        activeConversation,
        messages,
        isLoadingConversations,
        isLoadingMessages,
        isEncrypted,
        selectConversation,
        sendMessage,
        requestDelete,
        refreshConversations,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export function useChat(): ChatContextValue {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error('useChat debe usarse dentro de <ChatProvider>')
  return ctx
}
