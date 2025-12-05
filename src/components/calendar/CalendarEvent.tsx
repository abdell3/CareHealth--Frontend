import * as React from 'react'
import { cn } from '@/libs/utils'
import { AlertCircle, Stethoscope, Heart, Scalpel } from 'lucide-react'
import type { CalendarEvent } from '@/hooks/useCalendarEvents'

interface CalendarEventProps {
  event: CalendarEvent
  onClick?: () => void
  className?: string
}

const typeConfig = {
  consultation: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-900',
    icon: Stethoscope,
  },
  'follow-up': {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-900',
    icon: Heart,
  },
  emergency: {
    bg: 'bg-red-50',
    border: 'border-red-300 border-dashed',
    text: 'text-red-900',
    icon: AlertCircle,
  },
  surgery: {
    bg: 'bg-purple-50',
    border: 'border-purple-300',
    text: 'text-purple-900',
    icon: Scalpel,
  },
}

const statusConfig = {
  scheduled: 'border-l-4 border-medical-blue-500',
  completed: 'border-l-4 border-medical-green-500',
  cancelled: 'border-l-4 border-gray-400 opacity-60',
  'no-show': 'border-l-4 border-yellow-500',
}

export const CalendarEventComponent = React.forwardRef<HTMLDivElement, CalendarEventProps>(
  ({ event, onClick, className }, ref) => {
    const config = typeConfig[event.type]
    const Icon = config.icon
    const statusClass = statusConfig[event.status]

    // Check if appointment is overdue
    const isOverdue = event.status === 'scheduled' && event.start < new Date()

    return (
      <div
        ref={ref}
        onClick={onClick}
        className={cn(
          'group cursor-pointer rounded-lg border p-2 text-xs transition-all hover:shadow-md',
          config.bg,
          config.border,
          statusClass,
          isOverdue && 'animate-pulse border-red-500',
          className
        )}
        title={`${event.patientName} - ${event.doctorName} - ${event.start.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`}
      >
        <div className="flex items-start gap-2">
          <Icon className={cn('h-3 w-3 shrink-0', config.text)} />
          <div className="min-w-0 flex-1">
            <p className={cn('truncate font-medium', config.text)}>{event.patientName}</p>
            <p className="truncate text-gray-600">{event.doctorName}</p>
            <p className="text-gray-500">
              {event.start.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              {' - '}
              {event.end.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
      </div>
    )
  }
)
CalendarEventComponent.displayName = 'CalendarEvent'

