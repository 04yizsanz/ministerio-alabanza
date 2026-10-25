import { useEffect, useState } from 'react'
import { Users, Plus, Edit, Search, ToggleLeft, ToggleRight } from 'lucide-react'
import { peopleService, rolesService } from '../../services/people'
import Alert from '../../components/ui/Alert'
import Spinner from '../../components/ui/Spinner'
import Pagination from '../../components/ui/Pagination'
import PersonFormModal from './PersonFormModal'

export default function PeoplePage() {
  const [people, setPeople]     = useState([])
  const [roles, setRoles]       = useState([])
  const [meta, setMeta]         = useState(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [filters, setFilters]   = useState({ search: '', active: '', page: 1 })
  const [modal, setModal]       = useState({ open: false, person: null })

  const load = async (f = filters) => {
    setLoading(true)
    try {
      const params = { page: f.page }
      if (f.search) params.search = f.search
      if (f.active !== '') params.active = f.active
      const { data } = await peopleService.getAll(params)
      setPeople(data.data)
      setMeta(data)
    } catch {
      setError('No se pudo cargar el directorio.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    Promise.all([load(), rolesService.getAll()])
      .then(([, rolesRes]) => setRoles(rolesRes.data))
      .catch(() => {})
  }, []) // eslint-disable-line

  const handleFilter = (key, value) => {
    const updated = { ...filters, [key]: value, page: 1 }
    setFilters(updated)
    load(updated)
  }

  const handleToggle = async (person) => {
    try {
      await peopleService.remove(person.id) // desactiva
      setPeople(prev => prev.map(p =>
        p.id === person.id ? { ...p, is_active: false } : p
      ))
    } catch { setError('No se pudo cambiar el estado.') }
  }

  const handleSaved = (saved, isNew) => {
    if (isNew) {
      load(filters)
    } else {
      setPeople(prev => prev.map(p => p.id === saved.id ? saved : p))
    }
    setModal({ open: false, person: null })
  }

  const categoryLabel = { music: 'Musical', tech: 'Técnica', service: 'Servicio' }
  const categoryColor = { music: 'bg-ministry-100 text-ministry-700', tech: 'bg-blue-100 text-blue-700', service: 'bg-emerald-100 text-emerald-700' }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Directorio de integrantes</h1>
          <p className="text-sm text-gray-500 mt-0.5">{meta?.total ?? '—'} personas registradas</p>
        </div>
        <button
          onClick={() => setModal({ open: true, person: null })}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" /> Nuevo integrante
        </button>
      </div>

      <Alert type="error" message={error} onClose={() => setError('')} />

      {/* Filtros */}
      <div className="card p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o correo..."
            className="form-input pl-9"
            value={filters.search}
            onChange={e => handleFilter('search', e.target.value)}
          />
        </div>
        <select
          className="form-input w-36"
          value={filters.active}
          onChange={e => handleFilter('active', e.target.value)}
        >
          <option value="">Todos</option>
          <option value="true">Activos</option>
          <option value="false">Inactivos</option>
        </select>
      </div>

      {/* Tabla */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : people.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No hay integrantes registrados aún.</p>
            <button
              onClick={() => setModal({ open: true, person: null })}
              className="text-ministry-600 text-sm hover:underline mt-2"
            >
              Agregar el primer integrante
            </button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Nombre</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Contacto</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Funciones</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Estado</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {people.map(person => (
                <tr key={person.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-ministry-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-ministry-700 font-semibold text-xs">
                          {person.first_name?.[0]}{person.last_name?.[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{person.full_name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    <div className="space-y-0.5">
                      {person.email && <p className="text-xs">{person.email}</p>}
                      {person.phone && <p className="text-xs">{person.phone}</p>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {person.musical_roles?.map(role => (
                        <span
                          key={role.id}
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryColor[role.category] || 'bg-gray-100 text-gray-600'}`}
                        >
                          {role.name}
                        </span>
                      ))}
                      {(!person.musical_roles || person.musical_roles.length === 0) && (
                        <span className="text-xs text-gray-300">Sin funciones</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      person.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {person.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setModal({ open: true, person })}
                        className="text-gray-400 hover:text-ministry-600 transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {person.is_active && (
                        <button
                          onClick={() => handleToggle(person)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                          title="Desactivar"
                        >
                          <ToggleRight className="w-5 h-5 text-green-500" />
                        </button>
                      )}
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
              onPageChange={page => { const f = { ...filters, page }; setFilters(f); load(f) }}
            />
          </div>
        )}
      </div>

      {modal.open && (
        <PersonFormModal
          person={modal.person}
          roles={roles}
          onSaved={handleSaved}
          onClose={() => setModal({ open: false, person: null })}
        />
      )}
    </div>
  )
}
