import { useEffect, useMemo, useState } from 'react'
import { useStore } from '../store'
import { generatePrompt } from '../promptGenerator'
import { computeWarnings } from '../interactions'

export default function PromptModal({ onClose }: { onClose: () => void }) {
  const project = useStore((s) => s.project)
  const patchNodeProps = useStore((s) => s.patchNodeProps)
  const prompt = useMemo(() => generatePrompt(project), [project])
  const warnings = useMemo(() => computeWarnings(project), [project])
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(prompt)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = prompt
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  const download = () => {
    const blob = new Blob([prompt], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${project.appName.replace(/\s+/g, '-').toLowerCase() || 'app'}-prompt.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <div className="modal-title">✨ Build-Prompt für Claude Code</div>
            <div className="hint">Vollständige Bauanleitung — in Claude Code einfügen, fertige App entsteht.</div>
          </div>
          <button className="btn" onClick={onClose}>Schließen</button>
        </div>

        {warnings.length > 0 && (
          <div className="warnings">
            <div className="warnings-title">⚠ {warnings.length} Hinweis(e) — Export trotzdem möglich</div>
            <ul>
              {warnings.map((w, i) => {
                if (w.type === 'noTarget')
                  return <li key={i}>„{w.label}" (Screen „{w.screenName}") ist klickbar, hat aber kein Ziel.</li>
                if (w.type === 'unreachable')
                  return <li key={i}>Screen „{w.screenName}" ist von keinem anderen Screen aus erreichbar.</li>
                return (
                  <li key={i}>
                    „{w.label}" (Screen „{w.screenName}") sieht wie Navigation aus, ist aber nicht als klickbar markiert.{' '}
                    <button className="link-btn" onClick={() => patchNodeProps(w.nodeId, { clickable: true, linkKind: 'screen' })}>
                      Als klickbar markieren
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        )}

        <pre className="prompt-out">{prompt}</pre>
        <div className="modal-foot">
          <button className="btn" onClick={download}>⬇ .md herunterladen</button>
          <button className="btn primary" onClick={copy}>{copied ? '✓ Kopiert!' : 'In Zwischenablage kopieren'}</button>
        </div>
      </div>
    </div>
  )
}
