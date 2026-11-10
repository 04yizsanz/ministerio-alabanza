/**
 * CdoTemplate — Plantilla visual para programaciones de CDO.
 *
 * Estructura con bloques en paralelo (Bloque 1 | Bloque 2):
 * ┌────────────────────────────────────────────────────────┐
 * │              MINISTERIO DE ALABANZA                    │
 * │  CDO  │  Fecha                                         │
 * ├──────────────────┬─────────────────────────────────────│
 * │  BLOQUE 1        │  BLOQUE 2                           │
 * │  Función | Resp  │  Función | Resp  │                  │
 * │  Canciones       │  Canciones                          │
 * ├──────────────────┴─────────────────────────────────────│
 * │  Servicio: encargado, servidor, etc.                   │
 * └────────────────────────────────────────────────────────┘
 *
 * Si hay más de 2 bloques se muestran en pares adicionales.
 * Colores: morado (#7c3aed).
 */

import { useMemo } from 'react'

const C = {
  headerBg:     '#7c3aed',
  headerText:   '#ffffff',
  subHeaderBg:  '#ede9fe',
  subHeaderText:'#4c1d95',
  teamBg:       '#faf9ff',
  borderColor:  '#c4b5fd',
  altRow:       '#ede9fe',
  blockTitleBg: '#5b21b6',
  serviceBg:    '#f5f3ff',
  serviceLabel: '#6d28d9',
}

const BASE_CELL = {
  border:         `1px solid ${C.borderColor}`,
  padding:        '3px 7px',
  fontSize:       '11px',
  fontFamily:     '"Calibri","Segoe UI",Arial,sans-serif',
  verticalAlign:  'middle',
}

const HEADER_CELL = {
  ...BASE_CELL,
  backgroundColor: C.headerBg,
  color:           C.headerText,
  fontWeight:      'bold',
  textTransform:   'uppercase',
  letterSpacing:   '1px',
  textAlign:       'center',
}

const SUBHEADER_CELL = {
  ...BASE_CELL,
  backgroundColor: C.subHeaderBg,
  color:           C.subHeaderText,
  fontWeight:      'bold',
  fontSize:        '10px',
  textTransform:   'uppercase',
  letterSpacing:   '0.5px',
}

const BLOCK_TITLE_CELL = {
  ...BASE_CELL,
  backgroundColor: C.blockTitleBg,
  color:           C.headerText,
  fontWeight:      'bold',
  textAlign:       'center',
  textTransform:   'uppercase',
  padding:         '5px 10px',
}

function formatDate(d) {
  if (!d) return ''
  return new Date(d + 'T12:00:00').toLocaleDateString('es', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

function fullName(person) {
  if (!person) return '—'
  return `${person.first_name ?? ''} ${person.last_name ?? ''}`.trim()
}

// Roles que van en la sección de equipo musical
const MUSICAL_ROLES = [
  'Dirección de alabanza','Cantante','Coro de apoyo','Talkback',
  'Teclados','Bajo','Batería','Cajón peruano',
  'Guitarra acústica','Guitarra eléctrica',
  'Sonido','Sonido de streaming',
  'Computador y ProPresenter','Computador de transmisión',
]

// Roles que van en la fila de servicio al fondo
const SERVICE_ROLES = ['Encargado de turno','Servidor','Escenario','Danza']

function buildMaps(block) {
  const musical = {}
  const service = {}

  ;(block.block_assignments ?? []).forEach(a => {
    if (!a.musical_role) return
    const name = a.musical_role.name
    const target = SERVICE_ROLES.includes(name) ? service : musical
    if (!target[name]) target[name] = []
    if (a.person) target[name].push(fullName(a.person))
  })

  return { musical, service }
}

function orderedRows(map, order) {
  const rows = []
  const used = new Set()

  order.forEach(r => {
    if (map[r] !== undefined) { rows.push({ role: r, people: map[r] }); used.add(r) }
  })
  Object.keys(map).forEach(r => { if (!used.has(r)) rows.push({ role: r, people: map[r] }) })
  return rows
}

// ─── Tabla de canciones de un bloque (columna derecha) ────────────────────────
function SongsTable({ songs }) {
  if (!songs || songs.length === 0) {
    return (
      <div style={{ padding: '8px', color: '#bbb', fontStyle: 'italic', fontSize: '10px', textAlign: 'center' }}>
        Sin canciones
      </div>
    )
  }
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
      <thead>
        <tr>
          <td style={{ ...SUBHEADER_CELL, width: '20px', textAlign: 'center' }}>#</td>
          <td style={SUBHEADER_CELL}>Canción</td>
          <td style={{ ...SUBHEADER_CELL, width: '36px', textAlign: 'center' }}>Ton.</td>
          <td style={{ ...SUBHEADER_CELL, width: '72px' }}>Resp.</td>
        </tr>
      </thead>
      <tbody>
        {songs.map((bs, i) => {
          const bg = i % 2 === 1 ? C.altRow : '#fff'
          return (
            <tr key={bs.id} style={{ backgroundColor: bg }}>
              <td style={{ ...BASE_CELL, backgroundColor: bg, textAlign: 'center', color: '#999', width: '20px' }}>{i + 1}</td>
              <td style={{ ...BASE_CELL, backgroundColor: bg, fontWeight: '500' }}>
                {bs.song?.title ?? ''}
                {bs.structure_notes && (
                  <span style={{ display: 'block', color: '#888', fontStyle: 'italic', fontSize: '9px' }}>
                    {bs.structure_notes}
                  </span>
                )}
              </td>
              <td style={{ ...BASE_CELL, backgroundColor: bg, textAlign: 'center', fontWeight: 'bold', color: C.serviceLabel, width: '36px' }}>
                {bs.key_used ?? ''}
              </td>
              <td style={{ ...BASE_CELL, backgroundColor: bg, fontSize: '9px', width: '72px' }}>
                {bs.leaders?.[0]?.person ? fullName(bs.leaders[0].person) : '—'}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

// ─── Par de bloques (lado a lado) ────────────────────────────────────────────
function BlockPair({ left, right }) {
  const leftMaps  = useMemo(() => buildMaps(left), [left])
  const leftTeam  = useMemo(() => orderedRows(leftMaps.musical, MUSICAL_ROLES), [leftMaps])
  const leftSvc   = useMemo(() => orderedRows(leftMaps.service, SERVICE_ROLES), [leftMaps])

  const rightMaps = useMemo(() => right ? buildMaps(right) : { musical: {}, service: {} }, [right])
  const rightTeam = useMemo(() => right ? orderedRows(rightMaps.musical, MUSICAL_ROLES) : [], [rightMaps, right])
  const rightSvc  = useMemo(() => right ? orderedRows(rightMaps.service, SERVICE_ROLES) : [], [rightMaps, right])

  const rowCount = Math.max(leftTeam.length, rightTeam.length, 3)

  return (
    <div style={{ marginBottom: '16px', pageBreakInside: 'avoid' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', fontFamily: '"Calibri","Segoe UI",Arial,sans-serif' }}>
        <tbody>

          {/* Títulos de bloque */}
          <tr>
            <td colSpan="3" style={BLOCK_TITLE_CELL}>{left.name}</td>
            {right
              ? <td colSpan="3" style={BLOCK_TITLE_CELL}>{right.name}</td>
              : <td colSpan="3" style={{ ...BLOCK_TITLE_CELL, backgroundColor: C.subHeaderBg, color: C.subHeaderText }} />
            }
          </tr>

          {/* Cabeceras de columnas */}
          <tr>
            <td style={{ ...SUBHEADER_CELL, width: '14%' }}>Función</td>
            <td style={{ ...SUBHEADER_CELL, width: '14%' }}>Integrante</td>
            <td style={{ ...SUBHEADER_CELL, width: '22%' }}>Canciones</td>
            <td style={{ ...SUBHEADER_CELL, width: '14%' }}>Función</td>
            <td style={{ ...SUBHEADER_CELL, width: '14%' }}>Integrante</td>
            <td style={{ ...SUBHEADER_CELL, width: '22%' }}>Canciones</td>
          </tr>

          {/* Filas de equipo con columna de canciones (rowSpan) */}
          {Array.from({ length: rowCount }).map((_, i) => {
            const lRow  = leftTeam[i]
            const rRow  = rightTeam[i]
            const isAlt = i % 2 === 1
            const altBg = isAlt ? C.altRow : 'transparent'

            return (
              <tr key={i} style={{ backgroundColor: altBg }}>
                {/* Equipo izquierdo */}
                <td style={{ ...BASE_CELL, backgroundColor: isAlt ? '#ddd6fe' : C.subHeaderBg, color: C.subHeaderText, fontWeight: '600', fontSize: '10px', textTransform: 'uppercase' }}>
                  {lRow?.role ?? ''}
                </td>
                <td style={{ ...BASE_CELL, backgroundColor: isAlt ? '#f5f3ff' : C.teamBg, color: '#1a1a2e' }}>
                  {lRow ? (lRow.people.length > 0 ? lRow.people.join(', ') : '—') : ''}
                </td>

                {/* Canciones izquierda — rowSpan en primera fila */}
                {i === 0 && (
                  <td rowSpan={rowCount} style={{ ...BASE_CELL, padding: 0, verticalAlign: 'top' }}>
                    <SongsTable songs={left.block_songs ?? []} />
                  </td>
                )}

                {/* Equipo derecho */}
                <td style={{ ...BASE_CELL, backgroundColor: isAlt ? '#ddd6fe' : C.subHeaderBg, color: C.subHeaderText, fontWeight: '600', fontSize: '10px', textTransform: 'uppercase' }}>
                  {rRow?.role ?? ''}
                </td>
                <td style={{ ...BASE_CELL, backgroundColor: isAlt ? '#f5f3ff' : C.teamBg, color: '#1a1a2e' }}>
                  {rRow ? (rRow.people.length > 0 ? rRow.people.join(', ') : '—') : (right ? '' : '')}
                </td>

                {/* Canciones derecha — rowSpan en primera fila */}
                {i === 0 && (
                  <td rowSpan={rowCount} style={{ ...BASE_CELL, padding: 0, verticalAlign: 'top' }}>
                    {right
                      ? <SongsTable songs={right.block_songs ?? []} />
                      : <div style={{ height: '100%', backgroundColor: '#fafafa' }} />
                    }
                  </td>
                )}
              </tr>
            )
          })}

          {/* Fila de servicio */}
          {(leftSvc.length > 0 || rightSvc.length > 0) && (
            <tr>
              <td colSpan="3" style={{ ...BASE_CELL, backgroundColor: C.serviceBg, verticalAlign: 'top' }}>
                {leftSvc.map(s => (
                  <div key={s.role} style={{ marginBottom: '2px' }}>
                    <span style={{ fontWeight: 'bold', color: C.serviceLabel, fontSize: '10px', textTransform: 'uppercase' }}>{s.role}: </span>
                    <span>{s.people.join(', ') || '—'}</span>
                  </div>
                ))}
              </td>
              <td colSpan="3" style={{ ...BASE_CELL, backgroundColor: C.serviceBg, verticalAlign: 'top' }}>
                {rightSvc.map(s => (
                  <div key={s.role} style={{ marginBottom: '2px' }}>
                    <span style={{ fontWeight: 'bold', color: C.serviceLabel, fontSize: '10px', textTransform: 'uppercase' }}>{s.role}: </span>
                    <span>{s.people.join(', ') || '—'}</span>
                  </div>
                ))}
              </td>
            </tr>
          )}

        </tbody>
      </table>
    </div>
  )
}

// ─── Plantilla principal CDO ──────────────────────────────────────────────────
export default function CdoTemplate({ event, blocks }) {
  const eventDate = event.start_date ? formatDate(event.start_date) : ''
  const endDate   = event.end_date && event.end_date !== event.start_date
    ? formatDate(event.end_date) : null

  // Agrupar bloques en pares
  const pairs = []
  for (let i = 0; i < blocks.length; i += 2) {
    pairs.push({ left: blocks[i], right: blocks[i + 1] ?? null })
  }

  return (
    <div style={{
      fontFamily:      '"Calibri","Segoe UI",Arial,sans-serif',
      maxWidth:        '1100px',
      margin:          '0 auto',
      padding:         '12px',
      backgroundColor: '#fff',
    }}>

      {/* Encabezado */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '4px', fontSize: '11px' }}>
        <tbody>
          <tr>
            <td colSpan="6" style={{ ...HEADER_CELL, fontSize: '13px', letterSpacing: '2px', padding: '9px 12px' }}>
              MINISTERIO DE ALABANZA
            </td>
          </tr>
          <tr>
            <td style={{ ...HEADER_CELL, fontSize: '17px', letterSpacing: '2px', width: '15%', textAlign: 'left', paddingLeft: '14px' }}>
              {(event.event_type?.name || 'CDO').toUpperCase()}
            </td>
            <td colSpan="5" style={{ ...HEADER_CELL, fontWeight: 'normal', textAlign: 'left', fontSize: '11px', letterSpacing: '0.5px' }}>
              📅 &nbsp;{eventDate}{endDate && ` — ${endDate}`}
              {event.description && (
                <span style={{ marginLeft: '12px', opacity: 0.85 }}>· {event.description}</span>
              )}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Pares de bloques */}
      {pairs.length === 0 ? (
        <p style={{ color: '#888', textAlign: 'center', padding: '20px', fontSize: '12px' }}>
          Esta programación no tiene bloques aún.
        </p>
      ) : (
        pairs.map((pair, i) => (
          <BlockPair key={i} left={pair.left} right={pair.right} />
        ))
      )}

      {/* Pie */}
      <div style={{
        marginTop:      '14px',
        borderTop:      `2px solid ${C.borderColor}`,
        paddingTop:     '5px',
        fontSize:       '9px',
        color:          '#aaa',
        display:        'flex',
        justifyContent: 'space-between',
      }}>
        <span>Sistema de Gestión · Ministerio de Alabanza</span>
        <span>Generado el {new Date().toLocaleDateString('es')}</span>
      </div>
    </div>
  )
}
