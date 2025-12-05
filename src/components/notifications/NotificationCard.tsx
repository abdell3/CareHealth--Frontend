import { memo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Bell,
  Calendar,
  FileText,
  MessageSquare,
  Pill,
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle,
  X,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from 'lucide-react'
import { cn } from '@/libs/utils'
import type { Notification } from '@/types/api'

interface NotificationCardProps {
  notification: Notification
  onMarkAsRead?: (id: string) => void
  onDelete?: (id: string) => void
  onClick?: (notification: Notification) => void
}

const typeIcons = {
  system: Bell,
  appointment: Calendar,
  medical: FileText,
  message: MessageSquare,
  reminder: Pill,
}

const priorityColors = {
  info: {
    bg: 'bg-medical-blue-50',
    border: 'border-medical-blue-200',
    text: 'text-medical-blue-700',
    icon: Info,
    iconColor: 'text-medical-blue-600',
  },
  success: {
    bg: 'bg-medical-green-50',
    border: 'border-medical-green-200',
    text: 'text-medical-green-700',
    icon: CheckCircle,
    iconColor: 'text-medical-green-600',
  },
  warning: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-700',
    icon: AlertTriangle,
    iconColor: 'text-yellow-600',
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-700',
    icon: AlertCircle,
    iconColor: 'text-red-600',
  },
  urgent: {
    bg: 'bg-red-100',
    border: 'border-red-300',
    text: 'text-red-800',
    icon: AlertCircle,
    iconColor: 'text-red-700',
    pulse: true,
  },
}

const formatTimeAgo = (date: string): string => {
  const now = new Date()
  const notificationDate = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - notificationDate.getTime()) / 1000)

  if (diffInSeconds < 60) return 'À l\'instant'
  if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} min`
  if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)} h`
  if (diffInSeconds < 604800) return `Il y a ${Math.floor(diffInSeconds / 86400)} j`
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: notificationDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  }).format(notificationDate)
}

export const NotificationCard = memo<NotificationCardProps>(
  ({ notification, onMarkAsRead, onDelete, onClick }) => {
    const [expanded, setExpanded] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const TypeIcon = typeIcons[notification.type]
    const priorityStyle = priorityColors[notification.priority]
    const PriorityIcon = priorityStyle.icon

    const handleClick = () => {
      if (onClick) {
        onClick(notification)
      }
      if (notification.status === 'unread' && onMarkAsRead) {
        onMarkAsRead(notification.id)
      }
    }

    const handleDelete = async (e: React.MouseEvent) => {
      e.stopPropagation()
      if (onDelete && !isDeleting) {
        setIsDeleting(true)
        try {
          await onDelete(notification.id)
        } finally {
          setIsDeleting(false)
        }
      }
    }

    const handleMarkAsRead = (e: React.MouseEvent) => {
      e.stopPropagation()
      if (onMarkAsRead && notification.status === 'unread') {
        onMarkAsRead(notification.id)
      }
    }

    return (
      <Card
        className={cn(
          'cursor-pointer transition-all duration-200 hover:shadow-md',
          priorityStyle.bg,
          priorityStyle.border,
          'border-l-4',
          notification.status === 'unread' && 'shadow-medical',
          notification.priority === 'urgent' && priorityStyle.pulse && 'animate-pulse'
        )}
        onClick={handleClick}
      >
        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                priorityStyle.bg,
                priorityStyle.iconColor
              )}
            >
              <TypeIcon className="h-5 w-5" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4
                      className={cn(
                        'text-sm font-semibold truncate',
                        notification.status === 'unread' ? 'font-bold' : 'font-medium',
                        priorityStyle.text
                      )}
                    >
                      {notification.title}
                    </h4>
                    {notification.status === 'unread' && (
                      <div className="h-2 w-2 rounded-full bg-medical-blue-600 shrink-0" />
                    )}
                  </div>
                  <p className={cn('text-sm mb-2 line-clamp-2', priorityStyle.text)}>
                    {notification.message}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  {notification.status === 'unread' && onMarkAsRead && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={handleMarkAsRead}
                      title="Marquer comme lu"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-gray-400 hover:text-red-600"
                      onClick={handleDelete}
                      disabled={isDeleting}
                      title="Supprimer"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Metadata */}
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <Badge variant="outline" className="text-xs">
                  <PriorityIcon className="h-3 w-3 mr-1" />
                  {notification.priority}
                </Badge>
                <span className="text-xs text-gray-500">
                  {formatTimeAgo(notification.createdAt)}
                </span>
                {notification.metadata?.url && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs"
                    onClick={(e) => {
                      e.stopPropagation()
                      window.location.href = notification.metadata!.url!
                    }}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Voir
                  </Button>
                )}
              </div>

              {/* Expanded details */}
              {expanded && notification.metadata && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="text-xs text-gray-600 space-y-1">
                    {Object.entries(notification.metadata)
                      .filter(([key]) => !['url', 'actionLabel'].includes(key))
                      .map(([key, value]) => (
                        <div key={key}>
                          <span className="font-medium">{key}:</span> {String(value)}
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Expand button */}
              {notification.metadata &&
                Object.keys(notification.metadata).filter((k) => !['url', 'actionLabel'].includes(k))
                  .length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 h-6 text-xs"
                    onClick={(e) => {
                      e.stopPropagation()
                      setExpanded(!expanded)
                    }}
                  >
                    {expanded ? (
                      <>
                        <ChevronUp className="h-3 w-3 mr-1" />
                        Réduire
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-3 w-3 mr-1" />
                        Détails
                      </>
                    )}
                  </Button>
                )}
            </div>
          </div>
        </div>
      </Card>
    )
  }
)

NotificationCard.displayName = 'NotificationCard'

