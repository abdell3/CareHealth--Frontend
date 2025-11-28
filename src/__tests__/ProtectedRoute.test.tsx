/**
 * Tests for ProtectedRoute component
 */
import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import { BrowserRouter, MemoryRouter } from 'react-router-dom'
import { ProtectedRoute } from '@/router/protected-route'
import { authStore } from '@/store/auth.store'
import type { User } from '@/store/auth.store'

// Mock authStore
jest.mock('@/store/auth.store', () => {
  const mockStore = {
    accessToken: null,
    refreshToken: null,
    user: null,
    isAuthenticated: false,
    getAccessToken: jest.fn(() => null),
    getRefreshToken: jest.fn(() => null),
    getUser: jest.fn(() => null),
    setAuth: jest.fn(),
    clearAuth: jest.fn(),
    logout: jest.fn(),
  }
  return {
    authStore: (selector: (state: typeof mockStore) => unknown) => selector(mockStore),
    getState: () => mockStore,
  }
})

const mockUser: User = {
  id: '1',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'doctor',
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should redirect to login if not authenticated', () => {
    const mockStore = authStore.getState()
    mockStore.isAuthenticated = false
    mockStore.user = null

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    )

    // Should redirect to login
    expect(window.location.pathname).toBe('/login')
  })

  it('should render children if authenticated', () => {
    const mockStore = authStore.getState()
    mockStore.isAuthenticated = true
    mockStore.user = mockUser

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('should redirect if role not allowed', () => {
    const mockStore = authStore.getState()
    mockStore.isAuthenticated = true
    mockStore.user = { ...mockUser, role: 'patient' }

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <ProtectedRoute allowedRoles={['admin', 'doctor']}>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    )

    // Should redirect to dashboard
    expect(window.location.pathname).toBe('/dashboard')
  })

  it('should render children if role is allowed', () => {
    const mockStore = authStore.getState()
    mockStore.isAuthenticated = true
    mockStore.user = { ...mockUser, role: 'doctor' }

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <ProtectedRoute allowedRoles={['admin', 'doctor']}>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })
})

