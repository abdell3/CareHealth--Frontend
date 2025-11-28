import { useMemo } from 'react'
import { AxiosError } from 'axios'
import type { ApiError } from '@/types/api'

/**
 * Hook to extract and format API error messages
 * Provides consistent error handling across the application
 */
export const useApiError = (error: unknown): string | null => {
  return useMemo(() => {
    if (!error) return null

    // Handle Axios errors
    if (error instanceof AxiosError) {
      const apiError = error.response?.data as ApiError | undefined

      if (apiError?.message) {
        return apiError.message
      }

      // Handle validation errors
      if (apiError?.errors) {
        const errorMessages = Object.entries(apiError.errors)
          .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
          .join('\n')
        return errorMessages || 'Validation error'
      }

      // Fallback to status text or default message
      return error.response?.statusText || error.message || 'An error occurred'
    }

    // Handle standard Error objects
    if (error instanceof Error) {
      return error.message
    }

    // Fallback for unknown error types
    return 'An unexpected error occurred'
  }, [error])
}

