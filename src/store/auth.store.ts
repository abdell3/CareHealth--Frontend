import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { axiosInstance } from '@/api/axiosInstance'
import { authService } from '@/api/auth.service'
import type { LoginRequest } from '@/types/api'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'admin' | 'doctor' | 'nurse' | 'patient' | 'receptionist' | 'pharmacist' | 'lab_technician'
  profile?: {
    avatar?: string
    phone?: string
    address?: string
    specialization?: string
    licenseNumber?: string
  }
}

export interface AuthResponse {
  accessToken: string
  refreshToken?: string // Optional if using HTTP-only cookies
  user: User
}

export interface Tokens {
  accessToken: string
  refreshToken?: string
}

interface AuthState {
  // Tokens stored in localStorage (fallback strategy)
  // If backend supports HTTP-only cookies, accessToken can be removed from here
  accessToken: string | null
  refreshToken: string | null
  user: User | null
  isAuthenticated: boolean

  // Actions
  setAuth: (payload: { user: User; accessToken: string; refreshToken?: string }) => void
  clearAuth: () => void
  logout: () => Promise<void>
  login: (credentials: LoginRequest) => Promise<void>
  checkAuth: () => Promise<boolean>
  getAccessToken: () => string | null
  getRefreshToken: () => string | null
  getUser: () => User | null
}

/**
 * Check if authentication cookies are present
 * (For HTTP-only cookie strategy - note: we can't read HTTP-only cookies from JS)
 */
const hasAuthCookies = (): boolean => {
  // This is a placeholder - actual check should be done via /auth/me endpoint
  // since we can't read HTTP-only cookies from JavaScript
  return document.cookie.includes('access_token=') || document.cookie.includes('refresh_token=')
}

export const authStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,

      /**
       * Set authentication state
       * Supports both strategies:
       * - localStorage (current fallback)
       * - HTTP-only cookies (preferred, backend must set cookies)
       */
      setAuth: (payload) => {
        set({
          accessToken: payload.accessToken,
          refreshToken: payload.refreshToken || null,
          user: payload.user,
          isAuthenticated: true,
        })
      },

      /**
       * Clear authentication state
       */
      clearAuth: () => {
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
        })
      },

      /**
       * Login user
       * Backend should set HTTP-only cookies if supported
       */
      login: async (credentials) => {
        try {
          const response = await authService.login(credentials)
          const { accessToken, refreshToken, user } = response.data

          // Store tokens (fallback if backend doesn't use HTTP-only cookies)
          get().setAuth({
            accessToken,
            refreshToken,
            user,
          })
        } catch (error) {
          throw error
        }
      },

      /**
       * Logout user
       */
      logout: async () => {
        try {
          // Call logout endpoint to clear cookies on backend
          await authService.logout()
        } catch (error) {
          // Even if API call fails, clear local state
          const { logger } = await import('@/utils/logger')
          logger.error('Logout API call failed', error)
        } finally {
          // Always clear local state regardless of API call result
          get().clearAuth()
        }
      },

      /**
       * Check authentication status
       * Verifies with backend if user is still authenticated
       */
      checkAuth: async () => {
        try {
          const response = await authService.getMe()
          const user = response.data

          // Update user in store
          set({
            user,
            isAuthenticated: true,
          })

          return true
        } catch (error) {
          // Not authenticated or error
          get().clearAuth()
          return false
        }
      },

      getAccessToken: () => {
        return get().accessToken
      },

      getRefreshToken: () => {
        return get().refreshToken
      },

      getUser: () => {
        return get().user
      },
    }),
    {
      name: 'carehealth_auth',
      partialize: (state) => ({
        // Only persist accessToken and user if using localStorage strategy
        // If using HTTP-only cookies, these can be removed
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
