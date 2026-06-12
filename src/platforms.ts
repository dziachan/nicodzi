export type PlatformId = 'web' | 'ios' | 'godot' | 'unity'

export interface PlatformDef {
  id: PlatformId
  label: string
  subtitle: string
  bullets: string[] // shown on the selection card
  appNoun: string
  intro: string
  tech: string[]
  translateIcon: (lucideId: string) => string
  checklist: string[]
}

// Lucide id → SF Symbols name (common subset; falls back to the raw id).
const SF: Record<string, string> = {
  house: 'house', settings: 'gearshape', 'arrow-left': 'arrow.left', 'arrow-right': 'arrow.right',
  plus: 'plus', x: 'xmark', heart: 'heart', star: 'star', user: 'person', search: 'magnifyingglass',
  menu: 'line.3.horizontal', bell: 'bell', 'shopping-cart': 'cart', 'share-2': 'square.and.arrow.up',
  play: 'play.fill', pause: 'pause.fill', check: 'checkmark', 'chevron-left': 'chevron.left',
  'chevron-right': 'chevron.right', 'chevron-up': 'chevron.up', 'chevron-down': 'chevron.down',
  'trash-2': 'trash', pencil: 'pencil', camera: 'camera', image: 'photo', video: 'video',
  music: 'music.note', mail: 'envelope', phone: 'phone', 'message-circle': 'message', send: 'paperplane',
  calendar: 'calendar', clock: 'clock', 'map-pin': 'mappin', globe: 'globe', lock: 'lock', eye: 'eye',
  'eye-off': 'eye.slash', download: 'arrow.down.circle', upload: 'arrow.up.circle', 'refresh-cw': 'arrow.clockwise',
  'log-out': 'rectangle.portrait.and.arrow.right', 'log-in': 'arrow.right.to.line', filter: 'line.3.horizontal.decrease',
  list: 'list.bullet', 'layout-grid': 'square.grid.2x2', layers: 'square.stack', bookmark: 'bookmark', tag: 'tag',
  gift: 'gift', 'credit-card': 'creditcard', wallet: 'wallet.pass', 'thumbs-up': 'hand.thumbsup', sun: 'sun.max',
  moon: 'moon', cloud: 'cloud', zap: 'bolt', wifi: 'wifi', 'volume-2': 'speaker.wave.2', mic: 'mic', file: 'doc',
  folder: 'folder', copy: 'doc.on.doc', link: 'link', 'external-link': 'arrow.up.right.square', info: 'info.circle',
  'triangle-alert': 'exclamationmark.triangle', 'circle-check': 'checkmark.circle', 'circle-x': 'xmark.circle',
  trophy: 'trophy', 'gamepad-2': 'gamecontroller', sparkles: 'sparkles', 'shopping-bag': 'bag', rocket: 'paperplane',
  flame: 'flame', coffee: 'cup.and.saucer', compass: 'safari', map: 'map', 'more-horizontal': 'ellipsis',
  'settings-2': 'slider.horizontal.3', 'sliders-horizontal': 'slider.horizontal.3', power: 'power',
}

export const PLATFORMS: Record<PlatformId, PlatformDef> = {
  web: {
    id: 'web',
    label: 'Web-App',
    subtitle: 'React + Vite, responsive',
    bullets: ['CSS Flexbox/Grid', 'Safe Area via env(safe-area-inset)', 'Icons: Lucide', 'Webfonts + Fallbacks'],
    appNoun: 'mobile Web-App',
    intro: 'ZIELPLATTFORM: Web-App (React + Vite). Setze das folgende UI als responsive Web-App um und beachte die Anker-/Layout-Vorgaben strikt.',
    tech: [
      'Framework: React + Vite, responsive.',
      'Layout: CSS Flexbox/Grid. Übersetze die Anker in CSS-Positionierung (oben/zentriert/unten via Flex-Alignment, Abstände via padding/margin, prozentuale Breiten via %).',
      'Safe Area: env(safe-area-inset-*) berücksichtigen, damit nichts hinter Notch/Home-Indicator liegt.',
      'Icons: Lucide (lucide-react) mit den angegebenen Namen.',
      'Schriften: Webfonts mit System-Fallbacks.',
    ],
    translateIcon: (id) => `"${id}" (Lucide)`,
    checklist: [
      'Teste, dass der Build (npm run build) fehlerfrei durchläuft.',
      'Prüfe das Layout auf mehreren Bildschirmgrößen.',
      'Merge das Ergebnis in den main-Branch.',
    ],
  },
  ios: {
    id: 'ios',
    label: 'iOS – Xcode / Swift',
    subtitle: 'SwiftUI',
    bullets: ['VStack/HStack/ZStack', 'Safe Area: .safeAreaInset', 'Icons: SF Symbols', 'ggf. SpriteKit für Gameplay'],
    appNoun: 'native iOS-App',
    intro: 'ZIELPLATTFORM: iOS (Xcode / SwiftUI). Setze das folgende UI mit SwiftUI um und beachte die Anker-/Layout-Vorgaben strikt.',
    tech: [
      'Framework: SwiftUI.',
      'Layout: VStack/HStack/ZStack + Spacer + alignment. Übersetze Anker in SwiftUI-Alignment (oben/zentriert/unten, leading/center/trailing), Abstände in .padding(...), flexible/prozentuale Größen via GeometryReader bzw. .frame(maxWidth: .infinity).',
      'Safe Area: .safeAreaInset bzw. ignoresSafeArea bewusst einsetzen, damit nichts hinter Notch/Home-Indicator liegt.',
      'Icons: SF Symbols (Image(systemName:)) mit den angegebenen Symbol-Namen.',
      'Hinweis: Für reine UI SwiftUI verwenden. Falls Spiel-Logik gewünscht ist, ggf. SpriteKit/SceneKit für das Gameplay ergänzen.',
    ],
    translateIcon: (id) => `SF Symbol "${SF[id] ?? id}"`,
    checklist: [
      'Stelle sicher, dass das Projekt in Xcode fehlerfrei build­et.',
      'Prüfe das Safe-Area-Verhalten auf Geräten mit Notch und Home-Indicator.',
      'Merge das Ergebnis in den main-Branch.',
    ],
  },
  godot: {
    id: 'godot',
    label: 'Godot',
    subtitle: 'Godot 4 · GDScript',
    bullets: ['Control-Nodes / Container', 'Eine Scene (.tscn) pro Screen', 'Icons als Texturen', 'Button + pressed-Signal'],
    appNoun: 'Anwendung/Spiel in Godot 4',
    intro: 'ZIELPLATTFORM: Godot 4 (GDScript). Setze das folgende UI mit Control-Nodes um und beachte die Anker-/Container-Vorgaben strikt.',
    tech: [
      'Engine: Godot 4, Sprache GDScript.',
      'Layout: Control-Nodes — Control, VBoxContainer, HBoxContainer, MarginContainer; TextureRect für Bilder, Label für Text, Button für klickbare Elemente.',
      'Anker: Godots Anchor-/Container-System nutzen (Anchor-Presets oben/zentriert/unten), Abstände über Margins/Theme; flexible Größen über Size-Flags/Anchors statt fester Pixel.',
      'Szenen: Baue jeden Screen als eigene Scene (.tscn). Screen-Wechsel über change_scene_to() bzw. Sichtbarkeit umschalten.',
      'Icons: Icon-Grafiken als Texturen einbinden (TextureRect).',
      'Klickbare Elemente: Button-Nodes mit pressed-Signal verbinden.',
    ],
    translateIcon: (id) => `Icon-Textur (Motiv „${id}")`,
    checklist: [
      'Stelle sicher, dass alle Szenen in Godot ohne Fehler laufen.',
      'Prüfe Anker/Container auf verschiedenen Auflösungen.',
      'Merge das Ergebnis in den main-Branch.',
    ],
  },
  unity: {
    id: 'unity',
    label: 'Unity',
    subtitle: 'Unity · C#',
    bullets: ['Canvas + uGUI', 'RectTransform-Anchors', 'TextMeshPro für Text', 'Button + OnClick-Event'],
    appNoun: 'Anwendung/Spiel in Unity',
    intro: 'ZIELPLATTFORM: Unity (C#). Setze das folgende UI mit Canvas + uGUI um und beachte die Anker-/RectTransform-Vorgaben strikt.',
    tech: [
      'Engine: Unity, Sprache C#.',
      'Layout: Canvas + uGUI — RectTransform mit Anchors/Pivots, Image für Flächen/Bilder, TextMeshPro für Text, Button-Komponente für klickbare Elemente.',
      'Anker: RectTransform-Anchors/Pivots entsprechend setzen (oben/zentriert/unten, links/zentriert/rechts), Abstände über Anchored Position; flexible Größen über Anchor-Stretch statt fester Pixel.',
      'Screen-Wechsel: über Aktivieren/Deaktivieren von Panels oder Szenenwechsel.',
      'Icons: als Image/Sprite einbinden (z. B. Material Icons o. ä.).',
      'Klickbare Elemente: Button-Komponente mit OnClick-Event.',
    ],
    translateIcon: (id) => `Icon-Sprite (Motiv „${id}")`,
    checklist: [
      'Stelle sicher, dass die Szene in Unity ohne Konsolenfehler läuft.',
      'Prüfe die RectTransform-Anchors auf verschiedenen Auflösungen (Canvas Scaler).',
      'Merge das Ergebnis in den main-Branch.',
    ],
  },
}

export const PLATFORM_IDS = Object.keys(PLATFORMS) as PlatformId[]

const LS_KEY = 'phorge.platform'
export function loadPlatform(): PlatformId {
  try {
    const v = localStorage.getItem(LS_KEY)
    if (v && v in PLATFORMS) return v as PlatformId
  } catch {
    /* ignore */
  }
  return 'web'
}
export function savePlatform(id: PlatformId) {
  try {
    localStorage.setItem(LS_KEY, id)
  } catch {
    /* ignore */
  }
}
