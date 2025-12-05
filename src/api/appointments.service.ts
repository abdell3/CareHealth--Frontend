import { axiosInstance } from './axiosInstance'
import { endpoints } from './endpoints'
import type { ApiResponse } from './api.types'
import type {
  Appointment,
  AppointmentsListResponse,
  CreateAppointmentRequest,
} from '@/types/api'

/**
 * Appointments Service
 * Handles all appointment-related API calls
 */

export const appointmentsService = {
  /**
   * Get list of appointments
   */
  getAppointments: async (params?: {
    page?: number
    limit?: number
    patientId?: string
    doctorId?: string
    status?: Appointment['status']
    date?: string
  }): Promise<ApiResponse<AppointmentsListResponse>> => {
    const response = await axiosInstance.get<ApiResponse<AppointmentsListResponse>>(
      endpoints.appointments.list,
      { params }
    )
    return response.data
  },

  /**
   * Get appointment by ID
   */
  getAppointmentById: async (id: string): Promise<ApiResponse<Appointment>> => {
    const response = await axiosInstance.get<ApiResponse<Appointment>>(
      endpoints.appointments.detail(id)
    )
    return response.data
  },

  /**
   * Create a new appointment
   */
  createAppointment: async (
    data: CreateAppointmentRequest
  ): Promise<ApiResponse<Appointment>> => {
    const response = await axiosInstance.post<ApiResponse<Appointment>>(
      endpoints.appointments.list,
      data
    )
    return response.data
  },

  /**
   * Update appointment
   */
  updateAppointment: async (
    id: string,
    data: Partial<Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<ApiResponse<Appointment>> => {
    const response = await axiosInstance.put<ApiResponse<Appointment>>(
      endpoints.appointments.detail(id),
      data
    )
    return response.data
  },

  /**
   * Delete appointment
   */
  deleteAppointment: async (id: string): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.delete<ApiResponse<void>>(
      endpoints.appointments.detail(id)
    )
    return response.data
  },

  /**
   * Move appointment (drag & drop)
   */
  moveAppointment: async (
    id: string,
    newStart: Date,
    newResourceId?: string
  ): Promise<ApiResponse<Appointment>> => {
    const response = await axiosInstance.post<ApiResponse<Appointment>>(
      `${endpoints.appointments.detail(id)}/move`,
      {
        newStart: newStart.toISOString(),
        newResourceId,
      }
    )
    return response.data
  },

  /**
   * Resize appointment (change duration)
   */
  resizeAppointment: async (
    id: string,
    newDuration: number
  ): Promise<ApiResponse<Appointment>> => {
    const response = await axiosInstance.post<ApiResponse<Appointment>>(
      `${endpoints.appointments.detail(id)}/resize`,
      { newDuration }
    )
    return response.data
  },

  /**
   * Check availability
   */
  checkAvailability: async (params: {
    resourceId: string
    date: string
    duration: number
    excludeAppointmentId?: string
  }): Promise<ApiResponse<{ available: boolean; conflicts: string[] }>> => {
    const response = await axiosInstance.get<ApiResponse<{ available: boolean; conflicts: string[] }>>(
      `${endpoints.appointments.list}/availability`,
      { params }
    )
    return response.data
  },

  /**
   * Bulk operations
   */
  bulkUpdateAppointments: async (
    appointmentIds: string[],
    updates: Partial<Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<ApiResponse<{ updated: number; errors: string[] }>> => {
    const response = await axiosInstance.post<ApiResponse<{ updated: number; errors: string[] }>>(
      `${endpoints.appointments.list}/bulk`,
      { appointmentIds, updates }
    )
    return response.data
  },
}





