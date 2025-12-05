import { axiosInstance } from './axiosInstance'
import { endpoints } from './endpoints'
import type { ApiResponse } from './api.types'
import type {
  UserResponse,
  UsersListResponse,
} from '@/types/api'
import type { User } from '@/store/auth.store'

/**
 * Users Service
 * Handles all user-related API calls
 */

export const usersService = {
  /**
   * Get list of users
   */
  getUsers: async (params?: {
    page?: number
    limit?: number
    role?: User['role']
    search?: string
  }): Promise<ApiResponse<UsersListResponse>> => {
    const response = await axiosInstance.get<ApiResponse<UsersListResponse>>(
      endpoints.users.list,
      { params }
    )
    return response.data
  },

  /**
   * Get user by ID
   */
  getUserById: async (id: string): Promise<ApiResponse<UserResponse>> => {
    const response = await axiosInstance.get<ApiResponse<UserResponse>>(
      endpoints.users.detail(id)
    )
    return response.data
  },

  /**
   * Create a new user
   */
  createUser: async (
    data: Omit<User, 'id'> & { password: string }
  ): Promise<ApiResponse<UserResponse>> => {
    const response = await axiosInstance.post<ApiResponse<UserResponse>>(
      endpoints.users.list,
      data
    )
    return response.data
  },

  /**
   * Update user
   */
  updateUser: async (
    id: string,
    data: Partial<Omit<User, 'id'>>
  ): Promise<ApiResponse<UserResponse>> => {
    const response = await axiosInstance.put<ApiResponse<UserResponse>>(
      endpoints.users.detail(id),
      data
    )
    return response.data
  },

  /**
   * Delete user
   */
  deleteUser: async (id: string): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.delete<ApiResponse<void>>(
      endpoints.users.detail(id)
    )
    return response.data
  },
}





