import { useState } from 'react'
import { useStore } from '../store'
import { recognizeImage } from '../ocr'
import type { ComponentNode } from '../types'

type Phase = 'idle' | 'running' | 'preview' | 'empty' | 'error'

/** Deliberate, user-driven OCR for an image node, with a confirm/discard preview. */
export default function ImageOcr({ node }: { node: ComponentNode }) {
  const setProps = useStore((s) => s.updateNodeProps)
  const sp = (patch: Partial<ComponentNode['props']>) => setProps(node.id, patch)

  const [phase, setPhase] = useState<Phase>('idle')
  const [draft, setDraft] = useState('')
  const [progress, setProgress] = useState(0)

  const committed = node.props.ocrText?.trim()

  const run = () => {
    const src = node.props.src
    if (!src) return
    setProgress(0)
    setPhase('running')
    recognizeImage(src, (p) => setProgress(p))
      .then((res) => {
        if (res.usable) {
          setDraft(res.text)
          setPhase('preview')
        } else {
          setPhase('empty')
        }
      })
      .catch(() => setPhase('error'))
  }

  const accept = () => {
    sp({ ocrText: draft.trim() })
    setDraft('')
    setPhase('idle')
  }

  const discard = () => {
    setDraft('')
    setPhase('idle')
  }

  return (
    <>
      <div className="inspector-group">Bild</div>

      <label className="field">
        <span className="field-label">Was zeigt dieses Bild? (optional)</span>
        <textarea
          rows={2}
          placeholder="z. B. Illustration eines rosa Plüschmonsters"
          value={node.props.description ?? ''}
          onChange={(e) => sp({ description: e.target.value })}
        />
      </label>

      <div className="inspector-group">Texterkennung (OCR)</div>

      {committed && phase === 'idle' && (
        <>
          <div className="field-label">Übernommener Text (landet im Export-Prompt):</div>
          <pre className="ocr-preview">{committed}</pre>
          <div className="layer-row" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <button className="btn small" style={{ marginTop: 0 }} onClick={run}>Neu erkennen</button>
            <button className="btn danger small" style={{ marginTop: 0 }} onClick={() => sp({ ocrText: '' })}>Entfernen</button>
          </div>
        </>
      )}

      {!committed && phase === 'idle' && (
        <button className="btn small" onClick={run}>Text im Bild erkennen</button>
      )}

      {phase === 'running' && (
        <>
          <div className="hint">Text wird erkannt… {Math.round(progress * 100)}% (erstes Mal etwas langsamer)</div>
          <div className="progress"><div className="progress-fill" style={{ width: `${Math.round(progress * 100)}%` }} /></div>
        </>
      )}

      {phase === 'error' && (
        <>
          <div className="hint" style={{ color: '#f87171' }}>OCR fehlgeschlagen (offline?).</div>
          <button className="btn small" onClick={run}>Erneut versuchen</button>
        </>
      )}

      {phase === 'empty' && (
        <>
          <div className="hint">Kein verwertbarer Text im Bild gefunden.</div>
          <button className="btn small" onClick={run}>Erneut versuchen</button>
        </>
      )}

      {phase === 'preview' && (
        <>
          <div className="field-label">Vorschau (vor Übernahme prüfen/korrigieren):</div>
          <textarea className="field-textarea" rows={5} value={draft} onChange={(e) => setDraft(e.target.value)} />
          <div className="layer-row" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <button className="btn primary small" style={{ marginTop: 0 }} onClick={accept} disabled={!draft.trim()}>Übernehmen</button>
            <button className="btn small" style={{ marginTop: 0 }} onClick={discard}>Verwerfen</button>
          </div>
        </>
      )}
    </>
  )
}
