import { useEffect, useMemo, useState } from 'react'
import { useStore } from '../store'
import { generatePrompt } from '../promptGenerator'

export default function PromptModal({ onClose }: { onClose: () => void }) {
  const project = useStore((s) => s.project)
  const prompt = useMemo(() => generatePrompt(project), [project])
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
      // Fallback for environments without clipboard API
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

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <div className="modal-title">✨ Dein Vibe-Coding Prompt</div>
            <div className="hint">Kopiere das in Claude, Cursor, v0 o. Ä. — und deine App sieht modern aus.</div>
          </div>
          <button className="btn" onClick={onClose}>Schließen</button>
        </div>
        <pre className="prompt-out">{prompt}</pre>
        <div className="modal-foot">
          <button className="btn primary" onClick={copy}>{copied ? '✓ Kopiert!' : 'In Zwischenablage kopieren'}</button>
        </div>
      </div>
    </div>
  )
}
