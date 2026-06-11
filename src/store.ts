import { create } from 'zustand'
import type { DesignElement, ElementType, Project, Screen, Theme } from './types'

const uid = () => Math.random().toString(36).slice(2, 9)

/** Sensible default props for each element type. */
export function defaultProps(type: ElementType): DesignElement['props'] {
  switch (type) {
    case 'header':
      return { text: 'Willkommen zurück', subtitle: 'Schön, dass du da bist', align: 'left', fontSize: 26, fontWeight: 700 }
    case 'text':
      return { text: 'Hier steht ein beschreibender Text, der dem Nutzer Kontext gibt.', align: 'left', fontSize: 15, fontWeight: 400 }
    case 'button':
      return { text: 'Loslegen', variant: 'primary', align: 'center', fullWidth: true, radius: 14 }
    case 'image':
      return { height: 160, radius: 16 }
    case 'input':
      return { placeholder: 'E-Mail eingeben', radius: 12 }
    case 'card':
      return { text: 'Karten-Titel', subtitle: 'Untertitel mit Zusatzinfos', radius: 18 }
    case 'listItem':
      return { text: 'Listeneintrag', subtitle: 'Sekundärtext', icon: '●' }
    case 'badge':
      return { text: 'Neu', variant: 'primary' }
    case 'avatar':
      return { text: 'Anna Berg', subtitle: 'Online', height: 48 }
    case 'divider':
      return {}
    case 'spacer':
      return { height: 24 }
    default:
      return {}
  }
}

const labels: Record<ElementType, string> = {
  header: 'Überschrift',
  text: 'Text',
  button: 'Button',
  image: 'Bild',
  input: 'Eingabefeld',
  card: 'Karte',
  listItem: 'Listeneintrag',
  badge: 'Badge',
  avatar: 'Profil',
  divider: 'Trennlinie',
  spacer: 'Abstand',
}

export const elementLabel = (t: ElementType) => labels[t]

const defaultTheme: Theme = {
  primary: '#6366f1',
  accent: '#ec4899',
  background: '#0b0b12',
  surface: '#16161f',
  text: '#f5f5f7',
  muted: '#9a9aa8',
  fontFamily: 'Inter',
  radius: 16,
  mode: 'dark',
  style: 'minimal',
}

function starterScreen(): Screen {
  return {
    id: uid(),
    name: 'Home',
    elements: [
      { id: uid(), type: 'header', props: defaultProps('header') },
      { id: uid(), type: 'text', props: defaultProps('text') },
      { id: uid(), type: 'image', props: defaultProps('image') },
      { id: uid(), type: 'button', props: defaultProps('button') },
    ],
  }
}

const initialProject: Project = {
  appName: 'Meine App',
  tagline: 'Eine moderne mobile Anwendung',
  device: 'iphone',
  showStatusBar: true,
  showTabBar: true,
  tabs: ['Home', 'Suche', 'Profil'],
  theme: defaultTheme,
  screens: [starterScreen()],
}

interface StoreState {
  project: Project
  activeScreenId: string
  selectedId: string | null
  // selectors
  activeScreen: () => Screen
  // mutations
  setProject: (patch: Partial<Project>) => void
  setTheme: (patch: Partial<Theme>) => void
  select: (id: string | null) => void
  setActiveScreen: (id: string) => void
  addScreen: () => void
  renameScreen: (id: string, name: string) => void
  deleteScreen: (id: string) => void
  addElement: (type: ElementType) => void
  updateElement: (id: string, patch: Partial<DesignElement['props']>) => void
  deleteElement: (id: string) => void
  moveElement: (id: string, dir: -1 | 1) => void
  loadProject: (p: Project) => void
}

export const useStore = create<StoreState>((set, get) => ({
  project: initialProject,
  activeScreenId: initialProject.screens[0].id,
  selectedId: null,

  activeScreen: () => {
    const { project, activeScreenId } = get()
    return project.screens.find((s) => s.id === activeScreenId) ?? project.screens[0]
  },

  setProject: (patch) => set((s) => ({ project: { ...s.project, ...patch } })),

  setTheme: (patch) => set((s) => ({ project: { ...s.project, theme: { ...s.project.theme, ...patch } } })),

  select: (id) => set({ selectedId: id }),

  setActiveScreen: (id) => set({ activeScreenId: id, selectedId: null }),

  addScreen: () =>
    set((s) => {
      const screen: Screen = { id: uid(), name: `Screen ${s.project.screens.length + 1}`, elements: [] }
      return { project: { ...s.project, screens: [...s.project.screens, screen] }, activeScreenId: screen.id, selectedId: null }
    }),

  renameScreen: (id, name) =>
    set((s) => ({
      project: { ...s.project, screens: s.project.screens.map((sc) => (sc.id === id ? { ...sc, name } : sc)) },
    })),

  deleteScreen: (id) =>
    set((s) => {
      if (s.project.screens.length <= 1) return s
      const screens = s.project.screens.filter((sc) => sc.id !== id)
      const activeScreenId = s.activeScreenId === id ? screens[0].id : s.activeScreenId
      return { project: { ...s.project, screens }, activeScreenId, selectedId: null }
    }),

  addElement: (type) =>
    set((s) => {
      const el: DesignElement = { id: uid(), type, props: defaultProps(type) }
      const screens = s.project.screens.map((sc) =>
        sc.id === s.activeScreenId ? { ...sc, elements: [...sc.elements, el] } : sc,
      )
      return { project: { ...s.project, screens }, selectedId: el.id }
    }),

  updateElement: (id, patch) =>
    set((s) => {
      const screens = s.project.screens.map((sc) =>
        sc.id === s.activeScreenId
          ? { ...sc, elements: sc.elements.map((e) => (e.id === id ? { ...e, props: { ...e.props, ...patch } } : e)) }
          : sc,
      )
      return { project: { ...s.project, screens } }
    }),

  deleteElement: (id) =>
    set((s) => {
      const screens = s.project.screens.map((sc) =>
        sc.id === s.activeScreenId ? { ...sc, elements: sc.elements.filter((e) => e.id !== id) } : sc,
      )
      return { project: { ...s.project, screens }, selectedId: s.selectedId === id ? null : s.selectedId }
    }),

  moveElement: (id, dir) =>
    set((s) => {
      const screens = s.project.screens.map((sc) => {
        if (sc.id !== s.activeScreenId) return sc
        const idx = sc.elements.findIndex((e) => e.id === id)
        const next = idx + dir
        if (idx < 0 || next < 0 || next >= sc.elements.length) return sc
        const els = [...sc.elements]
        ;[els[idx], els[next]] = [els[next], els[idx]]
        return { ...sc, elements: els }
      })
      return { project: { ...s.project, screens } }
    }),

  loadProject: (p) => set({ project: p, activeScreenId: p.screens[0]?.id ?? '', selectedId: null }),
}))
