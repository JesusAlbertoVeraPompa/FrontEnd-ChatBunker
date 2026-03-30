import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, Mail, Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    try {
      await login({ email, password })
      navigate('/dashboard')
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } }
      setError(e?.response?.data?.detail ?? 'Credenciales incorrectas.')
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
            MENSAJERÍA PRIVADA E2EE
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
          }}
        >
          <h2 style={{ margin: '0 0 24px', color: '#e0e0e0', fontSize: 18, fontWeight: 600 }}>
            Acceder
          </h2>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
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

          <form onSubmit={handleSubmit}>
            <InputField
              icon={<Mail size={16} />}
              type="email"
              placeholder="Email"
              value={email}
              onChange={setEmail}
              required
            />

            <div style={{ position: 'relative', marginBottom: 20 }}>
              <InputField
                icon={<Lock size={16} />}
                type={showPass ? 'text' : 'password'}
                placeholder="Contraseña"
                value={password}
                onChange={setPassword}
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'rgba(255,255,255,0.4)',
                  display: 'flex',
                  padding: 4,
                }}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              whileTap={{ scale: 0.98 }}
              style={{
                width: '100%',
                padding: '13px 0',
                background: isLoading
                  ? 'rgba(0, 243, 255, 0.2)'
                  : 'linear-gradient(135deg, #00f3ff, #bc00ff)',
                border: 'none',
                borderRadius: 12,
                color: isLoading ? '#00f3ff' : '#000',
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: '0.1em',
                cursor: isLoading ? 'default' : 'pointer',
                boxShadow: isLoading ? undefined : '0 0 20px rgba(0, 243, 255, 0.4)',
                transition: 'all 0.2s',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {isLoading ? 'CONECTANDO...' : 'ENTRAR AL BUNKER'}
            </motion.button>
          </form>

          <p style={{ margin: '20px 0 0', textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
            ¿Sin cuenta?{' '}
            <Link
              to="/register"
              style={{ color: '#00f3ff', textDecoration: 'none', fontWeight: 600 }}
            >
              Registrarse
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

// ─── Componente interno de input ──────────────────────────────────────────────

interface InputFieldProps {
  icon: React.ReactNode
  type: string
  placeholder: string
  value: string
  onChange: (v: string) => void
  required?: boolean
}

function InputField({ icon, type, placeholder, value, onChange, required }: InputFieldProps) {
  const [focused, setFocused] = useState(false)

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        background: 'rgba(255,255,255,0.04)',
        border: `1px solid ${focused ? '#00f3ff' : 'rgba(255,255,255,0.1)'}`,
        borderRadius: 12,
        padding: '10px 14px',
        marginBottom: 14,
        boxShadow: focused ? '0 0 12px rgba(0, 243, 255, 0.2)' : undefined,
        transition: 'border-color 0.2s, box-shadow 0.2s',
      }}
    >
      <span style={{ color: focused ? '#00f3ff' : 'rgba(255,255,255,0.3)', flexShrink: 0 }}>
        {icon}
      </span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        required={required}
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
    </div>
  )
}
