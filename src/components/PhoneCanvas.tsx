import { useStore } from '../store'
import ElementRenderer from './ElementRenderer'

export default function PhoneCanvas() {
  const project = useStore((s) => s.project)
  const screen = useStore((s) => s.activeScreen())
  const selectedId = useStore((s) => s.selectedId)
  const select = useStore((s) => s.select)
  const moveElement = useStore((s) => s.moveElement)
  const deleteElement = useStore((s) => s.deleteElement)
  const theme = project.theme

  return (
    <div className="canvas">
      <div
        className="phone"
        style={{ background: theme.background, fontFamily: `${theme.fontFamily}, -apple-system, system-ui, sans-serif` }}
        onClick={() => select(null)}
      >
        {project.showStatusBar && (
          <div className="status-bar" style={{ color: theme.text }}>
            <span>9:41</span>
            <span className="notch" />
            <span style={{ letterSpacing: 1 }}>▮▮▮ 􀙇</span>
          </div>
        )}

        <div className="screen-scroll">
          {screen.elements.length === 0 && (
            <div className="empty-hint" style={{ color: theme.muted }}>
              Leerer Screen.<br />Füge links Elemente hinzu.
            </div>
          )}

          {screen.elements.map((el) => {
            const active = el.id === selectedId
            return (
              <div
                key={el.id}
                className={`el-wrap ${active ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation()
                  select(el.id)
                }}
              >
                <ElementRenderer el={el} theme={theme} />
                {active && (
                  <div className="el-tools" onClick={(e) => e.stopPropagation()}>
                    <button title="Nach oben" onClick={() => moveElement(el.id, -1)}>↑</button>
                    <button title="Nach unten" onClick={() => moveElement(el.id, 1)}>↓</button>
                    <button title="Löschen" className="danger" onClick={() => deleteElement(el.id)}>✕</button>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {project.showTabBar && (
          <div className="tab-bar" style={{ background: theme.surface, borderColor: `${theme.muted}22` }}>
            {project.tabs.map((t, i) => (
              <div key={t} className="tab" style={{ color: i === 0 ? theme.primary : theme.muted }}>
                <span className="tab-dot" style={{ background: i === 0 ? theme.primary : theme.muted }} />
                <span>{t}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="screen-name">{screen.name}</div>
    </div>
  )
}
