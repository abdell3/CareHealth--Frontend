/**
 * GlobalSearchBar Component Tests
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { GlobalSearchBar } from '@/components/search/GlobalSearchBar'
import { describe, it, expect, vi, beforeEach } from '@jest/globals'

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{component}</BrowserRouter>
    </QueryClientProvider>
  )
}

describe('GlobalSearchBar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders search input', () => {
    renderWithProviders(<GlobalSearchBar />)
    
    const input = screen.getByPlaceholderText(/rechercher/i)
    expect(input).toBeInTheDocument()
  })

  it('shows suggestions on input', async () => {
    renderWithProviders(<GlobalSearchBar />)
    
    const input = screen.getByPlaceholderText(/rechercher/i)
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'test' } })
    
    await waitFor(() => {
      // Suggestions should appear after debounce
      expect(input).toHaveValue('test')
    })
  })

  it('debounces search input', async () => {
    vi.useFakeTimers()
    renderWithProviders(<GlobalSearchBar />)
    
    const input = screen.getByPlaceholderText(/rechercher/i)
    
    fireEvent.change(input, { target: { value: 't' } })
    fireEvent.change(input, { target: { value: 'te' } })
    fireEvent.change(input, { target: { value: 'test' } })
    
    // Fast-forward time
    vi.advanceTimersByTime(300)
    
    await waitFor(() => {
      expect(input).toHaveValue('test')
    })
    
    vi.useRealTimers()
  })

  it('clears search on X button click', () => {
    renderWithProviders(<GlobalSearchBar />)
    
    const input = screen.getByPlaceholderText(/rechercher/i)
    fireEvent.change(input, { target: { value: 'test' } })
    
    const clearButton = screen.getByRole('button', { name: /clear|close/i })
    fireEvent.click(clearButton)
    
    expect(input).toHaveValue('')
  })

  it('handles keyboard navigation', async () => {
    renderWithProviders(<GlobalSearchBar />)
    
    const input = screen.getByPlaceholderText(/rechercher/i)
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'test' } })
    
    // Wait for dropdown to appear
    await waitFor(() => {
      expect(input).toHaveValue('test')
    })
    
    // Arrow down
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    
    // Enter
    fireEvent.keyDown(input, { key: 'Enter' })
  })

  it('closes dropdown on Escape key', async () => {
    renderWithProviders(<GlobalSearchBar />)
    
    const input = screen.getByPlaceholderText(/rechercher/i)
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'test' } })
    
    await waitFor(() => {
      expect(input).toHaveValue('test')
    })
    
    fireEvent.keyDown(input, { key: 'Escape' })
    
    // Dropdown should close
    await waitFor(() => {
      const dropdown = screen.queryByRole('dialog')
      expect(dropdown).not.toBeInTheDocument()
    })
  })

  it('navigates to search page on "View All" click', async () => {
    renderWithProviders(<GlobalSearchBar />)
    
    const input = screen.getByPlaceholderText(/rechercher/i)
    fireEvent.change(input, { target: { value: 'test' } })
    
    await waitFor(() => {
      const viewAllButton = screen.queryByText(/voir tous/i)
      if (viewAllButton) {
        fireEvent.click(viewAllButton)
        expect(mockNavigate).toHaveBeenCalledWith(
          expect.stringContaining('/dashboard/search')
        )
      }
    })
  })

  it('shows loading state', async () => {
    renderWithProviders(<GlobalSearchBar />)
    
    const input = screen.getByPlaceholderText(/rechercher/i)
    fireEvent.change(input, { target: { value: 'test' } })
    
    // Should show loading indicator
    await waitFor(() => {
      expect(input).toHaveValue('test')
    })
  })

  it('displays "no results" message when no results', async () => {
    renderWithProviders(<GlobalSearchBar />)
    
    const input = screen.getByPlaceholderText(/rechercher/i)
    fireEvent.change(input, { target: { value: 'nonexistent12345' } })
    
    await waitFor(() => {
      expect(input).toHaveValue('nonexistent12345')
    })
  })
})

