/**
 * useNotifications Hook Tests
 */

import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useNotifications } from '@/hooks/useNotifications'
import { describe, it, expect, beforeEach, vi } from '@jest/globals'

// Mock notificationsService
vi.mock('@/api/notifications.service', () => ({
  notificationsService: {
    getNotifications: vi.fn(),
    getStats: vi.fn(),
    getPreferences: vi.fn(),
    markAsRead: vi.fn(),
    markAllAsRead: vi.fn(),
    updatePreferences: vi.fn(),
  },
}))

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient()
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

describe('useNotifications', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches notifications on mount', async () => {
    const { notificationsService } = await import('@/api/notifications.service')
    
    vi.mocked(notificationsService.getNotifications).mockResolvedValue({
      status: 'success',
      data: {
        notifications: [],
        total: 0,
        unreadCount: 0,
        page: 1,
        limit: 10,
      },
    })

    const { result } = renderHook(() => useNotifications(), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(notificationsService.getNotifications).toHaveBeenCalled()
  })

  it('marks notification as read', async () => {
    const { notificationsService } = await import('@/api/notifications.service')
    
    const mockNotification = {
      id: '1',
      userId: '1',
      type: 'appointment' as const,
      priority: 'info' as const,
      status: 'unread' as const,
      title: 'Test',
      message: 'Test message',
      channels: ['in-app'] as const[],
      createdAt: new Date().toISOString(),
    }

    vi.mocked(notificationsService.getNotifications).mockResolvedValue({
      status: 'success',
      data: {
        notifications: [mockNotification],
        total: 1,
        unreadCount: 1,
        page: 1,
        limit: 10,
      },
    })

    vi.mocked(notificationsService.markAsRead).mockResolvedValue({
      status: 'success',
      data: {
        ...mockNotification,
        status: 'read',
        readAt: new Date().toISOString(),
      },
    })

    const { result } = renderHook(() => useNotifications(), { wrapper })

    await waitFor(() => {
      expect(result.current.notifications.length).toBeGreaterThan(0)
    })

    await result.current.markAsRead('1')

    expect(notificationsService.markAsRead).toHaveBeenCalledWith('1')
  })

  it('shows unread count', async () => {
    const { notificationsService } = await import('@/api/notifications.service')
    
    vi.mocked(notificationsService.getNotifications).mockResolvedValue({
      status: 'success',
      data: {
        notifications: [],
        total: 5,
        unreadCount: 3,
        page: 1,
        limit: 10,
      },
    })

    const { result } = renderHook(() => useNotifications(), { wrapper })

    await waitFor(() => {
      expect(result.current.unreadCount).toBe(3)
    })
  })

  it('marks all notifications as read', async () => {
    const { notificationsService } = await import('@/api/notifications.service')
    
    vi.mocked(notificationsService.markAllAsRead).mockResolvedValue({
      status: 'success',
      data: { count: 5 },
    })

    const { result } = renderHook(() => useNotifications(), { wrapper })

    await result.current.markAllAsRead(['1', '2', '3'])

    expect(notificationsService.markAllAsRead).toHaveBeenCalledWith(['1', '2', '3'])
  })

  it('updates preferences', async () => {
    const { notificationsService } = await import('@/api/notifications.service')
    
    const mockPreferences = {
      userId: '1',
      types: {
        system: { enabled: true, channels: ['in-app'] },
        appointment: { enabled: true, channels: ['in-app', 'email'] },
        medical: { enabled: true, channels: ['in-app'] },
        message: { enabled: true, channels: ['in-app'] },
        reminder: { enabled: true, channels: ['in-app'] },
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    vi.mocked(notificationsService.updatePreferences).mockResolvedValue({
      status: 'success',
      data: mockPreferences,
    })

    const { result } = renderHook(() => useNotifications(), { wrapper })

    await result.current.updatePreferences({
      types: {
        system: { enabled: false, channels: [] },
      },
    })

    expect(notificationsService.updatePreferences).toHaveBeenCalled()
  })
})

