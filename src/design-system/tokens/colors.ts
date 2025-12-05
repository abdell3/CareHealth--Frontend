/**
 * Medical Design System - Color Tokens
 * CareHealth Brand Colors
 */

export const medicalColors = {
  // Primary Medical Blue (Professional, Trust)
  blue: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6', // PRIMARY
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },

  // Secondary Medical Green (Health, Growth)
  green: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981', // SECONDARY
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
  },

  // Danger/Urgency Red
  red: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444', // DANGER
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },

  // Warning Amber
  amber: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b', // WARNING
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },

  // Purple (Admin)
  purple: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7e22ce',
    800: '#6b21a8',
    900: '#581c87',
  },

  // Indigo (Lab)
  indigo: {
    50: '#eef2ff',
    100: '#e0e7ff',
    200: '#c7d2fe',
    300: '#a5b4fc',
    400: '#818cf8',
    500: '#6366f1',
    600: '#4f46e5',
    700: '#4338ca',
    800: '#3730a3',
    900: '#312e81',
  },

  // Sky (Patient)
  sky: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },
} as const

/**
 * Role-specific colors
 */
export const roleColors = {
  admin: medicalColors.purple[600],
  doctor: medicalColors.blue[600],
  nurse: medicalColors.green[600],
  patient: medicalColors.sky[600],
  pharmacist: medicalColors.amber[600],
  lab_technician: medicalColors.indigo[600],
  receptionist: medicalColors.blue[500],
} as const

/**
 * Semantic color mappings
 */
export const semanticColors = {
  success: medicalColors.green[500],
  error: medicalColors.red[500],
  warning: medicalColors.amber[500],
  info: medicalColors.blue[500],
  primary: medicalColors.blue[500],
  secondary: medicalColors.green[500],
} as const

export type MedicalColorScale = keyof typeof medicalColors.blue
export type RoleColor = keyof typeof roleColors
export type SemanticColor = keyof typeof semanticColors

