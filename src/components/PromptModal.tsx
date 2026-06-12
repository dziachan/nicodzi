import { useEffect, useMemo, useState } from 'react'
import { useStore } from '../store'
import { generatePrompt } from '../promptGenerator'
import { computeWarnings } from '../interactions'
import { PLATFORMS, PLATFORM_IDS, loadPlatform, savePlatform, type PlatformId } from '../platforms'

export default function PromptModal({ onClose }: { onClose: () => void }) {
  const project = useStore((s) => s.project)
  const patchNodeProps = useStore((s) => s.patchNodeProps)

  const [platform, setPlatform] = useState<PlatformId>(loadPlatform())
  const [phase, setPhase] = useState<'choose' | 'prompt'>('choose')
  const [copied, setCopied] = useState(false)

  const prompt = useMemo(() => generatePrompt(project, platform), [project, platform])
  const warnings = useMemo(() => computeWarnings(project), [project])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const confirmPlatform = () => {
    savePlatform(platform)
    setPhase('prompt')
  }

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
    a.download = `${project.appName.replace(/\s+/g, '-').toLowerCase() || 'app'}-${platform}-prompt.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {phase === 'choose' ? (
          <>
            <div className="modal-head">
              <div>
                <div className="modal-title">🎯 Zielplattform wählen</div>
                <div className="hint">Pflichtfeld — bestimmt Framework, Layout-Sprache und Icon-System des Prompts.</div>
              </div>
              <button className="btn" onClick={onClose}>Abbrechen</button>
            </div>
            <div className="platform-grid">
              {PLATFORM_IDS.map((id) => {
                const def = PLATFORMS[id]
                return (
                  <button
                    key={id}
                    className={`platform-card ${platform === id ? 'active' : ''}`}
                    onClick={() => setPlatform(id)}
                  >
                    <div className="platform-label">{def.label}</div>
                    <div className="platform-sub">{def.subtitle}</div>
                    <ul className="platform-bullets">
                      {def.bullets.map((b) => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                  </button>
                )
              })}
            </div>
            <div className="modal-foot">
              <button className="btn primary" onClick={confirmPlatform}>Prompt für „{PLATFORMS[platform].label}" erzeugen →</button>
            </div>
          </>
        ) : (
          <>
            <div className="modal-head">
              <div>
                <div className="modal-title">✨ Build-Prompt · {PLATFORMS[platform].label}</div>
                <div className="hint">Vollständige, plattformspezifische Bauanleitung — in den jeweiligen Editor/AI einfügen.</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn" onClick={() => setPhase('choose')}>Plattform ändern</button>
                <button className="btn" onClick={onClose}>Schließen</button>
              </div>
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
          </>
        )}
      </div>
    </div>
  )
}
