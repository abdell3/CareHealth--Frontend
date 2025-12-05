import { memo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  User,
  Calendar,
  FileText,
  Pill,
  FlaskConical,
  ArrowRight,
  MapPin,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/libs/utils'
import type { SearchResult, SearchResultType } from '@/types/api'

interface SearchResultsCardProps {
  result: SearchResult
  query?: string
  viewMode?: 'compact' | 'extended'
  onAction?: (result: SearchResult) => void
}

const typeIcons = {
  patient: User,
  appointment: Calendar,
  prescription: FileText,
  document: FileText,
  lab: FlaskConical,
}

const typeColors: Record<SearchResultType, string> = {
  patient: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    icon: 'text-blue-600',
  },
  appointment: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-700',
    icon: 'text-green-600',
  },
  prescription: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-700',
    icon: 'text-purple-600',
  },
  document: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-700',
    icon: 'text-orange-600',
  },
  lab: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-700',
    icon: 'text-red-600',
  },
}

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
  pending: 'bg-yellow-100 text-yellow-700',
  cancelled: 'bg-red-100 text-red-700',
  scheduled: 'bg-blue-100 text-blue-700',
  'in-progress': 'bg-purple-100 text-purple-700',
}

const formatDate = (dateString?: string): string => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

const highlightText = (text: string, query?: string) => {
  if (!query) return text
  const parts = text.split(new RegExp(`(${query})`, 'gi'))
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={i} className="bg-yellow-200 font-semibold rounded px-1">
        {part}
      </mark>
    ) : (
      part
    )
  )
}

export const SearchResultsCard = memo<SearchResultsCardProps>(
  ({ result, query, viewMode = 'extended', onAction }) => {
    const navigate = useNavigate()
    const colors = typeColors[result.type]
    const Icon = typeIcons[result.type]

    const handleClick = () => {
      if (onAction) {
        onAction(result)
      } else {
        const action = result.actions[0]
        if (action?.url) {
          navigate(action.url)
        }
      }
    }

    const isCompact = viewMode === 'compact'

    return (
      <Card
        className={cn(
          'cursor-pointer transition-all duration-200 hover:shadow-md border-l-4',
          colors.border,
          colors.bg,
          'hover:scale-[1.01]'
        )}
        onClick={handleClick}
      >
        <div className={cn('p-4', isCompact && 'p-3')}>
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                colors.bg,
                colors.icon
              )}
            >
              <Icon className="h-5 w-5" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className={cn('font-semibold mb-1', isCompact ? 'text-sm' : 'text-base', colors.text)}>
                    {highlightText(result.title, query)}
                  </h3>
                  <p className={cn('text-gray-600 line-clamp-2', isCompact ? 'text-xs' : 'text-sm')}>
                    {highlightText(result.description, query)}
                  </p>
                </div>
                <ArrowRight className={cn('shrink-0 text-gray-400', isCompact ? 'h-4 w-4' : 'h-5 w-5')} />
              </div>

              {/* Metadata */}
              {!isCompact && (
                <div className="space-y-2 mt-3">
                  {/* Date */}
                  {result.metadata.date && (
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Clock className="h-3 w-3" />
                      <span>{formatDate(result.metadata.date)}</span>
                    </div>
                  )}

                  {/* Status */}
                  {result.metadata.status && (
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-xs',
                        statusColors[result.metadata.status] || 'bg-gray-100 text-gray-700'
                      )}
                    >
                      {result.metadata.status === 'active' && <CheckCircle className="h-3 w-3 mr-1" />}
                      {result.metadata.status === 'cancelled' && <XCircle className="h-3 w-3 mr-1" />}
                      {String(result.metadata.status)}
                    </Badge>
                  )}

                  {/* Patient specific */}
                  {result.type === 'patient' && (
                    <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                      {result.metadata.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          <span>{String(result.metadata.phone)}</span>
                        </div>
                      )}
                      {result.metadata.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          <span>{String(result.metadata.email)}</span>
                        </div>
                      )}
                      {result.metadata.city && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{String(result.metadata.city)}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Relevance */}
                  {result.relevance > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 flex-1 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={cn('h-full transition-all', colors.bg.replace('50', '500'))}
                          style={{ width: `${result.relevance * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">
                        {Math.round(result.relevance * 100)}% de pertinence
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              {result.actions.length > 1 && !isCompact && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {result.actions.slice(1).map((action, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="text-xs h-7"
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(action.url)
                      }}
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    )
  }
)

SearchResultsCard.displayName = 'SearchResultsCard'

