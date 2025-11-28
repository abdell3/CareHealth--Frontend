import { type ReactNode } from 'react'

interface PageLayoutProps {
  title: string
  description?: string
  actionButton?: ReactNode
  children: ReactNode
}

/**
 * Reusable layout component for list pages
 * Reduces code duplication across all list pages
 */
export const PageLayout = ({ title, description, actionButton, children }: PageLayoutProps) => {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          {description && <p className="mt-1 text-sm text-gray-600">{description}</p>}
        </div>
        {actionButton}
      </div>
      {children}
    </div>
  )
}

