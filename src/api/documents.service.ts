import { axiosInstance } from './axiosInstance'
import { endpoints } from './endpoints'
import type { ApiResponse } from './api.types'
import type {
  Document,
  DocumentsListResponse,
  UploadDocumentRequest,
} from '@/types/api'

/**
 * Documents Service
 * Handles all document-related API calls including file uploads and downloads
 */

export const documentsService = {
  /**
   * Get list of documents
   */
  getDocuments: async (params?: {
    page?: number
    limit?: number
    patientId?: string
    category?: Document['category']
    search?: string
  }): Promise<ApiResponse<DocumentsListResponse>> => {
    const response = await axiosInstance.get<ApiResponse<DocumentsListResponse>>(
      endpoints.documents.list,
      { params }
    )
    return response.data
  },

  /**
   * Get document by ID
   */
  getDocumentById: async (id: string): Promise<ApiResponse<Document>> => {
    const response = await axiosInstance.get<ApiResponse<Document>>(
      `${endpoints.documents.list}/${id}`
    )
    return response.data
  },

  /**
   * Upload a document
   */
  uploadDocument: async (
    data: UploadDocumentRequest
  ): Promise<ApiResponse<Document>> => {
    const formData = new FormData()
    formData.append('file', data.file)
    if (data.patientId) {
      formData.append('patientId', data.patientId)
    }
    formData.append('category', data.category)

    const response = await axiosInstance.post<ApiResponse<Document>>(
      endpoints.documents.upload,
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
   * Download a document
   */
  downloadDocument: async (id: string): Promise<Blob> => {
    const response = await axiosInstance.get(endpoints.documents.download(id), {
      responseType: 'blob',
    })
    return response.data
  },

  /**
   * Delete document
   */
  deleteDocument: async (id: string): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.delete<ApiResponse<void>>(
      `${endpoints.documents.list}/${id}`
    )
    return response.data
  },

  /**
   * Update document metadata
   */
  updateDocument: async (
    id: string,
    data: Partial<Pick<Document, 'name' | 'category' | 'tags' | 'confidentiality' | 'documentDate'>>
  ): Promise<ApiResponse<Document>> => {
    const response = await axiosInstance.put<ApiResponse<Document>>(
      `${endpoints.documents.list}/${id}`,
      data
    )
    return response.data
  },

  /**
   * Upload multiple documents (batch)
   */
  uploadDocumentsBatch: async (
    files: File[],
    metadata: Array<{
      patientId?: string
      category: Document['category']
      tags?: string[]
      documentDate?: string
      confidentiality?: Document['confidentiality']
    }>
  ): Promise<ApiResponse<{ documents: Document[]; errors: string[] }>> => {
    const formData = new FormData()
    files.forEach((file, index) => {
      formData.append('files', file)
      if (metadata[index]) {
        formData.append(`metadata[${index}]`, JSON.stringify(metadata[index]))
      }
    })

    const response = await axiosInstance.post<ApiResponse<{ documents: Document[]; errors: string[] }>>(
      `${endpoints.documents.upload}/batch`,
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
   * Validate document
   */
  validateDocument: async (
    id: string,
    validated: boolean
  ): Promise<ApiResponse<Document>> => {
    const response = await axiosInstance.post<ApiResponse<Document>>(
      `${endpoints.documents.list}/${id}/validate`,
      { validated }
    )
    return response.data
  },

  /**
   * Share document (generate secure link)
   */
  shareDocument: async (
    id: string,
    options?: {
      expiresIn?: number // hours
      password?: string
    }
  ): Promise<ApiResponse<{ shareLink: string; expiresAt: string }>> => {
    const response = await axiosInstance.post<ApiResponse<{ shareLink: string; expiresAt: string }>>(
      `${endpoints.documents.list}/${id}/share`,
      options
    )
    return response.data
  },
}





