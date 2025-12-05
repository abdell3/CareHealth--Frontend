/**
 * Tests for authentication functionality
 */
import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { renderHook } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { authStore } from '@/store/auth.store'

// Mock axios
jest.mock('@/api/axios', () => ({
  api: {
    post: jest.fn(),
  },
}))

// Mock router
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  )
}

describe('useAuth', () => {
  beforeEach(() => {
    // Clear auth store before each test
    authStore.getState().clearAuth()
  })

  it('should return initial auth state', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    })

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
  })

  it('should have login function', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    })

    expect(typeof result.current.login).toBe('function')
    expect(typeof result.current.loginAsync).toBe('function')
  })

  it('should have register function', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    })

    expect(typeof result.current.register).toBe('function')
    expect(typeof result.current.registerAsync).toBe('function')
  })

  it('should have logout function', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    })

    expect(typeof result.current.logout).toBe('function')
  })
})

