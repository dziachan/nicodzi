export type ElementType =
  | 'header'
  | 'text'
  | 'button'
  | 'image'
  | 'input'
  | 'card'
  | 'listItem'
  | 'badge'
  | 'avatar'
  | 'divider'
  | 'spacer'

export type Align = 'left' | 'center' | 'right'

export interface ElementProps {
  text?: string
  subtitle?: string
  placeholder?: string
  align?: Align
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline'
  bg?: string
  color?: string
  fontSize?: number
  fontWeight?: number
  radius?: number
  height?: number
  fullWidth?: boolean
  icon?: string
}

export interface DesignElement {
  id: string
  type: ElementType
  props: ElementProps
}

export interface Theme {
  primary: string
  accent: string
  background: string
  surface: string
  text: string
  muted: string
  fontFamily: string
  radius: number
  mode: 'light' | 'dark'
  style: 'minimal' | 'glass' | 'neumorph' | 'bold' | 'playful'
}

export interface Screen {
  id: string
  name: string
  elements: DesignElement[]
}

export interface Project {
  appName: string
  tagline: string
  device: 'iphone' | 'android'
  showStatusBar: boolean
  showTabBar: boolean
  tabs: string[]
  theme: Theme
  screens: Screen[]
}
