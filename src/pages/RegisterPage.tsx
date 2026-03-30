import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, User, Calendar, ShieldCheck, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    birth_date: '',
  })
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const set = (key: string) => (v: string) => setForm((f) => ({ ...f, [key]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    try {
      await register(form)
      setSuccess(true)
      setTimeout(() => navigate('/login'), 3000)
    } catch (err: unknown) {
      const e = err as { response?: { data?: Record<string, unknown> } }
      const data = e?.response?.data
      if (data) {
        const first = Object.values(data)[0]
        setError(Array.isArray(first) ? (first[0] as string) : String(first))
      } else {
        setError('Error al registrarse. Intenta de nuevo.')
      }
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
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 70% 60% at 80% 30%, rgba(188, 0, 255, 0.05) 0%, transparent 60%), ' +
            'radial-gradient(ellipse 60% 80% at 20% 70%, rgba(0, 243, 255, 0.05) 0%, transparent 60%)',
          pointerEvents: 'none',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ width: '100%', maxWidth: 440 }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'rgba(188, 0, 255, 0.08)',
              border: '1px solid rgba(188, 0, 255, 0.3)',
              boxShadow: '0 0 20px rgba(188, 0, 255, 0.2)',
              marginBottom: 14,
            }}
          >
            <ShieldCheck size={28} color="#bc00ff" />
          </div>
          <h1
            style={{
              margin: 0,
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: '0.1em',
              background: 'linear-gradient(90deg, #bc00ff, #00f3ff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            CHATBUNKER
          </h1>
          <p
            style={{
              margin: '4px 0 0',
              color: 'rgba(255,255,255,0.4)',
              fontSize: 11,
              fontFamily: '"Space Mono", monospace',
              letterSpacing: '0.2em',
            }}
          >
            NUEVA IDENTIDAD
          </p>
        </div>

        <div
          style={{
            background: 'rgba(255,255,255,0.03)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(188, 0, 255, 0.15)',
            borderRadius: 20,
            padding: '28px 28px',
            boxShadow: '0 0 40px rgba(188, 0, 255, 0.05)',
          }}
        >
          <h2 style={{ margin: '0 0 20px', color: '#e0e0e0', fontSize: 18, fontWeight: 600 }}>
            Crear cuenta
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
                marginBottom: 16,
              }}
            >
              {error}
            </motion.div>
          )}

          {success ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                background: 'rgba(57, 255, 20, 0.08)',
                border: '1px solid rgba(57, 255, 20, 0.4)',
                borderRadius: 10,
                padding: '16px',
                color: '#39ff14',
                fontSize: 14,
                textAlign: 'center',
              }}
            >
              ✓ Cuenta creada. Revisa tu email para verificarla.
              <br />
              <span style={{ opacity: 0.6, fontSize: 12 }}>Redirigiendo al login...</span>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <RegInput icon={<User size={14} />} placeholder="Nombre" value={form.first_name} onChange={set('first_name')} required />
                <RegInput icon={<User size={14} />} placeholder="Apellido" value={form.last_name} onChange={set('last_name')} required />
              </div>

              <RegInput icon={<Mail size={14} />} type="email" placeholder="Email" value={form.email} onChange={set('email')} required />

              <div style={{ position: 'relative' }}>
                <RegInput
                  icon={<Lock size={14} />}
                  type={showPass ? 'text' : 'password'}
                  placeholder="Contraseña"
                  value={form.password}
                  onChange={set('password')}
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
                    padding: 4,
                    display: 'flex',
                  }}
                >
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>

              <RegInput
                icon={<Calendar size={14} />}
                type="date"
                placeholder="Fecha de nacimiento"
                value={form.birth_date}
                onChange={set('birth_date')}
                required
              />

              <motion.button
                type="submit"
                disabled={isLoading}
                whileTap={{ scale: 0.98 }}
                style={{
                  width: '100%',
                  padding: '12px 0',
                  marginTop: 4,
                  background: isLoading
                    ? 'rgba(188, 0, 255, 0.2)'
                    : 'linear-gradient(135deg, #bc00ff, #00f3ff)',
                  border: 'none',
                  borderRadius: 12,
                  color: isLoading ? '#bc00ff' : '#000',
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  cursor: isLoading ? 'default' : 'pointer',
                  boxShadow: isLoading ? undefined : '0 0 20px rgba(188, 0, 255, 0.4)',
                  transition: 'all 0.2s',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                {isLoading ? 'CREANDO...' : 'CREAR IDENTIDAD'}
              </motion.button>
            </form>
          )}

          <p style={{ margin: '18px 0 0', textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" style={{ color: '#bc00ff', textDecoration: 'none', fontWeight: 600 }}>
              Acceder
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

function RegInput({
  icon,
  type = 'text',
  placeholder,
  value,
  onChange,
  required,
}: {
  icon: React.ReactNode
  type?: string
  placeholder: string
  value: string
  onChange: (v: string) => void
  required?: boolean
}) {
  const [focused, setFocused] = useState(false)
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        background: 'rgba(255,255,255,0.04)',
        border: `1px solid ${focused ? '#bc00ff' : 'rgba(255,255,255,0.1)'}`,
        borderRadius: 10,
        padding: '9px 12px',
        marginBottom: 12,
        boxShadow: focused ? '0 0 10px rgba(188, 0, 255, 0.2)' : undefined,
        transition: 'border-color 0.2s, box-shadow 0.2s',
      }}
    >
      <span style={{ color: focused ? '#bc00ff' : 'rgba(255,255,255,0.3)', flexShrink: 0 }}>
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
          fontSize: 13,
          fontFamily: 'Inter, sans-serif',
          colorScheme: 'dark',
        }}
      />
    </div>
  )
}
