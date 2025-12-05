import * as React from 'react'
import { useState, useEffect } from 'react'
import { Calendar, Clock, User, MapPin, AlertCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate, formatDateTime } from '@/utils/helpers'
import { cn } from '@/libs/utils'
import type { Appointment } from '@/types/api'

interface NextAppointmentCardProps {
  appointment: Appointment
  onCancel?: () => void
  onViewDetails?: () => void
  className?: string
}

export const NextAppointmentCard = React.forwardRef<HTMLDivElement, NextAppointmentCardProps>(
  ({ appointment, onCancel, onViewDetails, className }, ref) => {
    const [timeRemaining, setTimeRemaining] = useState<string>('')

    useEffect(() => {
      const updateCountdown = () => {
        const appointmentDate = new Date(`${appointment.date}T${appointment.time}`)
        const now = new Date()
        const diff = appointmentDate.getTime() - now.getTime()

        if (diff <= 0) {
          setTimeRemaining('En cours ou terminé')
          return
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

        if (days > 0) {
          setTimeRemaining(`${days} jour${days > 1 ? 's' : ''}, ${hours}h`)
        } else if (hours > 0) {
          setTimeRemaining(`${hours}h ${minutes}min`)
        } else {
          setTimeRemaining(`${minutes}min`)
        }
      }

      updateCountdown()
      const interval = setInterval(updateCountdown, 60000) // Update every minute

      return () => clearInterval(interval)
    }, [appointment.date, appointment.time])

    const appointmentDate = new Date(`${appointment.date}T${appointment.time}`)
    const isToday = appointmentDate.toDateString() === new Date().toDateString()
    const isUrgent = isToday && timeRemaining.includes('min') && !timeRemaining.includes('jour')

    return (
      <Card
        ref={ref}
        className={cn(
          'border-2 bg-gradient-to-br from-medical-blue-50 to-medical-green-50 shadow-medical-card',
          isUrgent && 'border-red-300 animate-pulse',
          className
        )}
      >
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="mb-4 flex items-center gap-2">
                <Calendar className="h-6 w-6 text-medical-blue-600" />
                <h3 className="text-xl font-bold text-gray-900">Prochain rendez-vous</h3>
                {isUrgent && (
                  <Badge variant="destructive" className="animate-pulse">
                    <AlertCircle className="h-3 w-3" />
                    Bientôt
                  </Badge>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-semibold text-gray-900">
                      {formatDate(appointment.date)} à {appointment.time}
                    </p>
                    <p className="text-sm text-gray-600">
                      {isToday ? "Aujourd'hui" : 'Dans'} {timeRemaining}
                    </p>
                  </div>
                </div>

                {appointment.doctor && (
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">
                        Dr. {appointment.doctor.firstName} {appointment.doctor.lastName}
                      </p>
                      {appointment.doctor.profile?.specialization && (
                        <p className="text-sm text-gray-600">
                          {appointment.doctor.profile.specialization}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <p className="text-sm text-gray-600">Consultation - {appointment.duration} min</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-2">
            {onViewDetails && (
              <Button
                variant="outline"
                onClick={onViewDetails}
                className="flex-1 border-medical-blue-300 text-medical-blue-700 hover:bg-medical-blue-50"
              >
                Voir les détails
              </Button>
            )}
            {onCancel && appointment.status === 'scheduled' && (
              <Button
                variant="outline"
                onClick={onCancel}
                className="flex-1 border-red-300 text-red-700 hover:bg-red-50"
              >
                Annuler
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }
)
NextAppointmentCard.displayName = 'NextAppointmentCard'

