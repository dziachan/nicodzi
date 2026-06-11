import { useRef } from 'react'
import { useStore } from '../store'
import type { ImageLayer } from '../types'

interface Props {
  img: ImageLayer
  screenId: string
  selected: boolean
  layerRef: React.RefObject<HTMLDivElement>
}

type Mode = 'move' | 'resize' | 'rotate'

const MIN_SIZE = 24

export default function ImageItem({ img, screenId, selected, layerRef }: Props) {
  const updateImage = useStore((s) => s.updateImage)
  const selectImage = useStore((s) => s.selectImage)
  const setActiveScreen = useStore((s) => s.setActiveScreen)
  const bringToFront = useStore((s) => s.bringImageToFront)
  const deleteImage = useStore((s) => s.deleteImage)

  // Mutable interaction state kept in a ref so window listeners see fresh values.
  const drag = useRef<{
    mode: Mode
    startPointer: { x: number; y: number }
    start: ImageLayer
    center: { x: number; y: number }
    startDist: number
  } | null>(null)

  const pointerInLayer = (e: PointerEvent | React.PointerEvent) => {
    const rect = layerRef.current!.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const begin = (mode: Mode) => (e: React.PointerEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setActiveScreen(screenId) // ensure edits target this screen
    selectImage(img.id)
    bringToFront(img.id)
    const p = pointerInLayer(e)
    const center = { x: img.x + img.width / 2, y: img.y + img.height / 2 }
    drag.current = {
      mode,
      startPointer: p,
      start: { ...img },
      center,
      startDist: Math.hypot(p.x - center.x, p.y - center.y) || 1,
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  const onMove = (e: PointerEvent) => {
    const d = drag.current
    if (!d) return
    const p = pointerInLayer(e)

    if (d.mode === 'move') {
      updateImage(img.id, {
        x: d.start.x + (p.x - d.startPointer.x),
        y: d.start.y + (p.y - d.startPointer.y),
      })
    } else if (d.mode === 'resize') {
      // Uniform scale based on distance from the (fixed) center — robust under rotation.
      const dist = Math.hypot(p.x - d.center.x, p.y - d.center.y)
      const ratio = dist / d.startDist
      const width = Math.max(MIN_SIZE, d.start.width * ratio)
      const height = Math.max(MIN_SIZE, d.start.height * ratio)
      updateImage(img.id, {
        width,
        height,
        x: d.center.x - width / 2,
        y: d.center.y - height / 2,
      })
    } else if (d.mode === 'rotate') {
      const angle = (Math.atan2(p.y - d.center.y, p.x - d.center.x) * 180) / Math.PI + 90
      updateImage(img.id, { rotation: Math.round(angle) })
    }
  }

  const onUp = () => {
    drag.current = null
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('pointerup', onUp)
  }

  return (
    <div
      className={`image-item ${selected ? 'selected' : ''}`}
      style={{
        left: img.x,
        top: img.y,
        width: img.width,
        height: img.height,
        transform: `rotate(${img.rotation}deg)`,
      }}
      onPointerDown={begin('move')}
      onClick={(e) => e.stopPropagation()}
    >
      <img src={img.src} alt={img.name} draggable={false} />

      {selected && (
        <>
          <div className="handle rotate" onPointerDown={begin('rotate')} title="Drehen" />
          <div className="handle resize" onPointerDown={begin('resize')} title="Größe ändern" />
          <button
            className="handle delete"
            onPointerDown={(e) => {
              e.stopPropagation()
              deleteImage(img.id)
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
