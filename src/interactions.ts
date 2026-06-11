import type { ComponentNode, Project } from './types'

export interface Interaction {
  kind: 'screen' | 'external'
  screenId?: string | null
  text?: string
}

/** Normalized interaction descriptor for a node, or null if not clickable. */
export function getInteraction(node: ComponentNode): Interaction | null {
  const p = node.props
  if (!p.clickable) return null
  if ((p.linkKind ?? 'screen') === 'external') return { kind: 'external', text: p.externalAction ?? '' }
  return { kind: 'screen', screenId: p.navigateTo ?? null }
}

/** Human-readable label for a node (for prompts and warnings). */
export function nodeLabel(node: ComponentNode): string {
  return String(node.props.text || node.props.placeholder || (node.type === 'image' ? 'Bild' : node.type))
}

const NAV_WORDS = [
  'start', 'settings', 'einstellungen', 'zurück', 'zuruck', 'back', 'weiter', 'next', 'continue',
  'login', 'log in', 'anmelden', 'registrieren', 'sign in', 'sign up', 'menü', 'menu', 'profil',
  'profile', 'home', 'startseite', 'play', 'spielen', 'fortfahren', 'abmelden', 'logout', 'mehr',
]

/** Heuristic: does this text read like a navigation control? */
export function looksLikeNav(text?: string): boolean {
  if (!text) return false
  const t = text.trim().toLowerCase()
  if (t.length === 0 || t.length > 24) return false
  return NAV_WORDS.some((w) => t === w || t.includes(w))
}

export interface Edge {
  fromScreenId: string
  fromLabel: string
  toScreenId: string
}

/** All screen→screen navigation edges in the project. */
export function getEdges(project: Project): Edge[] {
  const edges: Edge[] = []
  for (const s of project.screens) {
    for (const n of s.nodes) {
      const it = getInteraction(n)
      if (it?.kind === 'screen' && it.screenId) {
        edges.push({ fromScreenId: s.id, fromLabel: nodeLabel(n), toScreenId: it.screenId })
      }
    }
  }
  return edges
}

export type Warning =
  | { type: 'noTarget'; screenName: string; nodeId: string; label: string }
  | { type: 'unreachable'; screenName: string }
  | { type: 'looksClickable'; screenName: string; nodeId: string; label: string }

/** Pre-export checks: missing targets, unreachable screens, unmarked nav-like texts. */
export function computeWarnings(project: Project): Warning[] {
  const warnings: Warning[] = []

  for (const s of project.screens) {
    for (const n of s.nodes) {
      const it = getInteraction(n)
      if (!it) continue
      const missing = it.kind === 'screen' ? !it.screenId : !(it.text && it.text.trim())
      if (missing) warnings.push({ type: 'noTarget', screenName: s.name, nodeId: n.id, label: nodeLabel(n) })
    }
  }

  // Screens with no incoming edge — the first screen is treated as entry point.
  const reached = new Set(getEdges(project).map((e) => e.toScreenId))
  project.screens.forEach((s, i) => {
    if (i === 0) return
    if (!reached.has(s.id)) warnings.push({ type: 'unreachable', screenName: s.name })
  })

  for (const s of project.screens) {
    for (const n of s.nodes) {
      if ((n.type === 'label' || n.type === 'button') && !n.props.clickable && looksLikeNav(n.props.text)) {
        warnings.push({ type: 'looksClickable', screenName: s.name, nodeId: n.id, label: nodeLabel(n) })
      }
    }
  }

  return warnings
}
