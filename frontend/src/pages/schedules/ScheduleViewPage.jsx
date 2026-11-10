/**
 * ScheduleViewPage — Vista de la programación completa de un evento.
 *
 * Esta página renderiza la plantilla visual apropiada según el tipo de evento:
 *   - "Domingo"  →  DomingoTemplate
 *   - "CDO"      →  CdoTemplate
 *   - Otros      →  GeneralTemplate
 *
 * La URL es: /events/:id/schedule
 *
 * Desde aquí también se puede imprimir (Ctrl+P) o exportar a PDF/Excel
 * (funcionalidad a agregar en Día 5).
 */

import { useEffect, useState, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Printer, FileSpreadsheet, Edit } from 'lucide-react'
import { eventsService, blocksService } from '../../services/events'
import api from '../../services/api'
import Spinner from '../../components/ui/Spinner'
import Alert from '../../components/ui/Alert'
import DomingoTemplate from '../../components/schedules/DomingoTemplate'
import CdoTemplate from '../../components/schedules/CdoTemplate'
import GeneralTemplate from '../../components/schedules/GeneralTemplate'

export default function ScheduleViewPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [event, setEvent]   = useState(null)
  const [blocks, setBlocks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState('')
  const printRef = useRef(null)

  useEffect(() => {
    Promise.all([
      eventsService.getOne(id),
      blocksService.getAll(id),
    ]).then(([ev, bl]) => {
      setEvent(ev.data)
      setBlocks(bl.data)
    }).catch(() => setError('No se pudo cargar la programación.'))
      .finally(() => setLoading(false))
  }, [id])

  const handlePrint = () => window.print()

  const handleExcelDownload = async () => {
    try {
      // Descarga binaria autenticada via axios (mantiene la cookie de sesión)
      const response = await api.get(`/api/events/${id}/export/excel`, {
        responseType: 'blob',
      })
      // Crear un enlace temporal para disparar la descarga
      const url      = window.URL.createObjectURL(new Blob([response.data]))
      const link     = document.createElement('a')
      const name     = event.name.replace(/[^a-z0-9]/gi, '_')
      link.href      = url
      link.download  = `programacion_${name}.xlsx`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch {
      setError('No se pudo descargar el archivo Excel.')
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Spinner size="lg" />
        <p className="text-sm text-gray-400">Cargando programación...</p>
      </div>
    )
  }

  if (!event) return <Alert type="error" message={error || 'Evento no encontrado.'} />

  const typeName = (event.event_type?.name || '').toLowerCase()
  const isDomingo = typeName.includes('domingo')
  const isCdo     = typeName.includes('cdo')

  return (
    <div className="space-y-4">
      {/* ── Barra de control (solo visible en pantalla, no al imprimir) ── */}
      <div className="flex items-center justify-between no-print">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/events/${id}`)}
            className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-semibold text-gray-800">{event.name}</h1>
            <p className="text-xs text-gray-400">Vista de programación</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/events/${id}`}
            className="btn-secondary text-sm flex items-center gap-2"
          >
            <Edit className="w-4 h-4" /> Editar
          </Link>
          <button
            onClick={handleExcelDownload}
            className="btn-secondary text-sm flex items-center gap-2"
            title="Descargar como Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Excel
          </button>
          <button
            onClick={handlePrint}
            className="btn-primary text-sm flex items-center gap-2"
          >
            <Printer className="w-4 h-4" /> Imprimir / PDF
          </button>
        </div>
      </div>

      <Alert type="error" message={error} onClose={() => setError('')} />

      {/* ── Plantilla visual ── */}
      <div ref={printRef} className="print-area">
        {isDomingo && <DomingoTemplate event={event} blocks={blocks} />}
        {isCdo     && <CdoTemplate     event={event} blocks={blocks} />}
        {!isDomingo && !isCdo && <GeneralTemplate event={event} blocks={blocks} />}
      </div>
    </div>
  )
}
