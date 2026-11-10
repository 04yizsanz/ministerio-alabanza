/**
 * GeneralTemplate
 *
 * Plantilla visual para eventos que no son Domingo ni CDO:
 * Blaze, Campamentos, Alboradas, Ensayos, Eventos especiales, etc.
 *
 * Usa el color del tipo de evento como acento visual.
 * Cada bloque se renderiza en su propia sección con equipo y canciones.
 */

import { useMemo } from 'react'

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

function buildTeamRows(block) {
  const map = {}
  ;(block.block_assignments ?? []).forEach(a => {
    if (!a.musical_role) return
    const name = a.musical_role.name
    if (!map[name]) map[name] = []
    if (a.person) map[name].push(fullName(a.person))
  })
  return Object.entries(map).map(([role, people]) => ({ role, people }))
}

// ─── Sección de un bloque ────────────────────────────────────────────────────
function BlockSection({ block, accent }) {
  const teamRows = useMemo(() => buildTeamRows(block), [block])
  const songs    = block.block_songs ?? []
  const rowCount = Math.max(teamRows.length, songs.length, 2)

  const border    = `1px solid ${accent}44`
  const headerBg  = accent
  const subBg     = accent + '18'
  const altBg     = accent + '10'

  return (
    <div style={{ marginBottom: '18px', pageBreakInside: 'avoid' }}>
      {/* Nombre del bloque */}
      <div style={{
        backgroundColor: headerBg,
        color:           '#fff',
        padding:         '5px 12px',
        fontWeight:      'bold',
        fontSize:        '11px',
        textTransform:   'uppercase',
        letterSpacing:   '1px',
        border,
        borderBottom: 'none',
      }}>
        {block.name}
        {block.block_date && (
          <span style={{ fontWeight: 'normal', marginLeft: '10px', opacity: 0.85 }}>
            · {formatDate(block.block_date)}
          </span>
        )}
      </div>

      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: '11px',
        fontFamily: '"Calibri", "Segoe UI", Arial, sans-serif',
      }}>
        <thead>
          <tr>
            <td style={{ backgroundColor: subBg, color: accent, fontWeight: 'bold', padding: '4px 8px', border, fontSize: '10px', textTransform: 'uppercase', width: '18%' }}>Función</td>
            <td style={{ backgroundColor: subBg, color: accent, fontWeight: 'bold', padding: '4px 8px', border, fontSize: '10px', textTransform: 'uppercase', width: '18%' }}>Integrante</td>
            <td style={{ backgroundColor: subBg, color: accent, fontWeight: 'bold', padding: '4px 8px', border, fontSize: '10px', textTransform: 'uppercase', width: '4%',  textAlign: 'center' }}>#</td>
            <td style={{ backgroundColor: subBg, color: accent, fontWeight: 'bold', padding: '4px 8px', border, fontSize: '10px', textTransform: 'uppercase', width: '24%' }}>Canción</td>
            <td style={{ backgroundColor: subBg, color: accent, fontWeight: 'bold', padding: '4px 8px', border, fontSize: '10px', textTransform: 'uppercase', width: '6%',  textAlign: 'center' }}>Ton.</td>
            <td style={{ backgroundColor: subBg, color: accent, fontWeight: 'bold', padding: '4px 8px', border, fontSize: '10px', textTransform: 'uppercase', width: '12%' }}>Estructura</td>
            <td style={{ backgroundColor: subBg, color: accent, fontWeight: 'bold', padding: '4px 8px', border, fontSize: '10px', textTransform: 'uppercase', width: '18%' }}>Responsable</td>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rowCount }).map((_, i) => {
            const teamRow = teamRows[i]
            const song    = songs[i]
            const bg      = i % 2 === 1 ? altBg : '#fff'

            return (
              <tr key={i} style={{ backgroundColor: bg }}>
                {/* Equipo */}
                <td style={{ padding: '3px 8px', border, backgroundColor: i % 2 === 1 ? subBg : subBg + '88', fontWeight: '600', fontSize: '10px', color: accent, textTransform: 'uppercase' }}>
                  {teamRow?.role ?? ''}
                </td>
                <td style={{ padding: '3px 8px', border, color: '#1a1a2e' }}>
                  {teamRow ? (teamRow.people.length > 0 ? teamRow.people.join(', ') : '—') : ''}
                </td>

                {/* Canciones */}
                <td style={{ padding: '3px 6px', border, textAlign: 'center', color: '#aaa' }}>
                  {song ? i + 1 : ''}
                </td>
                <td style={{ padding: '3px 8px', border, fontWeight: song ? '600' : 'normal', color: '#1a1a2e' }}>
                  {song?.song?.title ?? ''}
                </td>
                <td style={{ padding: '3px 6px', border, textAlign: 'center', fontWeight: 'bold', color: accent }}>
                  {song?.key_used ?? ''}
                </td>
                <td style={{ padding: '3px 8px', border, color: '#666', fontStyle: 'italic', fontSize: '10px' }}>
                  {song?.structure_notes ?? ''}
                </td>
                <td style={{ padding: '3px 8px', border, color: '#333' }}>
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

// ─── Plantilla general ────────────────────────────────────────────────────────
export default function GeneralTemplate({ event, blocks }) {
  const accent    = event.event_type?.color || '#6b7280'
  const eventDate = event.start_date ? formatDate(event.start_date) : ''
  const endDate   = event.end_date && event.end_date !== event.start_date
    ? formatDate(event.end_date) : null

  return (
    <div style={{
      fontFamily:      '"Calibri", "Segoe UI", Arial, sans-serif',
      maxWidth:        '960px',
      margin:          '0 auto',
      padding:         '12px',
      backgroundColor: '#fff',
    }}>

      {/* ── Encabezado ── */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '4px', fontSize: '11px' }}>
        <tbody>
          <tr>
            <td style={{
              backgroundColor: accent,
              color: '#fff',
              padding: '9px 14px',
              fontWeight: 'bold',
              fontSize: '13px',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              textAlign: 'center',
              border: `1px solid ${accent}`,
            }} colSpan="2">
              MINISTERIO DE ALABANZA
            </td>
          </tr>
          <tr>
            <td style={{
              backgroundColor: accent,
              color: '#fff',
              padding: '7px 14px',
              fontWeight: 'bold',
              fontSize: '16px',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              border: `1px solid ${accent}`,
              width: '22%',
            }}>
              {event.event_type?.name || 'EVENTO'}
            </td>
            <td style={{
              backgroundColor: accent + 'dd',
              color: '#fff',
              padding: '7px 14px',
              fontSize: '11px',
              border: `1px solid ${accent}`,
            }}>
              📅 &nbsp;{eventDate}{endDate && ` — ${endDate}`}
              {event.description && (
                <span style={{ marginLeft: '12px', opacity: 0.9 }}>· {event.description}</span>
              )}
            </td>
          </tr>
        </tbody>
      </table>

      {/* ── Bloques ── */}
      {blocks.length === 0 ? (
        <p style={{ color: '#888', textAlign: 'center', padding: '20px', fontSize: '12px' }}>
          Esta programación no tiene bloques aún.
        </p>
      ) : (
        blocks.map(block => (
          <BlockSection key={block.id} block={block} accent={accent} />
        ))
      )}

      {/* ── Pie ── */}
      <div style={{
        marginTop:    '14px',
        borderTop:    `2px solid ${accent}44`,
        paddingTop:   '5px',
        fontSize:     '9px',
        color:        '#aaa',
        display:      'flex',
        justifyContent: 'space-between',
      }}>
        <span>Sistema de Gestión · Ministerio de Alabanza</span>
        <span>Generado el {new Date().toLocaleDateString('es')}</span>
      </div>
    </div>
  )
}
