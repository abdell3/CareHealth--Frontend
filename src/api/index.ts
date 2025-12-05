/**
 * API Module - Centralized exports
 * Single source of truth for all API-related functionality
 */

// Main axios instance
export { axiosInstance, hasAuthCookies } from './axiosInstance'

// Error handling
export {
  ApiError,
  normalizeError,
  isRetryableError,
  getUserFriendlyMessage,
} from './errorHandler'

// Retry handler
export { retryRequest, withRetry } from './retryHandler'

// Refresh queue
export { refreshQueue, refreshAuthToken } from './refreshQueue'

// CSRF protection
export {
  getCSRFToken,
  getCSRFTokenFromCookie,
  getCSRFTokenValue,
  isCSRFEnabled,
} from './csrf'

// Services
export { authService } from './auth.service'
export { usersService } from './users.service'
export { patientsService } from './patients.service'
export { appointmentsService } from './appointments.service'
export { pharmacyService } from './pharmacy.service'
export { labService } from './lab.service'
export { documentsService } from './documents.service'
export { notificationsService } from './notifications.service'
export { searchService } from './search.service'

// Endpoints
export { endpoints } from './endpoints'

// Types
export type { ApiResponse, ApiErrorResponse } from './api.types'

