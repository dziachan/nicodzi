import { useStore } from '../store'
import PhoneFrame from './PhoneFrame'

export default function PhoneCanvas() {
  const screens = useStore((s) => s.project.screens)
  const activeScreenId = useStore((s) => s.activeScreenId)
  const addScreen = useStore((s) => s.addScreen)

  return (
    <div className="canvas">
      <div className="canvas-scroll">
        {screens.map((screen) => (
          <PhoneFrame key={screen.id} screen={screen} active={screen.id === activeScreenId} />
        ))}

        <button className="add-frame" onClick={addScreen} title="Neuen Screen hinzufügen">
          <span className="add-frame-plus">+</span>
          <span>Neuer Screen</span>
        </button>
      </div>
    </div>
  )
}
