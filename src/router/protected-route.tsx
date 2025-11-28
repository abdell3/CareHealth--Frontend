import { memo } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { authStore, type User } from '@/store/auth.store'
import { logger } from '@/utils/logger'

type UserRole = User['role']

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
}

export const ProtectedRoute = memo(({ children, allowedRoles }: ProtectedRouteProps) => {
  const isAuthenticated = authStore((state) => state.isAuthenticated)
  const user = authStore((state) => state.user)
  const location = useLocation()

  // If not authenticated, redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Check if specific roles are required and user's role is allowed
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.role)) {
      // User doesn't have required role, log and redirect
      logger.warn('Access denied', {
        userRole: user.role,
        requiredRoles: allowedRoles,
        path: location.pathname,
      })
      // Redirect to dashboard - in a real app, you might want to show a toast/notification here
      return <Navigate to="/dashboard" replace state={{ accessDenied: true }} />
    }
  }

  return <>{children}</>
})

ProtectedRoute.displayName = 'ProtectedRoute'


