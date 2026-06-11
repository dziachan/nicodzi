import { useStore } from '../store'
import { FRAME_H, FRAME_W, SCREEN_H, SCREEN_W } from '../constants'
import NodeView from './NodeView'
import type { Screen } from '../types'

const THUMB_W = 104
const SCALE = THUMB_W / FRAME_W

function Thumb({ screen, active }: { screen: Screen; active: boolean }) {
  const tokens = useStore((s) => s.project.tokens)
  const device = useStore((s) => s.project.device)
  const setActiveScreen = useStore((s) => s.setActiveScreen)
  const renameScreen = useStore((s) => s.renameScreen)
  const duplicateScreen = useStore((s) => s.duplicateScreen)
  const deleteScreen = useStore((s) => s.deleteScreen)
  const canDelete = useStore((s) => s.project.screens.length > 1)

  return (
    <div className={`thumb ${active ? 'active' : ''}`}>
      <div className="thumb-frame" style={{ width: FRAME_W * SCALE, height: FRAME_H * SCALE }} onClick={() => setActiveScreen(screen.id)}>
        <div className={`phone-frame device-${device}`} style={{ transform: `scale(${SCALE})` }}>
          <div className="phone-screen" style={{ width: SCREEN_W, height: SCREEN_H, background: screen.background ?? tokens.background, fontFamily: `${tokens.fontFamily}, system-ui` }}>
            {screen.nodes.map((n) => (
              <div
                key={n.id}
                style={{ position: 'absolute', left: n.x, top: n.y, width: n.w, height: n.h, pointerEvents: 'none', opacity: n.props.opacity ?? 1, transform: n.props.rotation ? `rotate(${n.props.rotation}deg)` : undefined }}
              >
                <NodeView node={n} tokens={tokens} />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="thumb-bar">
        <input className="thumb-name" value={screen.name} onChange={(e) => renameScreen(screen.id, e.target.value)} />
        <button title="Duplizieren" onClick={() => duplicateScreen(screen.id)}>⧉</button>
        <button title="Löschen" className="danger" disabled={!canDelete} onClick={() => canDelete && deleteScreen(screen.id)}>✕</button>
      </div>
    </div>
  )
}

export default function ScreenThumbnails() {
  const screens = useStore((s) => s.project.screens)
  const activeScreenId = useStore((s) => s.activeScreenId)
  const addScreen = useStore((s) => s.addScreen)

  return (
    <div className="thumbnails">
      {screens.map((s) => (
        <Thumb key={s.id} screen={s} active={s.id === activeScreenId} />
      ))}
      <button className="thumb-add" onClick={addScreen}>
        <span style={{ fontSize: 26 }}>+</span>
        <span>Screen</span>
      </button>
    </div>
  )
}
