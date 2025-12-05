import { axiosInstance } from './axiosInstance'
import { endpoints } from './endpoints'
import type { ApiResponse } from './api.types'
import type {
  Notification,
  NotificationsListResponse,
  NotificationStats,
  NotificationPreferences,
  CreateNotificationRequest,
  MarkNotificationReadRequest,
  NotificationFilters,
} from '@/types/api'

/**
 * Notifications Service
 * Handles all notification-related API calls
 */
export const notificationsService = {
  /**
   * Get list of notifications with filters
   */
  getNotifications: async (
    filters?: NotificationFilters
  ): Promise<ApiResponse<NotificationsListResponse>> => {
    const response = await axiosInstance.get<ApiResponse<NotificationsListResponse>>(
      endpoints.notifications.list,
      { params: filters }
    )
    return response.data
  },

  /**
   * Get notification by ID
   */
  getNotificationById: async (id: string): Promise<ApiResponse<Notification>> => {
    const response = await axiosInstance.get<ApiResponse<Notification>>(
      endpoints.notifications.detail(id)
    )
    return response.data
  },

  /**
   * Mark notification as read
   */
  markAsRead: async (id: string): Promise<ApiResponse<Notification>> => {
    const response = await axiosInstance.put<ApiResponse<Notification>>(
      endpoints.notifications.markRead(id)
    )
    return response.data
  },

  /**
   * Mark multiple notifications as read
   */
  markAllAsRead: async (
    notificationIds?: string[]
  ): Promise<ApiResponse<{ count: number }>> => {
    const response = await axiosInstance.post<ApiResponse<{ count: number }>>(
      endpoints.notifications.markAllRead,
      notificationIds ? { notificationIds } : undefined
    )
    return response.data
  },

  /**
   * Get notification statistics
   */
  getStats: async (): Promise<ApiResponse<NotificationStats>> => {
    const response = await axiosInstance.get<ApiResponse<NotificationStats>>(
      endpoints.notifications.stats
    )
    return response.data
  },

  /**
   * Get user notification preferences
   */
  getPreferences: async (): Promise<ApiResponse<NotificationPreferences>> => {
    const response = await axiosInstance.get<ApiResponse<NotificationPreferences>>(
      endpoints.notifications.preferences
    )
    return response.data
  },

  /**
   * Update user notification preferences
   */
  updatePreferences: async (
    preferences: Partial<NotificationPreferences>
  ): Promise<ApiResponse<NotificationPreferences>> => {
    const response = await axiosInstance.put<ApiResponse<NotificationPreferences>>(
      endpoints.notifications.preferences,
      preferences
    )
    return response.data
  },

  /**
   * Create notification (admin only)
   */
  createNotification: async (
    data: CreateNotificationRequest
  ): Promise<ApiResponse<Notification>> => {
    const response = await axiosInstance.post<ApiResponse<Notification>>(
      endpoints.notifications.list,
      data
    )
    return response.data
  },

  /**
   * Delete notification
   */
  deleteNotification: async (id: string): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.delete<ApiResponse<void>>(
      endpoints.notifications.detail(id)
    )
    return response.data
  },
}

