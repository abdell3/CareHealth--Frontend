/**
 * API Response Types
 * Type-safe API response wrapper matching backend specification
 */

/**
 * Standard API Response format from backend
 * @template T - The data type returned by the API
 */
export type ApiResponse<T> = {
  status: 'success' | 'error'
  message?: string
  data: T
}

/**
 * Backend error response format
 */
export interface ApiErrorResponse {
  status: 'error'
  message: string
}





