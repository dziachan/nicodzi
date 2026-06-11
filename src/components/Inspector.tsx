import { useStore } from '../store'
import type { DesignElement, ImageLayer, Theme } from '../types'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
    </label>
  )
}

function ElementInspector({ el }: { el: DesignElement }) {
  const update = useStore((s) => s.updateElement)
  const p = el.props
  const set = (patch: Partial<DesignElement['props']>) => update(el.id, patch)
  const has = (k: keyof typeof p) => k in p

  return (
    <>
      {has('text') && (
        <Field label="Text">
          <input value={p.text ?? ''} onChange={(e) => set({ text: e.target.value })} />
        </Field>
      )}
      {has('subtitle') && (
        <Field label="Untertitel">
          <input value={p.subtitle ?? ''} onChange={(e) => set({ subtitle: e.target.value })} />
        </Field>
      )}
      {has('placeholder') && (
        <Field label="Platzhalter">
          <input value={p.placeholder ?? ''} onChange={(e) => set({ placeholder: e.target.value })} />
        </Field>
      )}
      {has('icon') && (
        <Field label="Icon">
          <input value={p.icon ?? ''} onChange={(e) => set({ icon: e.target.value })} />
        </Field>
      )}
      {has('align') && (
        <Field label="Ausrichtung">
          <select value={p.align} onChange={(e) => set({ align: e.target.value as any })}>
            <option value="left">Links</option>
            <option value="center">Mitte</option>
            <option value="right">Rechts</option>
          </select>
        </Field>
      )}
      {has('variant') && (
        <Field label="Variante">
          <select value={p.variant} onChange={(e) => set({ variant: e.target.value as any })}>
            <option value="primary">Primär</option>
            <option value="secondary">Sekundär</option>
            <option value="outline">Outline</option>
            <option value="ghost">Ghost</option>
          </select>
        </Field>
      )}
      {has('fontSize') && (
        <Field label={`Schriftgröße (${p.fontSize}px)`}>
          <input type="range" min={11} max={40} value={p.fontSize} onChange={(e) => set({ fontSize: +e.target.value })} />
        </Field>
      )}
      {has('fontWeight') && (
        <Field label="Schriftstärke">
          <select value={p.fontWeight} onChange={(e) => set({ fontWeight: +e.target.value })}>
            <option value={400}>Normal</option>
            <option value={500}>Medium</option>
            <option value={600}>Semibold</option>
            <option value={700}>Bold</option>
            <option value={800}>Extra Bold</option>
          </select>
        </Field>
      )}
      {has('radius') && (
        <Field label={`Eckenradius (${p.radius}px)`}>
          <input type="range" min={0} max={32} value={p.radius} onChange={(e) => set({ radius: +e.target.value })} />
        </Field>
      )}
      {has('height') && (
        <Field label={`Höhe (${p.height}px)`}>
          <input type="range" min={8} max={320} value={p.height} onChange={(e) => set({ height: +e.target.value })} />
        </Field>
      )}
      {has('fullWidth') && (
        <Field label="Volle Breite">
          <input type="checkbox" checked={!!p.fullWidth} onChange={(e) => set({ fullWidth: e.target.checked })} />
        </Field>
      )}
    </>
  )
}

const stylePresets: { id: Theme['style']; label: string }[] = [
  { id: 'minimal', label: 'Minimal' },
  { id: 'glass', label: 'Glass' },
  { id: 'neumorph', label: 'Neumorph' },
  { id: 'bold', label: 'Bold' },
  { id: 'playful', label: 'Playful' },
]

const fonts = ['Inter', 'SF Pro', 'Poppins', 'Roboto', 'Manrope', 'Georgia']

function ThemeInspector() {
  const theme = useStore((s) => s.project.theme)
  const setTheme = useStore((s) => s.setTheme)
  const project = useStore((s) => s.project)
  const setProject = useStore((s) => s.setProject)
  const screen = useStore((s) => s.activeScreen())
  const renameScreen = useStore((s) => s.renameScreen)
  const deleteScreen = useStore((s) => s.deleteScreen)

  const color = (label: string, key: keyof Theme) => (
    <Field label={label}>
      <div className="color-row">
        <input type="color" value={theme[key] as string} onChange={(e) => setTheme({ [key]: e.target.value } as any)} />
        <input className="hex" value={theme[key] as string} onChange={(e) => setTheme({ [key]: e.target.value } as any)} />
      </div>
    </Field>
  )

  return (
    <>
      <div className="inspector-group">App</div>
      <Field label="App-Name">
        <input value={project.appName} onChange={(e) => setProject({ appName: e.target.value })} />
      </Field>
      <Field label="Tagline">
        <input value={project.tagline} onChange={(e) => setProject({ tagline: e.target.value })} />
      </Field>
      <Field label="Aktiver Screen">
        <input value={screen.name} onChange={(e) => renameScreen(screen.id, e.target.value)} />
      </Field>
      {project.screens.length > 1 && (
        <button className="btn danger small" onClick={() => deleteScreen(screen.id)}>Diesen Screen löschen</button>
      )}

      <div className="inspector-group">Stil-Preset</div>
      <div className="preset-row">
        {stylePresets.map((s) => (
          <button
            key={s.id}
            className={`preset ${theme.style === s.id ? 'active' : ''}`}
            onClick={() => setTheme({ style: s.id })}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="inspector-group">Theme</div>
      <Field label="Modus">
        <select value={theme.mode} onChange={(e) => setTheme({ mode: e.target.value as any })}>
          <option value="dark">Dark</option>
          <option value="light">Light</option>
        </select>
      </Field>
      <Field label="Schriftart">
        <select value={theme.fontFamily} onChange={(e) => setTheme({ fontFamily: e.target.value })}>
          {fonts.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </Field>
      <Field label={`Eckenradius (${theme.radius}px)`}>
        <input type="range" min={0} max={32} value={theme.radius} onChange={(e) => setTheme({ radius: +e.target.value })} />
      </Field>
      {color('Primärfarbe', 'primary')}
      {color('Akzentfarbe', 'accent')}
      {color('Hintergrund', 'background')}
      {color('Flächen', 'surface')}
      {color('Text', 'text')}
      {color('Gedämpfter Text', 'muted')}

      <div className="inspector-group">Navigation</div>
      <Field label="Statusleiste">
        <input type="checkbox" checked={project.showStatusBar} onChange={(e) => setProject({ showStatusBar: e.target.checked })} />
      </Field>
      <Field label="Tab-Bar">
        <input type="checkbox" checked={project.showTabBar} onChange={(e) => setProject({ showTabBar: e.target.checked })} />
      </Field>
      {project.showTabBar && (
        <Field label="Tabs (Komma-getrennt)">
          <input
            value={project.tabs.join(', ')}
            onChange={(e) => setProject({ tabs: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) })}
          />
        </Field>
      )}
    </>
  )
}

function ImageInspector({ img }: { img: ImageLayer }) {
  const updateImage = useStore((s) => s.updateImage)
  const deleteImage = useStore((s) => s.deleteImage)
  const bringToFront = useStore((s) => s.bringImageToFront)
  const set = (patch: Partial<ImageLayer>) => updateImage(img.id, patch)
  // Keep rotation within -180..180 so the slider stays in sync.
  const norm = (deg: number) => ((((deg + 180) % 360) + 360) % 360) - 180

  return (
    <>
      <img className="img-preview" src={img.src} alt={img.name} />
      <div className="hint">{img.name}</div>

      <div className="inspector-group">Transform</div>
      <Field label={`Breite (${Math.round(img.width)}px)`}>
        <input type="range" min={24} max={320} value={Math.round(img.width)} onChange={(e) => {
          const ratio = img.height / img.width
          const width = +e.target.value
          set({ width, height: width * ratio })
        }} />
      </Field>
      <Field label={`Rotation (${img.rotation}°)`}>
        <input type="range" min={-180} max={180} value={img.rotation} onChange={(e) => set({ rotation: +e.target.value })} />
      </Field>
      <div className="preset-row">
        <button className="preset" onClick={() => set({ rotation: 0 })}>0°</button>
        <button className="preset" onClick={() => set({ rotation: norm(img.rotation - 90) })}>↺ 90°</button>
        <button className="preset" onClick={() => set({ rotation: norm(img.rotation + 90) })}>↻ 90°</button>
      </div>

      <div className="inspector-group">Anordnung</div>
      <button className="btn small" onClick={() => bringToFront(img.id)}>In den Vordergrund</button>
      <button className="btn danger small" onClick={() => deleteImage(img.id)}>Bild löschen</button>

      <div className="hint">Tipp: Im Handy kannst du das Bild ziehen, an der Ecke skalieren und am oberen Griff drehen.</div>
    </>
  )
}

export default function Inspector() {
  const selectedId = useStore((s) => s.selectedId)
  const selectedImageId = useStore((s) => s.selectedImageId)
  const screen = useStore((s) => s.activeScreen())
  const selected = screen.elements.find((e) => e.id === selectedId)
  const selectedImage = screen.images.find((i) => i.id === selectedImageId)

  const title = selectedImage ? 'Bild bearbeiten' : selected ? 'Element bearbeiten' : 'Design & Theme'

  return (
    <aside className="panel right">
      <div className="panel-title">{title}</div>
      <div className="inspector-body">
        {selectedImage ? <ImageInspector img={selectedImage} /> : selected ? <ElementInspector el={selected} /> : <ThemeInspector />}
      </div>
      {(selected || selectedImage) && (
        <div className="hint">Klicke auf den leeren Bereich, um zu den Theme-Einstellungen zurückzukehren.</div>
      )}
    </aside>
  )
}
