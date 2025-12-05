import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { authStore } from '@/store/auth.store'
import { authService } from '@/api/auth.service'
import type {
  LoginRequest,
  RegisterRequest,
} from '@/types/api'

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
    mutationFn: async (credentials: LoginRequest) => {
      const response = await authService.login(credentials)
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
    mutationFn: async (data: RegisterRequest) => {
      const response = await authService.register(data)
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
    try {
      const response = await authService.refresh()
      const newAccessToken = response.data.accessToken
      
      // Update token in store (refresh token is in HTTP-only cookie)
      const currentUser = authStore.getState().getUser()
      if (currentUser) {
        authStore.getState().setAuth({
          user: currentUser,
          accessToken: newAccessToken,
        })
      }
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


