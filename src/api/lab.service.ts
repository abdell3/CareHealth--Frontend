import { axiosInstance } from './axiosInstance'
import { endpoints } from './endpoints'
import type { ApiResponse } from './api.types'
import type {
  LabOrder,
  LabOrdersListResponse,
  CreateLabOrderRequest,
  LabResult,
} from '@/types/api'

/**
 * Laboratory Service
 * Handles all lab order-related API calls
 */

export const labService = {
  /**
   * Get list of lab orders
   */
  getLabOrders: async (params?: {
    page?: number
    limit?: number
    patientId?: string
    doctorId?: string
    status?: LabOrder['status']
  }): Promise<ApiResponse<LabOrdersListResponse>> => {
    const response = await axiosInstance.get<ApiResponse<LabOrdersListResponse>>(
      endpoints.laboratory.orders,
      { params }
    )
    return response.data
  },

  /**
   * Get lab order by ID
   */
  getLabOrderById: async (id: string): Promise<ApiResponse<LabOrder>> => {
    const response = await axiosInstance.get<ApiResponse<LabOrder>>(
      endpoints.laboratory.order(id)
    )
    return response.data
  },

  /**
   * Create a new lab order
   */
  createLabOrder: async (
    data: CreateLabOrderRequest
  ): Promise<ApiResponse<LabOrder>> => {
    const response = await axiosInstance.post<ApiResponse<LabOrder>>(
      endpoints.laboratory.orders,
      data
    )
    return response.data
  },

  /**
   * Update lab order
   */
  updateLabOrder: async (
    id: string,
    data: Partial<Omit<LabOrder, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<ApiResponse<LabOrder>> => {
    const response = await axiosInstance.put<ApiResponse<LabOrder>>(
      endpoints.laboratory.order(id),
      data
    )
    return response.data
  },

  /**
   * Delete lab order
   */
  deleteLabOrder: async (id: string): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.delete<ApiResponse<void>>(
      endpoints.laboratory.order(id)
    )
    return response.data
  },

  /**
   * Upload lab results file
   */
  uploadLabResults: async (
    orderId: string,
    file: File,
    results?: LabResult[]
  ): Promise<ApiResponse<LabOrder>> => {
    const formData = new FormData()
    formData.append('file', file)
    if (results) {
      formData.append('results', JSON.stringify(results))
    }

    const response = await axiosInstance.post<ApiResponse<LabOrder>>(
      `${endpoints.laboratory.order(orderId)}/results`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    return response.data
  },

  /**
   * Add lab results to an order
   */
  addLabResults: async (
    orderId: string,
    results: LabResult[]
  ): Promise<ApiResponse<LabOrder>> => {
    const response = await axiosInstance.post<ApiResponse<LabOrder>>(
      `${endpoints.laboratory.order(orderId)}/results`,
      { results }
    )
    return response.data
  },

  /**
   * Upload multiple lab result files
   */
  uploadLabResultFiles: async (
    orderId: string,
    files: File[],
    metadata?: Array<{
      testCode?: string
      sampleDate?: string
      technicianNotes?: string
      isCritical?: boolean
    }>
  ): Promise<ApiResponse<LabOrder>> => {
    const formData = new FormData()
    files.forEach((file, index) => {
      formData.append('files', file)
      if (metadata && metadata[index]) {
        formData.append(`metadata[${index}]`, JSON.stringify(metadata[index]))
      }
    })

    const response = await axiosInstance.post<ApiResponse<LabOrder>>(
      `${endpoints.laboratory.order(orderId)}/results/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    return response.data
  },

  /**
   * Validate lab results
   */
  validateResults: async (
    orderId: string,
    resultIds: string[],
    comments?: string
  ): Promise<ApiResponse<LabOrder>> => {
    const response = await axiosInstance.put<ApiResponse<LabOrder>>(
      `${endpoints.laboratory.order(orderId)}/results/validate`,
      { resultIds, comments }
    )
    return response.data
  },

  /**
   * Mark order as received
   */
  markOrderReceived: async (orderId: string): Promise<ApiResponse<LabOrder>> => {
    const response = await axiosInstance.post<ApiResponse<LabOrder>>(
      `${endpoints.laboratory.order(orderId)}/receive`
    )
    return response.data
  },
}





