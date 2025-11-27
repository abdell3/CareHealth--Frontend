import { Navigate, useLocation } from 'react-router-dom'
import { authStore } from '@/store/auth.store'
import { hasRouteAccess } from '@/utils/role-based-access'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: string[]
}

export const ProtectedRoute = ({
  children,
  requiredRole,
}: ProtectedRouteProps) => {
  const isAuthenticated = authStore((state) => state.isAuthenticated)
  const user = authStore((state) => state.user)
  const location = useLocation()

  // If not authenticated, redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Check route access based on role
  if (!hasRouteAccess(location.pathname, user.role)) {
    // User doesn't have access, redirect to dashboard
    return <Navigate to="/dashboard" replace />
  }

  // Check if specific role is required
  if (
    requiredRole &&
    !requiredRole.includes(user.role) &&
    user.role !== 'admin'
  ) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}


