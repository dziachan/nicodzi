import { useStore } from '../store'

/** Properties for the active screen itself, shown when no component is selected. */
export default function ScreenSettings() {
  const screen = useStore((s) => s.activeScreen())
  const tokens = useStore((s) => s.project.tokens)
  const updateScreen = useStore((s) => s.updateScreen)

  const bg = screen.background ?? tokens.background
  const custom = !!screen.background

  return (
    <div className="inspector-body">
      <div className="inspector-group">Screen</div>
      <label className="field">
        <span className="field-label">Name</span>
        <input value={screen.name} onChange={(e) => updateScreen(screen.id, { name: e.target.value })} />
      </label>
      <label className="field">
        <span className="field-label">Hintergrundfarbe dieses Screens</span>
        <div className="color-row">
          <input type="color" value={bg} onChange={(e) => updateScreen(screen.id, { background: e.target.value })} />
          <input
            className="hex"
            value={screen.background ?? ''}
            placeholder={`${tokens.background} (global)`}
            onChange={(e) => updateScreen(screen.id, { background: e.target.value || undefined })}
          />
        </div>
      </label>
      {custom ? (
        <button className="btn small" onClick={() => updateScreen(screen.id, { background: undefined })}>
          Auf globale Hintergrundfarbe zurücksetzen
        </button>
      ) : (
        <div className="hint">Aktuell wird die globale Hintergrundfarbe aus den Design-Tokens verwendet.</div>
      )}
    </div>
  )
}
