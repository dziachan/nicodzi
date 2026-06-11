import { useStore } from '../store'
import type { ComponentNode } from '../types'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
    </label>
  )
}

export default function Inspector({ node }: { node: ComponentNode }) {
  const setProps = useStore((s) => s.updateNodeProps)
  const setNode = useStore((s) => s.updateNode)
  const deleteNode = useStore((s) => s.deleteNode)
  const screens = useStore((s) => s.project.screens)
  const activeScreenId = useStore((s) => s.activeScreenId)
  const tokens = useStore((s) => s.project.tokens)

  const p = node.props
  const sp = (patch: Partial<ComponentNode['props']>) => setProps(node.id, patch)
  const has = (...t: ComponentNode['type'][]) => t.includes(node.type)

  const colorField = (label: string, key: 'bg' | 'textColor', fallback: string) => (
    <Field label={label}>
      <div className="color-row">
        <input type="color" value={p[key] ?? fallback} onChange={(e) => sp({ [key]: e.target.value })} />
        <input className="hex" value={p[key] ?? ''} placeholder={fallback} onChange={(e) => sp({ [key]: e.target.value })} />
      </div>
    </Field>
  )

  return (
    <div className="inspector-body">
      <div className="inspector-group">{node.type}</div>

      {has('button', 'label', 'topBar', 'card', 'toggle') && (
        <Field label="Text">
          <input value={p.text ?? ''} onChange={(e) => sp({ text: e.target.value })} />
        </Field>
      )}
      {has('input', 'searchBar') && (
        <Field label="Platzhalter">
          <input value={p.placeholder ?? ''} onChange={(e) => sp({ placeholder: e.target.value })} />
        </Field>
      )}
      {has('icon') && (
        <Field label="Icon / Emoji">
          <input value={p.icon ?? ''} onChange={(e) => sp({ icon: e.target.value })} />
        </Field>
      )}
      {has('list', 'bottomNav') && (
        <Field label="Einträge (Komma-getrennt)">
          <input
            value={(p.items ?? []).join(', ')}
            onChange={(e) => sp({ items: e.target.value.split(',').map((x) => x.trim()).filter(Boolean) })}
          />
        </Field>
      )}
      {has('toggle') && (
        <Field label="Standardmäßig an">
          <input type="checkbox" checked={!!p.value} onChange={(e) => sp({ value: e.target.checked })} />
        </Field>
      )}

      {has('label', 'button', 'card', 'topBar', 'input', 'searchBar', 'toggle') && (
        <Field label={`Schriftgröße (${p.fontSize ?? tokens.baseFontSize}px)`}>
          <input type="range" min={10} max={40} value={p.fontSize ?? tokens.baseFontSize} onChange={(e) => sp({ fontSize: +e.target.value })} />
        </Field>
      )}
      {has('label', 'button', 'topBar') && (
        <Field label="Ausrichtung">
          <select value={p.align ?? 'left'} onChange={(e) => sp({ align: e.target.value as any })}>
            <option value="left">Links</option>
            <option value="center">Mitte</option>
            <option value="right">Rechts</option>
          </select>
        </Field>
      )}
      {!has('icon', 'bottomNav') && (
        <Field label={`Eckenradius (${p.radius ?? tokens.radius}px)`}>
          <input type="range" min={0} max={40} value={p.radius ?? tokens.radius} onChange={(e) => sp({ radius: +e.target.value })} />
        </Field>
      )}

      {colorField('Hintergrund/Akzent', 'bg', tokens.primary)}
      {colorField('Textfarbe', 'textColor', tokens.text)}

      <div className="inspector-group">Navigation</div>
      <Field label="Bei Tap zu Screen">
        <select value={p.navigateTo ?? ''} onChange={(e) => sp({ navigateTo: e.target.value || null })}>
          <option value="">— keine —</option>
          {screens
            .filter((s) => s.id !== activeScreenId)
            .map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
        </select>
      </Field>

      <div className="inspector-group">Position & Größe</div>
      <div className="grid2">
        <Field label="X"><input type="number" value={Math.round(node.x)} onChange={(e) => setNode(node.id, { x: +e.target.value })} /></Field>
        <Field label="Y"><input type="number" value={Math.round(node.y)} onChange={(e) => setNode(node.id, { y: +e.target.value })} /></Field>
        <Field label="Breite"><input type="number" value={Math.round(node.w)} onChange={(e) => setNode(node.id, { w: +e.target.value })} /></Field>
        <Field label="Höhe"><input type="number" value={Math.round(node.h)} onChange={(e) => setNode(node.id, { h: +e.target.value })} /></Field>
      </div>

      <button className="btn danger small" onClick={() => deleteNode(node.id)}>Komponente löschen</button>
    </div>
  )
}
