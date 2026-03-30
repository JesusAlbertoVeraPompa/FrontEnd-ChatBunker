import { useState } from 'react'
import { motion } from 'framer-motion'
import { ShieldCheck, Loader2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export default function LoginPage() {
  const { socialLogin } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    setError(null)
    try {
      // 1. Simulación o integración real con Google SDK
      // Para pruebas, el token debe obtenerse de Google
      const mockToken = "GOOGLE_TOKEN_HERE" 
      await socialLogin(mockToken, 'google')
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? 'Error al conectar con Google.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Fondo decorativo */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 80% 60% at 20% 40%, rgba(0, 243, 255, 0.05) 0%, transparent 60%), ' +
            'radial-gradient(ellipse 60% 80% at 80% 60%, rgba(188, 0, 255, 0.05) 0%, transparent 60%)',
          pointerEvents: 'none',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ width: '100%', maxWidth: 400 }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'rgba(0, 243, 255, 0.08)',
              border: '1px solid rgba(0, 243, 255, 0.3)',
              boxShadow: '0 0 20px rgba(0, 243, 255, 0.2)',
              marginBottom: 16,
            }}
          >
            <ShieldCheck size={32} color="#00f3ff" />
          </div>
          <h1
            style={{
              margin: 0,
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: '0.1em',
              background: 'linear-gradient(90deg, #00f3ff, #bc00ff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            CHATBUNKER
          </h1>
          <p
            style={{
              margin: '6px 0 0',
              color: 'rgba(255,255,255,0.4)',
              fontSize: 12,
              fontFamily: '"Space Mono", monospace',
              letterSpacing: '0.2em',
            }}
          >
            ACCESO PRIVADO E2EE
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            background: 'rgba(255,255,255,0.03)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(0, 243, 255, 0.15)',
            borderRadius: 20,
            padding: '32px 28px',
            boxShadow: '0 0 40px rgba(0, 243, 255, 0.05)',
            textAlign: 'center'
          }}
        >
          <h2 style={{ margin: '0 0 12px', color: '#e0e0e0', fontSize: 18, fontWeight: 600 }}>
            Bienvenido al Bunker
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginBottom: 32 }}>
            Inicia sesión de forma segura para acceder a tus conversaciones cifradas.
          </p>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                background: 'rgba(255, 0, 0, 0.08)',
                border: '1px solid rgba(255, 60, 60, 0.4)',
                borderRadius: 10,
                padding: '10px 14px',
                color: '#ff6b6b',
                fontSize: 13,
                marginBottom: 20,
              }}
            >
              {error}
            </motion.div>
          )}

          <motion.button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            whileTap={{ scale: 0.98 }}
            style={{
              width: '100%',
              padding: '14px 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              background: '#fff',
              border: 'none',
              borderRadius: 12,
              color: '#000',
              fontSize: 14,
              fontWeight: 700,
              cursor: isLoading ? 'default' : 'pointer',
              transition: 'all 0.2s',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" alt="Google" style={{ width: 20 }} />
                <span>ACCEDER CON GOOGLE</span>
              </>
            )}
          </motion.button>

          <p style={{ marginTop: 24, fontSize: 11, color: 'rgba(255,255,255,0.2)', fontFamily: '"Space Mono", monospace' }}>
            Protegido por protocolos de cifrado militar AES-256
          </p>
        </div>
      </motion.div>
    </div>
  )
}
