/**
 * CSRF Protection
 * Handles CSRF token retrieval and validation
 */

/**
 * Get CSRF token from meta tag (if provided by backend)
 */
export const getCSRFToken = (): string | null => {
  const metaTag = document.querySelector('meta[name="csrf-token"]')
  return metaTag ? metaTag.getAttribute('content') : null
}

/**
 * Get CSRF token from cookie (if backend sets it)
 */
export const getCSRFTokenFromCookie = (): string | null => {
  const cookies = document.cookie.split(';')
  const csrfCookie = cookies.find((cookie) => cookie.trim().startsWith('csrf-token='))
  if (csrfCookie) {
    return csrfCookie.split('=')[1]?.trim() || null
  }
  return null
}

/**
 * Get CSRF token (tries meta tag first, then cookie)
 */
export const getCSRFTokenValue = (): string | null => {
  return getCSRFToken() || getCSRFTokenFromCookie()
}

/**
 * Check if CSRF protection is enabled
 */
export const isCSRFEnabled = (): boolean => {
  return getCSRFTokenValue() !== null
}

