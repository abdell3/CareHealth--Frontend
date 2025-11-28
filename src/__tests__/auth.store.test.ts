/**
 * Tests for auth store
 */
import { describe, it, expect, beforeEach } from '@jest/globals'
import { authStore } from '@/store/auth.store'
import type { User } from '@/store/auth.store'

const mockUser: User = {
  id: '1',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'doctor',
}

describe('authStore', () => {
  beforeEach(() => {
    // Clear auth before each test
    authStore.getState().clearAuth()
  })

  it('should have initial state', () => {
    const state = authStore.getState()
    expect(state.accessToken).toBeNull()
    expect(state.refreshToken).toBeNull()
    expect(state.user).toBeNull()
    expect(state.isAuthenticated).toBe(false)
  })

  it('should set auth correctly', () => {
    authStore.getState().setAuth({
      user: mockUser,
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    })

    const state = authStore.getState()
    expect(state.accessToken).toBe('access-token')
    expect(state.refreshToken).toBe('refresh-token')
    expect(state.user).toEqual(mockUser)
    expect(state.isAuthenticated).toBe(true)
  })

  it('should clear auth correctly', () => {
    // First set auth
    authStore.getState().setAuth({
      user: mockUser,
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    })

    // Then clear
    authStore.getState().clearAuth()

    const state = authStore.getState()
    expect(state.accessToken).toBeNull()
    expect(state.refreshToken).toBeNull()
    expect(state.user).toBeNull()
    expect(state.isAuthenticated).toBe(false)
  })

  it('should get access token', () => {
    authStore.getState().setAuth({
      user: mockUser,
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    })

    expect(authStore.getState().getAccessToken()).toBe('access-token')
  })

  it('should get refresh token', () => {
    authStore.getState().setAuth({
      user: mockUser,
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    })

    expect(authStore.getState().getRefreshToken()).toBe('refresh-token')
  })

  it('should get user', () => {
    authStore.getState().setAuth({
      user: mockUser,
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    })

    expect(authStore.getState().getUser()).toEqual(mockUser)
  })
})

