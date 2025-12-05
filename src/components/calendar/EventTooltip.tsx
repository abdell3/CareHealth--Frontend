import * as React from 'react'
import { User, Phone, Edit, X, Clock, MapPin, FileText } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { formatDateTime } from '@/utils/helpers'
import { cn } from '@/libs/utils'
import type { MedicalEvent } from '@/types/calendar'
import { cn } from '@/libs/utils'

interface EventTooltipProps {
  event: MedicalEvent
  position: { x: number; y: number }
  onEdit?: (event: MedicalEvent) => void
  onCancel?: (event: MedicalEvent) => void
  onCall?: (event: MedicalEvent) => void
  className?: string
}

export const EventTooltip: React.FC<EventTooltipProps> = ({
  event,
  position,
  onEdit,
  onCancel,
  onCall,
  className,
}) => {
  const getPriorityColor = (priority: MedicalEvent['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-300'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300'
      case 'normal':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getStatusColor = (status: MedicalEvent['status']) => {
    switch (status) {
      case 'in-progress':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-300'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300'
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300'
    }
  }

  return (
    <Card
      className={cn(
        'absolute z-50 w-80 border-medical-blue-200 shadow-xl',
        className
      )}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -100%)',
        marginTop: '-10px',
      }}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="mb-4 flex items-start gap-3">
          <Avatar
            src={event.patient.photo}
            fallback={event.patient.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()}
            className="h-12 w-12"
          />
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900">{event.patient.name}</h4>
            {event.doctor && (
              <p className="text-sm text-gray-600">{event.doctor.name}</p>
            )}
            <div className="mt-2 flex flex-wrap gap-1">
              <Badge className={cn('border', getPriorityColor(event.priority))}>
                {event.priority === 'urgent' ? 'Urgent' : event.priority === 'high' ? 'Élevée' : event.priority === 'normal' ? 'Normale' : 'Basse'}
              </Badge>
              <Badge className={cn('border', getStatusColor(event.status))}>
                {event.status === 'scheduled' ? 'Programmé' : event.status === 'in-progress' ? 'En cours' : event.status === 'completed' ? 'Terminé' : event.status === 'cancelled' ? 'Annulé' : 'Absent'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-gray-700">
            <Clock className="h-4 w-4 text-gray-500" />
            <span>{formatDateTime(event.start)}</span>
            <span className="text-gray-400">-</span>
            <span>{event.end.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <Clock className="h-4 w-4 text-gray-500" />
            <span>Durée: {event.metadata.duration} min</span>
          </div>
          {event.metadata.location && (
            <div className="flex items-center gap-2 text-gray-700">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span>{event.metadata.location}</span>
            </div>
          )}
          {event.metadata.notes && (
            <div className="flex items-start gap-2 text-gray-700">
              <FileText className="mt-0.5 h-4 w-4 text-gray-500" />
              <span className="line-clamp-2">{event.metadata.notes}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-4 flex gap-2 border-t pt-3">
          {onEdit && (
            <Button variant="outline" size="sm" className="flex-1" onClick={() => onEdit(event)}>
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </Button>
          )}
          {onCall && (
            <Button variant="outline" size="sm" onClick={() => onCall(event)}>
              <Phone className="h-4 w-4" />
            </Button>
          )}
          {onCancel && (
            <Button variant="outline" size="sm" onClick={() => onCancel(event)}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

