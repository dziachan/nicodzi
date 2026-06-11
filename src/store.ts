import { create } from 'zustand'
import type { ComponentNode, ComponentType, DesignTokens, Project, Screen } from './types'
import { PRESETS, type PresetName } from './presets'
import { SCREEN_H, SCREEN_W } from './constants'

const uid = () => Math.random().toString(36).slice(2, 9)
const LS_KEY = 'phorge.project.v2'
const HISTORY_LIMIT = 40
const COALESCE_MS = 500

const labels: Record<ComponentType, string> = {
  button: 'Button',
  input: 'Textfeld',
  label: 'Überschrift',
  image: 'Bild',
  card: 'Card',
  list: 'Liste',
  bottomNav: 'Bottom-Nav',
  topBar: 'Top-Bar',
  icon: 'Icon',
  toggle: 'Toggle',
  searchBar: 'Suchleiste',
}
export const componentLabel = (t: ComponentType) => labels[t]

/** Default geometry + props for a freshly placed component. */
export function defaultNode(type: ComponentType): ComponentNode {
  const base = { id: uid(), type }
  switch (type) {
    case 'topBar':
      return { ...base, x: 0, y: 0, w: SCREEN_W, h: 56, props: { text: 'Titel', align: 'center' } }
    case 'bottomNav':
      return { ...base, x: 0, y: SCREEN_H - 60, w: SCREEN_W, h: 60, props: { items: ['Home', 'Suche', 'Profil'] } }
    case 'button':
      return { ...base, x: 60, y: 240, w: 200, h: 48, props: { text: 'Button', align: 'center', navigateTo: null } }
    case 'input':
      return { ...base, x: 40, y: 200, w: 240, h: 46, props: { placeholder: 'Eingabe…' } }
    case 'searchBar':
      return { ...base, x: 40, y: 90, w: 240, h: 42, props: { placeholder: 'Suchen…' } }
    case 'label':
      return { ...base, x: 40, y: 110, w: 240, h: 34, props: { text: 'Überschrift', fontSize: 22, align: 'left' } }
    case 'image':
      return { ...base, x: 60, y: 150, w: 200, h: 140, props: {} }
    case 'card':
      return { ...base, x: 40, y: 170, w: 240, h: 120, props: { text: 'Card-Titel' } }
    case 'list':
      return { ...base, x: 20, y: 150, w: 280, h: 220, props: { items: ['Eintrag 1', 'Eintrag 2', 'Eintrag 3'] } }
    case 'icon':
      return { ...base, x: 140, y: 150, w: 40, h: 40, props: { icon: '★' } }
    case 'toggle':
      return { ...base, x: 40, y: 160, w: 240, h: 40, props: { text: 'Option aktivieren', value: true } }
    default:
      return { ...base, x: 60, y: 200, w: 200, h: 48, props: {} }
  }
}

function starterProject(): Project {
  const login: Screen = {
    id: uid(),
    name: 'Login',
    nodes: [],
  }
  const home: Screen = { id: uid(), name: 'Home', nodes: [] }
  // Build a small login screen so the editor isn't empty on first run.
  const title = defaultNode('label')
  title.props.text = 'Willkommen'
  title.y = 90
  const email = defaultNode('input')
  email.props.placeholder = 'E-Mail'
  email.y = 200
  const pass = defaultNode('input')
  pass.props.placeholder = 'Passwort'
  pass.y = 256
  const submit = defaultNode('button')
  submit.props.text = 'Anmelden'
  submit.y = 330
  submit.props.navigateTo = home.id
  login.nodes = [title, email, pass, submit]

  const top = defaultNode('topBar')
  top.props.text = 'Home'
  const list = defaultNode('list')
  const nav = defaultNode('bottomNav')
  home.nodes = [top, list, nav]

  return {
    appName: 'Meine App',
    appDescription: '',
    device: 'iphone',
    tokens: { ...PRESETS['Dark Mode'] },
    screens: [login, home],
  }
}

function validProject(p: unknown): p is Project {
  return !!p && typeof p === 'object' && Array.isArray((p as Project).screens) && (p as Project).screens.length > 0
}

function loadInitial(): Project {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (validProject(parsed)) return parsed
    }
  } catch {
    /* ignore corrupt storage */
  }
  return starterProject()
}

interface StoreState {
  project: Project
  activeScreenId: string
  selectedNodeId: string | null
  zoom: number
  past: Project[]
  future: Project[]
  _lastEdit: number

  activeScreen: () => Screen
  // generic project mutation with history handling
  setProject: (patch: Partial<Project>) => void
  setTokens: (patch: Partial<DesignTokens>) => void
  applyPreset: (name: PresetName) => void

  selectNode: (id: string | null) => void
  setActiveScreen: (id: string) => void
  setZoom: (z: number) => void

  addScreen: () => void
  duplicateScreen: (id: string) => void
  deleteScreen: (id: string) => void
  renameScreen: (id: string, name: string) => void

  addNode: (type: ComponentType, at?: { x: number; y: number }) => void
  addImageNode: (src: string, w: number, h: number, at: { x: number; y: number }) => void
  updateNode: (id: string, patch: Partial<ComponentNode>, history?: HistoryMode) => void
  updateNodeProps: (id: string, patch: Partial<ComponentNode['props']>, history?: HistoryMode) => void
  deleteNode: (id: string) => void

  checkpoint: () => void
  undo: () => void
  redo: () => void
  loadProject: (p: Project) => void
}

type HistoryMode = 'push' | 'coalesce' | 'none'

const cloneScreens = (screens: Screen[]) => screens.map((s) => ({ ...s, nodes: s.nodes.map((n) => ({ ...n })) }))

export const useStore = create<StoreState>((set, get) => {
  /** Apply a project update, recording history per the requested mode. */
  const apply = (updater: (p: Project) => Project, history: HistoryMode = 'push') =>
    set((s) => {
      const next = updater(s.project)
      const now = Date.now()
      let past = s.past
      let future = s.future
      const shouldPush = history === 'push' || (history === 'coalesce' && now - s._lastEdit > COALESCE_MS)
      if (shouldPush) {
        past = [...s.past, s.project].slice(-HISTORY_LIMIT)
        future = []
      }
      return { project: next, past, future, _lastEdit: now }
    })

  const mapScreen = (p: Project, id: string, fn: (s: Screen) => Screen): Project => ({
    ...p,
    screens: p.screens.map((s) => (s.id === id ? fn(s) : s)),
  })

  return {
    project: loadInitial(),
    activeScreenId: '',
    selectedNodeId: null,
    zoom: 1,
    past: [],
    future: [],
    _lastEdit: 0,

    activeScreen: () => {
      const { project, activeScreenId } = get()
      return project.screens.find((s) => s.id === activeScreenId) ?? project.screens[0]
    },

    setProject: (patch) => apply((p) => ({ ...p, ...patch }), 'coalesce'),
    setTokens: (patch) => apply((p) => ({ ...p, tokens: { ...p.tokens, ...patch } }), 'coalesce'),
    applyPreset: (name) => apply((p) => ({ ...p, tokens: { ...PRESETS[name] } }), 'push'),

    selectNode: (id) => set({ selectedNodeId: id }),
    setActiveScreen: (id) => set({ activeScreenId: id, selectedNodeId: null }),
    setZoom: (z) => set({ zoom: z }),

    addScreen: () =>
      set((s) => {
        const screen: Screen = { id: uid(), name: `Screen ${s.project.screens.length + 1}`, nodes: [] }
        return {
          project: { ...s.project, screens: [...s.project.screens, screen] },
          activeScreenId: screen.id,
          selectedNodeId: null,
          past: [...s.past, s.project].slice(-HISTORY_LIMIT),
          future: [],
          _lastEdit: Date.now(),
        }
      }),

    duplicateScreen: (id) =>
      set((s) => {
        const src = s.project.screens.find((sc) => sc.id === id)
        if (!src) return s
        const copy: Screen = {
          id: uid(),
          name: `${src.name} Kopie`,
          nodes: src.nodes.map((n) => ({ ...n, id: uid(), props: { ...n.props } })),
        }
        const idx = s.project.screens.findIndex((sc) => sc.id === id)
        const screens = [...s.project.screens]
        screens.splice(idx + 1, 0, copy)
        return {
          project: { ...s.project, screens },
          activeScreenId: copy.id,
          selectedNodeId: null,
          past: [...s.past, s.project].slice(-HISTORY_LIMIT),
          future: [],
          _lastEdit: Date.now(),
        }
      }),

    deleteScreen: (id) =>
      set((s) => {
        if (s.project.screens.length <= 1) return s
        const screens = s.project.screens.filter((sc) => sc.id !== id)
        // Clear navigation targets that pointed at the removed screen.
        const cleaned = screens.map((sc) => ({
          ...sc,
          nodes: sc.nodes.map((n) => (n.props.navigateTo === id ? { ...n, props: { ...n.props, navigateTo: null } } : n)),
        }))
        const activeScreenId = s.activeScreenId === id ? cleaned[0].id : s.activeScreenId
        return {
          project: { ...s.project, screens: cleaned },
          activeScreenId,
          selectedNodeId: null,
          past: [...s.past, s.project].slice(-HISTORY_LIMIT),
          future: [],
          _lastEdit: Date.now(),
        }
      }),

    renameScreen: (id, name) => apply((p) => mapScreen(p, id, (s) => ({ ...s, name })), 'coalesce'),

    addNode: (type, at) =>
      set((s) => {
        const node = defaultNode(type)
        if (at) {
          node.x = Math.max(0, Math.min(SCREEN_W - node.w, at.x - node.w / 2))
          node.y = Math.max(0, Math.min(SCREEN_H - node.h, at.y - node.h / 2))
        }
        const project = mapScreen(s.project, s.activeScreenId, (sc) => ({ ...sc, nodes: [...sc.nodes, node] }))
        return {
          project,
          selectedNodeId: node.id,
          past: [...s.past, s.project].slice(-HISTORY_LIMIT),
          future: [],
          _lastEdit: Date.now(),
        }
      }),

    addImageNode: (src, w, h, at) =>
      set((s) => {
        const node = defaultNode('image')
        node.w = w
        node.h = h
        node.x = Math.max(0, Math.min(SCREEN_W - w, at.x - w / 2))
        node.y = Math.max(0, Math.min(SCREEN_H - h, at.y - h / 2))
        node.props = { src }
        const project = mapScreen(s.project, s.activeScreenId, (sc) => ({ ...sc, nodes: [...sc.nodes, node] }))
        return {
          project,
          selectedNodeId: node.id,
          past: [...s.past, s.project].slice(-HISTORY_LIMIT),
          future: [],
          _lastEdit: Date.now(),
        }
      }),

    updateNode: (id, patch, history = 'coalesce') =>
      apply(
        (p) =>
          mapScreen(p, get().activeScreenId, (sc) => ({
            ...sc,
            nodes: sc.nodes.map((n) => (n.id === id ? { ...n, ...patch } : n)),
          })),
        history,
      ),

    updateNodeProps: (id, patch, history = 'coalesce') =>
      apply(
        (p) =>
          mapScreen(p, get().activeScreenId, (sc) => ({
            ...sc,
            nodes: sc.nodes.map((n) => (n.id === id ? { ...n, props: { ...n.props, ...patch } } : n)),
          })),
        history,
      ),

    deleteNode: (id) =>
      set((s) => {
        const project = mapScreen(s.project, s.activeScreenId, (sc) => ({
          ...sc,
          nodes: sc.nodes.filter((n) => n.id !== id),
        }))
        return {
          project,
          selectedNodeId: s.selectedNodeId === id ? null : s.selectedNodeId,
          past: [...s.past, s.project].slice(-HISTORY_LIMIT),
          future: [],
          _lastEdit: Date.now(),
        }
      }),

    checkpoint: () =>
      set((s) => ({ past: [...s.past, { ...s.project, screens: cloneScreens(s.project.screens) }].slice(-HISTORY_LIMIT), future: [], _lastEdit: Date.now() })),

    undo: () =>
      set((s) => {
        if (s.past.length === 0) return s
        const prev = s.past[s.past.length - 1]
        return {
          project: prev,
          past: s.past.slice(0, -1),
          future: [s.project, ...s.future].slice(0, HISTORY_LIMIT),
          selectedNodeId: null,
          activeScreenId: prev.screens.some((sc) => sc.id === s.activeScreenId) ? s.activeScreenId : prev.screens[0].id,
        }
      }),

    redo: () =>
      set((s) => {
        if (s.future.length === 0) return s
        const next = s.future[0]
        return {
          project: next,
          future: s.future.slice(1),
          past: [...s.past, s.project].slice(-HISTORY_LIMIT),
          selectedNodeId: null,
          activeScreenId: next.screens.some((sc) => sc.id === s.activeScreenId) ? s.activeScreenId : next.screens[0].id,
        }
      }),

    loadProject: (p) =>
      set({ project: p, activeScreenId: p.screens[0]?.id ?? '', selectedNodeId: null, past: [], future: [] }),
  }
})

// Ensure an active screen is selected once on startup.
{
  const s = useStore.getState()
  if (!s.activeScreenId && s.project.screens[0]) useStore.setState({ activeScreenId: s.project.screens[0].id })
}

// Persist the project to localStorage (debounced) whenever it changes.
let saveTimer: ReturnType<typeof setTimeout> | undefined
useStore.subscribe((state, prev) => {
  if (state.project === prev.project) return
  clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(state.project))
    } catch {
      /* storage full / unavailable */
    }
  }, 300)
})
