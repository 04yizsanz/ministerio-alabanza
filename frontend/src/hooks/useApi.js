import { useState, useCallback } from 'react'

/**
 * Hook genérico para manejar el estado de una llamada a la API.
 * Evita repetir loading/error/data en cada componente.
 *
 * Uso:
 *   const { data, loading, error, execute } = useApi()
 *   await execute(() => songsService.getAll({ search: 'amor' }))
 */
export function useApi() {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  const execute = useCallback(async (apiCall) => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiCall()
      setData(response.data)
      return response.data
    } catch (err) {
      const message = err.response?.data?.message || 'Error inesperado. Intenta de nuevo.'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { data, loading, error, execute }
}

/**
 * Extrae los mensajes de error de validación (422) de Laravel
 * y los convierte en un objeto { campo: 'mensaje' }
 */
export function parseValidationErrors(err) {
  const errors = err.response?.data?.errors
  if (!errors) return {}
  // Laravel devuelve arrays de mensajes por campo; tomamos el primero
  return Object.fromEntries(
    Object.entries(errors).map(([field, messages]) => [field, messages[0]])
  )
}
