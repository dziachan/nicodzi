import { SCREEN_H, SCREEN_W } from './constants'
import type { ComponentNode } from './types'

// Safe-area insets in the logical 320×640 screen space (approx. notch / status
// bar at the top and home-indicator at the bottom).
export const SAFE_TOP = 36
export const SAFE_BOTTOM = 24

export type AnchorV = 'top' | 'center' | 'bottom'
export type AnchorH = 'left' | 'center' | 'right'

const round = (n: number) => Math.round(n)

/** Nearest vertical anchor for the node's current position. */
export function computeAnchorV(node: ComponentNode): AnchorV {
  const topD = Math.abs(node.y - SAFE_TOP)
  const botD = Math.abs(SCREEN_H - SAFE_BOTTOM - (node.y + node.h))
  const cenD = Math.abs(node.y + node.h / 2 - SCREEN_H / 2)
  const m = Math.min(topD, botD, cenD)
  return m === topD ? 'top' : m === botD ? 'bottom' : 'center'
}

export function computeAnchorH(node: ComponentNode): AnchorH {
  const leftD = Math.abs(node.x)
  const rightD = Math.abs(SCREEN_W - (node.x + node.w))
  const cenD = Math.abs(node.x + node.w / 2 - SCREEN_W / 2)
  const m = Math.min(leftD, rightD, cenD)
  return m === leftD ? 'left' : m === rightD ? 'right' : 'center'
}

export const anchorV = (node: ComponentNode): AnchorV => node.props.anchorV ?? computeAnchorV(node)
export const anchorH = (node: ComponentNode): AnchorH => node.props.anchorH ?? computeAnchorH(node)

/** Distance (px) from the node to its anchored edge / center. */
export function offsetV(node: ComponentNode, a: AnchorV): number {
  if (a === 'top') return round(node.y - SAFE_TOP)
  if (a === 'bottom') return round(SCREEN_H - SAFE_BOTTOM - (node.y + node.h))
  return round(node.y + node.h / 2 - SCREEN_H / 2)
}
export function offsetH(node: ComponentNode, a: AnchorH): number {
  if (a === 'left') return round(node.x)
  if (a === 'right') return round(SCREEN_W - (node.x + node.w))
  return round(node.x + node.w / 2 - SCREEN_W / 2)
}

/** Inverse: y/x for a given anchor + offset (keeps current w/h). */
export function yForOffset(node: ComponentNode, a: AnchorV, off: number): number {
  if (a === 'top') return SAFE_TOP + off
  if (a === 'bottom') return SCREEN_H - SAFE_BOTTOM - node.h - off
  return SCREEN_H / 2 - node.h / 2 + off
}
export function xForOffset(node: ComponentNode, a: AnchorH, off: number): number {
  if (a === 'left') return off
  if (a === 'right') return SCREEN_W - node.w - off
  return SCREEN_W / 2 - node.w / 2 + off
}

export const anchorVLabel = (a: AnchorV) => (a === 'top' ? 'oben' : a === 'bottom' ? 'unten' : 'vertikal zentriert')
export const anchorHLabel = (a: AnchorH) => (a === 'left' ? 'links' : a === 'right' ? 'rechts' : 'horizontal zentriert')

/** Export-facing description of the width sizing mode. */
export function widthDesc(node: ComponentNode): string {
  const m = node.props.widthMode ?? 'fixed'
  if (m === 'percent') return `Breite ${node.props.widthPercent ?? Math.round((node.w / SCREEN_W) * 100)}% der Screen-Breite`
  if (m === 'inset') return `Breite an den Rändern ausgerichtet (${node.props.inset ?? Math.round(node.x)}px Abstand links & rechts)`
  return `Breite ${Math.round(node.w)}px`
}

export function heightDesc(node: ComponentNode): string {
  const m = node.props.heightMode ?? 'fixed'
  if (m === 'auto') return 'Höhe automatisch (passt sich dem Inhalt an)'
  if (m === 'percent') return `Höhe ${node.props.heightPercent ?? Math.round((node.h / SCREEN_H) * 100)}% der Screen-Höhe`
  return `Höhe ${Math.round(node.h)}px`
}

/** Full anchor + size description used in the export prompt. */
export function geometryDesc(node: ComponentNode): string {
  const aV = anchorV(node)
  const aH = anchorH(node)
  const oV = offsetV(node, aV)
  const oH = offsetH(node, aH)
  const vTxt =
    aV === 'top' ? `${oV}px unter der oberen Safe Area` : aV === 'bottom' ? `${oV}px über der unteren Safe Area` : `${oV >= 0 ? '+' : ''}${oV}px zur vertikalen Mitte`
  const hTxt =
    aH === 'left' ? `${oH}px vom linken Rand` : aH === 'right' ? `${oH}px vom rechten Rand` : `${oH >= 0 ? '+' : ''}${oH}px zur horizontalen Mitte`
  const aspect = node.type === 'image' && node.props.keepAspect ? ', Seitenverhältnis beibehalten' : ''
  return `verankert ${anchorVLabel(aV)} / ${anchorHLabel(aH)} (${vTxt}, ${hTxt}); ${widthDesc(node)}, ${heightDesc(node)}${aspect}`
}
