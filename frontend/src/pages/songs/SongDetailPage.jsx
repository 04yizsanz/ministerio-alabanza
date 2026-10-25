import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft, Edit, Music2, FileText, Upload, Trash2,
  Download, Eye, ChevronDown, ChevronUp, Plus, Save, X,
  FileIcon, ImageIcon, AlertCircle
} from 'lucide-react'
import { songsService } from '../../services/songs'
import Alert from '../../components/ui/Alert'
import Spinner from '../../components/ui/Spinner'
import { parseValidationErrors } from '../../hooks/useApi'

// ─── Íconos por tipo de archivo ──────────────────────────────────────────────
function FileTypeIcon({ mimeType }) {
  if (mimeType?.includes('pdf'))
    return <span className="text-red-500 font-bold text-xs bg-red-50 px-1.5 py-0.5 rounded">PDF</span>
  if (mimeType?.includes('word') || mimeType?.includes('document'))
    return <span className="text-blue-500 font-bold text-xs bg-blue-50 px-1.5 py-0.5 rounded">DOC</span>
  if (mimeType?.includes('image'))
    return <span className="text-green-500 font-bold text-xs bg-green-50 px-1.5 py-0.5 rounded">IMG</span>
  return <span className="text-gray-500 font-bold text-xs bg-gray-100 px-1.5 py-0.5 rounded">FILE</span>
}

function formatSize(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// ─── Sección de cifrado en texto ─────────────────────────────────────────────
const CIPHER_FIELDS = [
  { key: 'intro',      label: 'Intro' },
  { key: 'verse',      label: 'Verso' },
  { key: 'pre_chorus', label: 'Precoro' },
  { key: 'chorus',     label: 'Coro' },
  { key: 'bridge',     label: 'Puente' },
  { key: 'interlude',  label: 'Interludio' },
  { key: 'outro',      label: 'Final' },
  { key: 'chords',     label: 'Acordes adicionales' },
  { key: 'notes',      label: 'Observaciones' },
]

const KEYS = ['C','C#','Db','D','Eb','E','F','F#','Gb','G','Ab','A','Bb','B',
              'Cm','C#m','Dm','Ebm','Em','Fm','F#m','Gm','Abm','Am','Bbm','Bm']

function CipherTextSection({ songId }) {
  const [ciphers, setCiphers]         = useState([])
  const [loading, setLoading]         = useState(true)
  const [editing, setEditing]         = useState(null)   // id del cifrado en edición, o 'new'
  const [form, setForm]               = useState({})
  const [saving, setSaving]           = useState(false)
  const [error, setError]             = useState('')
  const [expanded, setExpanded]       = useState({})

  useEffect(() => {
    songsService.getCipherTexts(songId)
      .then(({ data }) => {
        setCiphers(data)
        // Expandir automáticamente el primero si existe
        if (data.length > 0) setExpanded({ [data[0].id]: true })
      })
      .catch(() => setError('No se pudieron cargar los cifrados.'))
      .finally(() => setLoading(false))
  }, [songId])

  const startNew = () => {
    setForm({ key_signature: '', intro: '', verse: '', pre_chorus: '', chorus: '', bridge: '', interlude: '', outro: '', chords: '', notes: '' })
    setEditing('new')
  }

  const startEdit = (cipher) => {
    setForm({ ...cipher })
    setEditing(cipher.id)
  }

  const cancelEdit = () => { setEditing(null); setError('') }

  const save = async () => {
    setSaving(true)
    setError('')
    try {
      if (editing === 'new') {
        const { data } = await songsService.createCipherText(songId, form)
        setCiphers(prev => [...prev, data])
        setExpanded(prev => ({ ...prev, [data.id]: true }))
      } else {
        const { data } = await songsService.updateCipherText(editing, form)
        setCiphers(prev => prev.map(c => c.id === editing ? data : c))
      }
      setEditing(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar el cifrado.')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id) => {
    if (!window.confirm('¿Eliminar este cifrado?')) return
    try {
      await songsService.deleteCipherText(id)
      setCiphers(prev => prev.filter(c => c.id !== id))
    } catch {
      setError('No se pudo eliminar el cifrado.')
    }
  }

  const toggle = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }))

  if (loading) return <div className="flex justify-center py-8"><Spinner /></div>

  return (
    <div className="space-y-3">
      <Alert type="error" message={error} onClose={() => setError('')} />

      {ciphers.map(cipher => (
        <div key={cipher.id} className="border border-gray-200 rounded-lg overflow-hidden">
          {/* Header del cifrado */}
          <div
            className="flex items-center justify-between px-4 py-3 bg-gray-50 cursor-pointer select-none"
            onClick={() => toggle(cipher.id)}
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-ministry-500" />
              <span className="font-medium text-sm text-gray-800">
                Cifrado en texto
                {cipher.key_signature && (
                  <span className="ml-2 text-xs bg-ministry-100 text-ministry-700 px-2 py-0.5 rounded-full font-semibold">
                    {cipher.key_signature}
                  </span>
                )}
              </span>
            </div>
            <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
              <button onClick={() => startEdit(cipher)} className="text-gray-400 hover:text-ministry-600 p-1" title="Editar">
                <Edit className="w-4 h-4" />
              </button>
              <button onClick={() => remove(cipher.id)} className="text-gray-400 hover:text-red-500 p-1" title="Eliminar">
                <Trash2 className="w-4 h-4" />
              </button>
              {expanded[cipher.id] ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </div>
          </div>

          {/* Contenido del cifrado */}
          {expanded[cipher.id] && editing !== cipher.id && (
            <div className="px-4 py-4 space-y-3">
              {CIPHER_FIELDS.map(({ key, label }) => cipher[key] ? (
                <div key={key}>
                  <p className="text-xs font-semibold text-ministry-600 uppercase tracking-wide mb-1">{label}</p>
                  <pre className="text-sm text-gray-800 font-mono whitespace-pre-wrap bg-gray-50 rounded p-3 leading-relaxed">
                    {cipher[key]}
                  </pre>
                </div>
              ) : null)}
            </div>
          )}

          {/* Formulario de edición inline */}
          {editing === cipher.id && (
            <CipherForm form={form} setForm={setForm} saving={saving} onSave={save} onCancel={cancelEdit} />
          )}
        </div>
      ))}

      {/* Formulario de nuevo cifrado */}
      {editing === 'new' && (
        <div className="border border-ministry-200 rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-ministry-50 flex items-center gap-2">
            <Plus className="w-4 h-4 text-ministry-600" />
            <span className="font-medium text-sm text-ministry-700">Nuevo cifrado en texto</span>
          </div>
          <CipherForm form={form} setForm={setForm} saving={saving} onSave={save} onCancel={cancelEdit} />
        </div>
      )}

      {editing !== 'new' && (
        <button onClick={startNew} className="btn-secondary w-full flex items-center justify-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> Agregar cifrado en texto
        </button>
      )}
    </div>
  )
}

function CipherForm({ form, setForm, saving, onSave, onCancel }) {
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  return (
    <div className="px-4 py-4 space-y-3">
      <div>
        <label className="form-label">Tonalidad del cifrado</label>
        <select className="form-input w-40" value={form.key_signature || ''} onChange={e => set('key_signature', e.target.value)}>
          <option value="">Sin tonalidad específica</option>
          {KEYS.map(k => <option key={k} value={k}>{k}</option>)}
        </select>
      </div>
      {CIPHER_FIELDS.map(({ key, label }) => (
        <div key={key}>
          <label className="form-label">{label}</label>
          <textarea
            className="form-input font-mono text-sm min-h-20 resize-y"
            value={form[key] || ''}
            onChange={e => set(key, e.target.value)}
            placeholder={`Contenido de ${label.toLowerCase()}...`}
          />
        </div>
      ))}
      <div className="flex gap-2 pt-2">
        <button onClick={onSave} disabled={saving} className="btn-primary text-sm flex items-center gap-2">
          <Save className="w-4 h-4" />
          {saving ? 'Guardando...' : 'Guardar cifrado'}
        </button>
        <button onClick={onCancel} className="btn-secondary text-sm">Cancelar</button>
      </div>
    </div>
  )
}

// ─── Sección de archivos ──────────────────────────────────────────────────────
function CipherFilesSection({ songId }) {
  const [files, setFiles]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [keySignature, setKeySignature] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    songsService.getCipherFiles(songId)
      .then(({ data }) => setFiles(data))
      .catch(() => setError('No se pudieron cargar los archivos.'))
      .finally(() => setLoading(false))
  }, [songId])

  const upload = async (file) => {
    if (!file) return
    const ALLOWED = ['application/pdf','image/jpeg','image/jpg','image/png','image/webp',
                     'application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!ALLOWED.includes(file.type)) {
      setError('Tipo de archivo no permitido. Usa PDF, Word, JPG, PNG o WEBP.')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('El archivo no puede superar 10 MB.')
      return
    }

    setUploading(true)
    setError('')
    const formData = new FormData()
    formData.append('file', file)
    if (keySignature) formData.append('key_signature', keySignature)

    try {
      const { data } = await songsService.uploadCipherFile(songId, formData)
      setFiles(prev => [...prev, data])
      setSuccess(`"${file.name}" subido correctamente.`)
      setSelectedFile(null)
      setKeySignature('')
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.file?.[0]
      setError(msg || 'Error al subir el archivo.')
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) setSelectedFile(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) setSelectedFile(file)
  }

  const remove = async (fileId, name) => {
    if (!window.confirm(`¿Eliminar "${name}"? Esta acción no se puede deshacer.`)) return
    try {
      await songsService.deleteCipherFile(fileId)
      setFiles(prev => prev.filter(f => f.id !== fileId))
      setSuccess('Archivo eliminado.')
    } catch {
      setError('No se pudo eliminar el archivo.')
    }
  }

  if (loading) return <div className="flex justify-center py-8"><Spinner /></div>

  return (
    <div className="space-y-4">
      <Alert type="error"   message={error}   onClose={() => setError('')} />
      <Alert type="success" message={success} onClose={() => setSuccess('')} />

      {/* Zona de subida */}
      <div
        className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
          dragOver ? 'border-ministry-400 bg-ministry-50' : 'border-gray-300 hover:border-ministry-300'
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
        <p className="text-sm text-gray-500 mb-1">
          Arrastra un archivo aquí o{' '}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-ministry-600 hover:underline font-medium"
          >
            selecciona desde tu computador
          </button>
        </p>
        <p className="text-xs text-gray-400">PDF, Word (.doc/.docx), JPG, PNG, WEBP — máximo 10 MB</p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Vista previa del archivo seleccionado */}
      {selectedFile && (
        <div className="border border-ministry-200 rounded-lg p-4 bg-ministry-50 space-y-3">
          <div className="flex items-center gap-3">
            <FileTypeIcon mimeType={selectedFile.type} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{selectedFile.name}</p>
              <p className="text-xs text-gray-500">{formatSize(selectedFile.size)}</p>
            </div>
            <button onClick={() => setSelectedFile(null)} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="form-label text-xs">Tonalidad del cifrado (opcional)</label>
              <select
                className="form-input"
                value={keySignature}
                onChange={e => setKeySignature(e.target.value)}
              >
                <option value="">Sin tonalidad específica</option>
                {KEYS.map(k => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
            <div className="flex gap-2 mt-5">
              <button
                onClick={() => upload(selectedFile)}
                disabled={uploading}
                className="btn-primary text-sm flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                {uploading ? 'Subiendo...' : 'Subir archivo'}
              </button>
              <button onClick={() => setSelectedFile(null)} className="btn-secondary text-sm">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de archivos */}
      {files.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <FileIcon className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No hay archivos adjuntos aún.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {files.map(file => (
            <div key={file.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 group">
              <FileTypeIcon mimeType={file.mime_type} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{file.original_name}</p>
                <p className="text-xs text-gray-400">
                  {formatSize(file.file_size)}
                  {file.key_signature && <span className="ml-2 text-ministry-600 font-medium">{file.key_signature}</span>}
                </p>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <a
                  href={file.download_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-gray-400 hover:text-ministry-600 p-1.5 rounded hover:bg-ministry-50"
                  title="Descargar"
                >
                  <Download className="w-4 h-4" />
                </a>
                <button
                  onClick={() => remove(file.id, file.original_name)}
                  className="text-gray-400 hover:text-red-500 p-1.5 rounded hover:bg-red-50"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function SongDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [song, setSong]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [tab, setTab]         = useState('cipher-text') // 'cipher-text' | 'files'

  useEffect(() => {
    songsService.getOne(id)
      .then(({ data }) => setSong(data))
      .catch(() => setError('No se pudo cargar la canción.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>
  if (error)   return <div className="max-w-2xl mx-auto"><Alert type="error" message={error} /></div>
  if (!song)   return null

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Navegación */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/songs')} className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <nav className="text-sm text-gray-500">
          <Link to="/songs" className="hover:text-ministry-600">Canciones</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-800 font-medium">{song.title}</span>
        </nav>
      </div>

      {/* Cabecera de la canción */}
      <div className="card">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-ministry-100 flex items-center justify-center flex-shrink-0">
              <Music2 className="w-6 h-6 text-ministry-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{song.title}</h1>
              {song.artist && <p className="text-gray-500 text-sm">{song.artist}</p>}
            </div>
          </div>
          <Link to={`/songs/${id}/edit`} className="btn-secondary text-sm flex items-center gap-2">
            <Edit className="w-4 h-4" /> Editar
          </Link>
        </div>

        {/* Metadatos */}
        <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gray-100">
          {song.original_key && (
            <div className="text-sm">
              <span className="text-gray-400 text-xs uppercase tracking-wide">Tonalidad</span>
              <p className="font-semibold text-ministry-700 mt-0.5">{song.original_key}</p>
            </div>
          )}
          {song.bpm && (
            <div className="text-sm ml-4">
              <span className="text-gray-400 text-xs uppercase tracking-wide">BPM</span>
              <p className="font-semibold text-gray-800 mt-0.5">{song.bpm}</p>
            </div>
          )}
          {song.audio_url && (
            <div className="text-sm ml-4">
              <span className="text-gray-400 text-xs uppercase tracking-wide">Audio</span>
              <a href={song.audio_url} target="_blank" rel="noreferrer"
                className="block text-ministry-600 hover:underline mt-0.5 truncate max-w-48 text-sm">
                Ver enlace ↗
              </a>
            </div>
          )}
          <div className="ml-auto">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              song.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
            }`}>
              {song.is_active ? 'Activa' : 'Inactiva'}
            </span>
          </div>
        </div>

        {song.notes && (
          <p className="mt-3 text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2">{song.notes}</p>
        )}
      </div>

      {/* Tabs: Cifrados en texto | Archivos */}
      <div className="card p-0 overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setTab('cipher-text')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors ${
              tab === 'cipher-text'
                ? 'border-b-2 border-ministry-600 text-ministry-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FileText className="w-4 h-4" />
            Cifrado en texto
          </button>
          <button
            onClick={() => setTab('files')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors ${
              tab === 'files'
                ? 'border-b-2 border-ministry-600 text-ministry-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Upload className="w-4 h-4" />
            Archivos adjuntos
            <span className="text-xs text-gray-400">(PDF, Word, imagen)</span>
          </button>
        </div>

        <div className="p-5">
          {tab === 'cipher-text' && <CipherTextSection songId={id} />}
          {tab === 'files'       && <CipherFilesSection songId={id} />}
        </div>
      </div>
    </div>
  )
}
