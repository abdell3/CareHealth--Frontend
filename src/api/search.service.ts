import { axiosInstance } from './axiosInstance'
import { endpoints } from './endpoints'
import type { ApiResponse } from './api.types'
import type { SearchResponse, SearchParams } from '@/types/api'

/**
 * Search Service
 * Handles global medical search across all entities
 */
export const searchService = {
  /**
   * Global search across all entities
   */
  search: async (params: SearchParams): Promise<ApiResponse<SearchResponse>> => {
    const response = await axiosInstance.get<ApiResponse<SearchResponse>>(
      endpoints.search.global,
      { params }
    )
    return response.data
  },

  /**
   * Get search suggestions
   */
  getSuggestions: async (query: string): Promise<ApiResponse<string[]>> => {
    const response = await axiosInstance.get<ApiResponse<string[]>>(
      endpoints.search.suggestions,
      { params: { q: query } }
    )
    return response.data
  },
}

