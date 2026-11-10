/**
 * SettingsPage — Configuración del sistema
 *
 * Actualmente contiene:
 *   - Gestión de funciones musicales (roles)
 *
 * Estructura modular: cada sección es un componente independiente
 * para poder ampliar fácilmente (tipos de evento, usuarios, etc.)
 */

import { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2, Save, X, GripVertical, Check } from 'lucide-react'
import { rolesService } from '../../services/people'
import Alert from '../../components/ui/Alert'
import Spinner from '../../components/ui/Spinner'

// Categorías disponibles con su etiqueta y color
const CATEGORIES = [
  { value: 'music',   label: 'Musical',   color: 'bg-ministry-100 text-ministry-700 border-ministry-200' },
  { value: 'tech',    label: 'Técnica',   color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { value: 'service', label: 'Servicio',  color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
]

function categoryMeta(value) {
  return CATEGORIES.find(c => c.value === value) ?? CATEGORIES[0]
}

// ─── Formulario inline para crear o editar un rol ────────────────────────────
function RoleForm({ initial, onSave, onCancel }) {
  const [name,     setName]     = useState(initial?.name     ?? '')
  const [category, setCategory] = useState(initial?.category ?? 'music')
  const [saving,   setSaving]   = useState(false)
  const [error,    setError]    = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) { setError('El nombre es obligatorio.'); return }
    setSaving(true)
    setError('')
    try {
      await onSave({ name: name.trim(), category })
    } catch (err) {
      const msg = err.response?.data?.errors?.name?.[0]
        || err.response?.data?.message
        || 'Error al guardar.'
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
      <div className="flex-1 space-y-2">
        {error && <Alert type="error" message={error} onClose={() => setError('')} />}
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="form-label text-xs">Nombre de la función</label>
            <input
              className="form-input text-sm"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ej: Guitarra líder, Coros..."
              autoFocus
              maxLength={100}
            />
          </div>
          <div className="w-36">
            <label className="form-label text-xs">Categoría</label>
            <select
              className="form-input text-sm"
              value={category}
              onChange={e => setCategory(e.target.value)}
            >
              {CATEGORIES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div className="flex items-end gap-2 pb-0.5 pt-5">
        <button type="submit" disabled={saving} className="btn-primary text-sm flex items-center gap-1.5">
          <Save className="w-3.5 h-3.5" />
          {saving ? 'Guardando...' : (initial ? 'Actualizar' : 'Crear')}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary text-sm">
          Cancelar
        </button>
      </div>
    </form>
  )
}

// ─── Fila de un rol (vista + acciones) ────────────────────────────────────────
function RoleRow({ role, onEdit, onDelete }) {
  const meta = categoryMeta(role.category)

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 group border-b border-gray-50 last:border-0">
      {/* Grip (visual only, sin drag&drop por ahora) */}
      <GripVertical className="w-4 h-4 text-gray-200 group-hover:text-gray-300 flex-shrink-0" />

      {/* Nombre */}
      <span className="flex-1 text-sm text-gray-800 font-medium">{role.name}</span>

      {/* Categoría */}
      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${meta.color}`}>
        {meta.label}
      </span>

      {/* Estado */}
      {!role.is_active && (
        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-400 font-medium">
          Inactivo
        </span>
      )}

      {/* Acciones */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(role)}
          className="p-1.5 text-gray-400 hover:text-ministry-600 rounded-lg hover:bg-ministry-50"
          title="Editar"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onDelete(role)}
          className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50"
          title="Eliminar"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

// ─── Sección: gestión de roles ────────────────────────────────────────────────
function RolesSection() {
  const [roles,       setRoles]       = useState([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState('')
  const [success,     setSuccess]     = useState('')
  const [showCreate,  setShowCreate]  = useState(false)
  const [editingRole, setEditingRole] = useState(null)

  const load = () => {
    setLoading(true)
    rolesService.getAll()
      .then(({ data }) => setRoles(data))
      .catch(() => setError('No se pudieron cargar las funciones.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleCreate = async (formData) => {
    const { data } = await rolesService.create(formData)
    setRoles(prev => [...prev, data])
    setShowCreate(false)
    setSuccess('Función creada correctamente.')
    setTimeout(() => setSuccess(''), 3000)
  }

  const handleUpdate = async (formData) => {
    const { data } = await rolesService.update(editingRole.id, formData)
    setRoles(prev => prev.map(r => r.id === data.id ? data : r))
    setEditingRole(null)
    setSuccess('Función actualizada.')
    setTimeout(() => setSuccess(''), 3000)
  }

  const handleDelete = async (role) => {
    if (!window.confirm(`¿Eliminar la función "${role.name}"?\n\nSi ya fue usada en programaciones no se podrá eliminar y quedará inactiva.`)) return
    try {
      await rolesService.remove(role.id)
      setRoles(prev => prev.filter(r => r.id !== role.id))
      setSuccess('Función eliminada.')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo eliminar. Puede estar en uso en programaciones activas.')
    }
  }

  // Agrupar por categoría
  const grouped = CATEGORIES.reduce((acc, cat) => {
    acc[cat.value] = roles.filter(r => r.category === cat.value)
    return acc
  }, {})

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-gray-800">Funciones musicales y técnicas</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Define las funciones que se asignarán en las programaciones. Los cambios aquí se reflejan automáticamente en el editor.
          </p>
        </div>
        <button
          onClick={() => { setShowCreate(true); setEditingRole(null) }}
          className="btn-primary text-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Nueva función
        </button>
      </div>

      <Alert type="error"   message={error}   onClose={() => setError('')} />
      <Alert type="success" message={success} onClose={() => setSuccess('')} />

      {/* Formulario de creación */}
      {showCreate && (
        <RoleForm
          onSave={handleCreate}
          onCancel={() => setShowCreate(false)}
        />
      )}

      {loading ? (
        <div className="flex justify-center py-10"><Spinner /></div>
      ) : (
        <div className="space-y-4">
          {CATEGORIES.map(cat => (
            <div key={cat.value} className="card p-0 overflow-hidden">
              {/* Cabecera de categoría */}
              <div className={`px-4 py-2.5 border-b border-gray-100 flex items-center justify-between`}>
                <span className={`text-xs font-semibold uppercase tracking-widest ${cat.color.split(' ')[1]}`}>
                  {cat.label}s
                </span>
                <span className="text-xs text-gray-400">{grouped[cat.value]?.length ?? 0} funciones</span>
              </div>

              {/* Lista de roles */}
              {grouped[cat.value]?.length === 0 ? (
                <p className="px-4 py-3 text-sm text-gray-400 italic">Sin funciones en esta categoría.</p>
              ) : (
                grouped[cat.value].map(role => (
                  editingRole?.id === role.id ? (
                    <div key={role.id} className="px-3 py-2">
                      <RoleForm
                        initial={role}
                        onSave={handleUpdate}
                        onCancel={() => setEditingRole(null)}
                      />
                    </div>
                  ) : (
                    <RoleRow
                      key={role.id}
                      role={role}
                      onEdit={setEditingRole}
                      onDelete={handleDelete}
                    />
                  )
                ))
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Página principal de configuración ───────────────────────────────────────
export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('roles')

  const tabs = [
    { id: 'roles', label: 'Funciones musicales' },
    // En el futuro: { id: 'event-types', label: 'Tipos de evento' },
    // En el futuro: { id: 'users', label: 'Usuarios' },
  ]

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Configuración</h1>
        <p className="text-sm text-gray-500 mt-1">Administra los datos maestros del sistema.</p>
      </div>

      {/* Pestañas */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-ministry-600 text-ministry-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Contenido de la pestaña activa */}
      {activeTab === 'roles' && <RolesSection />}
    </div>
  )
}
