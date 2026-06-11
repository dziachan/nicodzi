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

/** A free-form image dropped onto the canvas (moveable, resizable, rotatable). */
export interface ImageLayer {
  id: string
  src: string // data URL
  name: string
  x: number
  y: number
  width: number
  height: number
  rotation: number // degrees
}

export interface Screen {
  id: string
  name: string
  elements: DesignElement[]
  images: ImageLayer[]
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
