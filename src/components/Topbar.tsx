import { useStore } from '../store'
import { ZOOM_LEVELS } from '../constants'

export default function Topbar({ onExport }: { onExport: () => void }) {
  const undo = useStore((s) => s.undo)
  const redo = useStore((s) => s.redo)
  const canUndo = useStore((s) => s.past.length > 0)
  const canRedo = useStore((s) => s.future.length > 0)
  const zoom = useStore((s) => s.zoom)
  const setZoom = useStore((s) => s.setZoom)
  const device = useStore((s) => s.project.device)
  const setProject = useStore((s) => s.setProject)

  return (
    <header className="topbar">
      <div className="brand">
        <span className="logo">◳</span>
        <div>
          <div className="brand-name">Phorge</div>
          <div className="brand-sub">bau dein App-Design ✦ hol dir den Prompt</div>
        </div>
      </div>

      <div className="topbar-center">
        <div className="seg">
          <button onClick={undo} disabled={!canUndo} title="Rückgängig (Ctrl+Z)">↶</button>
          <button onClick={redo} disabled={!canRedo} title="Wiederholen (Ctrl+Y)">↷</button>
        </div>

        <div className="seg">
          {ZOOM_LEVELS.map((z) => (
            <button key={z} className={zoom === z ? 'active' : ''} onClick={() => setZoom(z)}>{Math.round(z * 100)}%</button>
          ))}
        </div>

        <div className="seg">
          <button className={device === 'iphone' ? 'active' : ''} onClick={() => setProject({ device: 'iphone' })}> iPhone</button>
          <button className={device === 'android' ? 'active' : ''} onClick={() => setProject({ device: 'android' })}>Android</button>
        </div>
      </div>

      <div className="topbar-actions">
        <button className="btn primary glow" onClick={onExport}>✨ Prompt exportieren</button>
      </div>
    </header>
  )
}
