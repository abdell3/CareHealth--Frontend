/**
 * Tests for logger utility
 */
import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { logger } from '@/utils/logger'

describe('Logger', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Mock console methods
    jest.spyOn(console, 'debug').mockImplementation(() => {})
    jest.spyOn(console, 'info').mockImplementation(() => {})
    jest.spyOn(console, 'warn').mockImplementation(() => {})
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('should log debug message in development', () => {
    logger.debug('Debug message', { data: 'test' })
    expect(console.debug).toHaveBeenCalled()
  })

  it('should log info message in development', () => {
    logger.info('Info message', { data: 'test' })
    expect(console.info).toHaveBeenCalled()
  })

  it('should log warn message in development', () => {
    logger.warn('Warning message', { data: 'test' })
    expect(console.warn).toHaveBeenCalled()
  })

  it('should log error message in development', () => {
    logger.error('Error message', new Error('Test error'))
    expect(console.error).toHaveBeenCalled()
  })

  it('should format error correctly', () => {
    const error = new Error('Test error')
    logger.error('Error occurred', error)

    expect(console.error).toHaveBeenCalledWith(
      expect.objectContaining({
        level: 'error',
        message: 'Error occurred',
        data: expect.objectContaining({
          message: 'Test error',
          name: 'Error',
        }),
      })
    )
  })

  it('should include timestamp in log entry', () => {
    logger.info('Test message')
    expect(console.info).toHaveBeenCalledWith(
      expect.objectContaining({
        timestamp: expect.any(String),
      })
    )
  })
})

