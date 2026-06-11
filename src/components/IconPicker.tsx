import { useMemo, useState } from 'react'
import { ALL_ICONS, PINNED_ICONS } from '../lucideIcons'

interface Props {
  onPick: (id: string) => void
  selected?: string
  /** When true, items can be dragged onto the canvas. */
  draggable?: boolean
}

function Cell({ id, Comp, selected, draggable, onPick }: { id: string; Comp: any; selected?: string; draggable?: boolean; onPick: (id: string) => void }) {
  return (
    <button
      className={`icon-cell ${selected === id ? 'sel' : ''}`}
      title={id}
      draggable={draggable}
      onDragStart={
        draggable
          ? (e) => {
              e.dataTransfer.setData('application/x-phorge-component', 'lucide')
              e.dataTransfer.setData('application/x-phorge-icon', id)
            }
          : undefined
      }
      onClick={() => onPick(id)}
    >
      <Comp size={20} />
    </button>
  )
}

/** Searchable Lucide icon grid with a pinned quick-pick row. */
export default function IconPicker({ onPick, selected, draggable }: Props) {
  const [q, setQ] = useState('')
  const query = q.trim().toLowerCase()
  const results = useMemo(() => (query ? ALL_ICONS.filter((d) => d.id.includes(query)) : ALL_ICONS), [query])

  return (
    <div className="icon-picker">
      <input className="icon-search" placeholder="Symbol suchen…" value={q} onChange={(e) => setQ(e.target.value)} />
      {!query && (
        <>
          <div className="icon-section">Häufig genutzt</div>
          <div className="icon-grid">
            {PINNED_ICONS.map((d) => (
              <Cell key={d.id} id={d.id} Comp={d.comp} selected={selected} draggable={draggable} onPick={onPick} />
            ))}
          </div>
          <div className="icon-section">Alle Symbole</div>
        </>
      )}
      <div className="icon-grid scroll">
        {results.map((d) => (
          <Cell key={d.id} id={d.id} Comp={d.comp} selected={selected} draggable={draggable} onPick={onPick} />
        ))}
        {results.length === 0 && <div className="hint">Kein Symbol gefunden.</div>}
      </div>
    </div>
  )
}
