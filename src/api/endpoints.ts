const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

export const endpoints = {
  // Auth endpoints
  auth: {
    login: `${API_BASE_URL}/auth/login`,
    register: `${API_BASE_URL}/auth/register`,
    logout: `${API_BASE_URL}/auth/logout`,
    refresh: `${API_BASE_URL}/auth/refresh`,
    forgotPassword: `${API_BASE_URL}/auth/forgot-password`,
    resetPassword: `${API_BASE_URL}/auth/reset-password`,
    verifyEmail: `${API_BASE_URL}/auth/verify-email`,
    me: `${API_BASE_URL}/auth/me`,
  },

  // Users endpoints
  users: {
    list: `${API_BASE_URL}/users`,
    detail: (id: string) => `${API_BASE_URL}/users/${id}`,
    create: `${API_BASE_URL}/users`,
    update: (id: string) => `${API_BASE_URL}/users/${id}`,
    delete: (id: string) => `${API_BASE_URL}/users/${id}`,
  },

  // Patients endpoints
  patients: {
    list: `${API_BASE_URL}/patients`,
    detail: (id: string) => `${API_BASE_URL}/patients/${id}`,
    create: `${API_BASE_URL}/patients`,
    update: (id: string) => `${API_BASE_URL}/patients/${id}`,
    delete: (id: string) => `${API_BASE_URL}/patients/${id}`,
  },

  // Appointments endpoints
  appointments: {
    list: `${API_BASE_URL}/appointments`,
    detail: (id: string) => `${API_BASE_URL}/appointments/${id}`,
    create: `${API_BASE_URL}/appointments`,
    update: (id: string) => `${API_BASE_URL}/appointments/${id}`,
    delete: (id: string) => `${API_BASE_URL}/appointments/${id}`,
    cancel: (id: string) => `${API_BASE_URL}/appointments/${id}/cancel`,
  },

  // Prescriptions endpoints
  prescriptions: {
    list: `${API_BASE_URL}/prescriptions`,
    detail: (id: string) => `${API_BASE_URL}/prescriptions/${id}`,
    create: `${API_BASE_URL}/prescriptions`,
    update: (id: string) => `${API_BASE_URL}/prescriptions/${id}`,
    delete: (id: string) => `${API_BASE_URL}/prescriptions/${id}`,
  },

  // Lab orders endpoints
  labOrders: {
    list: `${API_BASE_URL}/lab-orders`,
    detail: (id: string) => `${API_BASE_URL}/lab-orders/${id}`,
    create: `${API_BASE_URL}/lab-orders`,
    update: (id: string) => `${API_BASE_URL}/lab-orders/${id}`,
    delete: (id: string) => `${API_BASE_URL}/lab-orders/${id}`,
  },

  // Documents endpoints
  documents: {
    list: `${API_BASE_URL}/documents`,
    detail: (id: string) => `${API_BASE_URL}/documents/${id}`,
    upload: `${API_BASE_URL}/documents/upload`,
    delete: (id: string) => `${API_BASE_URL}/documents/${id}`,
    download: (id: string) => `${API_BASE_URL}/documents/${id}/download`,
  },
} as const

export default endpoints


