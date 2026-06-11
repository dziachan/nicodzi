import { useEffect, useState } from 'react'
import { useStore } from './store'
import Topbar from './components/Topbar'
import Palette from './components/Palette'
import PhoneEditor from './components/PhoneEditor'
import ScreenThumbnails from './components/ScreenThumbnails'
import Inspector from './components/Inspector'
import TokensPanel from './components/TokensPanel'
import ScreenSettings from './components/ScreenSettings'
import PromptModal from './components/PromptModal'

export default function App() {
  const [showPrompt, setShowPrompt] = useState(false)
  const selectedNodeId = useStore((s) => s.selectedNodeId)
  const screen = useStore((s) => s.activeScreen())
  const undo = useStore((s) => s.undo)
  const redo = useStore((s) => s.redo)
  const deleteNode = useStore((s) => s.deleteNode)
  const selectNode = useStore((s) => s.selectNode)
  const selected = screen.nodes.find((n) => n.id === selectedNodeId)

  // Keyboard shortcuts (ignored while typing in fields).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement
      if (el && /INPUT|TEXTAREA|SELECT/.test(el.tagName)) return
      const id = useStore.getState().selectedNodeId
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        e.shiftKey ? redo() : undo()
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault()
        redo()
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && id) {
        e.preventDefault()
        deleteNode(id)
      } else if (e.key === 'Escape') {
        selectNode(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [undo, redo, deleteNode, selectNode])

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
          <div className="panel-title">{selected ? 'Komponente' : 'Screen & Design'}</div>
          {selected ? (
            <Inspector node={selected} />
          ) : (
            <>
              <ScreenSettings />
              <TokensPanel />
            </>
          )}
        </aside>
      </main>
      {showPrompt && <PromptModal onClose={() => setShowPrompt(false)} />}
    </div>
  )
}
