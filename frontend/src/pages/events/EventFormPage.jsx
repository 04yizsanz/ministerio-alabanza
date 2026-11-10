import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import { eventsService } from '../../services/events'
import Alert from '../../components/ui/Alert'
import { useToast } from '../../context/ToastContext'
import { parseValidationErrors } from '../../hooks/useApi'

const empty = { event_type_id: '', name: '', start_date: '', end_date: '', description: '', status: 'draft', notes: '' }

export default function EventFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const isEditing = Boolean(id)

  const [form, setForm]       = useState(empty)
  const [types, setTypes]     = useState([])
  const [errors, setErrors]   = useState({})
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    eventsService.getTypes().then(({ data }) => setTypes(data)).catch(() => {})
    if (isEditing) {
      eventsService.getOne(id)
        .then(({ data }) => setForm({
          event_type_id: data.event_type_id || '',
          name:          data.name || '',
          start_date:    data.start_date || '',
          end_date:      data.end_date || '',
          description:   data.description || '',
          status:        data.status || 'draft',
          notes:         data.notes || '',
        }))
        .catch(() => setError('No se pudo cargar el evento.'))
    }
  }, [id, isEditing])

  const set = (field, value) => {
    setForm(f => ({ ...f, [field]: value }))
    setErrors(e => ({ ...e, [field]: undefined }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setErrors({})
    try {
      if (isEditing) {
        await eventsService.update(id, form)
        toast.success('Evento actualizado correctamente.')
        navigate(`/events/${id}`)
      } else {
        const { data } = await eventsService.create(form)
        toast.success('Evento creado correctamente.')
        navigate(`/events/${data.id}`)
      }
    } catch (err) {
      if (err.response?.status === 422) setErrors(parseValidationErrors(err))
      else setError(err.response?.data?.message || 'Error al guardar.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">{isEditing ? 'Editar evento' : 'Nuevo evento'}</h1>
      </div>

      <Alert type="error" message={error} onClose={() => setError('')} />

      <form onSubmit={handleSubmit} className="card space-y-4">
        <div>
          <label className="form-label">Tipo de evento <span className="text-red-500">*</span></label>
          <select className="form-input" value={form.event_type_id} onChange={e => set('event_type_id', e.target.value)}>
            <option value="">Seleccionar tipo...</option>
            {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          {errors.event_type_id && <p className="text-red-500 text-xs mt-1">{errors.event_type_id}</p>}
        </div>

        <div>
          <label className="form-label">Nombre del evento <span className="text-red-500">*</span></label>
          <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Ej: Domingo 26 de octubre" />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">Fecha de inicio <span className="text-red-500">*</span></label>
            <input type="date" className="form-input" value={form.start_date} onChange={e => set('start_date', e.target.value)} />
            {errors.start_date && <p className="text-red-500 text-xs mt-1">{errors.start_date}</p>}
          </div>
          <div>
            <label className="form-label">Fecha de fin</label>
            <input type="date" className="form-input" value={form.end_date} onChange={e => set('end_date', e.target.value)} />
          </div>
        </div>

        <div>
          <label className="form-label">Estado</label>
          <select className="form-input" value={form.status} onChange={e => set('status', e.target.value)}>
            <option value="draft">Borrador</option>
            <option value="published">Publicado</option>
            <option value="archived">Archivado</option>
          </select>
        </div>

        <div>
          <label className="form-label">Descripción</label>
          <textarea className="form-input min-h-20 resize-y" value={form.description} onChange={e => set('description', e.target.value)} placeholder="Descripción del evento..." />
        </div>

        <div>
          <label className="form-label">Observaciones internas</label>
          <textarea className="form-input min-h-16 resize-y" value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Notas internas..." />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary text-sm">Cancelar</button>
          <button type="submit" disabled={loading} className="btn-primary text-sm flex items-center gap-2">
            <Save className="w-4 h-4" />
            {loading ? 'Guardando...' : 'Guardar evento'}
          </button>
        </div>
      </form>
    </div>
  )
}
