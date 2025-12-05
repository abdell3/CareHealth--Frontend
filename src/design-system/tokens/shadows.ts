/**
 * Medical Design System - Shadow Tokens
 */

export const shadows = {
  // Standard shadows
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',

  // Medical-specific shadows
  medical: '0 4px 6px -1px rgba(0, 115, 230, 0.1), 0 2px 4px -1px rgba(0, 153, 85, 0.06)',
  'medical-card': '0 10px 40px rgba(59, 130, 246, 0.1)',
  'medical-elevated': '0 20px 50px rgba(59, 130, 246, 0.15)',
} as const

/**
 * Elevation levels for z-index
 */
export const elevations = {
  base: 0,
  raised: 10,
  dropdown: 100,
  sticky: 200,
  overlay: 300,
  modal: 400,
  popover: 500,
  tooltip: 600,
} as const

export type ShadowKey = keyof typeof shadows
export type ElevationKey = keyof typeof elevations

