/**
 * crypto.ts — Cifrado de Extremo a Extremo (E2EE) con Web Crypto API.
 *
 * Protocolo:
 *  1. Cada sesión genera un par de claves ECDH (P-256 ephemeral).
 *  2. La clave pública se exporta como base64 y se envía al partner via WebSocket.
 *  3. Con la clave pública del partner se deriva un secreto compartido ECDH.
 *  4. El secreto se usa para derivar una clave AES-GCM de 256 bits (via HKDF).
 *  5. Cada mensaje se cifra con un IV aleatorio de 12 bytes.
 *  6. El ciphertext viaja como: base64(IV):base64(ciphertext)
 */

const CURVE = 'P-256'
const ALGORITHM = { name: 'ECDH', namedCurve: CURVE }
const AES_ALGO = { name: 'AES-GCM', length: 256 }

// ─── Utilidades de conversión ────────────────────────────────────────────────

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary)
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes.buffer
}

// ─── Generación de claves ────────────────────────────────────────────────────

export interface KeyPair {
  privateKey: CryptoKey
  publicKeyBase64: string
}

export async function generateKeyPair(): Promise<KeyPair> {
  const keyPair = await crypto.subtle.generateKey(ALGORITHM, true, ['deriveKey', 'deriveBits'])

  const publicKeyRaw = await crypto.subtle.exportKey('raw', keyPair.publicKey)
  const publicKeyBase64 = arrayBufferToBase64(publicKeyRaw)

  return {
    privateKey: keyPair.privateKey,
    publicKeyBase64,
  }
}

// ─── Derivación de clave compartida ─────────────────────────────────────────

export async function deriveSharedKey(
  privateKey: CryptoKey,
  partnerPublicKeyBase64: string
): Promise<CryptoKey> {
  const partnerPublicKeyRaw = base64ToArrayBuffer(partnerPublicKeyBase64)

  const partnerPublicKey = await crypto.subtle.importKey(
    'raw',
    partnerPublicKeyRaw,
    ALGORITHM,
    false,
    []
  )

  // Derivar bits compartidos (ECDH)
  const sharedBits = await crypto.subtle.deriveBits(
    { name: 'ECDH', public: partnerPublicKey },
    privateKey,
    256
  )

  // Derivar clave AES-GCM final con HKDF
  const hkdfKey = await crypto.subtle.importKey('raw', sharedBits, 'HKDF', false, ['deriveKey'])

  const salt = new TextEncoder().encode('ChatBunker-E2EE-Salt-v1')
  const info = new TextEncoder().encode('ChatBunker-AES-GCM-Key')

  return crypto.subtle.deriveKey(
    { name: 'HKDF', hash: 'SHA-256', salt, info },
    hkdfKey,
    AES_ALGO,
    false,
    ['encrypt', 'decrypt']
  )
}

// ─── Cifrado ─────────────────────────────────────────────────────────────────

export async function encryptMessage(plaintext: string, sharedKey: CryptoKey): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encoded = new TextEncoder().encode(plaintext)

  const cipherBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    sharedKey,
    encoded
  )

  const ivB64 = arrayBufferToBase64(iv.buffer)
  const cipherB64 = arrayBufferToBase64(cipherBuffer)

  return `${ivB64}:${cipherB64}`
}

// ─── Descifrado ──────────────────────────────────────────────────────────────

export async function decryptMessage(ciphertext: string, sharedKey: CryptoKey): Promise<string> {
  const [ivB64, cipherB64] = ciphertext.split(':')
  if (!ivB64 || !cipherB64) throw new Error('Formato de ciphertext inválido')

  const iv = base64ToArrayBuffer(ivB64)
  const cipherBuffer = base64ToArrayBuffer(cipherB64)

  const plainBuffer = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    sharedKey,
    cipherBuffer
  )

  return new TextDecoder().decode(plainBuffer)
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Comprueba si un string parece ser ciphertext E2EE (IV:cipher en base64) */
export function isCiphertext(content: string): boolean {
  const parts = content.split(':')
  if (parts.length !== 2) return false
  try {
    atob(parts[0])
    atob(parts[1])
    return true
  } catch {
    return false
  }
}
