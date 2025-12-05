/**
 * useSearch Hook Tests
 */

import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useSearch } from '@/hooks/useSearch'
import { describe, it, expect, beforeEach, vi } from '@jest/globals'

// Mock searchService
vi.mock('@/api/search.service', () => ({
  searchService: {
    search: vi.fn(),
    getSuggestions: vi.fn(),
  },
}))

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient()
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

describe('useSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('searches with query', async () => {
    const { searchService } = await import('@/api/search.service')
    
    vi.mocked(searchService.search).mockResolvedValue({
      status: 'success',
      data: {
        results: [],
        suggestions: [],
        filters: [],
        total: 0,
        byType: {
          patient: 0,
          appointment: 0,
          prescription: 0,
          document: 0,
          lab: 0,
        },
      },
    })

    const { result } = renderHook(
      () => useSearch({ q: 'test', limit: 10 }),
      { wrapper }
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(searchService.search).toHaveBeenCalled()
  })

  it('caches search results', async () => {
    const { searchService } = await import('@/api/search.service')
    
    vi.mocked(searchService.search).mockResolvedValue({
      status: 'success',
      data: {
        results: [],
        suggestions: [],
        filters: [],
        total: 0,
        byType: {
          patient: 0,
          appointment: 0,
          prescription: 0,
          document: 0,
          lab: 0,
        },
      },
    })

    const { result: result1 } = renderHook(
      () => useSearch({ q: 'test' }),
      { wrapper }
    )

    await waitFor(() => {
      expect(result1.current.isLoading).toBe(false)
    })

    // Second search with same query should use cache
    const { result: result2 } = renderHook(
      () => useSearch({ q: 'test' }),
      { wrapper }
    )

    await waitFor(() => {
      expect(result2.current.isLoading).toBe(false)
    })

    // Should only call API once (second uses cache)
    expect(searchService.search).toHaveBeenCalledTimes(1)
  })

  it('gets suggestions', async () => {
    const { searchService } = await import('@/api/search.service')
    
    vi.mocked(searchService.getSuggestions).mockResolvedValue({
      status: 'success',
      data: ['test1', 'test2'],
    })

    const { result } = renderHook(
      () => useSearch({ q: 'test' }),
      { wrapper }
    )

    await waitFor(() => {
      expect(result.current.suggestions.length).toBeGreaterThan(0)
    })
  })
})

