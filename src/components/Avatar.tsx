/**
 * Avatar.tsx — Avatar circular con efecto glow si el usuario está online.
 */

interface AvatarProps {
  name: string
  size?: 'sm' | 'md' | 'lg'
  isOnline?: boolean
  color?: 'cyan' | 'violet'
}

const SIZES = {
  sm: { outer: 36, inner: 32, dot: 8 },
  md: { outer: 44, inner: 40, dot: 10 },
  lg: { outer: 72, inner: 64, dot: 14 },
}

const COLORS = {
  cyan:   { glow: 'rgba(0, 243, 255, 0.6)', border: '#00f3ff', text: '#00f3ff' },
  violet: { glow: 'rgba(188, 0, 255, 0.6)', border: '#bc00ff', text: '#bc00ff' },
}

/** Genera un color determinista basado en el nombre */
function nameToColor(name: string): 'cyan' | 'violet' {
  const sum = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return sum % 2 === 0 ? 'cyan' : 'violet'
}

/** Iniciales del nombre */
function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

export default function Avatar({ name, size = 'md', isOnline, color }: AvatarProps) {
  const s = SIZES[size]
  const c = COLORS[color ?? nameToColor(name)]
  const init = initials(name) || '?'

  return (
    <div style={{ position: 'relative', width: s.outer, height: s.outer, flexShrink: 0 }}>
      {/* Ring exterior con glow */}
      <div
        style={{
          width: s.outer,
          height: s.outer,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `linear-gradient(135deg, ${c.border}, transparent)`,
          boxShadow: isOnline
            ? `0 0 8px ${c.glow}, 0 0 16px ${c.glow}40`
            : undefined,
          transition: 'box-shadow 0.3s ease',
        }}
      >
        {/* Círculo interior */}
        <div
          style={{
            width: s.inner,
            height: s.inner,
            borderRadius: '50%',
            background: '#111',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: c.text,
            fontSize: size === 'lg' ? 22 : size === 'md' ? 14 : 11,
            fontFamily: '"Space Mono", monospace',
            fontWeight: 700,
            letterSpacing: '0.05em',
          }}
        >
          {init}
        </div>
      </div>

      {/* Indicador online */}
      {isOnline !== undefined && (
        <span
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: s.dot,
            height: s.dot,
            borderRadius: '50%',
            background: isOnline ? '#39ff14' : '#444',
            border: '2px solid #0b0b0b',
            boxShadow: isOnline ? '0 0 6px rgba(57, 255, 20, 0.8)' : undefined,
          }}
        />
      )}
    </div>
  )
}
