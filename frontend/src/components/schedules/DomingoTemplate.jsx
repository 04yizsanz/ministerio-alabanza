/**
 * DomingoTemplate
 *
 * Plantilla visual para programaciones de Domingo.
 *
 * Estructura:
 * ┌─────────────────────────────────────────────────┐
 * │              MINISTERIO DE ALABANZA              │
 * │──────────────────────────────────────────────────│
 * │  DOMINGO  │  (fecha larga)                       │
 * ├──────────────────────┬─────────────────────────── │
 * │  EQUIPO (funciones)  │  CANCIONES (tabla)        │
 * └──────────────────────┴───────────────────────────┘
 *
 * Si el evento tiene varios bloques, cada uno se renderiza
 * en su propia sección (útil para servicios AM/PM).
 *
 * Colores: rosado/rojo suave (#e8003a, #fce4ec, #fff8f9)
 */

import { useMemo } from 'react'

// Paleta de colores de la plantilla Domingo
const C = {
  headerBg:    '#e8003a',     // rojo ministerio (encabezado principal)
  headerText:  '#ffffff',
  subHeaderBg: '#fce4ec',     // rosado muy suave (fila de columnas)
  subHeaderText: '#b71c4a',   // rojo oscuro para texto de subtítulos
  teamBg:      '#fff8f9',     // fondo filas del equipo
  songBg:      '#ffffff',
  borderColor: '#f48fb1',     // rosado borde
  altRow:      '#fce4ec',     // fila alternada suave
  sectionBg:   '#fce4ec',
}

// Estilos reutilizables
const styles = {
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '11px',
    fontFamily: '"Calibri", "Segoe UI", Arial, sans-serif',
  },
  headerCell: {
    backgroundColor: C.headerBg,
    color: C.headerText,
    padding: '8px 12px',
    fontWeight: 'bold',
    border: `1px solid ${C.borderColor}`,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  subHeader: {
    backgroundColor: C.subHeaderBg,
    color: C.subHeaderText,
    padding: '5px 8px',
    fontWeight: 'bold',
    border: `1px solid ${C.borderColor}`,
    textTransform: 'uppercase',
    fontSize: '10px',
    letterSpacing: '0.5px',
  },
  cell: {
    padding: '4px 8px',
    border: `1px solid ${C.borderColor}`,
    verticalAlign: 'middle',
  },
  teamLabel: {
    padding: '4px 8px',
    border: `1px solid ${C.borderColor}`,
    backgroundColor: C.subHeaderBg,
    color: C.subHeaderText,
    fontWeight: '600',
    fontSize: '10px',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
  },
  teamValue: {
    padding: '4px 8px',
    border: `1px solid ${C.borderColor}`,
    backgroundColor: C.teamBg,
    color: '#1a1a2e',
  },
  songNum: {
    padding: '4px 6px',
    border: `1px solid ${C.borderColor}`,
    textAlign: 'center',
    color: '#888',
    width: '24px',
  },
  songTitle: {
    padding: '4px 8px',
    border: `1px solid ${C.borderColor}`,
    fontWeight: '600',
    color: '#1a1a2e',
  },
  songKey: {
    padding: '4px 6px',
    border: `1px solid ${C.borderColor}`,
    textAlign: 'center',
    fontWeight: 'bold',
    color: C.headerBg,
    width: '40px',
  },
  songStructure: {
    padding: '4px 8px',
    border: `1px solid ${C.borderColor}`,
    color: '#555',
    fontSize: '10px',
    fontStyle: 'italic',
  },
  songLeader: {
    padding: '4px 8px',
    border: `1px solid ${C.borderColor}`,
    color: '#333',
    whiteSpace: 'nowrap',
  },
}

// Formatea fecha de forma legible
function formatDate(d) {
  if (!d) return ''
  return new Date(d + 'T12:00:00').toLocaleDateString('es', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

// Formatea nombre completo de una persona
function fullName(person) {
  if (!person) return '—'
  return `${person.first_name ?? ''} ${person.last_name ?? ''}`.trim()
}

// Dado un bloque, devuelve un mapa: role.name → [personas]
function buildRoleMap(block) {
  const map = {}
  ;(block.block_assignments ?? []).forEach(a => {
    if (!a.musical_role) return
    const name = a.musical_role.name
    if (!map[name]) map[name] = []
    if (a.person) map[name].push(fullName(a.person))
  })
  return map
}

// Orden visual deseado para las funciones musicales en la plantilla Domingo
const ROLE_ORDER = [
  'Dirección de alabanza',
  'Cantante',
  'Coro de apoyo',
  'Talkback',
  'Teclados',
  'Bajo',
  'Batería',
  'Cajón peruano',
  'Guitarra acústica',
  'Guitarra eléctrica',
  'Sonido',
  'Sonido de streaming',
  'Computador y ProPresenter',
  'Computador de transmisión',
  'Danza',
  'Escenario',
  'Encargado de turno',
  'Servidor',
]

// Construye la lista ordenada de filas del equipo a partir del mapa de roles
function buildTeamRows(roleMap) {
  const rows = []
  const used = new Set()

  // Primero los roles en orden predefinido
  ROLE_ORDER.forEach(roleName => {
    if (roleMap[roleName] !== undefined) {
      rows.push({ role: roleName, people: roleMap[roleName] })
      used.add(roleName)
    }
  })

  // Luego cualquier rol no contemplado en el orden (roles personalizados)
  Object.keys(roleMap).forEach(roleName => {
    if (!used.has(roleName)) {
      rows.push({ role: roleName, people: roleMap[roleName] })
    }
  })

  return rows
}

// ─── Sección de un bloque dentro de la plantilla ─────────────────────────────
function BlockSection({ block, isFirst }) {
  const roleMap  = useMemo(() => buildRoleMap(block), [block])
  const teamRows = useMemo(() => buildTeamRows(roleMap), [roleMap])
  const songs    = block.block_songs ?? []

  // Número de filas: el máximo entre equipo y canciones (para alinear tablas)
  const rowCount = Math.max(teamRows.length, songs.length, 3)

  return (
    <div style={{ marginBottom: '20px', pageBreakInside: 'avoid' }}>

      {/* Nombre del bloque (si no es el primero o si el evento tiene varios bloques) */}
      {!isFirst && (
        <div style={{
          backgroundColor: C.subHeaderBg,
          color: C.subHeaderText,
          padding: '4px 12px',
          fontWeight: 'bold',
          fontSize: '11px',
          border: `1px solid ${C.borderColor}`,
          borderBottom: 'none',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}>
          {block.name}
        </div>
      )}

      {/* Tabla principal de dos columnas */}
      <table style={styles.table}>
        <thead>
          {/* Fila de subtítulos de columnas */}
          <tr>
            <td style={{ ...styles.subHeader, width: '25%' }}>Función</td>
            <td style={{ ...styles.subHeader, width: '25%' }}>Integrante</td>
            <td style={{ ...styles.subHeader, width: '4%', textAlign: 'center' }}>#</td>
            <td style={{ ...styles.subHeader, width: '22%' }}>Canción</td>
            <td style={{ ...styles.subHeader, width: '6%', textAlign: 'center' }}>Ton.</td>
            <td style={{ ...styles.subHeader, width: '10%' }}>Estructura</td>
            <td style={{ ...styles.subHeader, width: '18%' }}>Responsable</td>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rowCount }).map((_, i) => {
            const teamRow = teamRows[i]
            const song    = songs[i]
            const isAlt   = i % 2 === 1

            return (
              <tr key={i} style={{ backgroundColor: isAlt ? C.altRow : 'transparent' }}>

                {/* ── Columna equipo ── */}
                <td style={{ ...styles.teamLabel, backgroundColor: isAlt ? '#f8bbd0' : C.subHeaderBg }}>
                  {teamRow?.role ?? ''}
                </td>
                <td style={{ ...styles.teamValue, backgroundColor: isAlt ? '#fff3f5' : C.teamBg }}>
                  {teamRow ? (teamRow.people.length > 0 ? teamRow.people.join(', ') : '—') : ''}
                </td>

                {/* ── Columna canciones ── */}
                <td style={{ ...styles.songNum, backgroundColor: isAlt ? '#fff3f5' : '#fafafa' }}>
                  {song ? i + 1 : ''}
                </td>
                <td style={{ ...styles.songTitle, backgroundColor: isAlt ? '#fff3f5' : styles.songBg.backgroundColor }}>
                  {song?.song?.title ?? ''}
                </td>
                <td style={{ ...styles.songKey, backgroundColor: isAlt ? '#fff0f3' : '#fff8fa' }}>
                  {song?.key_used ?? ''}
                </td>
                <td style={{ ...styles.songStructure, backgroundColor: isAlt ? '#fff3f5' : styles.songBg.backgroundColor }}>
                  {song?.structure_notes ?? ''}
                </td>
                <td style={{ ...styles.songLeader, backgroundColor: isAlt ? '#fff3f5' : styles.songBg.backgroundColor }}>
                  {song?.leaders?.[0]?.person ? fullName(song.leaders[0].person) : (song ? '—' : '')}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ─── Plantilla principal de Domingo ──────────────────────────────────────────
export default function DomingoTemplate({ event, blocks }) {
  const eventDate = event.start_date ? formatDate(event.start_date) : ''
  const endDate   = event.end_date && event.end_date !== event.start_date
    ? formatDate(event.end_date)
    : null

  return (
    <div style={{
      fontFamily: '"Calibri", "Segoe UI", Arial, sans-serif',
      maxWidth:   '960px',
      margin:     '0 auto',
      padding:    '12px',
      backgroundColor: '#fff',
    }}>

      {/* ── Encabezado superior ── */}
      <table style={{ ...styles.table, marginBottom: '4px' }}>
        <tbody>
          {/* Título ministerio */}
          <tr>
            <td
              colSpan="7"
              style={{
                ...styles.headerCell,
                fontSize: '13px',
                letterSpacing: '2px',
                padding: '10px 12px',
              }}
            >
              MINISTERIO DE ALABANZA
            </td>
          </tr>

          {/* Tipo de evento y fecha */}
          <tr>
            <td
              style={{
                ...styles.headerCell,
                fontSize: '18px',
                letterSpacing: '3px',
                padding: '8px 16px',
                width: '22%',
              }}
            >
              {(event.event_type?.name || 'DOMINGO').toUpperCase()}
            </td>
            <td
              colSpan="6"
              style={{
                ...styles.headerCell,
                fontSize: '12px',
                textAlign: 'left',
                fontWeight: 'normal',
                letterSpacing: '0.5px',
              }}
            >
              📅 &nbsp;
              {eventDate}
              {endDate && ` — ${endDate}`}
              {event.description && (
                <span style={{ marginLeft: '12px', opacity: 0.85 }}>· {event.description}</span>
              )}
            </td>
          </tr>
        </tbody>
      </table>

      {/* ── Bloques de programación ── */}
      {blocks.length === 0 ? (
        <p style={{ color: '#888', textAlign: 'center', padding: '20px', fontSize: '12px' }}>
          Esta programación no tiene bloques aún.
        </p>
      ) : (
        blocks.map((block, i) => (
          <BlockSection key={block.id} block={block} isFirst={i === 0} />
        ))
      )}

      {/* ── Pie de página ── */}
      <div style={{
        marginTop:   '16px',
        borderTop:   `2px solid ${C.borderColor}`,
        paddingTop:  '6px',
        fontSize:    '9px',
        color:       '#aaa',
        display:     'flex',
        justifyContent: 'space-between',
      }}>
        <span>Sistema de Gestión · Ministerio de Alabanza</span>
        <span>Generado el {new Date().toLocaleDateString('es')}</span>
      </div>
    </div>
  )
}
