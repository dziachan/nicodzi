import { useState } from 'react'
import Topbar from './components/Topbar'
import Palette from './components/Palette'
import PhoneCanvas from './components/PhoneCanvas'
import Inspector from './components/Inspector'
import PromptModal from './components/PromptModal'

export default function App() {
  const [showPrompt, setShowPrompt] = useState(false)

  return (
    <div className="app">
      <Topbar onGenerate={() => setShowPrompt(true)} />
      <main className="workspace">
        <Palette />
        <PhoneCanvas />
        <Inspector />
      </main>
      {showPrompt && <PromptModal onClose={() => setShowPrompt(false)} />}
    </div>
  )
}
