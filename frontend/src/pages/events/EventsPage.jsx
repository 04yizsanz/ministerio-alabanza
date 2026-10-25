import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, Plus, ChevronRight, Archive } from 'lucide-react'
import { eventsService } from '../../services/events'
import Alert from '../../components/ui/Alert'
import Spinner from '../../components/ui/Spinner'
import Pagination from '../../components/ui/Pagination'

const statusLabel  = { draft: 'Borrador', published: 'Publicado', archived: 'Archivado' }
const statusColor  = {
  draft:     'bg-gray-100 text-gray-600',
  published: 'bg-green-100 text-green-700',
  archived:  'bg-orange-100 text-orange-600',
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d + 'T12:00:00').toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function EventsPage() {
  const [events, setEvents]   = useState([])
  const [meta, setMeta]       = useState(null)
  const [types, setTypes]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [filters, setFilters] = useState({ event_type_id: '', status: '', page: 1 })

  const load = async (f = filters) => {
    setLoading(true)
    try {
      const params = { page: f.page }
      if (f.event_type_id) params.event_type_id = f.event_type_id
      if (f.status)        params.status        = f.status
      const { data } = await eventsService.getAll(params)
      setEvents(data.data)
      setMeta(data)
    } catch {
      setError('No se pudieron cargar los eventos.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    Promise.all([load(), eventsService.getTypes()])
      .then(([, t]) => setTypes(t.data))
      .catch(() => {})
  }, []) // eslint-disable-line

  const handleFilter = (key, value) => {
    const updated = { ...filters, [key]: value, page: 1 }
    setFilters(updated)
    load(updated)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Eventos</h1>
          <p className="text-sm text-gray-500 mt-0.5">{meta?.total ?? '—'} eventos registrados</p>
        </div>
        <Link to="/events/new" className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> Nuevo evento
        </Link>
      </div>

      <Alert type="error" message={error} onClose={() => setError('')} />

      {/* Filtros */}
      <div className="card p-4 flex flex-wrap gap-3">
        <select className="form-input w-44" value={filters.event_type_id} onChange={e => handleFilter('event_type_id', e.target.value)}>
          <option value="">Todos los tipos</option>
          {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <select className="form-input w-36" value={filters.status} onChange={e => handleFilter('status', e.target.value)}>
          <option value="">Todos los estados</option>
          <option value="draft">Borrador</option>
          <option value="published">Publicado</option>
          <option value="archived">Archivado</option>
        </select>
      </div>

      {/* Lista */}
      <div className="space-y-2">
        {loading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : events.length === 0 ? (
          <div className="card text-center py-16 text-gray-400">
            <CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No hay eventos registrados.</p>
            <Link to="/events/new" className="text-ministry-600 text-sm hover:underline mt-2 inline-block">
              Crear el primer evento
            </Link>
          </div>
        ) : events.map(event => (
          <Link
            key={event.id}
            to={`/events/${event.id}`}
            className="card flex items-center gap-4 hover:shadow-md transition-shadow p-4"
          >
            {/* Color del tipo de evento */}
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: event.event_type?.color + '22' }}
            >
              <CalendarDays className="w-5 h-5" style={{ color: event.event_type?.color }} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-gray-900 truncate">{event.name}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[event.status]}`}>
                  {statusLabel[event.status]}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-0.5">
                {event.event_type?.name} · {formatDate(event.start_date)}
                {event.end_date && event.end_date !== event.start_date && ` — ${formatDate(event.end_date)}`}
              </p>
            </div>

            <div className="flex items-center gap-3 text-gray-400 flex-shrink-0">
              <span className="text-xs">{event.schedule_blocks_count} bloque(s)</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </Link>
        ))}
      </div>

      {meta && (
        <Pagination
          meta={meta}
          onPageChange={page => { const f = { ...filters, page }; setFilters(f); load(f) }}
        />
      )}
    </div>
  )
}
