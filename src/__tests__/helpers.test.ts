/**
 * Tests for helper functions
 */
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals'
import {
  formatDate,
  formatDateTime,
  formatPhoneNumber,
  debounce,
  capitalize,
  getUserInitials,
  isEmpty,
} from '@/utils/helpers'

describe('formatDate', () => {
  it('should format date correctly', () => {
    const date = new Date('2024-01-15')
    const formatted = formatDate(date)
    expect(formatted).toContain('15')
    expect(formatted).toContain('janvier')
    expect(formatted).toContain('2024')
  })

  it('should format date string', () => {
    const formatted = formatDate('2024-01-15')
    expect(formatted).toContain('15')
  })
})

describe('formatDateTime', () => {
  it('should format date and time correctly', () => {
    const date = new Date('2024-01-15T14:30:00')
    const formatted = formatDateTime(date)
    expect(formatted).toContain('15')
    expect(formatted).toContain('janvier')
    expect(formatted).toContain('2024')
  })
})

describe('formatPhoneNumber', () => {
  it('should format 10-digit phone number', () => {
    expect(formatPhoneNumber('0612345678')).toBe('06 12 34 56 78')
  })

  it('should return original if not 10 digits', () => {
    expect(formatPhoneNumber('123')).toBe('123')
  })

  it('should handle already formatted numbers', () => {
    expect(formatPhoneNumber('06 12 34 56 78')).toBe('06 12 34 56 78')
  })
})

describe('debounce', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should debounce function calls', () => {
    const func = jest.fn()
    const debouncedFunc = debounce(func, 100)

    debouncedFunc()
    debouncedFunc()
    debouncedFunc()

    expect(func).not.toHaveBeenCalled()

    jest.advanceTimersByTime(100)

    expect(func).toHaveBeenCalledTimes(1)
  })
})

describe('capitalize', () => {
  it('should capitalize first letter', () => {
    expect(capitalize('hello')).toBe('Hello')
    expect(capitalize('WORLD')).toBe('World')
  })
})

describe('getUserInitials', () => {
  it('should return user initials', () => {
    expect(getUserInitials('John', 'Doe')).toBe('JD')
  })

  it('should handle single name', () => {
    expect(getUserInitials('John', '')).toBe('J')
  })
})

describe('isEmpty', () => {
  it('should return true for null', () => {
    expect(isEmpty(null)).toBe(true)
  })

  it('should return true for undefined', () => {
    expect(isEmpty(undefined)).toBe(true)
  })

  it('should return true for empty string', () => {
    expect(isEmpty('')).toBe(true)
    expect(isEmpty('   ')).toBe(true)
  })

  it('should return true for empty array', () => {
    expect(isEmpty([])).toBe(true)
  })

  it('should return true for empty object', () => {
    expect(isEmpty({})).toBe(true)
  })

  it('should return false for non-empty values', () => {
    expect(isEmpty('hello')).toBe(false)
    expect(isEmpty([1])).toBe(false)
    expect(isEmpty({ a: 1 })).toBe(false)
    expect(isEmpty(0)).toBe(false)
  })
})

