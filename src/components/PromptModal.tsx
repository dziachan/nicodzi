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
        <pre className="prompt-out">{prompt}</pre>
        <div className="modal-foot">
          <button className="btn" onClick={download}>⬇ .md herunterladen</button>
          <button className="btn primary" onClick={copy}>{copied ? '✓ Kopiert!' : 'In Zwischenablage kopieren'}</button>
        </div>
      </div>
    </div>
  )
}
