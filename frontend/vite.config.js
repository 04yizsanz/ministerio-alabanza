import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * El proxy de Vite resuelve el problema de CORS y cookies entre puertos.
 *
 * Sin proxy: React (5173) → Laravel (8000) = orígenes distintos,
 *            el navegador bloquea las cookies de sesión de Sanctum.
 *
 * Con proxy: React hace peticiones a /api y /sanctum en su PROPIO puerto (5173).
 *            Vite las reenvía internamente a Laravel (8000).
 *            El navegador ve todo en el mismo origen → cookies funcionan.
 *
 * Esto significa que en el frontend usamos rutas relativas:
 *   api.get('/api/user')        en lugar de   api.get('http://localhost:8000/api/user')
 */
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      // Todas las peticiones a /api/* se reenvían a Laravel
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      // La cookie CSRF de Sanctum también pasa por el proxy
      '/sanctum': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
