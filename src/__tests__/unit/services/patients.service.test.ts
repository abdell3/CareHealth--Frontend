/**
 * Patients Service Tests
 */

import { patientsService } from '@/api/patients.service'
import { describe, it, expect, beforeEach, vi } from '@jest/globals'

// Mock axiosInstance
vi.mock('@/api/axiosInstance', () => ({
  axiosInstance: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('patientsService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches patients with pagination', async () => {
    const { axiosInstance } = await import('@/api/axiosInstance')
    
    const mockResponse = {
      status: 'success',
      data: {
        patients: [],
        total: 50,
        page: 1,
        limit: 10,
        totalPages: 5,
      },
    }

    vi.mocked(axiosInstance.get).mockResolvedValue({
      data: mockResponse,
    } as any)

    const result = await patientsService.getPatients({ page: 1, limit: 10 })

    expect(axiosInstance.get).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        params: { page: 1, limit: 10 },
      })
    )
    expect(result.data.total).toBe(50)
  })

  it('creates a new patient', async () => {
    const { axiosInstance } = await import('@/api/axiosInstance')
    
    const newPatient = {
      firstName: 'Test',
      lastName: 'Patient',
      email: 'test@example.com',
    }

    const mockResponse = {
      status: 'success',
      data: {
        ...newPatient,
        id: '1',
      },
    }

    vi.mocked(axiosInstance.post).mockResolvedValue({
      data: mockResponse,
    } as any)

    const result = await patientsService.createPatient(newPatient as any)

    expect(axiosInstance.post).toHaveBeenCalledWith(
      expect.any(String),
      newPatient
    )
    expect(result.data.id).toBe('1')
  })

  it('updates patient information', async () => {
    const { axiosInstance } = await import('@/api/axiosInstance')
    
    const updates = {
      phone: '0612345678',
    }

    const mockResponse = {
      status: 'success',
      data: {
        id: '1',
        ...updates,
      },
    }

    vi.mocked(axiosInstance.put).mockResolvedValue({
      data: mockResponse,
    } as any)

    const result = await patientsService.updatePatient('1', updates as any)

    expect(axiosInstance.put).toHaveBeenCalledWith(
      expect.stringContaining('/1'),
      updates
    )
    expect(result.data.phone).toBe('0612345678')
  })

  it('handles API errors gracefully', async () => {
    const { axiosInstance } = await import('@/api/axiosInstance')
    
    vi.mocked(axiosInstance.get).mockRejectedValue(
      new Error('Network error')
    )

    await expect(patientsService.getPatients()).rejects.toThrow()
  })

  it('searches patients with filters', async () => {
    const { axiosInstance } = await import('@/api/axiosInstance')
    
    vi.mocked(axiosInstance.get).mockResolvedValue({
      data: {
        status: 'success',
        data: {
          patients: [],
          total: 0,
        },
      },
    } as any)

    await patientsService.getPatients({
      search: 'Dupont',
      gender: 'male',
      city: 'Paris',
    })

    expect(axiosInstance.get).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        params: {
          search: 'Dupont',
          gender: 'male',
          city: 'Paris',
        },
      })
    )
  })
})

