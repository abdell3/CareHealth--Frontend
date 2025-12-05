/**
 * Medical Design System - Animation Tokens
 */

export const animations = {
  // Durations
  duration: {
    fast: '150ms',
    base: '200ms',
    slow: '300ms',
    slower: '500ms',
  },

  // Easing functions
  easing: {
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    medical: 'cubic-bezier(0.4, 0, 0.6, 1)',
  },

  // Keyframe names
  keyframes: {
    medicalPulse: 'medical-pulse',
    heartbeat: 'heartbeat',
    slideInMedical: 'slide-in-medical',
    fadeUp: 'fade-up',
    fadeIn: 'fade-in',
  },
} as const

/**
 * Animation classes for Tailwind
 */
export const animationClasses = {
  'medical-pulse': 'animate-medical-pulse',
  heartbeat: 'animate-heartbeat',
  'slide-in-medical': 'animate-slide-in-medical',
  'fade-up': 'animate-fade-up',
  'fade-in': 'animate-fade-in',
} as const

export type AnimationDuration = keyof typeof animations.duration
export type AnimationEasing = keyof typeof animations.easing

