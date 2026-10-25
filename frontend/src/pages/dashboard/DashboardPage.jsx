import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Music2, Users, CalendarDays, ClipboardList, Plus, ArrowRight } from 'lucide-react'
import api from '../../services/api'

function StatCard({ icon: Icon, label, value, color, loading }) {
  return (
    <div className="card flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        {loading
          ? <div className="h-7 w-12 bg-gray-200 animate-pulse rounded mt-1" />
          : <p className="text-2xl font-bold text-gray-900">{value ?? '—'}</p>
        }
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/dashboard/stats')
      .then(({ data }) => setStats(data.data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Resumen del ministerio</p>
        </div>
        <div className="flex gap-3">
          <Link to="/songs/new" className="btn-secondary flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" /> Nueva canción
          </Link>
          <Link to="/events/new" className="btn-primary flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" /> Nuevo evento
          </Link>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Music2}       label="Canciones"     value={stats?.songs_count}     color="bg-ministry-600" loading={loading} />
        <StatCard icon={Users}        label="Integrantes"   value={stats?.people_count}    color="bg-blue-500"     loading={loading} />
        <StatCard icon={CalendarDays} label="Eventos"       value={stats?.events_count}    color="bg-emerald-500"  loading={loading} />
        <StatCard icon={ClipboardList} label="Programaciones" value={stats?.schedules_count} color="bg-violet-500"  loading={loading} />
      </div>

      {/* Próximos eventos */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800">Próximos eventos</h2>
          <Link to="/events" className="text-sm text-ministry-600 hover:underline flex items-center gap-1">
            Ver todos <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="h-14 bg-gray-100 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : stats?.upcoming_events?.length ? (
          <div className="space-y-2">
            {stats.upcoming_events.map(event => (
              <Link
                key={event.id}
                to={`/events/${event.id}`}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-ministry-100 flex items-center justify-center flex-shrink-0">
                  <CalendarDays className="w-5 h-5 text-ministry-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">{event.name}</p>
                  <p className="text-xs text-gray-500">{event.start_date} · {event.event_type?.name}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <CalendarDays className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No hay eventos próximos</p>
            <Link to="/events/new" className="text-ministry-600 text-sm hover:underline mt-1 inline-block">
              Crear un evento
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
