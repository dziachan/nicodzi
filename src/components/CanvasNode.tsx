import { useRef } from 'react'
import { useStore } from '../store'
import type { ComponentNode } from '../types'

interface Props {
  node: ComponentNode
  selected: boolean
  zoom: number
  screenRef: React.RefObject<HTMLDivElement>
}

const MIN = 8

/**
 * Transparent interaction box for a node. The visual is rendered separately in
 * the (clipped) visual layer; this hit box lives in an unclipped layer so nodes
 * that stick out past the screen edge stay selectable / draggable.
 */
export default function CanvasNode({ node, selected, zoom, screenRef }: Props) {
  const selectNode = useStore((s) => s.selectNode)
  const updateNode = useStore((s) => s.updateNode)
  const deleteNode = useStore((s) => s.deleteNode)
  const checkpoint = useStore((s) => s.checkpoint)
  const targetName = useStore((s) =>
    node.props.navigateTo ? s.project.screens.find((sc) => sc.id === node.props.navigateTo)?.name ?? null : null,
  )

  const drag = useRef<{ mode: 'move' | 'resize'; px: number; py: number; start: ComponentNode; committed: boolean } | null>(null)

  const toLogical = (e: PointerEvent | React.PointerEvent) => {
    const r = screenRef.current!.getBoundingClientRect()
    return { x: (e.clientX - r.left) / zoom, y: (e.clientY - r.top) / zoom }
  }

  const begin = (mode: 'move' | 'resize') => (e: React.PointerEvent) => {
    e.preventDefault()
    e.stopPropagation()
    selectNode(node.id)
    const p = toLogical(e)
    drag.current = { mode, px: p.x, py: p.y, start: { ...node }, committed: false }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  const onMove = (e: PointerEvent) => {
    const d = drag.current
    if (!d) return
    if (!d.committed) {
      checkpoint() // one undo step per drag, captured on first movement
      d.committed = true
    }
    const p = toLogical(e)
    const dx = p.x - d.px
    const dy = p.y - d.py
    if (d.mode === 'move') {
      // No clamping: components may be placed freely, even past the screen edge.
      updateNode(node.id, { x: Math.round(d.start.x + dx), y: Math.round(d.start.y + dy) }, 'none')
    } else {
      const w = Math.max(MIN, Math.round(d.start.w + dx))
      const h = Math.max(MIN, Math.round(d.start.h + dy))
      updateNode(node.id, { w, h }, 'none')
    }
  }

  const onUp = () => {
    drag.current = null
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('pointerup', onUp)
  }

  const rotation = node.props.rotation ?? 0

  return (
    <div
      className={`canvas-node ${selected ? 'selected' : ''}`}
      style={{ left: node.x, top: node.y, width: node.w, height: node.h, transform: rotation ? `rotate(${rotation}deg)` : undefined }}
      onPointerDown={begin('move')}
      onClick={(e) => e.stopPropagation()}
    >
      {targetName && <span className="nav-badge">→ {targetName}</span>}
      {node.type === 'image' && node.props.ocrStatus === 'pending' && <span className="ocr-badge">Text wird gelesen…</span>}
      {node.type === 'image' && node.props.ocrStatus === 'done' && node.props.ocrText && <span className="ocr-badge done">Text erkannt ✓</span>}

      {selected && (
        <>
          <div className="node-resize" onPointerDown={begin('resize')} title="Größe ändern" />
          <button
            className="node-delete"
            onPointerDown={(e) => {
              e.stopPropagation()
              deleteNode(node.id)
            }}
            title="Löschen"
          >
            ✕
          </button>
        </>
      )}
    </div>
  )
}
