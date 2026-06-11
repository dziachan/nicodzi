import type { DesignTokens } from './types'

export type PresetName = 'Minimal Light' | 'Dark Mode' | 'Playful' | 'Corporate'

export const PRESETS: Record<PresetName, DesignTokens> = {
  'Minimal Light': {
    primary: '#111827',
    secondary: '#6b7280',
    background: '#ffffff',
    text: '#111827',
    fontFamily: 'Inter',
    baseFontSize: 16,
    radius: 12,
    spacing: 8,
  },
  'Dark Mode': {
    primary: '#6366f1',
    secondary: '#a855f7',
    background: '#0f1117',
    text: '#f3f4f6',
    fontFamily: 'Inter',
    baseFontSize: 16,
    radius: 16,
    spacing: 8,
  },
  Playful: {
    primary: '#ec4899',
    secondary: '#f59e0b',
    background: '#fff7fb',
    text: '#3b0a2a',
    fontFamily: 'Poppins',
    baseFontSize: 17,
    radius: 24,
    spacing: 8,
  },
  Corporate: {
    primary: '#1d4ed8',
    secondary: '#0ea5e9',
    background: '#f8fafc',
    text: '#0f172a',
    fontFamily: 'Roboto',
    baseFontSize: 15,
    radius: 6,
    spacing: 4,
  },
}

export const PRESET_NAMES = Object.keys(PRESETS) as PresetName[]
