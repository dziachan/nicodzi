import { SCREEN_H, SCREEN_W } from './constants'
import { getEdges, getInteraction, nodeLabel, type Interaction } from './interactions'
import type { ComponentNode, Project, Screen } from './types'

const screenName = (project: Project, id?: string | null) =>
  id ? project.screens.find((s) => s.id === id)?.name ?? null : null

/** Human description of a node's interaction (clickable target). */
function interactionText(it: Interaction, project: Project): string {
  if (it.kind === 'external') return `KLICKBAR, löst externe Aktion aus${it.text ? `: „${it.text}"` : ' (Beschreibung fehlt)'}`
  return it.screenId ? `KLICKBAR, navigiert zu Screen „${screenName(project, it.screenId)}"` : 'KLICKBAR, aber ohne Ziel'
}

const TOUCH_NOTE = ' Umsetzung als Button mit dem beschriebenen Erscheinungsbild, Touch-Target mindestens 44px.'

/** Vertical region of a node, for human-readable positioning in the prompt. */
function region(node: ComponentNode): string {
  const cy = node.y + node.h / 2
  const v = cy < SCREEN_H / 3 ? 'oben' : cy < (SCREEN_H * 2) / 3 ? 'mittig' : 'unten'
  const cx = node.x + node.w / 2
  const h = cx < SCREEN_W / 3 ? 'links' : cx < (SCREEN_W * 2) / 3 ? 'zentriert' : 'rechts'
  return `${v}/${h}`
}

function describeNode(node: ComponentNode, project: Project, layer: number): string {
  const p = node.props
  const pos = `[${region(node)}, ${Math.round(node.w)}×${Math.round(node.h)}px]`
  const layerInfo = `Ebene ${layer}`
  const rot = p.rotation ? `, um ${p.rotation}° gedreht` : ''
  const op = p.opacity != null && p.opacity < 1 ? `, Deckkraft ${Math.round(p.opacity * 100)}%` : ''
  const border = p.borderWidth ? `, Rand ${p.borderWidth}px ${p.borderColor ?? '#000'}` : ''

  const it = getInteraction(node)
  const inter = it ? interactionText(it, project) : ''
  // For inherently-clickable controls the interaction reads inline; for text/image
  // we add an explicit note to implement them as a proper, accessible button.
  const interInline = it ? `, ${inter}` : ''
  const interNote = it ? ` ${inter}.${TOUCH_NOTE}` : ''

  switch (node.type) {
    case 'rectangle':
      return `Gestaltungselement Rechteck ${pos} (${layerInfo}), Füllfarbe ${p.bg}, Eckenradius ${p.radius ?? 0}px${border}${op}${rot}.`
    case 'ellipse':
      return `Gestaltungselement Ellipse/Kreis ${pos} (${layerInfo}), Füllfarbe ${p.bg}${border}${op}${rot}.`
    case 'line':
      return `Gestaltungselement Linie ${pos} (${layerInfo}), Farbe ${p.bg}, Stärke ${Math.round(node.h)}px${rot}.`
    case 'topBar':
      return `Top-Bar/Header ${pos} mit Titel "${p.text}".`
    case 'bottomNav':
      return `Bottom-Navigation ${pos} mit Tabs: ${(p.items ?? []).map((i) => `"${i}"`).join(', ')}.`
    case 'button':
      return `Button ${pos} mit Label "${p.text}"${interInline}.`
    case 'input':
      return `Texteingabefeld ${pos}, Platzhalter "${p.placeholder}".`
    case 'searchBar':
      return `Suchleiste ${pos}, Platzhalter "${p.placeholder}".`
    case 'label': {
      const fs = p.fontSize ?? 22
      const level = fs >= 28 ? 'h1' : fs >= 20 ? 'h2' : 'h3'
      return `Überschrift ${pos}: "${p.text}" (${fs}px) – als Heading <${level}> umsetzen, NICHT als Fließtext.${interNote}`
    }
    case 'text': {
      const styleLbl = p.textStyle === 'bold' ? 'Fett' : p.textStyle === 'italic' ? 'Kursiv' : 'Normal'
      const color = p.textColor ?? project.tokens.text
      const al = p.align ?? 'left'
      return `Fließtext ${pos}: "${p.text}" (${styleLbl}, ${p.fontSize ?? 16}px, ${color}, ${al}, Zeilenhöhe ${p.lineHeight ?? 1.5}) – als Absatz/<p> umsetzen, NICHT als Überschrift.${interNote}`
    }
    case 'image': {
      const desc = p.description?.trim()
      const ocr = p.ocrText?.trim()
      let base: string
      if (ocr) {
        base =
          `Vom Nutzer hochgeladenes UI-Mockup ${pos} — verwende es als visuelle Vorlage und baue das gezeigte UI nach.` +
          (desc ? ` Inhalt: ${desc}.` : '') +
          `\n\nIm Bild erkannter Text/Inhalt:\n\n\`\`\`\n${ocr}\n\`\`\``
      } else if (desc) {
        base = `Bild-Platzhalter ${pos} — zeigt: ${desc}.`
      } else {
        base = `Bild-Platzhalter ${pos} (Bild vom Nutzer; Inhalt nicht näher beschrieben).`
      }
      return base + interNote
    }
    case 'card':
      return `Card ${pos} mit Titel "${p.text}"${interInline}.`
    case 'list':
      return `Liste ${pos} mit Beispiel-Einträgen: ${(p.items ?? []).map((i) => `"${i}"`).join(', ')}.`
    case 'lucide': {
      const color = p.bg ?? project.tokens.text
      return `Icon "${p.iconName ?? 'house'}" (Lucide) ${pos}, Farbe ${color}, Strichstärke ${p.borderWidth ?? 2}${interInline}.`
    }
    case 'icon':
      return `Icon ${pos}: "${p.icon}"${interInline}.`
    case 'toggle':
      return `Toggle/Switch ${pos}: "${p.text}" (Standard: ${p.value ? 'an' : 'aus'}).`
    default:
      return `${node.type} ${pos}.`
  }
}

interface Inventory {
  hasLogin: boolean
  hasList: boolean
  hasSearch: boolean
  hasToggle: boolean
  hasBottomNav: boolean
  hasForm: boolean
}

function analyze(project: Project): Inventory {
  const all = project.screens.flatMap((s) => s.nodes)
  const types = new Set(all.map((n) => n.type))
  const loginByName = project.screens.some((s) => /login|anmeld|sign\s?in/i.test(s.name))
  const loginByShape = project.screens.some(
    (s) => s.nodes.some((n) => n.type === 'input') && s.nodes.some((n) => n.type === 'button'),
  )
  return {
    hasLogin: loginByName || loginByShape,
    hasList: types.has('list'),
    hasSearch: types.has('searchBar'),
    hasToggle: types.has('toggle'),
    hasBottomNav: types.has('bottomNav'),
    hasForm: types.has('input'),
  }
}

function functionalitySection(inv: Inventory): string[] {
  const lines: string[] = []
  if (inv.hasLogin)
    lines.push(
      '- **Anmeldung:** Implementiere eine funktionierende Login-Logik mit Eingabe-Validierung (Pflichtfelder, E-Mail-Format, Fehlermeldungen). Nach erfolgreichem Login wird zum Ziel-Screen navigiert; der Login-Zustand bleibt erhalten (z. B. localStorage).',
    )
  if (inv.hasList)
    lines.push(
      '- **Listen:** Listen sollen Einträge anzeigen sowie das Hinzufügen und Löschen von Einträgen erlauben. Speichere die Daten persistent (localStorage), sodass sie nach Reload erhalten bleiben.',
    )
  if (inv.hasSearch)
    lines.push('- **Suche:** Die Suchleiste filtert die zugehörigen Listeninhalte live während der Eingabe.')
  if (inv.hasToggle)
    lines.push('- **Schalter:** Jeder Toggle speichert seinen Zustand persistent und wirkt sich sichtbar auf die App aus.')
  if (inv.hasForm)
    lines.push('- **Formulare:** Alle Eingabefelder sind kontrolliert, mit sinnvoller Validierung und Feedback.')
  if (inv.hasBottomNav)
    lines.push('- **Navigation:** Die Bottom-Navigation wechselt zwischen den Haupt-Screens (clientseitiges Routing).')
  lines.push('- **Zustand & Persistenz:** Halte den App-Zustand konsistent und speichere relevante Daten lokal.')
  return lines
}

function screenSection(screen: Screen, index: number, project: Project): string[] {
  const lines = [`### ${index + 1}. Screen: „${screen.name}"`]
  if (screen.background) lines.push(`Hintergrundfarbe dieses Screens: \`${screen.background}\` (überschreibt den globalen Wert).`)
  if (screen.nodes.length === 0) {
    lines.push('_(leer)_', '')
    return lines
  }
  // Layer index in the original array: 0 = hinten, höher = weiter vorne.
  const layerOf = new Map(screen.nodes.map((n, i) => [n.id, i]))
  const ordered = [...screen.nodes].sort((a, b) => a.y - b.y)
  ordered.forEach((n, i) => lines.push(`${i + 1}. ${describeNode(n, project, layerOf.get(n.id) ?? 0)}`))
  lines.push('')
  return lines
}

/** Builds the full, AI-ready Markdown build specification. */
export function generatePrompt(project: Project): string {
  const t = project.tokens
  const inv = analyze(project)
  const out: string[] = []

  out.push(
    'Baue eine vollständige, produktionsreife mobile Web-App exakt nach folgender Spezifikation. ' +
      'Implementiere neben dem UI auch die komplette Funktionalität (nicht nur das Design).',
  )
  out.push('')
  out.push(`# App: ${project.appName}`)
  out.push('')

  if (project.appDescription.trim()) {
    out.push('## Was die App können soll')
    out.push('')
    out.push('> ' + project.appDescription.trim().replace(/\n/g, '\n> '))
    out.push('')
  }

  out.push('## Design-Tokens (exakt einhalten)')
  out.push('')
  out.push(`- **Primärfarbe:** \`${t.primary}\``)
  out.push(`- **Sekundärfarbe:** \`${t.secondary}\``)
  out.push(`- **Hintergrund:** \`${t.background}\``)
  out.push(`- **Textfarbe:** \`${t.text}\``)
  out.push(`- **Schriftart:** ${t.fontFamily} (mit System-Fallbacks)`)
  out.push(`- **Basis-Schriftgröße:** ${t.baseFontSize}px`)
  out.push(`- **Globaler Eckenradius:** ${t.radius}px`)
  out.push(`- **Abstands-Raster:** ${t.spacing}px (alle Abstände als Vielfache verwenden)`)
  out.push(`- **Geräte-Rahmen:** ${project.device === 'iphone' ? 'iOS / iPhone' : 'Android'}-Stil`)
  out.push('')

  out.push('## Screens & Layout')
  out.push('')
  out.push(`Die App hat ${project.screens.length} Screen(s). Positionsangaben in der Form [vertikal/horizontal].`)
  out.push('')
  project.screens.forEach((s, i) => out.push(...screenSection(s, i, project)))

  // Navigation overview: all screen→screen connections + external actions.
  const edges = getEdges(project)
  const externals = project.screens.flatMap((s) =>
    s.nodes.flatMap((n) => {
      const it = getInteraction(n)
      return it?.kind === 'external' && it.text ? [`- Screen „${s.name}", Element „${nodeLabel(n)}" → externe Aktion: „${it.text}"`] : []
    }),
  )
  if (edges.length || externals.length) {
    out.push('## Navigation')
    out.push('')
    edges.forEach((e) => out.push(`- Screen „${screenName(project, e.fromScreenId)}", Element „${e.fromLabel}" → Screen „${screenName(project, e.toScreenId)}"`))
    externals.forEach((line) => out.push(line))
    out.push('')
  }

  out.push('## Funktionalität (zwingend implementieren)')
  out.push('')
  out.push(...functionalitySection(inv))
  out.push('')

  const hasMockups = project.screens.some((s) => s.nodes.some((n) => n.type === 'image' && n.props.src))
  const hasIcons = project.screens.some((s) => s.nodes.some((n) => n.type === 'lucide'))

  out.push('## Technische Vorgaben')
  out.push('')
  out.push('- Saubere, komponentenbasierte Umsetzung; responsives, mobil-zentriertes Layout.')
  out.push('- Verwende die Design-Tokens als zentrale CSS-Variablen / Theme-Konstanten.')
  out.push('- Gute Lesbarkeit, ausreichende Touch-Targets (≥ 44px), sanfte Übergänge.')
  if (hasIcons)
    out.push('- Verwende für alle Icons die Lucide-Bibliothek (lucide-react o. ä.) mit exakt den angegebenen Icon-Namen.')
  if (hasMockups)
    out.push(
      '- Hochgeladene UI-Mockups sind verbindliche Design-Vorlagen: Setze Layout, Texte und Stil aus dem jeweiligen Bild möglichst exakt um (der per OCR erkannte Text ist oben angegeben).',
    )
  out.push('')

  out.push('## Abschluss')
  out.push('')
  out.push('- Teste, dass der Build fehlerfrei durchläuft.')
  out.push('- Merge das Ergebnis in den main-Branch.')

  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n'
}
