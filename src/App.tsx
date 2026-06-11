import { useEffect, useState } from 'react'
import { useStore } from './store'
import Topbar from './components/Topbar'
import Palette from './components/Palette'
import PhoneEditor from './components/PhoneEditor'
import ScreenThumbnails from './components/ScreenThumbnails'
import Inspector from './components/Inspector'
import TokensPanel from './components/TokensPanel'
import PromptModal from './components/PromptModal'

export default function App() {
  const [showPrompt, setShowPrompt] = useState(false)
  const selectedNodeId = useStore((s) => s.selectedNodeId)
  const screen = useStore((s) => s.activeScreen())
  const undo = useStore((s) => s.undo)
  const redo = useStore((s) => s.redo)
  const selected = screen.nodes.find((n) => n.id === selectedNodeId)

  // Undo / redo keyboard shortcuts (ignored while typing in fields).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement
      if (el && /INPUT|TEXTAREA|SELECT/.test(el.tagName)) return
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        e.shiftKey ? redo() : undo()
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault()
        redo()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [undo, redo])

  return (
    <div className="app">
      <Topbar onExport={() => setShowPrompt(true)} />
      <main className="workspace">
        <Palette />
        <div className="center">
          <PhoneEditor />
          <ScreenThumbnails />
        </div>
        <aside className="panel right">
          <div className="panel-title">{selected ? 'Komponente' : 'Design & Tokens'}</div>
          {selected ? <Inspector node={selected} /> : <TokensPanel />}
        </aside>
      </main>
      {showPrompt && <PromptModal onClose={() => setShowPrompt(false)} />}
    </div>
  )
}
