/**
 * Axios Instance - Single Source of Truth
 * Consolidated Axios configuration with security, error handling, and retry logic
 */

import axios, { AxiosError } from 'axios'
import type { AxiosResponse, AxiosRequestConfig } from 'axios'
import { authStore } from '@/store/auth.store'
import { normalizeError } from './errorHandler'
import { refreshQueue, refreshAuthToken } from './refreshQueue'
import { getCSRFTokenValue } from './csrf'
import type { ApiErrorResponse } from './api.types'

// Base URL from environment variable
const API_BASE_URL =
  import.meta.env.VITE_API_URL ??
  import.meta.env.VITE_API_BASE_URL ??
  'http://localhost:5000/api/v1'

/**
 * Main Axios instance - Single source of truth
 */
export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Required for HTTP-only cookies (refresh token)
})

/**
 * Request Interceptor
 * - Adds access token to Authorization header
 * - Adds CSRF token for non-GET requests
 */
axiosInstance.interceptors.request.use(
  (config) => {
    // Add access token from store
    const accessToken = authStore.getState().getAccessToken()
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }

    // Add CSRF token for non-GET requests
    const method = config.method?.toUpperCase()
    if (method && method !== 'GET' && method !== 'HEAD' && method !== 'OPTIONS') {
      const csrfToken = getCSRFTokenValue()
      if (csrfToken && config.headers) {
        config.headers['X-CSRF-Token'] = csrfToken
      }
    }

    return config
  },
  (error: AxiosError) => {
    return Promise.reject(normalizeError(error))
  }
)

/**
 * Response Interceptor
 * - Handles 401 errors with token refresh
 * - Normalizes all errors
 * - Uses refresh queue for concurrent requests
 */
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // Return successful responses as-is
    return response
  },
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean
      _retryCount?: number
    } | undefined

    // Handle 401 Unauthorized (token expired)
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true

      // If already refreshing, queue this request
      if (refreshQueue.getIsRefreshing()) {
        try {
          // Wait for refresh to complete and retry with new token
          const newToken = await refreshQueue.queueRequest(originalRequest)
          if (originalRequest.headers && newToken) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`
          }
          return axiosInstance(originalRequest)
        } catch (queueError) {
          return Promise.reject(normalizeError(queueError))
        }
      }

      // Start refresh process
      try {
        const newAccessToken = await refreshAuthToken()

        // Process all queued requests
        await refreshQueue.processQueuedRequests(newAccessToken, axiosInstance)

        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        }

        return axiosInstance(originalRequest)
      } catch (refreshError) {
        // Refresh failed, logout user
        authStore.getState().clearAuth()
        refreshQueue.clearQueue(refreshError)

        // Redirect to login
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }

        return Promise.reject(normalizeError(refreshError))
      }
    }

    // Normalize and reject all other errors
    return Promise.reject(normalizeError(error))
  }
)

/**
 * Check if user has authentication cookies
 * (For HTTP-only cookie strategy)
 */
export const hasAuthCookies = (): boolean => {
  // Note: We can't directly read HTTP-only cookies from JavaScript
  // This is a check for the presence of auth state
  // Backend should verify cookies on /auth/me endpoint
  return authStore.getState().isAuthenticated
}

export default axiosInstance
