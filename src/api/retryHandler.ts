/**
 * Retry Handler
 * Implements exponential backoff retry strategy for failed requests
 */

import { isRetryableError, normalizeError } from './errorHandler'

export interface RetryOptions {
  maxRetries?: number
  baseDelay?: number
  maxDelay?: number
  retryCondition?: (error: unknown, attempt: number) => boolean
}

const DEFAULT_OPTIONS: Required<Omit<RetryOptions, 'retryCondition'>> = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
}

/**
 * Retry a request with exponential backoff
 */
export const retryRequest = async <T>(
  requestFn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> => {
  const { maxRetries, baseDelay, maxDelay, retryCondition } = {
    ...DEFAULT_OPTIONS,
    ...options,
  }

  let lastError: unknown

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn()
    } catch (error) {
      lastError = error

      // Check if we should retry
      const shouldRetry =
        attempt < maxRetries &&
        (retryCondition
          ? retryCondition(error, attempt)
          : isRetryableError(error))

      if (!shouldRetry) {
        break
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay)

      // Add jitter to prevent thundering herd
      const jitter = Math.random() * 0.3 * delay
      const finalDelay = delay + jitter

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, finalDelay))
    }
  }

  // All retries exhausted, throw last error
  throw normalizeError(lastError)
}

/**
 * Create a retry wrapper for axios requests
 */
export const withRetry = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options?: RetryOptions
): T => {
  return ((...args: Parameters<T>) => {
    return retryRequest(() => fn(...args), options)
  }) as T
}

