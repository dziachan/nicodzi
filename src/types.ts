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
}

export interface Project {
  appName: string
  appDescription: string
  device: DeviceFrame
  tokens: DesignTokens
  screens: Screen[]
}
