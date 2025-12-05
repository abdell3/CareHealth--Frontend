import { axiosInstance } from './axiosInstance'
import { endpoints } from './endpoints'
import type { ApiResponse } from './api.types'
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  RequestPasswordResetRequest,
  ResetPasswordRequest,
  UserResponse,
} from '@/types/api'
import type { User } from '@/store/auth.store'

/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

export const authService = {
  /**
   * Login with email and password
   */
  login: async (credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
    const response = await axiosInstance.post<ApiResponse<AuthResponse>>(
      endpoints.auth.login,
      credentials
    )
    return response.data
  },

  /**
   * Register a new user
   */
  register: async (data: RegisterRequest): Promise<ApiResponse<AuthResponse>> => {
    const response = await axiosInstance.post<ApiResponse<AuthResponse>>(
      endpoints.auth.register,
      data
    )
    return response.data
  },

  /**
   * Refresh access token
   * Refresh token is automatically sent via HTTP-only cookie
   */
  refresh: async (): Promise<ApiResponse<{ accessToken: string }>> => {
    const response = await axiosInstance.post<ApiResponse<{ accessToken: string }>>(
      endpoints.auth.refresh
    )
    return response.data
  },

  /**
   * Logout user
   */
  logout: async (): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.post<ApiResponse<void>>(endpoints.auth.logout)
    return response.data
  },

  /**
   * Request password reset
   */
  requestPasswordReset: async (
    data: RequestPasswordResetRequest
  ): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.post<ApiResponse<void>>(
      endpoints.auth.requestPasswordReset,
      data
    )
    return response.data
  },

  /**
   * Reset password with token
   */
  resetPassword: async (data: ResetPasswordRequest): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.post<ApiResponse<void>>(
      endpoints.auth.resetPassword,
      data
    )
    return response.data
  },

  /**
   * Get current user profile
   */
  getMe: async (): Promise<ApiResponse<UserResponse>> => {
    const response = await axiosInstance.get<ApiResponse<UserResponse>>(endpoints.auth.me)
    return response.data
  },
}





