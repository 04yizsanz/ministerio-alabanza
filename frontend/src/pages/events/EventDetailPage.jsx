import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft, Plus, Edit, Trash2, ChevronDown, ChevronUp,
  Save, Music2, Users, X, CalendarDays, ArrowUp, ArrowDown,
  Copy, Check
} from 'lucide-react'
import { eventsService, blocksService } from '../../services/events'
import { songsService } from '../../services/songs'
import { peopleService, rolesService } from '../../services/people'
import Alert from '../../components/ui/Alert'
import Spinner from '../../components/ui/Spinner'

// Tonalidades disponibles
const KEYS = [
  'C','C#','Db','D','Eb','E','F','F#','Gb','G','Ab','A','Bb','B',
  'Cm','C#m','Dm','Ebm','Em','Fm','F#m','Gm','Abm','Am','Bbm','Bm',
]

// Etiquetas de categoría de rol
const CAT_LABELS = { music: 'Musicales', tech: 'Técnicas', service: 'Servicio' }

// Colores por categoría de rol (badge)
const CAT_COLOR = {
  music:   'text-ministry-700 bg-ministry-50 border-ministry-200',
  tech:    'text-blue-700 bg-blue-50 border-blue-200',
  service: 'text-emerald-700 bg-emerald-50 border-emerald-200',
}

function formatDate(d) {
  if (!d) return ''
  return new Date(d + 'T12:00:00').toLocaleDateString('es', {
    weekday: 'long', day: 'numeric', month: 'long',
  })
}

// ─── Modal: Agregar canción al bloque ─────────────────────────────────────────
function AddSongModal({ blockId, people, onAdded, onClose }) {
  const [songs, setSongs]     = useState([])
  const [search, setSearch]   = useState('')
  const [selected, setSelected] = useState(null)
  const [keyUsed, setKeyUsed] = useState('')
  const [leaderId, setLeaderId] = useState('')   // persona responsable principal
  const [loading, setLoading] = useState(false)
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState('')

  useEffect(() => {
    setLoading(true)
    songsService.getAll({ search, active: true, per_page: 30 })
      .then(({ data }) => setSongs(data.data ?? data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [search])

  const handleAdd = async () => {
    if (!selected) return
    setSaving(true)
    setError('')
    try {
      const payload = {
        song_id:  selected.id,
        key_used: keyUsed || selected.original_key || '',
        leaders:  leaderId ? [{ person_id: Number(leaderId), role_label: 'Líder' }] : [],
      }
      const { data } = await blocksService.addSong(blockId, payload)
      onAdded(data)
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Error al agregar canción.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Music2 className="w-4 h-4 text-ministry-600" /> Agregar canción al bloque
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-3">
          {error && <Alert type="error" message={error} onClose={() => setError('')} />}

          {/* Buscador */}
          <input
            className="form-input"
            placeholder="Buscar canción por título o artista..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
          />

          {/* Lista de canciones */}
          <div className="max-h-52 overflow-y-auto border border-gray-100 rounded-lg divide-y divide-gray-50">
            {loading ? (
              <div className="flex justify-center py-6"><Spinner size="sm" /></div>
            ) : songs.length === 0 ? (
              <p className="text-sm text-center text-gray-400 py-4">Sin resultados</p>
            ) : songs.map(song => (
              <button
                key={song.id}
                onClick={() => { setSelected(song); setKeyUsed(song.original_key || '') }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors hover:bg-gray-50 ${
                  selected?.id === song.id ? 'bg-ministry-50 hover:bg-ministry-50' : ''
                }`}
              >
                {selected?.id === song.id && <Check className="w-3.5 h-3.5 text-ministry-600 flex-shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{song.title}</p>
                  <p className="text-xs text-gray-400 truncate">{song.artist}</p>
                </div>
                {song.original_key && (
                  <span className="text-xs bg-ministry-100 text-ministry-700 px-2 py-0.5 rounded-full font-semibold flex-shrink-0">
                    {song.original_key}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Configuración de la canción seleccionada */}
          {selected && (
            <div className="bg-ministry-50 rounded-xl p-3 space-y-3 border border-ministry-100">
              <p className="text-sm font-semibold text-ministry-800">{selected.title}</p>

              <div className="grid grid-cols-2 gap-3">
                {/* Tonalidad */}
                <div>
                  <label className="form-label text-xs">Tonalidad para esta programación</label>
                  <select
                    className="form-input text-sm"
                    value={keyUsed}
                    onChange={e => setKeyUsed(e.target.value)}
                  >
                    <option value="">Sin especificar</option>
                    {KEYS.map(k => <option key={k} value={k}>{k}</option>)}
                  </select>
                </div>

                {/* Responsable */}
                <div>
                  <label className="form-label text-xs">Responsable / Líder</label>
                  <select
                    className="form-input text-sm"
                    value={leaderId}
                    onChange={e => setLeaderId(e.target.value)}
                  >
                    <option value="">Sin asignar</option>
                    {people.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.first_name} {p.last_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Acciones */}
          <div className="flex justify-end gap-2 pt-1">
            <button onClick={onClose} className="btn-secondary text-sm">Cancelar</button>
            <button
              onClick={handleAdd}
              disabled={!selected || saving}
              className="btn-primary text-sm"
            >
              {saving ? 'Agregando...' : 'Agregar al bloque'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Modal: Editar canción ya agregada al bloque ──────────────────────────────
function EditSongModal({ blockSong, people, onSaved, onClose }) {
  const [keyUsed, setKeyUsed]       = useState(blockSong.key_used || '')
  const [structure, setStructure]   = useState(blockSong.structure_notes || '')
  const [perfNotes, setPerfNotes]   = useState(blockSong.performance_notes || '')
  const [leaderId, setLeaderId]     = useState(
    blockSong.leaders?.[0]?.person?.id?.toString() || ''
  )
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      const payload = {
        key_used:          keyUsed || null,
        structure_notes:   structure || null,
        performance_notes: perfNotes || null,
        leaders: leaderId ? [{ person_id: Number(leaderId), role_label: 'Líder' }] : [],
      }
      const { data } = await blocksService.updateSong(blockSong.id, payload)
      onSaved(data)
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Edit className="w-4 h-4 text-ministry-600" />
            Editar — {blockSong.song?.title}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {error && <Alert type="error" message={error} onClose={() => setError('')} />}

          {/* Tonalidad */}
          <div>
            <label className="form-label">Tonalidad para esta programación</label>
            <select className="form-input" value={keyUsed} onChange={e => setKeyUsed(e.target.value)}>
              <option value="">Sin especificar</option>
              {KEYS.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
            {blockSong.song?.original_key && (
              <p className="text-xs text-gray-400 mt-1">
                Tonalidad original: <strong>{blockSong.song.original_key}</strong>
              </p>
            )}
          </div>

          {/* Responsable */}
          <div>
            <label className="form-label">Responsable / Líder</label>
            <select className="form-input" value={leaderId} onChange={e => setLeaderId(e.target.value)}>
              <option value="">Sin asignar</option>
              {people.map(p => (
                <option key={p.id} value={p.id}>
                  {p.first_name} {p.last_name}
                </option>
              ))}
            </select>
          </div>

          {/* Estructura */}
          <div>
            <label className="form-label">Estructura de interpretación</label>
            <input
              className="form-input"
              placeholder="Ej: Intro – V1 – C – V2 – C – P – C×2"
              value={structure}
              onChange={e => setStructure(e.target.value)}
            />
          </div>

          {/* Notas */}
          <div>
            <label className="form-label">Observaciones</label>
            <textarea
              className="form-input resize-none"
              rows={2}
              placeholder="Notas de interpretación..."
              value={perfNotes}
              onChange={e => setPerfNotes(e.target.value)}
            />
          </div>

          {/* Acciones */}
          <div className="flex justify-end gap-2 pt-1">
            <button onClick={onClose} className="btn-secondary text-sm">Cancelar</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary text-sm flex items-center gap-2">
              <Save className="w-4 h-4" />
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Modal: Asignar personas a funciones del bloque ───────────────────────────
function AssignmentsModal({ block, roles, people, onSaved, onClose }) {
  // Inicializa: mapa roleId → [personId, ...]
  const [assignments, setAssignments] = useState(() => {
    const map = {}
    roles.forEach(r => { map[r.id] = [] })
    block.block_assignments?.forEach(a => {
      if (a.person_id) {
        if (!map[a.musical_role_id]) map[a.musical_role_id] = []
        if (!map[a.musical_role_id].includes(a.person_id)) {
          map[a.musical_role_id].push(a.person_id)
        }
      }
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

    // Construir lista plana. Roles sin asignar se guardan con person_id null
    // para preservar la visibilidad de la fila en la plantilla.
    const list = []
    Object.entries(assignments).forEach(([roleId, personIds]) => {
      if (personIds.length === 0) {
        list.push({ musical_role_id: Number(roleId), person_id: null })
      } else {
        personIds.forEach(pid =>
          list.push({ musical_role_id: Number(roleId), person_id: pid })
        )
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

  // Agrupar roles por categoría
  const grouped = roles.reduce((acc, r) => {
    if (!acc[r.category]) acc[r.category] = []
    acc[r.category].push(r)
    return acc
  }, {})

  // Conteo de personas ya asignadas
  const assignedCount = Object.values(assignments).flat().length

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0">
          <div>
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-ministry-600" />
              Asignar equipo — {block.name}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {assignedCount} persona{assignedCount !== 1 ? 's' : ''} asignada{assignedCount !== 1 ? 's' : ''}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-5 space-y-5">
          <Alert type="error" message={error} onClose={() => setError('')} />

          {Object.entries(grouped).map(([cat, catRoles]) => (
            <div key={cat}>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
                {CAT_LABELS[cat] || cat}
              </p>
              <div className="space-y-2">
                {catRoles.map(role => (
                  <div key={role.id} className="border border-gray-100 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-sm font-medium text-gray-700">{role.name}</p>
                      {assignments[role.id]?.length > 0 && (
                        <span className="text-xs bg-ministry-100 text-ministry-700 px-1.5 py-0.5 rounded-full font-semibold">
                          {assignments[role.id].length}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {people.map(person => {
                        const isSelected = assignments[role.id]?.includes(person.id)
                        return (
                          <button
                            key={person.id}
                            type="button"
                            onClick={() => togglePerson(role.id, person.id)}
                            className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                              isSelected
                                ? 'bg-ministry-600 border-ministry-600 text-white shadow-sm'
                                : 'bg-white border-gray-200 text-gray-600 hover:border-ministry-300 hover:text-ministry-700'
                            }`}
                          >
                            {isSelected && <Check className="w-2.5 h-2.5 inline mr-1" />}
                            {person.first_name} {person.last_name}
                          </button>
                        )
                      })}
                      {people.length === 0 && (
                        <p className="text-xs text-gray-400 italic">Sin integrantes registrados</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t flex-shrink-0 bg-gray-50">
          <p className="text-xs text-gray-400">
            Haz clic en un nombre para asignarlo o quitarlo de una función.
          </p>
          <div className="flex gap-2">
            <button onClick={onClose} className="btn-secondary text-sm">Cancelar</button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary text-sm flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Guardando...' : 'Guardar equipo'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Componente: Fila de canción dentro de un bloque ─────────────────────────
function SongRow({ bs, index, total, people, onUpdate, onRemove, onMoveUp, onMoveDown }) {
  const [showEdit, setShowEdit] = useState(false)

  const handleSaved = (updated) => {
    onUpdate(updated)
  }

  return (
    <>
      <div className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-lg group hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-gray-100">

        {/* Número de orden */}
        <span className="text-xs text-gray-400 w-5 text-center flex-shrink-0 font-mono">{index + 1}</span>

        {/* Datos de la canción */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800 truncate">{bs.song?.title}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-xs text-gray-400 truncate">{bs.song?.artist}</p>
            {bs.leaders?.[0]?.person && (
              <span className="text-xs text-ministry-600 font-medium truncate">
                · {bs.leaders[0].person.first_name} {bs.leaders[0].person.last_name}
              </span>
            )}
            {bs.structure_notes && (
              <span className="text-xs text-gray-400 italic truncate hidden sm:block">
                · {bs.structure_notes}
              </span>
            )}
          </div>
        </div>

        {/* Tonalidad */}
        {bs.key_used && (
          <span className="text-xs bg-ministry-100 text-ministry-700 px-2 py-0.5 rounded-full font-semibold flex-shrink-0">
            {bs.key_used}
          </span>
        )}

        {/* Acciones (visibles al hover) */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          {/* Mover arriba */}
          <button
            onClick={onMoveUp}
            disabled={index === 0}
            className="p-1 text-gray-300 hover:text-gray-600 disabled:opacity-0"
            title="Subir"
          >
            <ArrowUp className="w-3 h-3" />
          </button>

          {/* Mover abajo */}
          <button
            onClick={onMoveDown}
            disabled={index === total - 1}
            className="p-1 text-gray-300 hover:text-gray-600 disabled:opacity-0"
            title="Bajar"
          >
            <ArrowDown className="w-3 h-3" />
          </button>

          {/* Editar */}
          <button
            onClick={() => setShowEdit(true)}
            className="p-1 text-gray-300 hover:text-ministry-600"
            title="Editar tonalidad y notas"
          >
            <Edit className="w-3 h-3" />
          </button>

          {/* Quitar */}
          <button
            onClick={onRemove}
            className="p-1 text-gray-300 hover:text-red-500"
            title="Quitar del bloque"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Modal de edición */}
      {showEdit && (
        <EditSongModal
          blockSong={bs}
          people={people}
          onSaved={handleSaved}
          onClose={() => setShowEdit(false)}
        />
      )}
    </>
  )
}

// ─── Componente: Tarjeta de un bloque de programación ────────────────────────
function BlockCard({ block: initialBlock, roles, people, onUpdate, onDelete, onDuplicate, isFirst, isLast }) {
  const [block, setBlock]           = useState(initialBlock)
  const [expanded, setExpanded]     = useState(true)
  const [showAddSong, setShowAddSong] = useState(false)
  const [showAssign, setShowAssign]  = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [nameVal, setNameVal]        = useState(initialBlock.name)
  const [saving, setSaving]          = useState(false)

  // Sincroniza si el bloque cambia desde el padre (ej. después de duplicar)
  useEffect(() => {
    setBlock(initialBlock)
    setNameVal(initialBlock.name)
  }, [initialBlock])

  // Guardar nombre renombrado
  const saveName = async () => {
    if (!nameVal.trim() || nameVal === block.name) {
      setEditingName(false)
      return
    }
    setSaving(true)
    try {
      await blocksService.update(block.id, { name: nameVal })
      setBlock(prev => ({ ...prev, name: nameVal }))
      setEditingName(false)
    } catch {
      alert('No se pudo renombrar el bloque.')
      setNameVal(block.name)
    } finally {
      setSaving(false)
    }
  }

  // Agregar canción
  const handleSongAdded = (newSong) => {
    setBlock(prev => ({
      ...prev,
      block_songs: [...(prev.block_songs ?? []), newSong],
    }))
  }

  // Actualizar canción editada
  const handleSongUpdated = (updatedSong) => {
    setBlock(prev => ({
      ...prev,
      block_songs: prev.block_songs.map(s => s.id === updatedSong.id ? updatedSong : s),
    }))
  }

  // Quitar canción
  const handleRemoveSong = async (bsId) => {
    if (!window.confirm('¿Quitar esta canción del bloque?')) return
    try {
      await blocksService.removeSong(bsId)
      setBlock(prev => ({
        ...prev,
        block_songs: prev.block_songs.filter(s => s.id !== bsId),
      }))
    } catch {
      alert('No se pudo quitar la canción.')
    }
  }

  // Reordenar canciones (intercambio de posiciones + persistir sort_order)
  const handleMoveSong = async (index, direction) => {
    const songs = [...(block.block_songs ?? [])]
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= songs.length) return

    // Intercambiar en el estado local inmediatamente (UX fluido)
    ;[songs[index], songs[targetIndex]] = [songs[targetIndex], songs[index]]
    setBlock(prev => ({ ...prev, block_songs: songs }))

    // Persistir el nuevo sort_order de los dos afectados
    try {
      await Promise.all([
        blocksService.updateSong(songs[index].id,       { sort_order: index }),
        blocksService.updateSong(songs[targetIndex].id, { sort_order: targetIndex }),
      ])
    } catch {
      // Si falla, revertir
      ;[songs[index], songs[targetIndex]] = [songs[targetIndex], songs[index]]
      setBlock(prev => ({ ...prev, block_songs: songs }))
      alert('No se pudo reordenar.')
    }
  }

  // Guardar asignaciones y recargar bloque
  const handleAssignmentsSaved = () => {
    onUpdate()   // recarga todos los bloques desde la API para obtener asignaciones frescas
  }

  const songs        = block.block_songs ?? []
  const assignments  = (block.block_assignments ?? []).filter(a => a.person)

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">

      {/* ── Header del bloque ── */}
      <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-100">

        {editingName ? (
          <div className="flex items-center gap-2 flex-1">
            <input
              className="form-input py-1 text-sm flex-1"
              value={nameVal}
              onChange={e => setNameVal(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') { setEditingName(false); setNameVal(block.name) } }}
              autoFocus
            />
            <button onClick={saveName} disabled={saving} className="text-ministry-600 text-xs font-medium hover:underline">
              {saving ? '...' : 'OK'}
            </button>
            <button onClick={() => { setEditingName(false); setNameVal(block.name) }} className="text-gray-400 text-xs hover:underline">
              Cancelar
            </button>
          </div>
        ) : (
          <button onClick={() => setExpanded(e => !e)} className="flex-1 flex items-center gap-2 text-left min-w-0">
            <span className="font-semibold text-gray-800 text-sm truncate">{block.name}</span>
            {block.block_date && (
              <span className="text-xs text-gray-400 flex-shrink-0">{formatDate(block.block_date)}</span>
            )}
            {songs.length > 0 && (
              <span className="text-xs bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded-full flex-shrink-0">
                {songs.length} {songs.length === 1 ? 'canción' : 'canciones'}
              </span>
            )}
          </button>
        )}

        {/* Botones de acción del bloque */}
        <div className="flex items-center gap-0.5 flex-shrink-0">
          <button onClick={() => setEditingName(true)} className="p-1.5 text-gray-400 hover:text-ministry-600 rounded-lg hover:bg-white" title="Renombrar">
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setShowAssign(true)} className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-white" title="Asignar equipo">
            <Users className="w-3.5 h-3.5" />
          </button>
          <button onClick={onDuplicate} className="p-1.5 text-gray-400 hover:text-emerald-600 rounded-lg hover:bg-white" title="Duplicar bloque">
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button onClick={onDelete} className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-white" title="Eliminar bloque">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setExpanded(e => !e)} className="p-1.5 text-gray-400 hover:text-gray-600">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ── Cuerpo expandible ── */}
      {expanded && (
        <div className="p-4 space-y-4">

          {/* Equipo asignado */}
          {assignments.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Equipo</p>
                <button
                  onClick={() => setShowAssign(true)}
                  className="text-xs text-ministry-600 hover:text-ministry-700 hover:underline"
                >
                  Editar
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {assignments.map(a => (
                  <span
                    key={a.id}
                    className={`text-xs px-2.5 py-1 rounded-full border font-medium ${CAT_COLOR[a.musical_role?.category] || 'bg-gray-100 text-gray-600 border-gray-200'}`}
                  >
                    <span className="opacity-60 mr-1">{a.musical_role?.name}:</span>
                    {a.person?.first_name} {a.person?.last_name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Sin equipo asignado */}
          {assignments.length === 0 && (
            <button
              onClick={() => setShowAssign(true)}
              className="w-full flex items-center justify-center gap-1.5 text-xs text-blue-500 hover:text-blue-600 border border-dashed border-blue-200 rounded-lg py-2 hover:bg-blue-50 transition-colors"
            >
              <Users className="w-3.5 h-3.5" /> Asignar equipo a este bloque
            </button>
          )}

          {/* Canciones del bloque */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Canciones</p>

            {songs.length === 0 ? (
              <p className="text-sm text-gray-400 italic text-center py-2">Sin canciones aún</p>
            ) : (
              <div className="space-y-1.5">
                {songs.map((bs, idx) => (
                  <SongRow
                    key={bs.id}
                    bs={bs}
                    index={idx}
                    total={songs.length}
                    people={people}
                    onUpdate={handleSongUpdated}
                    onRemove={() => handleRemoveSong(bs.id)}
                    onMoveUp={() => handleMoveSong(idx, -1)}
                    onMoveDown={() => handleMoveSong(idx, +1)}
                  />
                ))}
              </div>
            )}

            {/* Botón agregar canción */}
            <button
              onClick={() => setShowAddSong(true)}
              className="mt-2 w-full flex items-center justify-center gap-1.5 text-xs text-ministry-600 hover:text-ministry-700 border border-dashed border-ministry-300 rounded-lg py-2.5 hover:bg-ministry-50 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Agregar canción
            </button>
          </div>
        </div>
      )}

      {/* Modales */}
      {showAddSong && (
        <AddSongModal
          blockId={block.id}
          people={people}
          onAdded={handleSongAdded}
          onClose={() => setShowAddSong(false)}
        />
      )}

      {showAssign && (
        <AssignmentsModal
          block={block}
          roles={roles}
          people={people}
          onSaved={handleAssignmentsSaved}
          onClose={() => setShowAssign(false)}
        />
      )}
    </div>
  )
}

// ─── Página principal: Detalle del evento + Editor de programación ────────────
export default function EventDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [event, setEvent]     = useState(null)
  const [blocks, setBlocks]   = useState([])
  const [roles, setRoles]     = useState([])
  const [people, setPeople]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [addingBlock, setAddingBlock]   = useState(false)
  const [newBlockName, setNewBlockName] = useState('')
  const [duplicating, setDuplicating]   = useState(false)

  // Carga todos los bloques del evento desde la API
  const loadBlocks = useCallback(async () => {
    try {
      const { data } = await blocksService.getAll(id)
      setBlocks(data)
    } catch {
      setError('No se pudieron actualizar los bloques.')
    }
  }, [id])

  // Carga inicial: evento + bloques + roles + personas en paralelo
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

  // Agregar un bloque nuevo
  const handleAddBlock = async () => {
    if (!newBlockName.trim()) return
    try {
      const { data } = await blocksService.create(id, { name: newBlockName })
      setBlocks(prev => [
        ...prev,
        { ...data, block_songs: [], block_assignments: [] },
      ])
      setNewBlockName('')
      setAddingBlock(false)
    } catch {
      setError('No se pudo crear el bloque.')
    }
  }

  // Eliminar bloque con confirmación
  const handleDeleteBlock = async (blockId) => {
    if (!window.confirm('¿Eliminar este bloque y todas sus canciones? Esta acción no se puede deshacer.')) return
    try {
      await blocksService.remove(blockId)
      setBlocks(prev => prev.filter(b => b.id !== blockId))
    } catch {
      setError('No se pudo eliminar el bloque.')
    }
  }

  // Duplicar bloque: usa el endpoint del servidor (atómico con transacción DB)
  const handleDuplicateBlock = async (block) => {
    setDuplicating(true)
    try {
      await blocksService.duplicate(block.id)
      await loadBlocks()
    } catch {
      setError('No se pudo duplicar el bloque.')
    } finally {
      setDuplicating(false)
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Spinner size="lg" />
        <p className="text-sm text-gray-400">Cargando programación...</p>
      </div>
    )
  }

  if (!event) {
    return <Alert type="error" message={error || 'Evento no encontrado.'} />
  }

  const typeColor  = event.event_type?.color || '#e8003a'
  const blockCount = blocks.length
  const songCount  = blocks.reduce((acc, b) => acc + (b.block_songs?.length ?? 0), 0)

  return (
    <div className="max-w-4xl mx-auto space-y-5 pb-10">

      {/* ── Navegación ── */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/events')} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <nav className="text-sm text-gray-500 flex items-center gap-1">
          <Link to="/events" className="hover:text-ministry-600">Eventos</Link>
          <span>/</span>
          <span className="text-gray-800 font-medium">{event.name}</span>
        </nav>
      </div>

      <Alert type="error" message={error} onClose={() => setError('')} />

      {/* ── Encabezado del evento ── */}
      <div className="card">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Icono con color del tipo */}
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: typeColor + '22' }}
            >
              <CalendarDays className="w-6 h-6" style={{ color: typeColor }} />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-gray-900">{event.name}</h1>
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium text-white"
                  style={{ backgroundColor: typeColor }}
                >
                  {event.event_type?.name}
                </span>
                {event.status === 'draft' && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 font-medium">
                    Borrador
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-0.5">
                {formatDate(event.start_date)}
                {event.end_date && event.end_date !== event.start_date
                  ? ` — ${formatDate(event.end_date)}`
                  : ''}
              </p>

              {/* Resumen rápido */}
              <div className="flex items-center gap-3 mt-2">
                <span className="text-xs text-gray-400">
                  {blockCount} {blockCount === 1 ? 'bloque' : 'bloques'}
                </span>
                <span className="text-gray-200">·</span>
                <span className="text-xs text-gray-400">
                  {songCount} {songCount === 1 ? 'canción' : 'canciones'} en total
                </span>
              </div>
            </div>
          </div>

          <Link to={`/events/${id}/edit`} className="btn-secondary text-sm flex items-center gap-2 flex-shrink-0">
            <Edit className="w-4 h-4" /> Editar evento
          </Link>
          <Link to={`/events/${id}/schedule`} className="btn-primary text-sm flex items-center gap-2 flex-shrink-0">
            <CalendarDays className="w-4 h-4" /> Ver programación
          </Link>
        </div>

        {event.description && (
          <p className="mt-3 text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2.5 border border-gray-100">
            {event.description}
          </p>
        )}
      </div>

      {/* ── Sección de bloques de programación ── */}
      <div className="space-y-3">

        {/* Encabezado de sección */}
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2">
            Programación
            {duplicating && (
              <span className="text-xs text-gray-400 font-normal flex items-center gap-1">
                <Spinner size="xs" /> Duplicando...
              </span>
            )}
          </h2>
          <button
            onClick={() => setAddingBlock(true)}
            className="btn-primary text-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Agregar bloque
          </button>
        </div>

        {/* Estado vacío */}
        {blocks.length === 0 && !addingBlock && (
          <div className="card text-center py-12 text-gray-400">
            <Music2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">Sin bloques de programación</p>
            <p className="text-xs mt-1 mb-3">Agrega el primer bloque para comenzar a programar canciones y asignar el equipo.</p>
            <button onClick={() => setAddingBlock(true)} className="btn-primary text-sm">
              Agregar primer bloque
            </button>
          </div>
        )}

        {/* Lista de bloques */}
        {blocks.map((block, index) => (
          <BlockCard
            key={block.id}
            block={block}
            roles={roles}
            people={people}
            onUpdate={loadBlocks}
            onDelete={() => handleDeleteBlock(block.id)}
            onDuplicate={() => handleDuplicateBlock(block)}
            isFirst={index === 0}
            isLast={index === blocks.length - 1}
          />
        ))}

        {/* Formulario: nuevo bloque */}
        {addingBlock && (
          <div className="border-2 border-dashed border-ministry-300 rounded-xl p-4 bg-ministry-50">
            <p className="text-sm font-medium text-ministry-700 mb-2">Nombre del nuevo bloque</p>
            <p className="text-xs text-gray-500 mb-3">
              Ejemplos: "Bloque 1", "Alabanza mañana", "CDO tarde", "Apertura Blaze"
            </p>
            <div className="flex gap-2">
              <input
                className="form-input flex-1"
                placeholder="Nombre del bloque..."
                value={newBlockName}
                onChange={e => setNewBlockName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAddBlock(); if (e.key === 'Escape') { setAddingBlock(false); setNewBlockName('') } }}
                autoFocus
              />
              <button
                onClick={handleAddBlock}
                disabled={!newBlockName.trim()}
                className="btn-primary text-sm"
              >
                Crear
              </button>
              <button
                onClick={() => { setAddingBlock(false); setNewBlockName('') }}
                className="btn-secondary text-sm"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
