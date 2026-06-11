import { useRef, useState } from 'react'
import { useStore } from '../store'
import { FRAME_H, FRAME_W, SCREEN_H, SCREEN_W } from '../constants'
import CanvasNode from './CanvasNode'
import NodeView from './NodeView'
import { recognizeText } from '../ocr'
import type { ComponentType } from '../types'

const IMG_TYPES = ['image/png', 'image/jpeg']
const MAX_IMG = 200

export default function PhoneEditor() {
  const screen = useStore((s) => s.activeScreen())
  const tokens = useStore((s) => s.project.tokens)
  const device = useStore((s) => s.project.device)
  const zoom = useStore((s) => s.zoom)
  const selectedNodeId = useStore((s) => s.selectedNodeId)
  const selectNode = useStore((s) => s.selectNode)
  const addNode = useStore((s) => s.addNode)
  const addImageNode = useStore((s) => s.addImageNode)
  const patchNodeProps = useStore((s) => s.patchNodeProps)

  const screenRef = useRef<HTMLDivElement>(null)
  const [over, setOver] = useState(false)

  const dropPoint = (e: React.DragEvent) => {
    const r = screenRef.current!.getBoundingClientRect()
    return { x: (e.clientX - r.left) / zoom, y: (e.clientY - r.top) / zoom }
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setOver(false)
    const at = dropPoint(e)
    const files = Array.from(e.dataTransfer.files).filter((f) => IMG_TYPES.includes(f.type))
    if (files.length) {
      files.forEach((file) => {
        const reader = new FileReader()
        reader.onload = () => {
          const src = String(reader.result)
          const probe = new Image()
          probe.onload = () => {
            const ratio = probe.naturalWidth / probe.naturalHeight || 1
            const w = ratio >= 1 ? MAX_IMG : MAX_IMG * ratio
            const h = ratio >= 1 ? MAX_IMG / ratio : MAX_IMG
            const id = addImageNode(src, w, h, at)
            // Read any text in the image (e.g. a UI mockup from Photoshop) via OCR.
            recognizeText(src)
              .then((text) => patchNodeProps(id, { ocrText: text, ocrStatus: 'done' }))
              .catch(() => patchNodeProps(id, { ocrStatus: 'error' }))
          }
          probe.src = src
        }
        reader.readAsDataURL(file)
      })
      return
    }
    const type = e.dataTransfer.getData('application/x-phorge-component') as ComponentType
    if (type) {
      const sizeRaw = e.dataTransfer.getData('application/x-phorge-size')
      addNode(type, at, sizeRaw ? JSON.parse(sizeRaw) : undefined)
    }
  }

  return (
    <div className="editor-stage" onClick={() => selectNode(null)}>
      <div className="frame-reserve" style={{ width: FRAME_W * zoom, height: FRAME_H * zoom }}>
        <div className={`phone-frame device-${device}`} style={{ transform: `scale(${zoom})` }}>
          <div className={`device-cutout device-${device}`} />

          {/* Visual layer: clipped to the (rounded) screen edges */}
          <div
            className={`phone-screen ${over ? 'drag-over' : ''}`}
            style={{ width: SCREEN_W, height: SCREEN_H, background: screen.background ?? tokens.background, fontFamily: `${tokens.fontFamily}, system-ui, sans-serif`, fontSize: tokens.baseFontSize }}
          >
            {screen.nodes.length === 0 && (
              <div className="screen-empty" style={{ color: `${tokens.text}88` }}>
                Komponente per Klick hinzufügen<br />oder hierher ziehen
              </div>
            )}
            {screen.nodes.map((n) => (
              <div
                key={n.id}
                className="node-visual"
                style={{ left: n.x, top: n.y, width: n.w, height: n.h, opacity: n.props.opacity ?? 1, transform: n.props.rotation ? `rotate(${n.props.rotation}deg)` : undefined }}
              >
                <NodeView node={n} tokens={tokens} />
              </div>
            ))}
          </div>

          {/* Interaction layer: sits over the screen but is NOT clipped, so nodes
              that stick out past the edge stay selectable and draggable. */}
          <div
            ref={screenRef}
            className="interact-overlay"
            style={{ width: SCREEN_W, height: SCREEN_H }}
            onClick={(e) => {
              e.stopPropagation()
              selectNode(null)
            }}
            onDragOver={(e) => {
              e.preventDefault()
              if (!over) setOver(true)
            }}
            onDragLeave={(e) => {
              if (e.currentTarget === e.target) setOver(false)
            }}
            onDrop={onDrop}
          >
            {screen.nodes.map((n) => (
              <CanvasNode key={n.id} node={n} selected={n.id === selectedNodeId} zoom={zoom} screenRef={screenRef} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
