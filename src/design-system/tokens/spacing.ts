/**
 * Medical Design System - Spacing Tokens
 * Base unit: 4px (0.25rem)
 */

export const spacing = {
  // Base scale (4px increments)
  0: '0',
  1: '0.25rem', // 4px
  2: '0.5rem', // 8px
  3: '0.75rem', // 12px
  4: '1rem', // 16px
  5: '1.25rem', // 20px
  6: '1.5rem', // 24px
  8: '2rem', // 32px
  10: '2.5rem', // 40px
  12: '3rem', // 48px
  16: '4rem', // 64px
  20: '5rem', // 80px
  24: '6rem', // 96px
  32: '8rem', // 128px
  40: '10rem', // 160px
  48: '12rem', // 192px
  64: '16rem', // 256px
} as const

/**
 * Container max widths
 */
export const containerWidths = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const

/**
 * Common spacing patterns
 */
export const spacingPatterns = {
  cardPadding: spacing[6], // 24px
  sectionGap: spacing[8], // 32px
  componentGap: spacing[4], // 16px
  inputPadding: spacing[3], // 12px
  buttonPadding: spacing[3], // 12px
} as const

export type SpacingKey = keyof typeof spacing

