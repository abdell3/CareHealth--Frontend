/**
 * Medical Design System - Typography Tokens
 */

export const medicalTypography = {
  // Font families
  fonts: {
    primary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    secondary: "'DM Sans', sans-serif",
    mono: "'JetBrains Mono', 'Courier New', monospace",
  },

  // Font sizes and line heights
  scale: {
    h1: {
      fontSize: '2.25rem', // 36px
      lineHeight: '2.5rem', // 40px
      fontWeight: '700',
      letterSpacing: '-0.025em',
    },
    h2: {
      fontSize: '1.875rem', // 30px
      lineHeight: '2.25rem', // 36px
      fontWeight: '600',
      letterSpacing: '-0.025em',
    },
    h3: {
      fontSize: '1.5rem', // 24px
      lineHeight: '2rem', // 32px
      fontWeight: '600',
      letterSpacing: '-0.025em',
    },
    h4: {
      fontSize: '1.25rem', // 20px
      lineHeight: '1.75rem', // 28px
      fontWeight: '600',
    },
    h5: {
      fontSize: '1.125rem', // 18px
      lineHeight: '1.75rem', // 28px
      fontWeight: '600',
    },
    h6: {
      fontSize: '1rem', // 16px
      lineHeight: '1.5rem', // 24px
      fontWeight: '600',
    },
    body: {
      fontSize: '1rem', // 16px
      lineHeight: '1.5rem', // 24px
      fontWeight: '400',
    },
    bodySmall: {
      fontSize: '0.875rem', // 14px
      lineHeight: '1.25rem', // 20px
      fontWeight: '400',
    },
    small: {
      fontSize: '0.75rem', // 12px
      lineHeight: '1rem', // 16px
      fontWeight: '400',
    },
    medical: {
      fontSize: '0.875rem', // 14px
      lineHeight: '1.25rem', // 20px
      fontWeight: '500',
      fontFamily: "'JetBrains Mono', monospace",
    },
  },
} as const

/**
 * Tailwind classes for typography
 */
export const typographyClasses = {
  h1: 'text-4xl font-bold tracking-tight',
  h2: 'text-3xl font-semibold tracking-tight',
  h3: 'text-2xl font-semibold',
  h4: 'text-xl font-semibold',
  h5: 'text-lg font-semibold',
  h6: 'text-base font-semibold',
  body: 'text-base leading-relaxed',
  bodySmall: 'text-sm leading-relaxed',
  small: 'text-sm text-gray-600',
  medical: 'font-mono text-sm bg-gray-50 px-2 py-1 rounded',
} as const

export type TypographyScale = keyof typeof medicalTypography.scale

