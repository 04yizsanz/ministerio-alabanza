import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

/**
 * AuthProvider envuelve toda la aplicación y expone:
 * - user: objeto del usuario autenticado (null si no hay sesión)
 * - login(email, password): inicia sesión con Sanctum SPA
 * - logout(): cierra la sesión
 * - loading: true mientras se verifica la sesión inicial
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  /**
   * Verifica si hay una sesión activa al cargar la app.
   * Sanctum usa cookies httpOnly, por eso no guardamos nada en
   * localStorage — simplemente preguntamos al backend quién soy.
   */
  const checkAuth = useCallback(async () => {
    try {
      const { data } = await api.get('/api/user')
      setUser(data)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  /**
   * Flujo de login con Sanctum SPA:
   * 1. GET /sanctum/csrf-cookie  → Laravel genera y envía la cookie XSRF-TOKEN
   * 2. POST /api/login           → autentica y crea la sesión
   * 3. GET /api/user             → recupera el usuario autenticado
   */
  const login = async (email, password) => {
    await api.get('/sanctum/csrf-cookie')
    await api.post('/api/login', { email, password })
    await checkAuth()
  }

  const logout = async () => {
    await api.post('/api/logout')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
