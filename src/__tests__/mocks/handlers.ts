/**
 * MSW Request Handlers
 * Mock API responses for testing
 */

import { http, HttpResponse } from 'msw'

const API_BASE_URL = 'http://localhost:5000/api/v1'

// Mock data
const mockDoctorUser = {
  id: '1',
  email: 'doctor@example.com',
  firstName: 'Jean',
  lastName: 'Dupont',
  role: 'doctor' as const,
  profile: {
    specialization: 'Cardiologie',
    phone: '0612345678',
  },
}

const mockPatient = {
  id: '1',
  firstName: 'Marie',
  lastName: 'Martin',
  email: 'marie.martin@example.com',
  phone: '0612345678',
  dateOfBirth: '1990-01-15',
  gender: 'female' as const,
  address: {
    street: '123 Rue de la Santé',
    city: 'Paris',
    zipCode: '75001',
  },
  createdAt: '2024-01-01T00:00:00Z',
}

const mockPatients = Array.from({ length: 10 }, (_, i) => ({
  ...mockPatient,
  id: String(i + 1),
  firstName: `Patient${i + 1}`,
  lastName: `Test${i + 1}`,
}))

const mockAppointment = {
  id: '1',
  patientId: '1',
  patient: mockPatient,
  doctorId: '1',
  doctor: mockDoctorUser,
  date: '2024-12-20',
  time: '10:00',
  duration: 30,
  type: 'consultation' as const,
  status: 'scheduled' as const,
  createdAt: '2024-12-01T00:00:00Z',
}

const mockNotification = {
  id: '1',
  userId: '1',
  type: 'appointment' as const,
  priority: 'info' as const,
  status: 'unread' as const,
  title: 'Nouveau rendez-vous',
  message: 'Vous avez un rendez-vous demain à 10h',
  channels: ['in-app'] as const[],
  createdAt: new Date().toISOString(),
}

export const handlers = [
  // Auth endpoints
  http.post(`${API_BASE_URL}/auth/login`, async ({ request }) => {
    const body = await request.json() as { email: string; password: string }
    
    if (body.email === 'doctor@example.com' && body.password === 'Password123!') {
      return HttpResponse.json({
        status: 'success',
        data: {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
          user: mockDoctorUser,
        },
      })
    }
    
    return HttpResponse.json(
      {
        status: 'error',
        message: 'Invalid credentials',
      },
      { status: 401 }
    )
  }),

  http.post(`${API_BASE_URL}/auth/refresh`, () => {
    return HttpResponse.json({
      status: 'success',
      data: {
        accessToken: 'new-mock-access-token',
      },
    })
  }),

  http.post(`${API_BASE_URL}/auth/logout`, () => {
    return HttpResponse.json({
      status: 'success',
    })
  }),

  http.get(`${API_BASE_URL}/auth/me`, () => {
    return HttpResponse.json({
      status: 'success',
      data: mockDoctorUser,
    })
  }),

  // Patients endpoints
  http.get(`${API_BASE_URL}/patients`, ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')
    const search = url.searchParams.get('search') || ''

    let filteredPatients = mockPatients

    if (search) {
      filteredPatients = mockPatients.filter(
        (p) =>
          p.firstName.toLowerCase().includes(search.toLowerCase()) ||
          p.lastName.toLowerCase().includes(search.toLowerCase()) ||
          p.email.toLowerCase().includes(search.toLowerCase())
      )
    }

    const start = (page - 1) * limit
    const end = start + limit
    const paginatedPatients = filteredPatients.slice(start, end)

    return HttpResponse.json({
      status: 'success',
      data: {
        patients: paginatedPatients,
        total: filteredPatients.length,
        page,
        limit,
        totalPages: Math.ceil(filteredPatients.length / limit),
      },
    })
  }),

  http.get(`${API_BASE_URL}/patients/:id`, ({ params }) => {
    const { id } = params
    return HttpResponse.json({
      status: 'success',
      data: {
        ...mockPatient,
        id: String(id),
      },
    })
  }),

  http.post(`${API_BASE_URL}/patients`, async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json({
      status: 'success',
      data: {
        ...mockPatient,
        ...body,
        id: String(mockPatients.length + 1),
      },
    })
  }),

  // Appointments endpoints
  http.get(`${API_BASE_URL}/appointments`, () => {
    return HttpResponse.json({
      status: 'success',
      data: {
        appointments: [mockAppointment],
        total: 1,
        page: 1,
        limit: 10,
      },
    })
  }),

  // Notifications endpoints
  http.get(`${API_BASE_URL}/notifications`, () => {
    return HttpResponse.json({
      status: 'success',
      data: {
        notifications: [mockNotification],
        total: 1,
        unreadCount: 1,
        page: 1,
        limit: 10,
      },
    })
  }),

  http.put(`${API_BASE_URL}/notifications/:id/read`, () => {
    return HttpResponse.json({
      status: 'success',
      data: {
        ...mockNotification,
        status: 'read',
        readAt: new Date().toISOString(),
      },
    })
  }),

  // Search endpoint
  http.get(`${API_BASE_URL}/search`, ({ request }) => {
    const url = new URL(request.url)
    const q = url.searchParams.get('q') || ''

    const results = [
      {
        type: 'patient' as const,
        id: '1',
        title: 'Marie Martin',
        description: 'Patient - marie.martin@example.com',
        relevance: 0.9,
        metadata: {
          patientId: '1',
        },
        actions: [
          {
            label: 'Voir',
            url: '/dashboard/patients/1',
          },
        ],
      },
    ]

    return HttpResponse.json({
      status: 'success',
      data: {
        results: q ? results : [],
        suggestions: q ? ['Marie Martin', 'Patient test'] : [],
        filters: [],
        total: q ? 1 : 0,
        byType: {
          patient: q ? 1 : 0,
          appointment: 0,
          prescription: 0,
          document: 0,
          lab: 0,
        },
      },
    })
  }),
]

