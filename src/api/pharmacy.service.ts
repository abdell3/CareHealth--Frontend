import { axiosInstance } from './axiosInstance'
import { endpoints } from './endpoints'
import type { ApiResponse } from './api.types'
import type {
  Prescription,
  PrescriptionsListResponse,
  CreatePrescriptionRequest,
} from '@/types/api'

/**
 * Pharmacy Service (Prescriptions)
 * Handles all prescription-related API calls
 */

export const pharmacyService = {
  /**
   * Get list of prescriptions
   */
  getPrescriptions: async (params?: {
    page?: number
    limit?: number
    patientId?: string
    doctorId?: string
    status?: Prescription['status']
  }): Promise<ApiResponse<PrescriptionsListResponse>> => {
    const response = await axiosInstance.get<ApiResponse<PrescriptionsListResponse>>(
      endpoints.prescriptions.list,
      { params }
    )
    return response.data
  },

  /**
   * Get prescription by ID
   */
  getPrescriptionById: async (id: string): Promise<ApiResponse<Prescription>> => {
    const response = await axiosInstance.get<ApiResponse<Prescription>>(
      endpoints.prescriptions.detail(id)
    )
    return response.data
  },

  /**
   * Create a new prescription
   */
  createPrescription: async (
    data: CreatePrescriptionRequest
  ): Promise<ApiResponse<Prescription>> => {
    const response = await axiosInstance.post<ApiResponse<Prescription>>(
      endpoints.prescriptions.list,
      data
    )
    return response.data
  },

  /**
   * Update prescription
   */
  updatePrescription: async (
    id: string,
    data: Partial<Omit<Prescription, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<ApiResponse<Prescription>> => {
    const response = await axiosInstance.put<ApiResponse<Prescription>>(
      endpoints.prescriptions.detail(id),
      data
    )
    return response.data
  },

  /**
   * Delete prescription
   */
  deletePrescription: async (id: string): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.delete<ApiResponse<void>>(
      endpoints.prescriptions.detail(id)
    )
    return response.data
  },

  /**
   * Assign pharmacy to prescription
   */
  assignPharmacy: async (
    prescriptionId: string,
    pharmacyId: string
  ): Promise<ApiResponse<Prescription>> => {
    const response = await axiosInstance.post<ApiResponse<Prescription>>(
      `${endpoints.prescriptions.detail(prescriptionId)}/assign-pharmacy`,
      { pharmacyId }
    )
    return response.data
  },

  /**
   * Mark prescription as ready
   */
  markReady: async (prescriptionId: string): Promise<ApiResponse<Prescription>> => {
    const response = await axiosInstance.post<ApiResponse<Prescription>>(
      `${endpoints.prescriptions.detail(prescriptionId)}/mark-ready`
    )
    return response.data
  },

  /**
   * Mark prescription as unavailable
   */
  markUnavailable: async (
    prescriptionId: string,
    reason?: string
  ): Promise<ApiResponse<Prescription>> => {
    const response = await axiosInstance.post<ApiResponse<Prescription>>(
      `${endpoints.prescriptions.detail(prescriptionId)}/mark-unavailable`,
      { reason }
    )
    return response.data
  },

  /**
   * Mark prescription as dispensed
   */
  markDispensed: async (prescriptionId: string): Promise<ApiResponse<Prescription>> => {
    const response = await axiosInstance.post<ApiResponse<Prescription>>(
      `${endpoints.prescriptions.detail(prescriptionId)}/mark-dispensed`
    )
    return response.data
  },

  /**
   * Check medication stock in pharmacy
   */
  checkStock: async (
    pharmacyId: string,
    medicationIds: string[]
  ): Promise<ApiResponse<{ medicationId: string; available: boolean; quantity?: number }[]>> => {
    const response = await axiosInstance.post<ApiResponse<{ medicationId: string; available: boolean; quantity?: number }[]>>(
      `${endpoints.pharmacy}/check-stock`,
      { pharmacyId, medicationIds }
    )
    return response.data
  },
}





