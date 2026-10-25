import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

/**
 * ProtectedRoute: si no hay sesión, redirige al login.
 * Mientras se verifica la sesión inicial muestra un spinner
 * para evitar un flash de la pantalla de login.
 */
export default function ProtectedRoute() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-ministry-600" />
      </div>
    )
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />
}
