/**
 * useAuth Hook Tests
 */

import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { authStore } from '@/store/auth.store'
import { describe, it, expect, beforeEach, vi } from '@jest/globals'

// Mock authService
vi.mock('@/api/auth.service', () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    refresh: vi.fn(),
    getMe: vi.fn(),
  },
}))

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient()
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  )
}

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authStore.getState().clearAuth()
  })

  it('returns initial auth state', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('logs in successfully', async () => {
    const { authService } = await import('@/api/auth.service')
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'doctor' as const,
    }

    vi.mocked(authService.login).mockResolvedValue({
      status: 'success',
      data: {
        accessToken: 'token',
        refreshToken: 'refresh',
        user: mockUser,
      },
    })

    const { result } = renderHook(() => useAuth(), { wrapper })

    await result.current.loginAsync({
      email: 'test@example.com',
      password: 'password',
    })

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser)
      expect(result.current.isAuthenticated).toBe(true)
    })

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
  })

  it('handles login errors', async () => {
    const { authService } = await import('@/api/auth.service')
    vi.mocked(authService.login).mockRejectedValue(
      new Error('Invalid credentials')
    )

    const { result } = renderHook(() => useAuth(), { wrapper })

    await expect(
      result.current.loginAsync({
        email: 'wrong@example.com',
        password: 'wrong',
      })
    ).rejects.toThrow()

    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('logs out and clears state', async () => {
    const { authService } = await import('@/api/auth.service')
    
    // Set initial auth state
    authStore.getState().setAuth({
      user: {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'doctor',
      },
      accessToken: 'token',
      refreshToken: 'refresh',
    })

    vi.mocked(authService.logout).mockResolvedValue({
      status: 'success',
    })

    const { result } = renderHook(() => useAuth(), { wrapper })

    result.current.logout()

    await waitFor(() => {
      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
    })

    expect(mockNavigate).toHaveBeenCalledWith('/login')
  })

  it('refreshes token when expired', async () => {
    const { authService } = await import('@/api/auth.service')
    
    authStore.getState().setAuth({
      user: {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'doctor',
      },
      accessToken: 'old-token',
      refreshToken: 'refresh',
    })

    vi.mocked(authService.refresh).mockResolvedValue({
      status: 'success',
      data: {
        accessToken: 'new-token',
      },
    })

    const { result } = renderHook(() => useAuth(), { wrapper })

    await result.current.refreshAccessToken()

    await waitFor(() => {
      expect(authStore.getState().getAccessToken()).toBe('new-token')
    })
  })

  it('maintains auth state across reloads', () => {
    // Set auth state
    authStore.getState().setAuth({
      user: {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'doctor',
      },
      accessToken: 'token',
      refreshToken: 'refresh',
    })

    const { result } = renderHook(() => useAuth(), { wrapper })

    expect(result.current.user).not.toBeNull()
    expect(result.current.isAuthenticated).toBe(true)
  })
})

