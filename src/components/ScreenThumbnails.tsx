import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useStore } from '../store'
import { FRAME_H, FRAME_W, SCREEN_H, SCREEN_W } from '../constants'
import { getEdges } from '../interactions'
import NodeView from './NodeView'
import type { Screen } from '../types'

const THUMB_W = 104
const SCALE = THUMB_W / FRAME_W

function Thumb({ screen, active, registerFrame }: { screen: Screen; active: boolean; registerFrame: (id: string, el: HTMLDivElement | null) => void }) {
  const tokens = useStore((s) => s.project.tokens)
  const device = useStore((s) => s.project.device)
  const setActiveScreen = useStore((s) => s.setActiveScreen)
  const renameScreen = useStore((s) => s.renameScreen)
  const duplicateScreen = useStore((s) => s.duplicateScreen)
  const deleteScreen = useStore((s) => s.deleteScreen)
  const canDelete = useStore((s) => s.project.screens.length > 1)

  return (
    <div className={`thumb ${active ? 'active' : ''}`}>
      <div
        className="thumb-frame"
        ref={(el) => registerFrame(screen.id, el)}
        style={{ width: FRAME_W * SCALE, height: FRAME_H * SCALE }}
        onClick={() => setActiveScreen(screen.id)}
      >
        <div className={`phone-frame device-${device}`} style={{ transform: `scale(${SCALE})` }}>
          <div className="phone-screen" style={{ width: SCREEN_W, height: SCREEN_H, background: screen.background ?? tokens.background, fontFamily: `'${tokens.fontFamily}', system-ui` }}>
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

interface Arc {
  x1: number
  x2: number
  y: number
  depth: number
}

export default function ScreenThumbnails() {
  const project = useStore((s) => s.project)
  const screens = project.screens
  const activeScreenId = useStore((s) => s.activeScreenId)
  const addScreen = useStore((s) => s.addScreen)
  const [showConn, setShowConn] = useState(false)

  const trackRef = useRef<HTMLDivElement>(null)
  const frameRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const [arcs, setArcs] = useState<Arc[]>([])

  // Unique screen→screen connections (self-links excluded).
  const edges = useMemo(() => {
    const seen = new Set<string>()
    const list: { from: string; to: string }[] = []
    for (const e of getEdges(project)) {
      if (e.fromScreenId === e.toScreenId) continue
      const key = `${e.fromScreenId}>${e.toScreenId}`
      if (seen.has(key)) continue
      seen.add(key)
      list.push({ from: e.fromScreenId, to: e.toScreenId })
    }
    return list
  }, [project])

  const edgesKey = edges.map((e) => `${e.from}>${e.to}`).join('|')

  useLayoutEffect(() => {
    const track = trackRef.current
    if (!showConn || !track) {
      setArcs([])
      return
    }
    const measure = () => {
      const base = track.getBoundingClientRect()
      const next: Arc[] = []
      edges.forEach((e, i) => {
        const a = frameRefs.current[e.from]
        const b = frameRefs.current[e.to]
        if (!a || !b) return
        const ra = a.getBoundingClientRect()
        const rb = b.getBoundingClientRect()
        const x1 = ra.left - base.left + track.scrollLeft + ra.width / 2
        const x2 = rb.left - base.left + track.scrollLeft + rb.width / 2
        const y = ra.top - base.top + track.scrollTop
        next.push({ x1, x2, y, depth: (i % 3) * 10 })
      })
      setArcs(next)
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [showConn, edgesKey, screens.length])

  return (
    <div className="thumbnails-wrap">
      <div className="thumbnails-bar">
        <span className="thumbnails-label">Screens</span>
        <button className={`conn-toggle ${showConn ? 'active' : ''}`} onClick={() => setShowConn((v) => !v)} disabled={edges.length === 0}>
          {showConn ? '✓ ' : ''}Verbindungen anzeigen{edges.length ? ` (${edges.length})` : ''}
        </button>
      </div>
      <div ref={trackRef} className={`thumbnails ${showConn ? 'with-conn' : ''}`}>
        {showConn && arcs.length > 0 && (
          <svg className="conn-svg" width={trackRef.current?.scrollWidth ?? '100%'} height={trackRef.current?.clientHeight ?? 0}>
            <defs>
              <marker id="conn-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" fill="#818cf8" />
              </marker>
            </defs>
            {arcs.map((a, i) => {
              const midX = (a.x1 + a.x2) / 2
              const peak = a.y - 22 - a.depth
              return (
                <path
                  key={i}
                  d={`M ${a.x1} ${a.y} Q ${midX} ${peak} ${a.x2} ${a.y}`}
                  fill="none"
                  stroke="#818cf8"
                  strokeWidth={2}
                  markerEnd="url(#conn-arrow)"
                />
              )
            })}
          </svg>
        )}
        {screens.map((s) => (
          <Thumb key={s.id} screen={s} active={s.id === activeScreenId} registerFrame={(id, el) => (frameRefs.current[id] = el)} />
        ))}
        <button className="thumb-add" onClick={addScreen}>
          <span style={{ fontSize: 26 }}>+</span>
          <span>Screen</span>
        </button>
      </div>
    </div>
  )
}
