import { componentLabel, useStore } from '../store'
import type { ComponentType } from '../types'

const groups: { title: string; items: ComponentType[] }[] = [
  { title: 'Struktur', items: ['topBar', 'bottomNav', 'card'] },
  { title: 'Inhalt', items: ['label', 'image', 'icon', 'list'] },
  { title: 'Eingabe', items: ['button', 'input', 'searchBar', 'toggle'] },
]

const icons: Record<ComponentType, string> = {
  button: '▭',
  input: '⌨',
  label: 'H',
  image: '🖼',
  card: '▢',
  list: '≣',
  bottomNav: '⬓',
  topBar: '⬒',
  icon: '★',
  toggle: '◖',
  searchBar: '🔍',
}

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
            {g.items.map((type) => (
              <button
                key={type}
                className="palette-item"
                draggable
                onDragStart={(e) => e.dataTransfer.setData('application/x-phorge-component', type)}
                onClick={() => addNode(type)}
              >
                <span className="palette-icon">{icons[type]}</span>
                <span>{componentLabel(type)}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </aside>
  )
}
