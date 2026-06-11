import { useRef } from 'react'
import { elementLabel, useStore } from '../store'
import type { ElementType, ImageLayer } from '../types'

const ACCEPTED = ['image/png', 'image/jpeg']
const MAX_INITIAL = 180

function fileToLayer(file: File): Promise<Omit<ImageLayer, 'id'>> {
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
        // Drop roughly in the upper-middle of the ~280px-wide screen body.
        resolve({ src, name: file.name, x: 140 - width / 2, y: 120 - height / 2, width, height, rotation: 0 })
      }
      probe.onerror = () => reject(new Error('Bild konnte nicht geladen werden.'))
      probe.src = src
    }
    reader.readAsDataURL(file)
  })
}

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
  const addImage = useStore((s) => s.addImage)
  const screens = useStore((s) => s.project.screens)
  const activeScreenId = useStore((s) => s.activeScreenId)
  const setActiveScreen = useStore((s) => s.setActiveScreen)
  const addScreen = useStore((s) => s.addScreen)
  const fileRef = useRef<HTMLInputElement>(null)

  const onFiles = async (files: FileList | null) => {
    if (!files) return
    for (const file of Array.from(files)) {
      try {
        addImage(await fileToLayer(file))
      } catch (err) {
        alert((err as Error).message)
      }
    }
    if (fileRef.current) fileRef.current.value = ''
  }

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
        <div className="panel-title">Bilder</div>
        <div className="hint">PNG/JPEG ins Handy ziehen — oder hier wählen. Danach verschieben, skalieren, drehen.</div>
        <button className="btn upload" onClick={() => fileRef.current?.click()}>⬆ Bild hochladen</button>
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg"
          multiple
          style={{ display: 'none' }}
          onChange={(e) => onFiles(e.target.files)}
        />
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
