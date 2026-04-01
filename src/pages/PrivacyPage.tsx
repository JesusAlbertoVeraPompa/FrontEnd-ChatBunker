import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'

export default function PrivacyPage() {
  const requestMail =
    'mailto:privacy@chatbunker.app?subject=Solicitud%20de%20derechos%20de%20datos&body=Hola%20equipo%20ChatBunker,%0D%0A%0D%0AEjercito%20mi%20derecho%20de:%20[Acceso/Rectificacion/Supresion/Oposicion/Portabilidad].%0D%0A%0D%0ADatos%20de%20mi%20cuenta:%0D%0A-%20Email:%20%0D%0A-%20Nombre:%20%0D%0A%0D%0AAutorizo%20el%20uso%20de%20este%20correo%20para%20responder%20mi%20solicitud.%0D%0A'

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#050505',
        color: '#e8e8e8',
        fontFamily: 'Inter, sans-serif',
        padding: '28px 18px',
      }}
    >
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <h1 style={{ marginTop: 0, fontSize: 28, letterSpacing: '0.03em' }}>
          Politica de Privacidad y Aviso de Tratamiento
        </h1>

        <p style={{ color: 'rgba(255,255,255,0.72)', lineHeight: 1.6 }}>
          ChatBunker es un servicio de mensajeria privada. Aplicamos cifrado de extremo a
          extremo en cliente para proteger el contenido de mensajes. Aun asi, tratamos datos
          personales necesarios para operar la plataforma (por ejemplo: email, telefono,
          identificadores tecnicos y metadatos de seguridad).
        </p>

        <section style={sectionStyle}>
          <h2 style={titleStyle}>1. Datos que tratamos</h2>
          <p style={pStyle}>- Datos de cuenta: email, nombre, telefono, rol y estado de verificacion.</p>
          <p style={pStyle}>- Datos tecnicos: IP, tokens, registros de seguridad, eventos de autenticacion.</p>
          <p style={pStyle}>- Datos de chat: contenido cifrado, marcas de tiempo y metadatos operativos.</p>
        </section>

        <section style={sectionStyle}>
          <h2 style={titleStyle}>2. Finalidades</h2>
          <p style={pStyle}>- Autenticacion, control de acceso y seguridad antifraude.</p>
          <p style={pStyle}>- Prestacion del servicio de mensajeria cifrada y soporte tecnico.</p>
          <p style={pStyle}>- Cumplimiento de obligaciones legales y atencion de requerimientos de autoridad.</p>
        </section>

        <section style={sectionStyle}>
          <h2 style={titleStyle}>3. Conservacion y seguridad</h2>
          <p style={pStyle}>
            Aplicamos medidas tecnicas y organizativas de seguridad. Los enlaces firmados para
            descarga de media tienen vigencia limitada. Conservamos datos personales solo por el
            tiempo necesario segun finalidad, obligaciones legales y defensa ante reclamaciones.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={titleStyle}>4. Derechos del titular</h2>
          <p style={pStyle}>Puedes solicitar acceso, rectificacion, actualizacion, supresion y oposicion al tratamiento.</p>
          <p style={pStyle}>Flujo de atencion integrado:</p>
          <p style={pStyle}>1. Envia tu solicitud por el canal oficial.</p>
          <p style={pStyle}>2. Validamos identidad para proteger tu cuenta.</p>
          <p style={pStyle}>3. Respondemos dentro de los plazos legales aplicables.</p>
          <p style={pStyle}>4. Ejecutamos la accion solicitada o explicamos la base legal de no procedencia.</p>

          <a
            href={requestMail}
            style={{
              display: 'inline-block',
              marginTop: 10,
              background: '#00e7ff',
              color: '#071018',
              fontWeight: 700,
              textDecoration: 'none',
              padding: '10px 14px',
              borderRadius: 10,
            }}
          >
            Iniciar solicitud de derechos
          </a>
        </section>

        <section style={sectionStyle}>
          <h2 style={titleStyle}>5. Contacto de privacidad</h2>
          <p style={pStyle}>Correo: privacy@chatbunker.app</p>
          <p style={pStyle}>Ultima actualizacion: 31 de marzo de 2026</p>
        </section>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 24 }}>
          <Link to="/login" style={linkStyle}>
            Volver a login
          </Link>
          <Link to="/dashboard" style={linkStyle}>
            Ir al dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}

const sectionStyle: CSSProperties = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 14,
  padding: '14px 16px',
  marginTop: 14,
}

const titleStyle: CSSProperties = {
  margin: '0 0 10px',
  fontSize: 17,
}

const pStyle: CSSProperties = {
  margin: '0 0 8px',
  color: 'rgba(255,255,255,0.74)',
  lineHeight: 1.55,
}

const linkStyle: CSSProperties = {
  background: 'transparent',
  border: '1px solid rgba(0,231,255,0.45)',
  color: '#a4f8ff',
  textDecoration: 'none',
  borderRadius: 10,
  padding: '9px 12px',
  fontSize: 13,
}

