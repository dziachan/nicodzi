// Logical dimensions of a phone screen's content area (inside the frame).
// Nodes are positioned in this coordinate space; zoom only scales the view.
export const SCREEN_W = 320
export const SCREEN_H = 640
export const FRAME_BORDER = 12
export const FRAME_W = SCREEN_W + FRAME_BORDER * 2
export const FRAME_H = SCREEN_H + FRAME_BORDER * 2

export const FONT_OPTIONS = ['Inter', 'Poppins', 'Roboto', 'Manrope', 'SF Pro', 'Georgia']

export const ZOOM_LEVELS = [0.5, 0.75, 1] as const
