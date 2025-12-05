/**
 * Helpers Utility Tests
 */

import {
  formatDate,
  formatDateTime,
  formatPhoneNumber,
  formatFileSize,
  capitalize,
  getUserInitials,
  isEmpty,
  debounce,
} from '@/utils/helpers'
import { describe, it, expect, vi, beforeEach, afterEach } from '@jest/globals'

describe('Helper Functions', () => {
  describe('formatDate', () => {
    it('formats date in French', () => {
      const date = new Date('2024-12-15')
      const formatted = formatDate(date)
      
      expect(formatted).toContain('décembre')
      expect(formatted).toContain('2024')
    })

    it('handles string dates', () => {
      const formatted = formatDate('2024-12-15')
      expect(formatted).toBeTruthy()
    })
  })

  describe('formatDateTime', () => {
    it('formats date and time in French', () => {
      const date = new Date('2024-12-15T14:30:00')
      const formatted = formatDateTime(date)
      
      expect(formatted).toContain('décembre')
      expect(formatted).toContain('14')
      expect(formatted).toContain('30')
    })
  })

  describe('formatPhoneNumber', () => {
    it('formats 10-digit phone number', () => {
      expect(formatPhoneNumber('0612345678')).toBe('06 12 34 56 78')
    })

    it('returns original if not 10 digits', () => {
      expect(formatPhoneNumber('123')).toBe('123')
    })

    it('handles already formatted numbers', () => {
      expect(formatPhoneNumber('06 12 34 56 78')).toContain('06')
    })
  })

  describe('formatFileSize', () => {
    it('formats bytes', () => {
      expect(formatFileSize(500)).toBe('500.0 B')
    })

    it('formats kilobytes', () => {
      expect(formatFileSize(2048)).toBe('2.0 KB')
    })

    it('formats megabytes', () => {
      expect(formatFileSize(2097152)).toBe('2.0 MB')
    })
  })

  describe('capitalize', () => {
    it('capitalizes first letter', () => {
      expect(capitalize('hello')).toBe('Hello')
    })

    it('handles already capitalized', () => {
      expect(capitalize('Hello')).toBe('Hello')
    })

    it('handles empty string', () => {
      expect(capitalize('')).toBe('')
    })
  })

  describe('getUserInitials', () => {
    it('returns initials from first and last name', () => {
      expect(getUserInitials('Jean', 'Dupont')).toBe('JD')
    })

    it('handles single name', () => {
      expect(getUserInitials('Jean', '')).toBe('J')
    })
  })

  describe('isEmpty', () => {
    it('returns true for null', () => {
      expect(isEmpty(null)).toBe(true)
    })

    it('returns true for undefined', () => {
      expect(isEmpty(undefined)).toBe(true)
    })

    it('returns true for empty string', () => {
      expect(isEmpty('')).toBe(true)
      expect(isEmpty('   ')).toBe(true)
    })

    it('returns true for empty array', () => {
      expect(isEmpty([])).toBe(true)
    })

    it('returns true for empty object', () => {
      expect(isEmpty({})).toBe(true)
    })

    it('returns false for non-empty values', () => {
      expect(isEmpty('test')).toBe(false)
      expect(isEmpty([1])).toBe(false)
      expect(isEmpty({ key: 'value' })).toBe(false)
      expect(isEmpty(0)).toBe(false)
      expect(isEmpty(false)).toBe(false)
    })
  })

  describe('debounce', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('debounces function calls', () => {
      const mockFn = vi.fn()
      const debouncedFn = debounce(mockFn, 300)

      debouncedFn()
      debouncedFn()
      debouncedFn()

      expect(mockFn).not.toHaveBeenCalled()

      vi.advanceTimersByTime(300)

      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    it('cancels previous calls', () => {
      const mockFn = vi.fn()
      const debouncedFn = debounce(mockFn, 300)

      debouncedFn()
      vi.advanceTimersByTime(200)
      debouncedFn()
      vi.advanceTimersByTime(300)

      expect(mockFn).toHaveBeenCalledTimes(1)
    })
  })
})

