import axios from 'axios'

/**
 * Con el proxy de Vite configurado en vite.config.js, todas las peticiones
 * a /api/* y /sanctum/* se reenvían automáticamente a Laravel (puerto 8000)
 * pero el navegador las ve como peticiones al mismo origen (puerto 5173).
 *
 * Esto resuelve el problema de cookies entre puertos distintos en desarrollo.
 *
 * baseURL vacío = peticiones relativas al origen actual del navegador.
 * withCredentials: true sigue siendo necesario para enviar la cookie de sesión.
 */
const api = axios.create({
  baseURL: '',
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status

    if (status === 401) {
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

export default api
