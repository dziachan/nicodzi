import { componentLabel, useStore } from '../store'
import IconPicker from './IconPicker'
import type { ComponentType } from '../types'

interface PItem {
  type: ComponentType
  label?: string
  icon: string
  size?: { w: number; h: number }
}

const groups: { title: string; items: PItem[] }[] = [
  { title: 'Struktur', items: [
    { type: 'topBar', icon: '⬒' },
    { type: 'bottomNav', icon: '⬓' },
    { type: 'card', icon: '▢' },
  ] },
  { title: 'Inhalt', items: [
    { type: 'label', icon: 'H' },
    { type: 'text', icon: '¶' },
    { type: 'image', icon: '🖼' },
    { type: 'icon', icon: '★' },
    { type: 'list', icon: '≣' },
  ] },
  { title: 'Eingabe', items: [
    { type: 'button', icon: '▭' },
    { type: 'input', icon: '⌨' },
    { type: 'searchBar', icon: '🔍' },
    { type: 'toggle', icon: '◖' },
  ] },
  { title: 'Formen', items: [
    { type: 'rectangle', label: 'Rechteck', icon: '▬' },
    { type: 'rectangle', label: 'Quadrat', icon: '⬛', size: { w: 140, h: 140 } },
    { type: 'ellipse', label: 'Kreis', icon: '⬤', size: { w: 140, h: 140 } },
    { type: 'line', label: 'Linie', icon: '╱' },
  ] },
]

export default function Palette() {
  const addNode = useStore((s) => s.addNode)

  return (
    <aside className="panel left">
      <div className="panel-title">Komponenten</div>
      <div className="hint">Klicken zum Hinzufügen oder auf den Screen ziehen.</div>
      {groups.map((g) => (
        <div key={g.title} className="palette-group">
          <div className="group-label">{g.title}</div>
          <div className="palette-grid">
            {g.items.map((it) => (
              <button
                key={it.label ?? it.type}
                className="palette-item"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('application/x-phorge-component', it.type)
                  if (it.size) e.dataTransfer.setData('application/x-phorge-size', JSON.stringify(it.size))
                }}
                onClick={() => addNode(it.type, undefined, it.size)}
              >
                <span className="palette-icon">{it.icon}</span>
                <span>{it.label ?? componentLabel(it.type)}</span>
              </button>
            ))}
          </div>
        </div>
      ))}

      <div className="palette-group">
        <div className="group-label">Symbole (Lucide)</div>
        <IconPicker draggable onPick={(id) => addNode('lucide', undefined, undefined, { iconName: id })} />
      </div>
    </aside>
  )
}
