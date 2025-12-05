/**
 * Accessibility Tests
 */

import { render } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { MedicalCard } from '@/design-system/components/medical'
import { GlobalSearchBar } from '@/components/search/GlobalSearchBar'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect } from '@jest/globals'

expect.extend(toHaveNoViolations)

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
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

describe('Accessibility', () => {
  it('MedicalCard has no accessibility violations', async () => {
    const { container } = render(
      <MedicalCard title="Test Card" description="Test description">
        Content
      </MedicalCard>
    )

    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('GlobalSearchBar is accessible', async () => {
    const { container } = renderWithProviders(<GlobalSearchBar />)

    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})

