import { useState, useEffect } from 'react'
import { X, Save, User } from 'lucide-react'
import { peopleService } from '../../services/people'
import Alert from '../../components/ui/Alert'
import { parseValidationErrors } from '../../hooks/useApi'

const empty = { first_name: '', last_name: '', phone: '', email: '', notes: '', is_active: true }

export default function PersonFormModal({ person, roles, onSaved, onClose }) {
  const isEditing = Boolean(person)
  const [form, setForm]     = useState(isEditing ? {
    first_name: person.first_name || '',
    last_name:  person.last_name  || '',
    phone:      person.phone      || '',
    email:      person.email      || '',
    notes:      person.notes      || '',
    is_active:  person.is_active,
  } : empty)
  const [selectedRoles, setSelectedRoles] = useState(
    isEditing ? (person.musical_roles?.map(r => r.id) || []) : []
  )
  const [errors, setErrors]   = useState({})
  const [error, setError]     = useState('')
  const [saving, setSaving]   = useState(false)

  // Agrupar funciones por categoría para mostrarlas ordenadas
  const grouped = roles.reduce((acc, role) => {
    if (!acc[role.category]) acc[role.category] = []
    acc[role.category].push(role)
    return acc
  }, {})
  const catLabels = { music: 'Musicales', tech: 'Técnicas', service: 'Servicio' }

  const set = (field, value) => {
    setForm(f => ({ ...f, [field]: value }))
    setErrors(e => ({ ...e, [field]: undefined }))
  }

  const toggleRole = (roleId) => {
    setSelectedRoles(prev =>
      prev.includes(roleId) ? prev.filter(id => id !== roleId) : [...prev, roleId]
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setErrors({})
    const payload = { ...form, musical_role_ids: selectedRoles }
    try {
      if (isEditing) {
        const { data } = await peopleService.update(person.id, payload)
        onSaved(data, false)
      } else {
        const { data } = await peopleService.create(payload)
        onSaved(data, true)
      }
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(parseValidationErrors(err))
      } else {
        setError(err.response?.data?.message || 'Error al guardar.')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-ministry-100 flex items-center justify-center">
              <User className="w-4 h-4 text-ministry-600" />
            </div>
            <h2 className="font-semibold text-gray-900">
              {isEditing ? 'Editar integrante' : 'Nuevo integrante'}
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <Alert type="error" message={error} onClose={() => setError('')} />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">Nombre <span className="text-red-500">*</span></label>
              <input className="form-input" value={form.first_name} onChange={e => set('first_name', e.target.value)} placeholder="Nombre" />
              {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>}
            </div>
            <div>
              <label className="form-label">Apellido <span className="text-red-500">*</span></label>
              <input className="form-input" value={form.last_name} onChange={e => set('last_name', e.target.value)} placeholder="Apellido" />
              {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>}
            </div>
          </div>

          <div>
            <label className="form-label">Correo electrónico</label>
            <input type="email" className="form-input" value={form.email} onChange={e => set('email', e.target.value)} placeholder="correo@ejemplo.com" />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="form-label">Teléfono</label>
            <input className="form-input" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+57 300 000 0000" />
          </div>

          <div>
            <label className="form-label">Observaciones</label>
            <textarea className="form-input min-h-16 resize-none" value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Notas adicionales..." />
          </div>

          {/* Funciones musicales */}
          <div>
            <label className="form-label">Funciones</label>
            <div className="border border-gray-200 rounded-lg divide-y divide-gray-100 max-h-56 overflow-y-auto">
              {Object.entries(grouped).map(([cat, catRoles]) => (
                <div key={cat} className="p-3">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{catLabels[cat] || cat}</p>
                  <div className="flex flex-wrap gap-2">
                    {catRoles.map(role => (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => toggleRole(role.id)}
                        className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
                          selectedRoles.includes(role.id)
                            ? 'bg-ministry-600 border-ministry-600 text-white'
                            : 'bg-white border-gray-200 text-gray-600 hover:border-ministry-300'
                        }`}
                      >
                        {role.name}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {selectedRoles.length > 0 && (
              <p className="text-xs text-ministry-600 mt-1">{selectedRoles.length} función(es) seleccionada(s)</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="person_active" checked={form.is_active} onChange={e => set('is_active', e.target.checked)} className="w-4 h-4 accent-ministry-600" />
            <label htmlFor="person_active" className="text-sm text-gray-700">Integrante activo</label>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <button type="button" onClick={onClose} className="btn-secondary text-sm">Cancelar</button>
            <button type="submit" disabled={saving} className="btn-primary text-sm flex items-center gap-2">
              <Save className="w-4 h-4" />
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
