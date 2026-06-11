export type ComponentType =
  | 'button'
  | 'input'
  | 'label'
  | 'image'
  | 'card'
  | 'list'
  | 'bottomNav'
  | 'topBar'
  | 'icon'
  | 'toggle'
  | 'searchBar'
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
  radius?: number
  align?: Align
  icon?: string
  src?: string // data URL for uploaded images
  ocrText?: string // text recognized in an uploaded image (OCR)
  ocrStatus?: 'pending' | 'done' | 'error'
  items?: string[] // list / bottomNav entries
  value?: boolean // toggle state
  navigateTo?: string | null // target screen id on tap
  // Shape styling (rectangle / ellipse / line)
  borderColor?: string
  borderWidth?: number
  opacity?: number // 0..1
  rotation?: number // degrees
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
