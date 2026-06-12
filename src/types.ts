export type ComponentType =
  | 'button'
  | 'input'
  | 'label'
  | 'text'
  | 'image'
  | 'card'
  | 'list'
  | 'bottomNav'
  | 'topBar'
  | 'icon'
  | 'toggle'
  | 'searchBar'
  | 'lucide'
  | 'rectangle'
  | 'ellipse'
  | 'line'

export const SHAPE_TYPES: ComponentType[] = ['rectangle', 'ellipse', 'line']
export const isShape = (t: ComponentType) => SHAPE_TYPES.includes(t)

export type Align = 'left' | 'center' | 'right'

export interface NodeProps {
  text?: string
  placeholder?: string
  bg?: string
  textColor?: string
  fontSize?: number
  textStyle?: 'normal' | 'bold' | 'italic' // body text style (component 'text')
  lineHeight?: number
  radius?: number
  align?: Align
  icon?: string
  iconName?: string // Lucide icon id (kebab-case) for 'lucide' components
  src?: string // data URL for uploaded images
  ocrText?: string // text the user accepted from OCR (only this goes into the prompt)
  description?: string // free-text "what does this image show?"
  items?: string[] // list / bottomNav entries
  value?: boolean // toggle state
  // Interactivity
  clickable?: boolean // explicitly marked as tappable
  linkKind?: 'screen' | 'external' // target type when clickable
  navigateTo?: string | null // target screen id (linkKind 'screen')
  externalAction?: string // free-text description (linkKind 'external')
  // Shape styling (rectangle / ellipse / line)
  borderColor?: string
  borderWidth?: number
  opacity?: number // 0..1
  rotation?: number // degrees
  // Anchor-based layout
  anchorV?: 'top' | 'center' | 'bottom'
  anchorH?: 'left' | 'center' | 'right'
  widthMode?: 'fixed' | 'percent' | 'inset'
  widthPercent?: number
  inset?: number
  heightMode?: 'fixed' | 'percent' | 'auto'
  heightPercent?: number
  keepAspect?: boolean
}

export interface ComponentNode {
  id: string
  type: ComponentType
  x: number
  y: number
  w: number
  h: number
  props: NodeProps
}

export type DeviceFrame = 'iphone' | 'android'

export interface DesignTokens {
  primary: string
  secondary: string
  background: string
  text: string
  fontFamily: string
  baseFontSize: number
  radius: number
  spacing: 4 | 8
}

export interface Screen {
  id: string
  name: string
  nodes: ComponentNode[]
  background?: string // overrides the global background token for this screen
}

export interface Project {
  appName: string
  appDescription: string
  device: DeviceFrame
  tokens: DesignTokens
  screens: Screen[]
}
