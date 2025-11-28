/**
 * Logger utility for production-safe logging
 * Replaces console.log/error/warn with environment-aware logging
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  message: string
  data?: unknown
  timestamp: string
}

class Logger {
  private isDevelopment = import.meta.env.DEV
  private isProduction = import.meta.env.PROD

  private formatMessage(level: LogLevel, message: string, data?: unknown): LogEntry {
    return {
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
    }
  }

  private log(level: LogLevel, message: string, data?: unknown): void {
    const entry = this.formatMessage(level, message, data)

    // In development, log to console
    if (this.isDevelopment) {
      switch (level) {
        case 'debug':
          console.debug(entry)
          break
        case 'info':
          console.info(entry)
          break
        case 'warn':
          console.warn(entry)
          break
        case 'error':
          console.error(entry)
          break
      }
    }

    // In production, only log errors (and send to error tracking service)
    if (this.isProduction && level === 'error') {
      // TODO: Integrate with error tracking service (Sentry, LogRocket, etc.)
      // For now, we silently log errors in production
      // In a real app, you would send this to your error tracking service
    }
  }

  debug(message: string, data?: unknown): void {
    this.log('debug', message, data)
  }

  info(message: string, data?: unknown): void {
    this.log('info', message, data)
  }

  warn(message: string, data?: unknown): void {
    this.log('warn', message, data)
  }

  error(message: string, error?: unknown): void {
    const errorData =
      error instanceof Error
        ? {
            message: error.message,
            stack: error.stack,
            name: error.name,
          }
        : error

    this.log('error', message, errorData)
  }
}

export const logger = new Logger()

