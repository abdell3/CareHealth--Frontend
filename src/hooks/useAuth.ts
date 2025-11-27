import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { authStore, type User, type AuthResponse } from '@/store/auth.store'
import { api } from '@/api/axios'
import { endpoints } from '@/api/endpoints'

interface LoginCredentials {
  email: string
  password: string
}

interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
  role?: string
}

/**
 * Hook for authentication operations
 * Provides login, register, logout, and refresh token functionality
 */
export const useAuth = () => {
  const user = authStore((state) => state.user)
  const isAuthenticated = authStore((state) => state.isAuthenticated)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await api.post<AuthResponse>(
        endpoints.auth.login,
        credentials
      )
      return response.data
    },
    onSuccess: (data) => {
      authStore.getState().setAuth({
        user: data.user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      })
      queryClient.setQueryData(['auth', 'me'], data.user)
      navigate('/dashboard')
    },
  })

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      const response = await api.post<AuthResponse>(endpoints.auth.register, data)
      return response.data
    },
    onSuccess: () => {
      // On successful registration, redirect to login
      navigate('/login', { state: { message: 'Registration successful. Please login.' } })
    },
  })

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await authStore.getState().logout()
    },
    onSuccess: () => {
      queryClient.clear()
      navigate('/login')
    },
    onError: () => {
      // Even if logout fails, clear local state
      authStore.getState().clearAuth()
      queryClient.clear()
      navigate('/login')
    },
  })

  // Refresh access token (imperative function for startup refresh)
  const refreshAccessToken = async (): Promise<void> => {
    const refreshToken = authStore.getState().getRefreshToken()
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    try {
      const response = await api.post<AuthResponse>(endpoints.auth.refresh, {
        refreshToken,
      })
      authStore.getState().setAuth({
        user: response.data.user,
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken,
      })
    } catch (error) {
      // Refresh failed, clear auth
      authStore.getState().clearAuth()
      throw error
    }
  }

  return {
    user,
    isAuthenticated,
    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    register: registerMutation.mutate,
    registerAsync: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    logout: () => logoutMutation.mutate(),
    isLoggingOut: logoutMutation.isPending,
    refreshAccessToken,
    error: loginMutation.error || registerMutation.error || logoutMutation.error,
  }
}


