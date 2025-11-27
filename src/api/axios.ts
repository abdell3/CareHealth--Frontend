import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios'
import { authStore } from '@/store/auth.store'

// Base URL includes /api/v1 as per backend structure
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api/v1'

// Main API instance with interceptors
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

// Separate axios instance for refresh calls to avoid interceptor loops
// This instance does NOT have interceptors attached
const refreshInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

// Request queue type for managing failed requests during refresh
type QueuedRequest = {
  resolve: (value?: unknown) => void
  reject: (error?: unknown) => void
  config: InternalAxiosRequestConfig
}

// Internal state for refresh queue management
let isRefreshing = false
let requestQueue: QueuedRequest[] = []

// Process queued requests after successful refresh
const processQueue = (error: AxiosError | null, token: string | null = null) => {
  requestQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else if (token && prom.config.headers) {
      prom.config.headers.Authorization = `Bearer ${token}`
      prom.resolve(api(prom.config))
    }
  })
  requestQueue = []
}

// Request interceptor - Add access token to requests
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = authStore.getState().getAccessToken()
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// Response interceptor - Handle token refresh with queue management
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
    }

    // If error is 401 and we haven't already retried this request
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      // Mark this request as retried to prevent infinite loops
      originalRequest._retry = true

      // If we're already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          requestQueue.push({ resolve, reject, config: originalRequest })
        })
      }

      // Start refresh process
      isRefreshing = true
      const refreshToken = authStore.getState().getRefreshToken()

      if (!refreshToken) {
        // No refresh token, logout user
        isRefreshing = false
        processQueue(error)
        authStore.getState().logout()
        window.location.href = '/login'
        return Promise.reject(error)
      }

      try {
        // Call refresh endpoint using separate instance (no interceptors)
        const response = await refreshInstance.post<{
          accessToken: string
          refreshToken: string
          user?: typeof authStore.getState().user
        }>('/auth/refresh', { refreshToken })

        const { accessToken: newAccessToken, refreshToken: newRefreshToken, user } =
          response.data

        // Update tokens and user in store
        authStore.getState().setAuth({
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
          user: user || authStore.getState().getUser(),
        })

        // Process queued requests with new token
        isRefreshing = false
        processQueue(null, newAccessToken)

        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        }

        return api(originalRequest)
      } catch (refreshError) {
        // Refresh failed, logout user and reject all queued requests
        isRefreshing = false
        processQueue(refreshError as AxiosError)
        authStore.getState().logout()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default api


