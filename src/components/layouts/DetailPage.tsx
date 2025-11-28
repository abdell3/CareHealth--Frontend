import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { type ReactNode } from 'react'

interface DetailPageProps {
  title: string
  id?: string
  backTo: string
  children: ReactNode
}

/**
 * Reusable layout component for detail pages
 * Reduces code duplication across all detail pages
 */
export const DetailPage = ({ title, id, backTo, children }: DetailPageProps) => {
  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link to={backTo} className="rounded-lg p-2 text-gray-600 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          {id && <p className="mt-1 text-sm text-gray-600">ID: {id}</p>}
        </div>
      </div>
      {children}
    </div>
  )
}

