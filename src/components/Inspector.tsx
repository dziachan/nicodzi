import { componentLabel, useStore } from '../store'
import ImageOcr from './ImageOcr'
import IconPicker from './IconPicker'
import { isShape, type ComponentNode } from '../types'

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
  const reorderNode = useStore((s) => s.reorderNode)
  const screens = useStore((s) => s.project.screens)
  const activeScreenId = useStore((s) => s.activeScreenId)
  const tokens = useStore((s) => s.project.tokens)

  const p = node.props
  const sp = (patch: Partial<ComponentNode['props']>) => setProps(node.id, patch)
  const has = (...t: ComponentNode['type'][]) => t.includes(node.type)
  const shape = isShape(node.type)
  const isIcon = node.type === 'lucide'
  const isText = node.type === 'text'

  const colorField = (label: string, key: 'bg' | 'textColor' | 'borderColor', fallback: string) => (
    <Field label={label}>
      <div className="color-row">
        <input type="color" value={p[key] ?? fallback} onChange={(e) => sp({ [key]: e.target.value })} />
        <input className="hex" value={p[key] ?? ''} placeholder={fallback} onChange={(e) => sp({ [key]: e.target.value })} />
      </div>
    </Field>
  )

  const roundMax = Math.round(Math.min(node.w, node.h) / 2)

  return (
    <div className="inspector-body">
      <div className="inspector-group">{componentLabel(node.type)}</div>

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

      {has('image') && p.src && <ImageOcr key={node.id} node={node} />}

      {/* ---- Shape styling ---- */}
      {shape && (
        <>
          <div className="inspector-group">Form</div>
          {colorField('Füllfarbe', 'bg', tokens.primary)}
          <Field label={`Randstärke (${p.borderWidth ?? 0}px)`}>
            <input type="range" min={0} max={20} value={p.borderWidth ?? 0} onChange={(e) => sp({ borderWidth: +e.target.value })} />
          </Field>
          {(p.borderWidth ?? 0) > 0 && colorField('Randfarbe', 'borderColor', '#000000')}
          {!has('ellipse') && (
            <Field label={`Eckenradius (${p.radius ?? 0}px)`}>
              <input type="range" min={0} max={Math.max(2, roundMax)} value={Math.min(p.radius ?? 0, roundMax)} onChange={(e) => sp({ radius: +e.target.value })} />
            </Field>
          )}
          <Field label={`Deckkraft (${Math.round((p.opacity ?? 1) * 100)}%)`}>
            <input type="range" min={0} max={100} value={Math.round((p.opacity ?? 1) * 100)} onChange={(e) => sp({ opacity: +e.target.value / 100 })} />
          </Field>
          <Field label={`Drehung (${p.rotation ?? 0}°)`}>
            <input type="range" min={-180} max={180} value={p.rotation ?? 0} onChange={(e) => sp({ rotation: +e.target.value })} />
          </Field>
        </>
      )}

      {/* ---- Lucide icon ---- */}
      {isIcon && (
        <>
          <div className="inspector-group">Symbol</div>
          <div className="hint">Aktuell: {p.iconName ?? 'house'}</div>
          <IconPicker selected={p.iconName} onPick={(id) => sp({ iconName: id })} />
          {colorField('Farbe', 'bg', tokens.text)}
          <Field label={`Größe (${Math.round(Math.min(node.w, node.h))}px)`}>
            <input type="range" min={16} max={160} value={Math.round(Math.min(node.w, node.h))} onChange={(e) => setNode(node.id, { w: +e.target.value, h: +e.target.value })} />
          </Field>
          <Field label={`Strichstärke (${p.borderWidth ?? 2})`}>
            <input type="range" min={1} max={4} step={0.25} value={p.borderWidth ?? 2} onChange={(e) => sp({ borderWidth: +e.target.value })} />
          </Field>
          <Field label={`Drehung (${p.rotation ?? 0}°)`}>
            <input type="range" min={-180} max={180} value={p.rotation ?? 0} onChange={(e) => sp({ rotation: +e.target.value })} />
          </Field>
          <Field label={`Deckkraft (${Math.round((p.opacity ?? 1) * 100)}%)`}>
            <input type="range" min={0} max={100} value={Math.round((p.opacity ?? 1) * 100)} onChange={(e) => sp({ opacity: +e.target.value / 100 })} />
          </Field>
        </>
      )}

      {/* ---- Body text (paragraph) ---- */}
      {isText && (
        <>
          <Field label="Textinhalt">
            <textarea rows={4} value={p.text ?? ''} onChange={(e) => sp({ text: e.target.value })} />
          </Field>
          <Field label="Textgröße">
            <div className="seg">
              {([['Untertitel', 18], ['Normal', 16], ['Klein', 14], ['Caption', 12]] as const).map(([lbl, px]) => (
                <button key={px} className={(p.fontSize ?? 16) === px ? 'active' : ''} onClick={() => sp({ fontSize: px })}>{lbl}</button>
              ))}
            </div>
          </Field>
          <Field label="Größe (px)">
            <input type="number" min={8} max={64} value={p.fontSize ?? 16} onChange={(e) => sp({ fontSize: +e.target.value })} />
          </Field>
          <Field label="Schriftschnitt">
            <select value={p.textStyle ?? 'normal'} onChange={(e) => sp({ textStyle: e.target.value as any })}>
              <option value="normal">Normal</option>
              <option value="bold">Fett</option>
              <option value="italic">Kursiv</option>
            </select>
          </Field>
          {colorField('Farbe', 'textColor', tokens.text)}
          <Field label={`Zeilenhöhe (${(p.lineHeight ?? 1.5).toFixed(1)})`}>
            <input type="range" min={1} max={2.2} step={0.1} value={p.lineHeight ?? 1.5} onChange={(e) => sp({ lineHeight: +e.target.value })} />
          </Field>
          <Field label="Ausrichtung">
            <select value={p.align ?? 'left'} onChange={(e) => sp({ align: e.target.value as any })}>
              <option value="left">Links</option>
              <option value="center">Mitte</option>
              <option value="right">Rechts</option>
            </select>
          </Field>
          <Field label={`Deckkraft (${Math.round((p.opacity ?? 1) * 100)}%)`}>
            <input type="range" min={0} max={100} value={Math.round((p.opacity ?? 1) * 100)} onChange={(e) => sp({ opacity: +e.target.value / 100 })} />
          </Field>
        </>
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
      {!has('icon', 'bottomNav') && !shape && !isIcon && !isText && (
        <Field label={`Eckenradius (${p.radius ?? tokens.radius}px)`}>
          <input type="range" min={0} max={40} value={p.radius ?? tokens.radius} onChange={(e) => sp({ radius: +e.target.value })} />
        </Field>
      )}

      {!shape && !isIcon && !isText && (
        <>
          {colorField('Hintergrund/Akzent', 'bg', tokens.primary)}
          {colorField('Textfarbe', 'textColor', tokens.text)}
        </>
      )}

      {!shape && (
        <>
          <div className="inspector-group">Interaktion</div>
          <Field label="Anklickbar">
            <input
              type="checkbox"
              checked={!!p.clickable}
              onChange={(e) => sp({ clickable: e.target.checked, linkKind: p.linkKind ?? 'screen' })}
            />
          </Field>
          {p.clickable && (
            <>
              <Field label="Führt zu:">
                <select
                  value={p.linkKind === 'external' ? '__external__' : p.navigateTo ?? ''}
                  onChange={(e) => {
                    const v = e.target.value
                    if (v === '__external__') sp({ linkKind: 'external' })
                    else sp({ linkKind: 'screen', navigateTo: v || null })
                  }}
                >
                  <option value="">— Ziel wählen —</option>
                  {screens
                    .filter((s) => s.id !== activeScreenId)
                    .map((s) => (
                      <option key={s.id} value={s.id}>Screen: {s.name}</option>
                    ))}
                  <option value="__external__">Externe Aktion (Beschreibung)</option>
                </select>
              </Field>
              {p.linkKind === 'external' && (
                <Field label="Beschreibung der Aktion">
                  <input
                    value={p.externalAction ?? ''}
                    placeholder="z. B. öffnet Instagram-Profil"
                    onChange={(e) => sp({ externalAction: e.target.value })}
                  />
                </Field>
              )}
            </>
          )}
        </>
      )}

      <div className="inspector-group">Ebene</div>
      <div className="layer-row">
        <button className="btn" onClick={() => reorderNode(node.id, 'front')} title="Ganz nach vorne">⤒</button>
        <button className="btn" onClick={() => reorderNode(node.id, 'forward')} title="Eine Ebene nach vorne">↑</button>
        <button className="btn" onClick={() => reorderNode(node.id, 'backward')} title="Eine Ebene nach hinten">↓</button>
        <button className="btn" onClick={() => reorderNode(node.id, 'back')} title="Ganz nach hinten">⤓</button>
      </div>

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
