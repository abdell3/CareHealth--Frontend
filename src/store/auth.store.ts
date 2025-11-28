import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'admin' | 'doctor' | 'nurse' | 'patient' | 'receptionist'
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
  refreshToken: string
  user: User
}

export interface Tokens {
  accessToken: string
  refreshToken: string
}

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  user: User | null
  isAuthenticated: boolean

  // Actions
  setAuth: (payload: { user: User; accessToken: string; refreshToken: string }) => void
  clearAuth: () => void
  logout: () => Promise<void>
  getAccessToken: () => string | null
  getRefreshToken: () => string | null
  getUser: () => User | null
}

// TODO: Migrate refreshToken storage from localStorage to HttpOnly cookie for better security.
// Currently using localStorage for simplicity, but HttpOnly cookies prevent XSS attacks.
export const authStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,

      setAuth: (payload) => {
        set({
          accessToken: payload.accessToken,
          refreshToken: payload.refreshToken,
          user: payload.user,
          isAuthenticated: true,
        })
      },

      clearAuth: () => {
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
        })
      },

      logout: async () => {
        try {
          // Lazy import to avoid circular dependency
          const { api } = await import('@/api/axios')
          const { endpoints } = await import('@/api/endpoints')
          // Attempt to call logout endpoint
          await api.post(endpoints.auth.logout)
        } catch (error) {
          // Even if API call fails, clear local state
          // Error is logged via logger utility
          const { logger } = await import('@/utils/logger')
          logger.error('Logout API call failed', error)
        } finally {
          // Always clear local state regardless of API call result
          get().clearAuth()
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
      name: 'careflow_auth',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)


