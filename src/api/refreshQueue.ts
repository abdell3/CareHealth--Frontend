/**
 * Refresh Token Queue
 * Manages concurrent requests during token refresh to prevent multiple refresh calls
 */

import type { AxiosRequestConfig } from 'axios'
import { authStore } from '@/store/auth.store'
import { normalizeError } from './errorHandler'
import type { ApiResponse } from './api.types'

type QueuedRequest = {
  resolve: (value: any) => void
  reject: (error: unknown) => void
  config: AxiosRequestConfig
}

class RefreshQueue {
  private isRefreshing = false
  private failedQueue: QueuedRequest[] = []

  /**
   * Add a request to the queue during token refresh
   */
  async addToQueue(requestFn: () => Promise<any>): Promise<any> {
    if (!this.isRefreshing) {
      // Start refresh process
      this.isRefreshing = true

      try {
        const result = await requestFn()
        this.processQueue(null, result)
        return result
      } catch (error) {
        this.processQueue(error, null)
        throw error
      }
    } else {
      // Already refreshing, queue this request
      return new Promise((resolve, reject) => {
        // We need to store the request function, not just the config
        // For now, we'll use a placeholder and resolve/reject later
        this.failedQueue.push({
          resolve,
          reject,
          config: {} as AxiosRequestConfig, // Placeholder
        })
      })
    }
  }

  /**
   * Process all queued requests after refresh completes
   */
  private processQueue(error: unknown | null, token: string | null) {
    this.failedQueue.forEach((queued) => {
      if (error) {
        queued.reject(error)
      } else {
        queued.resolve(token)
      }
    })

    this.failedQueue = []
    this.isRefreshing = false
  }

  /**
   * Queue a failed request to retry after token refresh
   * Returns a promise that resolves when the request can be retried
   */
  queueRequest(config: AxiosRequestConfig): Promise<string> {
    return new Promise((resolve, reject) => {
      this.failedQueue.push({
        resolve: (token: string) => resolve(token),
        reject,
        config,
      })
    })
  }

  /**
   * Process queued requests with new token
   * Note: This will be called from axiosInstance interceptor
   */
  async processQueuedRequests(newToken: string, axiosInstance: any) {
    const requests = [...this.failedQueue]
    this.failedQueue = []
    this.isRefreshing = false

    // Retry all queued requests with new token
    const results = await Promise.allSettled(
      requests.map((queued) => {
        if (queued.config.headers) {
          queued.config.headers.Authorization = `Bearer ${newToken}`
        }
        return axiosInstance(queued.config)
          .then((response: any) => {
            queued.resolve(response)
            return response
          })
          .catch((error: unknown) => {
            queued.reject(error)
            throw error
          })
      })
    )

    return results
  }

  /**
   * Check if currently refreshing
   */
  getIsRefreshing(): boolean {
    return this.isRefreshing
  }

  /**
   * Get queue size
   */
  getQueueSize(): number {
    return this.failedQueue.length
  }

  /**
   * Clear queue (on logout or error)
   */
  clearQueue(error?: unknown) {
    this.failedQueue.forEach((queued) => {
      if (error) {
        queued.reject(error)
      } else {
        queued.reject(new Error('Token refresh cancelled'))
      }
    })
    this.failedQueue = []
    this.isRefreshing = false
  }
}

export const refreshQueue = new RefreshQueue()

/**
 * Refresh authentication token
 */
export const refreshAuthToken = async (): Promise<string> => {
  try {
    // Use a separate axios instance to avoid interceptor loops
    const { default: axios } = await import('axios')
    const API_BASE_URL =
      import.meta.env.VITE_API_URL ??
      import.meta.env.VITE_API_BASE_URL ??
      'http://localhost:5000/api/v1'

    const refreshInstance = axios.create({
      baseURL: API_BASE_URL,
      withCredentials: true,
    })

    const response = await refreshInstance.post<ApiResponse<{ accessToken: string }>>(
      '/auth/refresh'
    )

    const newAccessToken = response.data.data?.accessToken

    if (!newAccessToken) {
      throw new Error('No access token received from refresh endpoint')
    }

    // Update token in store
    const currentUser = authStore.getState().getUser()
    if (currentUser) {
      authStore.getState().setAuth({
        accessToken: newAccessToken,
        refreshToken: '', // Refresh token is in HTTP-only cookie
        user: currentUser,
      })
    } else {
      // Edge case: update only accessToken
      authStore.setState({ accessToken: newAccessToken })
    }

    return newAccessToken
  } catch (error) {
    // Refresh failed, clear auth
    authStore.getState().clearAuth()
    refreshQueue.clearQueue(error)
    throw normalizeError(error)
  }
}

