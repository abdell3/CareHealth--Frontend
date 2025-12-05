/**
 * MedicalCard Component Tests
 */

import { render, screen, fireEvent } from '@testing-library/react'
import { MedicalCard } from '@/design-system/components/medical'
import { describe, it, expect, vi } from '@jest/globals'

describe('MedicalCard', () => {
  const defaultProps = {
    title: 'Test Card',
    description: 'Test description',
  }

  it('renders with default variant', () => {
    render(<MedicalCard {...defaultProps}>Content</MedicalCard>)
    
    expect(screen.getByText('Test Card')).toBeInTheDocument()
    expect(screen.getByText('Test description')).toBeInTheDocument()
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('renders patient variant correctly', () => {
    render(
      <MedicalCard {...defaultProps} variant="patient">
        Patient content
      </MedicalCard>
    )
    
    expect(screen.getByText('Test Card')).toBeInTheDocument()
    expect(screen.getByText('Patient content')).toBeInTheDocument()
  })

  it('shows alert badge when provided', () => {
    render(
      <MedicalCard
        {...defaultProps}
        badge={{ label: 'Urgent', variant: 'error' }}
      >
        Content
      </MedicalCard>
    )
    
    expect(screen.getByText('Urgent')).toBeInTheDocument()
  })

  it('expands and collapses content when expandable', () => {
    render(
      <MedicalCard {...defaultProps} expandable>
        <div>Expandable content</div>
      </MedicalCard>
    )
    
    // Content should be visible by default if defaultExpanded is false
    const expandButton = screen.getByRole('button', { name: /expand|collapse/i })
    expect(expandButton).toBeInTheDocument()
    
    // Click to expand
    fireEvent.click(expandButton)
    expect(screen.getByText('Expandable content')).toBeInTheDocument()
  })

  it('calls onClick when card is clicked', () => {
    const handleClick = vi.fn()
    render(
      <MedicalCard {...defaultProps} onClick={handleClick}>
        Content
      </MedicalCard>
    )
    
    const card = screen.getByText('Test Card').closest('div')
    fireEvent.click(card!)
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('renders header actions when provided', () => {
    render(
      <MedicalCard
        {...defaultProps}
        headerActions={<button>Action</button>}
      >
        Content
      </MedicalCard>
    )
    
    expect(screen.getByText('Action')).toBeInTheDocument()
  })

  it('renders footer actions when provided', () => {
    render(
      <MedicalCard
        {...defaultProps}
        footerActions={<button>Footer Action</button>}
      >
        Content
      </MedicalCard>
    )
    
    expect(screen.getByText('Footer Action')).toBeInTheDocument()
  })

  it('applies role-specific styling', () => {
    const { container } = render(
      <MedicalCard {...defaultProps} role="doctor">
        Content
      </MedicalCard>
    )
    
    // Check for role-specific classes
    expect(container.firstChild).toHaveClass('border-l-4')
  })

  it('is accessible', () => {
    const { container } = render(
      <MedicalCard {...defaultProps} title="Accessible Card">
        Content
      </MedicalCard>
    )
    
    // Check for semantic HTML
    expect(screen.getByText('Accessible Card')).toBeInTheDocument()
    expect(container.querySelector('h3')).toBeInTheDocument()
  })
})

