import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Shield, Lock, Eye, FileText, ChevronLeft, Mail } from 'lucide-react'

export default function PrivacyPage() {
  const requestMail =
    'mailto:privacy@chatbunker.app?subject=Solicitud%20de%20derechos%20de%20datos&body=Hola%20equipo%20ChatBunker,%0D%0A%0D%0AEjercito%20mi%20derecho%20de:%20[Acceso/Rectificacion/Supresion/Oposicion/Portabilidad].%0D%0A%0D%0ADatos%20de%20mi%20cuenta:%0D%0A-%20Email:%20%0D%0A-%20Nombre:%20%0D%0A%0D%0AAutorizo%20el%20uso%20de%20este%20correo%20para%20responder%20mi%20solicitud.%0D%0A'

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at 50% 0%, #1a1a1a 0%, #000 70%)',
        color: '#e8e8e8',
        fontFamily: 'Inter, sans-serif',
        padding: '40px 20px',
        overflowY: 'auto',
      }}
    >
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ maxWidth: 800, margin: '0 auto' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
          <div style={{ padding: 12, background: 'rgba(0, 243, 255, 0.1)', border: '1px solid rgba(0, 243, 255, 0.3)', borderRadius: 16 }}>
            <Shield size={32} color="#00f3ff" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em', background: 'linear-gradient(90deg, #00f3ff, #bc00ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Privacidad de Datos
            </h1>
            <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.4)', fontSize: 14, fontFamily: 'Space Mono' }}>
              PROTOCOL-V1.0 // ACTUALIZADO: MARZO 2026
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <Card 
            icon={<Lock size={20} color="#00f3ff" />}
            title="Cifrado de Extremo a Extremo (E2EE)"
            content="ChatBunker es un servicio de mensajería privada. Aplicamos cifrado de extremo a extremo en cliente (Double Ratchet Protocol) para proteger el contenido de tus mensajes. Ni siquiera nosotros podemos leer lo que envías."
          />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            <section style={glassSection}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <Eye size={18} color="#bc00ff" />
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>1. Datos que tratamos</h2>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <ListItem text="Email y Teléfono para identidad y recuperación." />
                <ListItem text="Nombre completo y Rol asignado." />
                <ListItem text="Metadatos técnicos: IP, tokens y registros de seguridad." />
                <ListItem text="Contenido de mensajes (Cifrado e ilegible para el servidor)." />
              </ul>
            </section>

            <section style={glassSection}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <FileText size={18} color="#39ff14" />
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>2. Finalidades</h2>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <ListItem text="Autenticación y control de acceso seguro." />
                <ListItem text="Operación del servicio de mensajería y búnkeres." />
                <ListItem text="Prevención de fraude y seguridad del sistema." />
                <ListItem text="Soporte técnico y resolución de conflictos." />
              </ul>
            </section>
          </div>

          <section style={glassSection}>
            <h2 style={{ fontSize: 20, marginBottom: 16, fontWeight: 700 }}>3. Derechos del titular</h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, marginBottom: 20 }}>
              Como usuario del Búnker, tienes pleno control sobre tu información. Puedes solicitar acceso, rectificación, supresión y portabilidad de tus datos en cualquier momento.
            </p>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)', marginBottom: 20 }}>
              <p style={{ margin: '0 0 10px', fontSize: 13, color: '#bc00ff', fontWeight: 600 }}>FLUJO DE ATENCIÓN:</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14 }}>
                <div style={{ display: 'flex', gap: 10 }}><span style={{ color: '#00f3ff' }}>01.</span> Solicitud vía canal oficial.</div>
                <div style={{ display: 'flex', gap: 10 }}><span style={{ color: '#00f3ff' }}>02.</span> Validación rigurosa de identidad.</div>
                <div style={{ display: 'flex', gap: 10 }}><span style={{ color: '#00f3ff' }}>03.</span> Respuesta en plazos legales.</div>
              </div>
            </div>
            <a href={requestMail} style={ctaButton}>
              <Mail size={16} />
              Iniciar solicitud de derechos
            </a>
          </section>
        </div>

        <footer style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <Link to="/login" style={backLink}>
              <ChevronLeft size={16} /> Volver al Login
            </Link>
            <Link to="/dashboard" style={backLink}>
              Ir al Dashboard
            </Link>
          </div>
          <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
            © 2026 ChatBunker Inc. // Todos los derechos reservados.
          </p>
        </footer>
      </motion.div>
    </div>
  )
}

function Card({ icon, title, content }: { icon: any, title: string, content: string }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 24, display: 'flex', gap: 20 }}>
      <div style={{ flexShrink: 0, width: 44, height: 44, background: 'rgba(255,255,255,0.03)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </div>
      <div>
        <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700, color: '#fff' }}>{title}</h3>
        <p style={{ margin: 0, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, fontSize: 15 }}>{content}</p>
      </div>
    </div>
  )
}

function ListItem({ text }: { text: string }) {
  return (
    <li style={{ display: 'flex', gap: 10, fontSize: 14, color: 'rgba(255,255,255,0.6)', alignItems: 'center' }}>
      <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#00f3ff' }} />
      {text}
    </li>
  )
}

const glassSection: CSSProperties = {
  background: 'rgba(0,0,0,0.3)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255,255,255,0.05)',
  borderRadius: 20,
  padding: 24,
}

const ctaButton: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 10,
  background: '#00f3ff',
  color: '#000',
  fontWeight: 700,
  textDecoration: 'none',
  padding: '12px 20px',
  borderRadius: 12,
  fontSize: 14,
  transition: 'transform 0.2s',
}

const backLink: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  color: 'rgba(255,255,255,0.4)',
  textDecoration: 'none',
  fontSize: 13,
  fontWeight: 600,
  transition: 'color 0.2s',
}
