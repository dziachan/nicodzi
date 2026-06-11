import { elementLabel, useStore } from '../store'
import type { ElementType } from '../types'

const groups: { title: string; items: ElementType[] }[] = [
  { title: 'Inhalt', items: ['header', 'text', 'image', 'badge'] },
  { title: 'Aktionen', items: ['button', 'input'] },
  { title: 'Listen & Karten', items: ['card', 'listItem', 'avatar'] },
  { title: 'Layout', items: ['divider', 'spacer'] },
]

const icons: Record<ElementType, string> = {
  header: 'H',
  text: '¶',
  button: '▭',
  image: '🖼',
  input: '⌨',
  card: '▢',
  listItem: '≣',
  badge: '●',
  avatar: '👤',
  divider: '—',
  spacer: '↕',
}

export default function Palette() {
  const addElement = useStore((s) => s.addElement)
  const screens = useStore((s) => s.project.screens)
  const activeScreenId = useStore((s) => s.activeScreenId)
  const setActiveScreen = useStore((s) => s.setActiveScreen)
  const addScreen = useStore((s) => s.addScreen)

  return (
    <aside className="panel left">
      <div className="panel-section">
        <div className="panel-title">Screens</div>
        <div className="screen-tabs">
          {screens.map((s) => (
            <button
              key={s.id}
              className={`screen-tab ${s.id === activeScreenId ? 'active' : ''}`}
              onClick={() => setActiveScreen(s.id)}
            >
              {s.name}
            </button>
          ))}
          <button className="screen-tab add" onClick={addScreen}>+ Neu</button>
        </div>
      </div>

      <div className="panel-section">
        <div className="panel-title">Komponenten</div>
        <div className="hint">Klicken, um zum aktiven Screen hinzuzufügen.</div>
        {groups.map((g) => (
          <div key={g.title} className="palette-group">
            <div className="group-label">{g.title}</div>
            <div className="palette-grid">
              {g.items.map((type) => (
                <button key={type} className="palette-item" onClick={() => addElement(type)}>
                  <span className="palette-icon">{icons[type]}</span>
                  <span>{elementLabel(type)}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </aside>
  )
}
