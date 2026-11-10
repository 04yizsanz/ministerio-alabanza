import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import { songsService } from '../../services/songs'
import Alert from '../../components/ui/Alert'
import { useToast } from '../../context/ToastContext'
import { parseValidationErrors } from '../../hooks/useApi'

const KEYS = ['C','C#','Db','D','Eb','E','F','F#','Gb','G','Ab','A','Bb','B',
              'Cm','C#m','Dm','Ebm','Em','Fm','F#m','Gm','Abm','Am','Bbm','Bm']

const empty = { title: '', artist: '', original_key: '', bpm: '', audio_url: '', notes: '', is_active: true }

export default function SongFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const isEditing = Boolean(id)

  const [form, setForm]       = useState(empty)
  const [errors, setErrors]   = useState({})
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(isEditing)

  useEffect(() => {
    if (!isEditing) return
    songsService.getOne(id)
      .then(({ data }) => setForm({
        title: data.title || '',
        artist: data.artist || '',
        original_key: data.original_key || '',
        bpm: data.bpm || '',
        audio_url: data.audio_url || '',
        notes: data.notes || '',
        is_active: data.is_active,
      }))
      .catch(() => setError('No se pudo cargar la canción.'))
      .finally(() => setFetching(false))
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

    const payload = { ...form, bpm: form.bpm ? Number(form.bpm) : null }

    try {
      if (isEditing) {
        await songsService.update(id, payload)
        toast.success('Canción actualizada correctamente.')
      } else {
        const { data } = await songsService.create(payload)
        toast.success('Canción registrada correctamente.')
        setTimeout(() => navigate(`/songs/${data.id}`), 400)
      }
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(parseValidationErrors(err))
      } else {
        setError(err.response?.data?.message || 'Error al guardar la canción.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (fetching) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ministry-600" /></div>

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">
          {isEditing ? 'Editar canción' : 'Nueva canción'}
        </h1>
      </div>

      <Alert type="error" message={error} onClose={() => setError('')} />

      <form onSubmit={handleSubmit} className="card space-y-4">
        {/* Título */}
        <div>
          <label className="form-label">Título <span className="text-red-500">*</span></label>
          <input className="form-input" value={form.title} onChange={e => set('title', e.target.value)} placeholder="Nombre de la canción" />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
        </div>

        {/* Artista */}
        <div>
          <label className="form-label">Artista / Intérprete</label>
          <input className="form-input" value={form.artist} onChange={e => set('artist', e.target.value)} placeholder="Nombre del artista o banda" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Tonalidad */}
          <div>
            <label className="form-label">Tonalidad original</label>
            <select className="form-input" value={form.original_key} onChange={e => set('original_key', e.target.value)}>
              <option value="">Seleccionar</option>
              {KEYS.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>

          {/* BPM */}
          <div>
            <label className="form-label">BPM</label>
            <input type="number" className="form-input" value={form.bpm} onChange={e => set('bpm', e.target.value)} placeholder="Ej: 72" min="40" max="300" />
            {errors.bpm && <p className="text-red-500 text-xs mt-1">{errors.bpm}</p>}
          </div>
        </div>

        {/* Enlace de audio */}
        <div>
          <label className="form-label">Enlace de audio o video</label>
          <input className="form-input" value={form.audio_url} onChange={e => set('audio_url', e.target.value)} placeholder="https://youtube.com/..." />
          {errors.audio_url && <p className="text-red-500 text-xs mt-1">{errors.audio_url}</p>}
        </div>

        {/* Observaciones */}
        <div>
          <label className="form-label">Observaciones</label>
          <textarea className="form-input min-h-20 resize-y" value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Notas adicionales sobre la canción..." />
        </div>

        {/* Estado */}
        <div className="flex items-center gap-3">
          <input type="checkbox" id="is_active" checked={form.is_active} onChange={e => set('is_active', e.target.checked)} className="w-4 h-4 accent-ministry-600" />
          <label htmlFor="is_active" className="text-sm text-gray-700">Canción activa</label>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary text-sm">Cancelar</button>
          <button type="submit" disabled={loading} className="btn-primary text-sm flex items-center gap-2">
            <Save className="w-4 h-4" />
            {loading ? 'Guardando...' : 'Guardar canción'}
          </button>
        </div>
      </form>
    </div>
  )
}
