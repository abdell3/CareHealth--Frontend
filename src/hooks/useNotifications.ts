import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationsService } from '@/api/notifications.service'
import type {
  Notification,
  NotificationFilters,
  NotificationPreferences,
  CreateNotificationRequest,
} from '@/types/api'

/**
 * Hook for managing notifications
 */
export const useNotifications = (filters?: NotificationFilters) => {
  const queryClient = useQueryClient()

  // Get notifications list
  const {
    data: notificationsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['notifications', filters],
    queryFn: async () => {
      const response = await notificationsService.getNotifications(filters)
      return response.data
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  })

  // Get notification stats
  const { data: stats } = useQuery({
    queryKey: ['notifications', 'stats'],
    queryFn: async () => {
      const response = await notificationsService.getStats()
      return response.data
    },
    refetchInterval: 60000, // Refetch every minute
  })

  // Get preferences
  const { data: preferences } = useQuery({
    queryKey: ['notifications', 'preferences'],
    queryFn: async () => {
      const response = await notificationsService.getPreferences()
      return response.data
    },
  })

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await notificationsService.markAsRead(id)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: async (notificationIds?: string[]) => {
      const response = await notificationsService.markAllAsRead(notificationIds)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  // Update preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: async (prefs: Partial<NotificationPreferences>) => {
      const response = await notificationsService.updatePreferences(prefs)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'preferences'] })
    },
  })

  // Create notification mutation (admin only)
  const createNotificationMutation = useMutation({
    mutationFn: async (data: CreateNotificationRequest) => {
      const response = await notificationsService.createNotification(data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: async (id: string) => {
      await notificationsService.deleteNotification(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  return {
    notifications: notificationsData?.notifications ?? [],
    total: notificationsData?.total ?? 0,
    unreadCount: notificationsData?.unreadCount ?? 0,
    stats,
    preferences,
    isLoading,
    error,
    refetch,
    markAsRead: markAsReadMutation.mutateAsync,
    markAllAsRead: markAllAsReadMutation.mutateAsync,
    updatePreferences: updatePreferencesMutation.mutateAsync,
    createNotification: createNotificationMutation.mutateAsync,
    deleteNotification: deleteNotificationMutation.mutateAsync,
    isMarkingAsRead: markAsReadMutation.isPending,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
    isUpdatingPreferences: updatePreferencesMutation.isPending,
    isCreating: createNotificationMutation.isPending,
    isDeleting: deleteNotificationMutation.isPending,
  }
}

