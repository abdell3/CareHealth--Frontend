import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { authStore } from '@/store/auth.store'
import { api } from '@/api/axios'
import { endpoints } from '@/api/endpoints'
import type { User } from '@/store/auth.store'

interface LoginCredentials {
  email: string
  password: string
}

interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  role?: string
}

interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: User
}

/**
 * Hook to get current authenticated user
 */
export const useAuth = () => {
  const user = authStore((state) => state.user)
  const isAuthenticated = authStore((state) => state.isAuthenticated)
  const accessToken = authStore((state) => state.accessToken)
  const storeLogout = authStore((state) => state.logout)

  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Fetch current user
  const { data: currentUser, isLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const response = await api.get<User>(endpoints.auth.me)
      authStore.getState().setUser(response.data)
      return response.data
    },
    enabled: !!accessToken && isAuthenticated,
    retry: false,
  })

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
      authStore.getState().setTokens(data.accessToken, data.refreshToken)
      authStore.getState().setUser(data.user)
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
    onSuccess: (data) => {
      authStore.getState().setTokens(data.accessToken, data.refreshToken)
      authStore.getState().setUser(data.user)
      queryClient.setQueryData(['auth', 'me'], data.user)
      navigate('/dashboard')
    },
  })

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await api.post(endpoints.auth.logout)
    },
    onSuccess: () => {
      storeLogout()
      queryClient.clear()
      navigate('/login')
    },
    onError: () => {
      // Even if API call fails, logout locally
      storeLogout()
      queryClient.clear()
      navigate('/login')
    },
  })

  const logout = () => {
    logoutMutation.mutate()
  }

  return {
    user: currentUser || user,
    isAuthenticated,
    isLoading,
    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    register: registerMutation.mutate,
    registerAsync: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    logout,
    isLoggingOut: logoutMutation.isPending,
    error: loginMutation.error || registerMutation.error,
  }
}


