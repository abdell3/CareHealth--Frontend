/**
 * API Error Handler
 * Normalizes and handles API errors consistently
 */

import axios from 'axios'

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string,
    public validationErrors?: Record<string, string[]>,
    public originalError?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError)
    }
  }
}

export interface ApiErrorResponse {
  message?: string
  code?: string
  errors?: Record<string, string[]>
  status?: number
}

/**
 * Normalize any error to ApiError format
 */
export const normalizeError = (error: unknown): ApiError => {
  // Axios error
  if (axios.isAxiosError(error)) {
    const { response, request, message } = error

    // Server responded with error
    if (response) {
      const { data, status } = response
      const errorData = data as ApiErrorResponse

      return new ApiError(
        errorData.message || message || 'Une erreur est survenue',
        status,
        errorData.code || `HTTP_${status}`,
        errorData.errors,
        error
      )
    }

    // Request made but no response (network error)
    if (request) {
      return new ApiError(
        'Problème de connexion au serveur. Vérifiez votre connexion internet.',
        0,
        'NETWORK_ERROR',
        undefined,
        error
      )
    }

    // Request setup error
    return new ApiError(
      message || 'Erreur lors de la configuration de la requête',
      0,
      'REQUEST_ERROR',
      undefined,
      error
    )
  }

  // ApiError already normalized
  if (error instanceof ApiError) {
    return error
  }

  // Standard Error
  if (error instanceof Error) {
    return new ApiError(error.message, undefined, 'UNKNOWN_ERROR', undefined, error)
  }

  // Unknown error type
  return new ApiError(
    'Une erreur inattendue est survenue',
    undefined,
    'UNKNOWN_ERROR',
    undefined,
    error
  )
}

/**
 * Check if error is retryable
 */
export const isRetryableError = (error: unknown): boolean => {
  const apiError = normalizeError(error)

  // Network errors are retryable
  if (apiError.code === 'NETWORK_ERROR' || apiError.code === 'REQUEST_ERROR') {
    return true
  }

  // 5xx server errors are retryable
  if (apiError.statusCode && apiError.statusCode >= 500) {
    return true
  }

  // 429 Too Many Requests is retryable
  if (apiError.statusCode === 429) {
    return true
  }

  // 408 Request Timeout is retryable
  if (apiError.statusCode === 408) {
    return true
  }

  // 4xx client errors (except 429, 408) are NOT retryable
  if (apiError.statusCode && apiError.statusCode >= 400 && apiError.statusCode < 500) {
    return false
  }

  // 401 Unauthorized should not be retried (handled by refresh token)
  if (apiError.statusCode === 401) {
    return false
  }

  return false
}

/**
 * Get user-friendly error message
 */
export const getUserFriendlyMessage = (error: unknown): string => {
  const apiError = normalizeError(error)

  // Custom messages for common errors
  if (apiError.code === 'NETWORK_ERROR') {
    return 'Impossible de se connecter au serveur. Vérifiez votre connexion internet.'
  }

  if (apiError.statusCode === 401) {
    return 'Votre session a expiré. Veuillez vous reconnecter.'
  }

  if (apiError.statusCode === 403) {
    return "Vous n'avez pas les permissions nécessaires pour effectuer cette action."
  }

  if (apiError.statusCode === 404) {
    return "La ressource demandée n'a pas été trouvée."
  }

  if (apiError.statusCode === 429) {
    return 'Trop de requêtes. Veuillez patienter quelques instants.'
  }

  if (apiError.statusCode && apiError.statusCode >= 500) {
    return 'Une erreur serveur est survenue. Veuillez réessayer plus tard.'
  }

  // Validation errors
  if (apiError.validationErrors && Object.keys(apiError.validationErrors).length > 0) {
    const firstError = Object.values(apiError.validationErrors)[0]
    return Array.isArray(firstError) ? firstError[0] : String(firstError)
  }

  return apiError.message
}

