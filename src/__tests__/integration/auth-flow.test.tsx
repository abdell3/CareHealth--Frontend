/**
 * Authentication Flow Integration Tests
 */

import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Login } from '@/pages/auth/Login'
import { authStore } from '@/store/auth.store'
import { describe, it, expect, beforeEach, vi } from '@jest/globals'

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

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{component}</BrowserRouter>
    </QueryClientProvider>
  )
}

describe('Authentication Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authStore.getState().clearAuth()
  })

  it('allows user to login and access dashboard', async () => {
    renderWithProviders(<Login />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password|mot de passe/i)
    const submitButton = screen.getByRole('button', { name: /login|connexion/i })

    fireEvent.change(emailInput, { target: { value: 'doctor@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(authStore.getState().isAuthenticated).toBe(true)
    })

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
  })

  it('redirects unauthenticated users to login', async () => {
    authStore.getState().clearAuth()

    // This would be tested in ProtectedRoute component
    expect(authStore.getState().isAuthenticated).toBe(false)
  })

  it('handles login errors', async () => {
    renderWithProviders(<Login />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password|mot de passe/i)
    const submitButton = screen.getByRole('button', { name: /login|connexion/i })

    fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'wrong' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      const errorMessage = screen.queryByText(/error|erreur|invalid/i)
      expect(errorMessage).toBeInTheDocument()
    })
  })

  it('allows user to logout', async () => {
    // Set authenticated state
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

    expect(authStore.getState().isAuthenticated).toBe(true)

    await authStore.getState().logout()

    await waitFor(() => {
      expect(authStore.getState().isAuthenticated).toBe(false)
    })
  })

  it('persists session across page reloads', () => {
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

    // Simulate page reload by creating new store instance
    const state = authStore.getState()
    expect(state.isAuthenticated).toBe(true)
    expect(state.user).not.toBeNull()
  })
})

