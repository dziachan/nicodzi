import { useStore } from '../store'
import { FONT_OPTIONS } from '../constants'
import { PRESET_NAMES } from '../presets'
import type { DesignTokens } from '../types'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
    </label>
  )
}

export default function TokensPanel() {
  const t = useStore((s) => s.project.tokens)
  const setTokens = useStore((s) => s.setTokens)
  const applyPreset = useStore((s) => s.applyPreset)
  const project = useStore((s) => s.project)
  const setProject = useStore((s) => s.setProject)

  const color = (label: string, key: keyof DesignTokens) => (
    <Field label={label}>
      <div className="color-row">
        <input type="color" value={t[key] as string} onChange={(e) => setTokens({ [key]: e.target.value } as any)} />
        <input className="hex" value={t[key] as string} onChange={(e) => setTokens({ [key]: e.target.value } as any)} />
      </div>
    </Field>
  )

  return (
    <div className="inspector-body">
      <div className="inspector-group">App</div>
      <Field label="App-Name">
        <input value={project.appName} onChange={(e) => setProject({ appName: e.target.value })} />
      </Field>
      <Field label="Was soll die App können?">
        <textarea
          rows={4}
          placeholder="z. B. Eine To-Do-App mit Login, in der man Aufgaben anlegen, abhaken und filtern kann."
          value={project.appDescription}
          onChange={(e) => setProject({ appDescription: e.target.value })}
        />
      </Field>

      <div className="inspector-group">Presets</div>
      <div className="preset-row">
        {PRESET_NAMES.map((name) => (
          <button key={name} className="preset" onClick={() => applyPreset(name)}>{name}</button>
        ))}
      </div>

      <div className="inspector-group">Design-Tokens</div>
      {color('Primärfarbe', 'primary')}
      {color('Sekundärfarbe', 'secondary')}
      {color('Hintergrund', 'background')}
      {color('Textfarbe', 'text')}
      <Field label="Schriftart">
        <select value={t.fontFamily} onChange={(e) => setTokens({ fontFamily: e.target.value })}>
          {FONT_OPTIONS.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </Field>
      <Field label={`Basis-Schriftgröße (${t.baseFontSize}px)`}>
        <input type="range" min={12} max={22} value={t.baseFontSize} onChange={(e) => setTokens({ baseFontSize: +e.target.value })} />
      </Field>
      <Field label={`Globaler Eckenradius (${t.radius}px)`}>
        <input type="range" min={0} max={40} value={t.radius} onChange={(e) => setTokens({ radius: +e.target.value })} />
      </Field>
      <Field label="Abstands-Raster">
        <div className="seg">
          <button className={t.spacing === 4 ? 'active' : ''} onClick={() => setTokens({ spacing: 4 })}>4px</button>
          <button className={t.spacing === 8 ? 'active' : ''} onClick={() => setTokens({ spacing: 8 })}>8px</button>
        </div>
      </Field>
    </div>
  )
}
