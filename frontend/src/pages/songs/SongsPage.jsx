import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Music2, Edit, ToggleLeft, ToggleRight, X } from 'lucide-react'
import { songsService } from '../../services/songs'
import Spinner from '../../components/ui/Spinner'
import Alert from '../../components/ui/Alert'
import Pagination from '../../components/ui/Pagination'

const KEYS = ['C','C#','Db','D','D#','Eb','E','F','F#','Gb','G','G#','Ab','A','A#','Bb','B',
              'Cm','C#m','Dbm','Dm','D#m','Ebm','Em','Fm','F#m','Gbm','Gm','G#m','Abm','Am','A#m','Bbm','Bm']

export default function SongsPage() {
  const [songs, setSongs]     = useState([])
  const [meta, setMeta]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [filters, setFilters] = useState({ search: '', key: '', active: '', page: 1 })

  const load = async (f = filters) => {
    setLoading(true)
    try {
      const params = { page: f.page }
      if (f.search) params.search = f.search
      if (f.key)    params.key    = f.key
      if (f.active !== '') params.active = f.active
      const { data } = await songsService.getAll(params)
      setSongs(data.data)
      setMeta(data)
    } catch {
      setError('No se pudo cargar el catálogo.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, []) // eslint-disable-line

  const handleFilter = (key, value) => {
    const updated = { ...filters, [key]: value, page: 1 }
    setFilters(updated)
    load(updated)
  }

  const handleToggle = async (song) => {
    try {
      await songsService.toggle(song.id)
      setSongs(prev => prev.map(s => s.id === song.id ? { ...s, is_active: !s.is_active } : s))
    } catch {
      setError('No se pudo cambiar el estado.')
    }
  }

  return (
    <div className="space-y-5">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Catálogo de canciones</h1>
          <p className="text-sm text-gray-500 mt-0.5">{meta?.total ?? '—'} canciones registradas</p>
        </div>
        <Link to="/songs/new" className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> Nueva canción
        </Link>
      </div>

      <Alert type="error" message={error} onClose={() => setError('')} />

      {/* Filtros */}
      <div className="card p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por título o artista..."
            className="form-input pl-9"
            value={filters.search}
            onChange={e => handleFilter('search', e.target.value)}
          />
        </div>
        <select
          className="form-input w-40"
          value={filters.key}
          onChange={e => handleFilter('key', e.target.value)}
        >
          <option value="">Todas las tonalidades</option>
          {KEYS.map(k => <option key={k} value={k}>{k}</option>)}
        </select>
        <select
          className="form-input w-36"
          value={filters.active}
          onChange={e => handleFilter('active', e.target.value)}
        >
          <option value="">Todas</option>
          <option value="true">Activas</option>
          <option value="false">Inactivas</option>
        </select>
      </div>

      {/* Tabla */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : songs.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Music2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No hay canciones que coincidan con los filtros.</p>
            <Link to="/songs/new" className="text-ministry-600 text-sm hover:underline mt-2 inline-block">
              Agregar la primera canción
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Título</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Artista</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Tono</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">BPM</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Estado</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {songs.map(song => (
                <tr key={song.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link to={`/songs/${song.id}`} className="font-medium text-gray-900 hover:text-ministry-600 transition-colors">
                      {song.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{song.artist || '—'}</td>
                  <td className="px-4 py-3 text-center">
                    {song.original_key
                      ? <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-ministry-100 text-ministry-700">{song.original_key}</span>
                      : <span className="text-gray-300">—</span>
                    }
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600">{song.bpm || '—'}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                      song.is_active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {song.is_active ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link to={`/songs/${song.id}/edit`} className="text-gray-400 hover:text-ministry-600 transition-colors" title="Editar">
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleToggle(song)}
                        className="text-gray-400 hover:text-ministry-600 transition-colors"
                        title={song.is_active ? 'Desactivar' : 'Activar'}
                      >
                        {song.is_active
                          ? <ToggleRight className="w-5 h-5 text-green-500" />
                          : <ToggleLeft className="w-5 h-5" />
                        }
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {meta && (
          <div className="px-4 pb-4">
            <Pagination
              meta={meta}
              onPageChange={page => { setFilters(f => ({ ...f, page })); load({ ...filters, page }) }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
