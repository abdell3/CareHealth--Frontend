export type UserRole = 'admin' | 'doctor' | 'nurse' | 'patient' | 'receptionist'

export interface RoutePermissions {
  roles: UserRole[]
  requiresAuth: boolean
}

/**
 * Route permissions mapping
 */
export const routePermissions: Record<string, RoutePermissions> = {
  '/dashboard': {
    roles: ['admin', 'doctor', 'nurse', 'patient', 'receptionist'],
    requiresAuth: true,
  },
  '/profile': {
    roles: ['admin', 'doctor', 'nurse', 'patient', 'receptionist'],
    requiresAuth: true,
  },
  '/appointments': {
    roles: ['admin', 'doctor', 'nurse', 'patient', 'receptionist'],
    requiresAuth: true,
  },
  '/appointments/new': {
    roles: ['admin', 'doctor', 'nurse', 'receptionist'],
    requiresAuth: true,
  },
  '/patients': {
    roles: ['admin', 'doctor', 'nurse', 'receptionist'],
    requiresAuth: true,
  },
  '/users': {
    roles: ['admin'],
    requiresAuth: true,
  },
  '/prescriptions': {
    roles: ['admin', 'doctor', 'nurse'],
    requiresAuth: true,
  },
  '/lab-orders': {
    roles: ['admin', 'doctor', 'nurse'],
    requiresAuth: true,
  },
  '/documents': {
    roles: ['admin', 'doctor', 'nurse', 'patient', 'receptionist'],
    requiresAuth: true,
  },
}

/**
 * Check if user has access to a route
 */
export const hasRouteAccess = (
  route: string,
  userRole: UserRole | null
): boolean => {
  const permissions = routePermissions[route]

  if (!permissions) {
    // Route not in mapping, allow access (public route)
    return true
  }

  if (permissions.requiresAuth && !userRole) {
    return false
  }

  if (!permissions.requiresAuth) {
    return true
  }

  return permissions.roles.includes(userRole as UserRole)
}

/**
 * Get accessible routes for a role
 */
export const getAccessibleRoutes = (role: UserRole | null): string[] => {
  if (!role) return []

  return Object.entries(routePermissions)
    .filter(([, permissions]) => permissions.roles.includes(role))
    .map(([route]) => route)
}

/**
 * Check if user has specific role
 */
export const hasRole = (
  userRole: UserRole | null,
  requiredRoles: UserRole[]
): boolean => {
  if (!userRole) return false
  return requiredRoles.includes(userRole)
}

/**
 * Check if user is admin
 */
export const isAdmin = (userRole: UserRole | null): boolean => {
  return userRole === 'admin'
}

/**
 * Check if user is medical staff (doctor or nurse)
 */
export const isMedicalStaff = (userRole: UserRole | null): boolean => {
  return userRole === 'doctor' || userRole === 'nurse'
}


