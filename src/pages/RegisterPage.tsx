import { Navigate } from 'react-router-dom'

/**
 * RegisterPage — Obsoleto. El registro se maneja mediante Social Login en LoginPage.
 */
export default function RegisterPage() {
  return <Navigate to="/login" replace />
}
