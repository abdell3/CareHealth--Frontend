/**
 * Tests for role-based access utilities
 */
import { describe, it, expect } from '@jest/globals'
import {
  hasRouteAccess,
  getAccessibleRoutes,
  hasRole,
  isAdmin,
  isMedicalStaff,
} from '@/utils/role-based-access'
import type { UserRole } from '@/utils/role-based-access'

describe('hasRouteAccess', () => {
  it('should return true for public routes', () => {
    expect(hasRouteAccess('/login', null)).toBe(true)
  })

  it('should return false if route requires auth and user is null', () => {
    expect(hasRouteAccess('/dashboard', null)).toBe(false)
  })

  it('should return true if user has required role', () => {
    expect(hasRouteAccess('/dashboard', 'admin')).toBe(true)
    expect(hasRouteAccess('/users', 'admin')).toBe(true)
  })

  it('should return false if user does not have required role', () => {
    expect(hasRouteAccess('/users', 'patient')).toBe(false)
  })
})

describe('getAccessibleRoutes', () => {
  it('should return empty array for null role', () => {
    expect(getAccessibleRoutes(null)).toEqual([])
  })

  it('should return accessible routes for admin', () => {
    const routes = getAccessibleRoutes('admin')
    expect(routes).toContain('/dashboard')
    expect(routes).toContain('/users')
    expect(routes).toContain('/patients')
  })

  it('should return accessible routes for patient', () => {
    const routes = getAccessibleRoutes('patient')
    expect(routes).toContain('/dashboard')
    expect(routes).toContain('/appointments')
    expect(routes).not.toContain('/users')
  })
})

describe('hasRole', () => {
  it('should return true if user has one of required roles', () => {
    expect(hasRole('admin', ['admin', 'doctor'])).toBe(true)
    expect(hasRole('doctor', ['admin', 'doctor'])).toBe(true)
  })

  it('should return false if user does not have required role', () => {
    expect(hasRole('patient', ['admin', 'doctor'])).toBe(false)
  })

  it('should return false for null role', () => {
    expect(hasRole(null, ['admin'])).toBe(false)
  })
})

describe('isAdmin', () => {
  it('should return true for admin role', () => {
    expect(isAdmin('admin')).toBe(true)
  })

  it('should return false for other roles', () => {
    expect(isAdmin('doctor')).toBe(false)
    expect(isAdmin('patient')).toBe(false)
  })

  it('should return false for null', () => {
    expect(isAdmin(null)).toBe(false)
  })
})

describe('isMedicalStaff', () => {
  it('should return true for doctor', () => {
    expect(isMedicalStaff('doctor')).toBe(true)
  })

  it('should return true for nurse', () => {
    expect(isMedicalStaff('nurse')).toBe(true)
  })

  it('should return false for other roles', () => {
    expect(isMedicalStaff('admin')).toBe(false)
    expect(isMedicalStaff('patient')).toBe(false)
  })

  it('should return false for null', () => {
    expect(isMedicalStaff(null)).toBe(false)
  })
})

