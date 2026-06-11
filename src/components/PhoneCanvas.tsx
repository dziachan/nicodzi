import { useRef, useState } from 'react'
import { useStore } from '../store'
import ElementRenderer from './ElementRenderer'
import ImageItem from './ImageItem'
import type { ImageLayer } from '../types'

const ACCEPTED = ['image/png', 'image/jpeg']
const MAX_INITIAL = 180

/** Reads a dropped/selected image file into an ImageLayer placed at (cx, cy). */
function fileToLayer(file: File, cx: number, cy: number): Promise<Omit<ImageLayer, 'id'>> {
  return new Promise((resolve, reject) => {
    if (!ACCEPTED.includes(file.type)) return reject(new Error('Nur PNG und JPEG werden unterstützt.'))
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Datei konnte nicht gelesen werden.'))
    reader.onload = () => {
      const src = String(reader.result)
      const probe = new Image()
      probe.onload = () => {
        const ratio = probe.naturalWidth / probe.naturalHeight || 1
        const width = ratio >= 1 ? MAX_INITIAL : MAX_INITIAL * ratio
        const height = ratio >= 1 ? MAX_INITIAL / ratio : MAX_INITIAL
        resolve({
          src,
          name: file.name,
          x: cx - width / 2,
          y: cy - height / 2,
          width,
          height,
          rotation: 0,
        })
      }
      probe.onerror = () => reject(new Error('Bild konnte nicht geladen werden.'))
      probe.src = src
    }
    reader.readAsDataURL(file)
  })
}

export default function PhoneCanvas() {
  const project = useStore((s) => s.project)
  const screen = useStore((s) => s.activeScreen())
  const selectedId = useStore((s) => s.selectedId)
  const selectedImageId = useStore((s) => s.selectedImageId)
  const select = useStore((s) => s.select)
  const moveElement = useStore((s) => s.moveElement)
  const deleteElement = useStore((s) => s.deleteElement)
  const addImage = useStore((s) => s.addImage)
  const theme = project.theme

  const bodyRef = useRef<HTMLDivElement>(null)
  const [dragOver, setDragOver] = useState(false)

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const rect = bodyRef.current!.getBoundingClientRect()
    let cx = e.clientX - rect.left
    let cy = e.clientY - rect.top
    const files = Array.from(e.dataTransfer.files).filter((f) => ACCEPTED.includes(f.type))
    if (files.length === 0) return
    for (const file of files) {
      try {
        const layer = await fileToLayer(file, cx, cy)
        addImage(layer)
        cx += 16
        cy += 16
      } catch (err) {
        alert((err as Error).message)
      }
    }
  }

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

        <div
          ref={bodyRef}
          className={`screen-body ${dragOver ? 'drag-over' : ''}`}
          onDragOver={(e) => {
            e.preventDefault()
            if (!dragOver) setDragOver(true)
          }}
          onDragLeave={(e) => {
            if (e.currentTarget === e.target) setDragOver(false)
          }}
          onDrop={handleDrop}
        >
          <div className="screen-scroll">
            {screen.elements.length === 0 && screen.images.length === 0 && (
              <div className="empty-hint" style={{ color: theme.muted }}>
                Leerer Screen.<br />Füge links Elemente hinzu<br />oder zieh ein PNG/JPEG hierher.
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

          {/* Free-form image layer sits above the stacked content */}
          <div className="image-layer">
            {screen.images.map((img) => (
              <ImageItem key={img.id} img={img} selected={img.id === selectedImageId} layerRef={bodyRef} />
            ))}
          </div>

          {dragOver && <div className="drop-overlay">Bild hier ablegen</div>}
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
