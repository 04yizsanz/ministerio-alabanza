/**
 * ToastContext — Sistema de notificaciones flotantes.
 *
 * Uso en cualquier componente:
 *   const { toast } = useToast()
 *   toast.success('Canción guardada.')
 *   toast.error('No se pudo guardar.')
 *   toast.info('Procesando...')
 *
 * Los toasts desaparecen solos después de 4 segundos.
 */

import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react'

const ToastContext = createContext(null)

let nextId = 0

const ICONS = {
  success: CheckCircle,
  error:   XCircle,
  info:    AlertCircle,
}

const COLORS = {
  success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  error:   'bg-red-50 border-red-200 text-red-800',
  info:    'bg-blue-50 border-blue-200 text-blue-800',
}

const ICON_COLORS = {
  success: 'text-emerald-500',
  error:   'text-red-500',
  info:    'text-blue-500',
}

// ─── Toast individual ─────────────────────────────────────────────────────────
function Toast({ id, type, message, onDismiss }) {
  const Icon = ICONS[type] ?? AlertCircle

  // Auto-dismiss después de 4 segundos
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(id), 4000)
    return () => clearTimeout(timer)
  }, [id, onDismiss])

  return (
    <div
      className={`
        flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg
        max-w-sm w-full pointer-events-auto
        animate-in slide-in-from-right-5 fade-in duration-300
        ${COLORS[type]}
      `}
    >
      <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${ICON_COLORS[type]}`} />
      <p className="flex-1 text-sm font-medium leading-snug">{message}</p>
      <button
        onClick={() => onDismiss(id)}
        className="flex-shrink-0 opacity-50 hover:opacity-100 transition-opacity"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const show = useCallback((type, message) => {
    const id = ++nextId
    setToasts(prev => [...prev, { id, type, message }])
  }, [])

  const toast = {
    success: (msg) => show('success', msg),
    error:   (msg) => show('error',   msg),
    info:    (msg) => show('info',    msg),
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Contenedor de toasts — esquina inferior derecha */}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <Toast
            key={t.id}
            id={t.id}
            type={t.type}
            message={t.message}
            onDismiss={dismiss}
          />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast debe usarse dentro de <ToastProvider>')
  return ctx
}
