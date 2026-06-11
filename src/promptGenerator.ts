import type { DesignElement, Project, Theme } from './types'

const styleGuidance: Record<Theme['style'], string> = {
  minimal: 'Cleanes, minimalistisches Design mit viel Weißraum, dezenten Schatten und klaren Kanten.',
  glass: 'Glassmorphism: durchscheinende Flächen mit Blur (backdrop-filter), feinen Rändern und leuchtenden Akzenten.',
  neumorph: 'Neumorphismus: weiche, plastische Flächen mit doppelten Schatten (hell/dunkel) auf einfarbigem Hintergrund.',
  bold: 'Bold & kontrastreich: kräftige Farben, große Typografie, klare Hierarchie und auffällige CTAs.',
  playful: 'Verspielt & freundlich: abgerundete Formen, lebendige Farben, sanfte Animationen und Emojis/Illustrationen.',
}

function describeElement(el: DesignElement): string {
  const p = el.props
  const align = p.align ? ` (${p.align}-ausgerichtet)` : ''
  switch (el.type) {
    case 'header':
      return `Überschrift "${p.text}"${p.subtitle ? ` mit Untertitel "${p.subtitle}"` : ''}${align}, Schriftgröße ~${p.fontSize}px, Gewicht ${p.fontWeight}.`
    case 'text':
      return `Fließtext: "${p.text}"${align}.`
    case 'button':
      return `${p.variant ?? 'primary'}-Button mit Label "${p.text}"${p.fullWidth ? ', volle Breite' : ''}, abgerundete Ecken (${p.radius ?? 'theme'}px).`
    case 'image':
      return `Bild-/Medienfläche, Höhe ~${p.height}px, Eckenradius ${p.radius}px (Platzhalter für ein Foto oder eine Illustration).`
    case 'input':
      return `Texteingabefeld mit Platzhalter "${p.placeholder}", abgerundet (${p.radius}px).`
    case 'card':
      return `Karte mit Titel "${p.text}" und Untertitel "${p.subtitle}", erhöht über Schatten, Eckenradius ${p.radius}px.`
    case 'listItem':
      return `Listeneintrag "${p.text}"${p.subtitle ? ` / "${p.subtitle}"` : ''} mit führendem Icon "${p.icon}".`
    case 'badge':
      return `Badge/Chip mit Text "${p.text}" (${p.variant ?? 'primary'}).`
    case 'avatar':
      return `Profilzeile: Avatar (${p.height}px) neben Name "${p.text}" und Status "${p.subtitle}".`
    case 'divider':
      return `Horizontale Trennlinie.`
    case 'spacer':
      return `Vertikaler Abstand (~${p.height}px).`
    default:
      return el.type
  }
}

/** Builds a rich, AI-ready prompt that describes the whole design. */
export function generatePrompt(project: Project): string {
  const { theme } = project
  const lines: string[] = []

  lines.push(`# Baue die mobile App "${project.appName}"`)
  lines.push('')
  lines.push(project.tagline ? `> ${project.tagline}` : '')
  lines.push('')
  lines.push(
    `Erstelle eine moderne, gut aussehende mobile App (${project.device === 'iphone' ? 'iOS / iPhone' : 'Android'}-Stil). ` +
      `Halte dich exakt an das folgende Design-System und die Screen-Layouts. Setze es sauber, responsiv und pixel-genau um.`,
  )
  lines.push('')

  lines.push('## Design-System')
  lines.push('')
  lines.push(`- **Stil:** ${styleGuidance[theme.style]}`)
  lines.push(`- **Modus:** ${theme.mode === 'dark' ? 'Dark Mode' : 'Light Mode'}`)
  lines.push(`- **Schrift:** ${theme.fontFamily} (System-Fallbacks erlaubt)`)
  lines.push(`- **Eckenradius (global):** ${theme.radius}px`)
  lines.push('- **Farbpalette:**')
  lines.push(`  - Primär: \`${theme.primary}\``)
  lines.push(`  - Akzent: \`${theme.accent}\``)
  lines.push(`  - Hintergrund: \`${theme.background}\``)
  lines.push(`  - Flächen/Karten: \`${theme.surface}\``)
  lines.push(`  - Text: \`${theme.text}\``)
  lines.push(`  - Gedämpfter Text: \`${theme.muted}\``)
  lines.push('')

  lines.push('## Globale Struktur')
  lines.push('')
  lines.push(`- Statusleiste: ${project.showStatusBar ? 'sichtbar' : 'ausgeblendet'}`)
  if (project.showTabBar) {
    lines.push(`- Untere Tab-Bar mit den Tabs: ${project.tabs.map((t) => `**${t}**`).join(', ')}`)
  } else {
    lines.push('- Keine Tab-Bar')
  }
  lines.push(`- Anzahl Screens: ${project.screens.length}`)
  lines.push('')

  lines.push('## Screens')
  lines.push('')
  project.screens.forEach((screen, i) => {
    lines.push(`### ${i + 1}. Screen: "${screen.name}"`)
    if (screen.elements.length === 0) {
      lines.push('_(leer)_')
      lines.push('')
      return
    }
    lines.push('Elemente von oben nach unten:')
    lines.push('')
    screen.elements.forEach((el, idx) => {
      lines.push(`${idx + 1}. ${describeElement(el)}`)
    })
    lines.push('')
  })

  lines.push('## Umsetzungs-Hinweise')
  lines.push('')
  lines.push('- Nutze konsistente Abstände (8pt-Raster) und die oben definierten Farb-Tokens als Variablen.')
  lines.push('- Achte auf gute Lesbarkeit, ausreichende Touch-Targets (min. 44px) und sanfte Übergänge.')
  lines.push('- Verwende echte Komponenten statt fester Pixelwerte, wo sinnvoll, und halte das Layout responsiv.')
  lines.push('- Liefere am Ende ein modernes, aufgeräumtes Ergebnis, das exakt dem beschriebenen Look entspricht.')

  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n'
}
