import type { Project } from './types'

export interface AssetItem {
  file: string // suggested file name, e.g. "home-bild-1.png"
  nodeId?: string // set for image nodes, so the layout can reference the file
  screenName: string
  usage: string
  size: string
  content: string
}

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[äöüß]/g, (m) => ({ ä: 'ae', ö: 'oe', ü: 'ue', ß: 'ss' }[m] as string))
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'screen'

/**
 * Every graphic the design references but the coding assistant does NOT have:
 * user-uploaded images (and, on engines without a built-in icon set, icons).
 */
export function collectAssets(project: Project, needsIconFiles: boolean): AssetItem[] {
  const items: AssetItem[] = []

  for (const screen of project.screens) {
    const base = slug(screen.name)
    let imgN = 0
    for (const n of screen.nodes) {
      if (n.type === 'image' && n.props.src) {
        imgN += 1
        const desc = n.props.description?.trim()
        const ocr = n.props.ocrText?.trim()
        items.push({
          file: `${base}-bild-${imgN}.png`,
          nodeId: n.id,
          screenName: screen.name,
          usage: `Screen „${screen.name}"`,
          size: `${Math.round(n.w)}×${Math.round(n.h)} px (im Entwurf)`,
          content: desc || (ocr ? `enthält Text: „${ocr.split('\n')[0].slice(0, 60)}…"` : 'Grafik aus dem Entwurf — siehe Referenzbild'),
        })
      }
    }
  }

  if (needsIconFiles) {
    const icons = new Set<string>()
    for (const screen of project.screens) {
      for (const n of screen.nodes) if (n.type === 'lucide') icons.add(n.props.iconName ?? 'house')
    }
    for (const id of icons) {
      items.push({
        file: `icon-${id}.png`,
        screenName: '—',
        usage: 'Icon (mehrfach verwendbar)',
        size: '128×128 px, transparent',
        content: `Icon-Motiv „${id}" (z. B. aus lucide.dev als PNG/SVG exportiert)`,
      })
    }
  }

  return items
}

/** Fonts that are not part of the platform and must be bundled. */
export function fontAsset(project: Project): string | null {
  const f = project.tokens.fontFamily
  const system = ['SF Pro', 'Arial', 'Verdana', 'Georgia', 'Times New Roman', 'Courier New']
  return system.includes(f) ? null : f
}
