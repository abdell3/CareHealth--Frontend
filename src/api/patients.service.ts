import { axiosInstance } from './axiosInstance'
import { endpoints } from './endpoints'
import type { ApiResponse } from './api.types'
import type {
  Patient,
  PatientsListResponse,
} from '@/types/api'

/**
 * Patients Service
 * Handles all patient-related API calls
 */

export const patientsService = {
  /**
   * Get list of patients
   */
  getPatients: async (params?: {
    page?: number
    limit?: number
    search?: string
    gender?: 'male' | 'female' | 'other'
    city?: string
  }): Promise<ApiResponse<PatientsListResponse>> => {
    const response = await axiosInstance.get<ApiResponse<PatientsListResponse>>(
      endpoints.patients.list,
      { params }
    )
    return response.data
  },

  /**
   * Get patient by ID
   */
  getPatientById: async (id: string): Promise<ApiResponse<Patient>> => {
    const response = await axiosInstance.get<ApiResponse<Patient>>(
      endpoints.patients.detail(id)
    )
    return response.data
  },

  /**
   * Create a new patient
   */
  createPatient: async (data: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Patient>> => {
    const response = await axiosInstance.post<ApiResponse<Patient>>(
      endpoints.patients.list,
      data
    )
    return response.data
  },

  /**
   * Update patient
   */
  updatePatient: async (
    id: string,
    data: Partial<Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<ApiResponse<Patient>> => {
    const response = await axiosInstance.put<ApiResponse<Patient>>(
      endpoints.patients.detail(id),
      data
    )
    return response.data
  },

  /**
   * Delete patient
   */
  deletePatient: async (id: string): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.delete<ApiResponse<void>>(
      endpoints.patients.detail(id)
    )
    return response.data
  },
}





