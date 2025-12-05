// Endpoints are relative paths since axios baseURL includes /api/v1
export const endpoints = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
    requestPasswordReset: '/auth/request-password-reset',
    resetPassword: '/auth/reset-password',
    me: '/auth/me',
  },
  users: {
    list: '/users',
    detail: (id: string) => `/users/${id}`,
  },
  patients: {
    list: '/patients',
    detail: (id: string) => `/patients/${id}`,
  },
  appointments: {
    list: '/appointments',
    detail: (id: string) => `/appointments/${id}`,
  },
  prescriptions: {
    list: '/prescriptions',
    detail: (id: string) => `/prescriptions/${id}`,
  },
  laboratory: {
    orders: '/laboratory',
    order: (id: string) => `/laboratory/${id}`,
  },
  documents: {
    list: '/documents',
    upload: '/documents',
    download: (id: string) => `/documents/${id}/download`,
  },
  pharmacy: '/pharmacy',
  notifications: {
    list: '/notifications',
    detail: (id: string) => `/notifications/${id}`,
    markRead: (id: string) => `/notifications/${id}/read`,
    markAllRead: '/notifications/read-all',
    stats: '/notifications/stats',
    preferences: '/notifications/preferences',
  },
  search: {
    global: '/search',
    suggestions: '/search/suggestions',
  },
} as const

export default endpoints


