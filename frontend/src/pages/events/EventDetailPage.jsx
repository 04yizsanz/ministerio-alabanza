import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Plus, Edit, Trash2, ChevronDown, ChevronUp, Save, Music2, Users, X, CalendarDays } from 'lucide-react'
import { eventsService, blocksService } from '../../services/events'
import { songsService } from '../../services/songs'
import { peopleService, rolesService } from '../../services/people'
import Alert from '../../components/ui/Alert'
import Spinner from '../../components/ui/Spinner'

const KEYS = ['C','C#','Db','D','Eb','E','F','F#','Gb','G','Ab','A','Bb','B',
              'Cm','C#m','Dm','Ebm','Em','Fm','F#m','Gm','Abm','Am','Bbm','Bm']

function formatDate(d) {
  if (!d) return ''
  return new Date(d + 'T12:00:00').toLocaleDateString('es', { weekday:'long', day:'numeric', month:'long' })
}

// ─── Modal para agregar canción al bloque ─────────────────────────────────────
function AddSongModal({ blockId, onAdded, onClose }) {
  const [songs, setSongs]     = useState([])
  const [search, setSearch]   = useState('')
  const [selected, setSelected] = useState(null)
  const [keyUsed, setKeyUsed] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving]   = useState(false)

  useEffect(() => {
    setLoading(true)
    songsService.getAll({ search, active: true, per_page: 30 })
      .then(({ data }) => setSongs(data.data))
      .finally(() => setLoading(false))
  }, [search])

  const handleAdd = async () => {
    if (!selected) return
    setSaving(true)
    try {
      const { data } = await blocksService.addSong(blockId, {
        song_id:  selected.id,
        key_used: keyUsed || selected.original_key,
      })
      onAdded(data)
      onClose()
    } catch (err) {
      alert(err.response?.data?.message || 'Error al agregar canción.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Music2 className="w-4 h-4 text-ministry-600" /> Agregar canción
          </h3>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>
        <div className="p-5 space-y-3">
          <input
            className="form-input"
            placeholder="Buscar canción..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
          />
          <div className="max-h-52 overflow-y-auto space-y-1 border border-gray-100 rounded-lg">
            {loading ? (
              <div className="flex justify-center py-6"><Spinner size="sm" /></div>
            ) : songs.map(song => (
              <button
                key={song.id}
                onClick={() => { setSelected(song); setKeyUsed(song.original_key || '') }}
                className={`w-full flex items-center gap-3 px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${selected?.id === song.id ? 'bg-ministry-50' : ''}`}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{song.title}</p>
                  <p className="text-xs text-gray-400">{song.artist}</p>
                </div>
                {song.original_key && (
                  <span className="text-xs bg-ministry-100 text-ministry-700 px-2 py-0.5 rounded-full font-semibold">{song.original_key}</span>
                )}
              </button>
            ))}
          </div>

          {selected && (
            <div className="bg-ministry-50 rounded-lg p-3 space-y-2">
              <p className="text-sm font-medium text-ministry-800">{selected.title}</p>
              <div>
                <label className="form-label text-xs">Tonalidad para esta programación</label>
                <select className="form-input" value={keyUsed} onChange={e => setKeyUsed(e.target.value)}>
                  <option value="">Sin especificar</option>
                  {KEYS.map(k => <option key={k} value={k}>{k}</option>)}
                </select>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button onClick={onClose} className="btn-secondary text-sm">Cancelar</button>
            <button onClick={handleAdd} disabled={!selected || saving} className="btn-primary text-sm">
              {saving ? 'Agregando...' : 'Agregar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Modal para asignar personas a funciones ──────────────────────────────────
function AssignmentsModal({ block, roles, people, onSaved, onClose }) {
  // Estado local: mapa roleId → lista de person_id asignados en ese bloque
  const [assignments, setAssignments] = useState(() => {
    const map = {}
    roles.forEach(r => { map[r.id] = [] })
    block.block_assignments?.forEach(a => {
      if (!map[a.musical_role_id]) map[a.musical_role_id] = []
      map[a.musical_role_id].push(a.person_id)
    })
    return map
  })
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  const togglePerson = (roleId, personId) => {
    setAssignments(prev => {
      const current = prev[roleId] || []
      return {
        ...prev,
        [roleId]: current.includes(personId)
          ? current.filter(id => id !== personId)
          : [...current, personId],
      }
    })
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    // Construir array plano de asignaciones
    const list = []
    Object.entries(assignments).forEach(([roleId, personIds]) => {
      if (personIds.length === 0) {
        // Rol sin asignar: guardar con person_id null para mantener la fila visible
        list.push({ musical_role_id: Number(roleId), person_id: null })
      } else {
        personIds.forEach(pid => list.push({ musical_role_id: Number(roleId), person_id: pid }))
      }
    })
    try {
      await blocksService.bulkAssignments(block.id, { assignments: list })
      onSaved()
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar las asignaciones.')
    } finally {
      setSaving(false)
    }
  }

  const catLabels = { music: 'Musicales', tech: 'Técnicas', service: 'Servicio' }
  const grouped   = roles.reduce((acc, r) => {
    if (!acc[r.category]) acc[r.category] = []
    acc[r.category].push(r)
    return acc
  }, {})

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-ministry-600" />
            Asignar integrantes — {block.name}
          </h3>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-4">
          <Alert type="error" message={error} onClose={() => setError('')} />

          {Object.entries(grouped).map(([cat, catRoles]) => (
            <div key={cat}>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{catLabels[cat]}</p>
              <div className="space-y-3">
                {catRoles.map(role => (
                  <div key={role.id} className="border border-gray-100 rounded-lg p-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">{role.name}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {people.map(person => (
                        <button
                          key={person.id}
                          type="button"
                          onClick={() => togglePerson(role.id, person.id)}
                          className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                            assignments[role.id]?.includes(person.id)
                              ? 'bg-ministry-600 border-ministry-600 text-white'
                              : 'bg-white border-gray-200 text-gray-600 hover:border-ministry-300'
                          }`}
                        >
                          {person.first_name} {person.last_name}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2 px-5 py-4 border-t flex-shrink-0">
          <button onClick={onClose} className="btn-secondary text-sm">Cancelar</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary text-sm flex items-center gap-2">
            <Save className="w-4 h-4" />
            {saving ? 'Guardando...' : 'Guardar asignaciones'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Tarjeta de un bloque ─────────────────────────────────────────────────────
function BlockCard({ block, roles, people, onUpdate, onDelete }) {
  const [expanded, setExpanded]     = useState(true)
  const [showAddSong, setShowAddSong] = useState(false)
  const [showAssign, setShowAssign]  = useState(false)
  const [localBlock, setLocalBlock]  = useState(block)
  const [editName, setEditName]      = useState(false)
  const [nameVal, setNameVal]        = useState(block.name)

  const handleSongAdded = (song) => {
    setLocalBlock(prev => ({ ...prev, block_songs: [...(prev.block_songs || []), song] }))
  }

  const handleRemoveSong = async (bsId) => {
    if (!window.confirm('¿Quitar esta canción del bloque?')) return
    try {
      await blocksService.removeSong(bsId)
      setLocalBlock(prev => ({ ...prev, block_songs: prev.block_songs.filter(s => s.id !== bsId) }))
    } catch { alert('No se pudo eliminar.') }
  }

  const saveName = async () => {
    if (!nameVal.trim()) return
    try {
      await blocksService.update(localBlock.id, { name: nameVal })
      setLocalBlock(prev => ({ ...prev, name: nameVal }))
      setEditName(false)
    } catch { alert('Error al renombrar.') }
  }

  const handleAssignmentsSaved = () => {
    // Recargar el bloque para mostrar las asignaciones actualizadas
    onUpdate()
  }

  const catColor = { music: 'text-ministry-700 bg-ministry-50', tech: 'text-blue-700 bg-blue-50', service: 'text-emerald-700 bg-emerald-50' }

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      {/* Header del bloque */}
      <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-100">
        {editName ? (
          <div className="flex items-center gap-2 flex-1">
            <input
              className="form-input py-1 text-sm flex-1"
              value={nameVal}
              onChange={e => setNameVal(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && saveName()}
              autoFocus
            />
            <button onClick={saveName} className="text-ministry-600 text-xs font-medium hover:underline">Guardar</button>
            <button onClick={() => { setEditName(false); setNameVal(localBlock.name) }} className="text-gray-400 text-xs hover:underline">Cancelar</button>
          </div>
        ) : (
          <button onClick={() => setExpanded(!expanded)} className="flex-1 flex items-center gap-2 text-left">
            <span className="font-semibold text-gray-800 text-sm">{localBlock.name}</span>
            {localBlock.block_date && (
              <span className="text-xs text-gray-400">{formatDate(localBlock.block_date)}</span>
            )}
          </button>
        )}
        <div className="flex items-center gap-1">
          <button onClick={() => setEditName(true)} className="text-gray-400 hover:text-ministry-600 p-1" title="Renombrar"><Edit className="w-3.5 h-3.5" /></button>
          <button onClick={() => setShowAssign(true)} className="text-gray-400 hover:text-blue-600 p-1" title="Asignar personas"><Users className="w-3.5 h-3.5" /></button>
          <button onClick={onDelete} className="text-gray-400 hover:text-red-500 p-1" title="Eliminar bloque"><Trash2 className="w-3.5 h-3.5" /></button>
          <button onClick={() => setExpanded(!expanded)} className="text-gray-400 p-1">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="p-4 space-y-4">
          {/* Asignaciones de funciones */}
          {localBlock.block_assignments?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Equipo</p>
              <div className="flex flex-wrap gap-1.5">
                {localBlock.block_assignments
                  .filter(a => a.person)
                  .map(a => (
                    <span key={a.id} className={`text-xs px-2.5 py-1 rounded-full font-medium ${catColor[a.musical_role?.category] || 'bg-gray-100 text-gray-600'}`}>
                      {a.musical_role?.name}: {a.person?.first_name} {a.person?.last_name}
                    </span>
                  ))}
              </div>
            </div>
          )}

          {/* Canciones */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Canciones</p>
            {localBlock.block_songs?.length === 0 && (
              <p className="text-sm text-gray-400 italic">Sin canciones aún</p>
            )}
            <div className="space-y-1.5">
              {localBlock.block_songs?.map((bs, idx) => (
                <div key={bs.id} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg group">
                  <span className="text-xs text-gray-400 w-5 text-center">{idx + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{bs.song?.title}</p>
                    <p className="text-xs text-gray-400">{bs.song?.artist}</p>
                  </div>
                  {bs.key_used && (
                    <span className="text-xs bg-ministry-100 text-ministry-700 px-2 py-0.5 rounded-full font-semibold">{bs.key_used}</span>
                  )}
                  <button
                    onClick={() => handleRemoveSong(bs.id)}
                    className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowAddSong(true)}
              className="mt-2 w-full flex items-center justify-center gap-1.5 text-xs text-ministry-600 hover:text-ministry-700 border border-dashed border-ministry-300 rounded-lg py-2 hover:bg-ministry-50 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Agregar canción
            </button>
          </div>
        </div>
      )}

      {showAddSong && (
        <AddSongModal
          blockId={localBlock.id}
          onAdded={handleSongAdded}
          onClose={() => setShowAddSong(false)}
        />
      )}

      {showAssign && (
        <AssignmentsModal
          block={localBlock}
          roles={roles}
          people={people}
          onSaved={handleAssignmentsSaved}
          onClose={() => setShowAssign(false)}
        />
      )}
    </div>
  )
}

// ─── Página principal del evento ──────────────────────────────────────────────
export default function EventDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [event, setEvent]   = useState(null)
  const [blocks, setBlocks] = useState([])
  const [roles, setRoles]   = useState([])
  const [people, setPeople] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState('')
  const [addingBlock, setAddingBlock] = useState(false)
  const [newBlockName, setNewBlockName] = useState('')

  const loadBlocks = async () => {
    const { data } = await blocksService.getAll(id)
    setBlocks(data)
  }

  useEffect(() => {
    Promise.all([
      eventsService.getOne(id),
      blocksService.getAll(id),
      rolesService.getAll(),
      peopleService.getAll2(),
    ]).then(([ev, bl, ro, pe]) => {
      setEvent(ev.data)
      setBlocks(bl.data)
      setRoles(ro.data)
      setPeople(pe.data)
    }).catch(() => setError('No se pudo cargar el evento.'))
      .finally(() => setLoading(false))
  }, [id])

  const handleAddBlock = async () => {
    if (!newBlockName.trim()) return
    try {
      const { data } = await blocksService.create(id, { name: newBlockName })
      setBlocks(prev => [...prev, { ...data, block_songs: [], block_assignments: [] }])
      setNewBlockName('')
      setAddingBlock(false)
    } catch { setError('No se pudo crear el bloque.') }
  }

  const handleDeleteBlock = async (blockId) => {
    if (!window.confirm('¿Eliminar este bloque y todas sus canciones?')) return
    try {
      await blocksService.remove(blockId)
      setBlocks(prev => prev.filter(b => b.id !== blockId))
    } catch { setError('No se pudo eliminar el bloque.') }
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>
  if (!event) return <Alert type="error" message={error || 'Evento no encontrado.'} />

  const typeColor = event.event_type?.color || '#e8003a'

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Navegación */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/events')} className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <nav className="text-sm text-gray-500">
          <Link to="/events" className="hover:text-ministry-600">Eventos</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-800 font-medium">{event.name}</span>
        </nav>
      </div>

      <Alert type="error" message={error} onClose={() => setError('')} />

      {/* Encabezado del evento */}
      <div className="card">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: typeColor + '22' }}>
              <CalendarDays className="w-6 h-6" style={{ color: typeColor }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900">{event.name}</h1>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-600">
                  {event.event_type?.name}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-0.5">
                {formatDate(event.start_date)}
                {event.end_date && event.end_date !== event.start_date && ` — ${formatDate(event.end_date)}`}
              </p>
            </div>
          </div>
          <Link to={`/events/${id}/edit`} className="btn-secondary text-sm flex items-center gap-2">
            <Edit className="w-4 h-4" /> Editar
          </Link>
        </div>
        {event.description && (
          <p className="mt-3 text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2">{event.description}</p>
        )}
      </div>

      {/* Bloques de programación */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">Programación</h2>
          <button
            onClick={() => setAddingBlock(true)}
            className="btn-primary text-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Agregar bloque
          </button>
        </div>

        {blocks.length === 0 && !addingBlock && (
          <div className="card text-center py-10 text-gray-400">
            <p className="text-sm">No hay bloques de programación aún.</p>
            <button onClick={() => setAddingBlock(true)} className="text-ministry-600 text-sm hover:underline mt-1">
              Agregar el primer bloque
            </button>
          </div>
        )}

        {blocks.map(block => (
          <BlockCard
            key={block.id}
            block={block}
            roles={roles}
            people={people}
            onUpdate={loadBlocks}
            onDelete={() => handleDeleteBlock(block.id)}
          />
        ))}

        {/* Formulario nuevo bloque */}
        {addingBlock && (
          <div className="border-2 border-dashed border-ministry-300 rounded-xl p-4 bg-ministry-50">
            <p className="text-sm font-medium text-ministry-700 mb-2">Nombre del nuevo bloque</p>
            <div className="flex gap-2">
              <input
                className="form-input flex-1"
                placeholder='Ej: "Bloque 1", "Alabanza mañana", "CDO tarde"'
                value={newBlockName}
                onChange={e => setNewBlockName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddBlock()}
                autoFocus
              />
              <button onClick={handleAddBlock} disabled={!newBlockName.trim()} className="btn-primary text-sm">Crear</button>
              <button onClick={() => { setAddingBlock(false); setNewBlockName('') }} className="btn-secondary text-sm">Cancelar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// fin del archivo
