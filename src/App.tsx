import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { ChatProvider } from '@/context/ChatContext'
import LoginPage from '@/pages/LoginPage'
import DashboardPage from '@/pages/DashboardPage'

// ─── Ruta protegida ───────────────────────────────────────────────────────────

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#000',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            border: '2px solid rgba(0, 243, 255, 0.15)',
            borderTopColor: '#00f3ff',
            animation: 'spin 1s linear infinite',
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <span
          style={{
            color: 'rgba(0, 243, 255, 0.6)',
            fontFamily: '"Space Mono", monospace',
            fontSize: 11,
            letterSpacing: '0.2em',
          }}
        >
          AUTENTICANDO...
        </span>
      </div>
    )
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

// ─── Ruta pública (redirige al dashboard si ya está logueado) ─────────────────

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) return null
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <>{children}</>
}

// ─── App ──────────────────────────────────────────────────────────────────────

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />

      {/* Redirigir registro al login ya que usamos Social Login únicamente */}
      <Route path="/register" element={<Navigate to="/login" replace />} />

      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <ChatProvider>
              <DashboardPage />
            </ChatProvider>
          </PrivateRoute>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
