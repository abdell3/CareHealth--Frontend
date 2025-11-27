import { Navigate, useLocation } from 'react-router-dom'
import { authStore } from '@/store/auth.store'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: string[]
}

export const ProtectedRoute = ({
  children,
  allowedRoles,
}: ProtectedRouteProps) => {
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
      // User doesn't have required role, redirect to dashboard with access denied
      // Note: In a real app, you might want to show a toast/notification here
      return <Navigate to="/dashboard" replace />
    }
  }

  return <>{children}</>
}


