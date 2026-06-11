import { useRef } from 'react'
import { useStore } from '../store'
import type { Project } from '../types'

export default function Topbar({ onGenerate }: { onGenerate: () => void }) {
  const project = useStore((s) => s.project)
  const loadProject = useStore((s) => s.loadProject)
  const fileRef = useRef<HTMLInputElement>(null)

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${project.appName.replace(/\s+/g, '-').toLowerCase() || 'design'}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const importJson = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result)) as Project
        if (data && Array.isArray(data.screens)) loadProject(data)
        else alert('Ungültige Projektdatei.')
      } catch {
        alert('Datei konnte nicht gelesen werden.')
      }
    }
    reader.readAsText(file)
  }

  return (
    <header className="topbar">
      <div className="brand">
        <span className="logo">◳</span>
        <div>
          <div className="brand-name">Phorge</div>
          <div className="brand-sub">Mobile Design → Prompt</div>
        </div>
      </div>

      <div className="topbar-actions">
        <button className="btn" onClick={exportJson}>Exportieren</button>
        <button className="btn" onClick={() => fileRef.current?.click()}>Importieren</button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          style={{ display: 'none' }}
          onChange={(e) => e.target.files?.[0] && importJson(e.target.files[0])}
        />
        <button className="btn primary glow" onClick={onGenerate}>✨ Prompt generieren</button>
      </div>
    </header>
  )
}
