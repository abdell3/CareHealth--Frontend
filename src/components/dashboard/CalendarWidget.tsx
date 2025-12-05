import * as React from 'react'
import { Calendar, Clock } from 'lucide-react'
import { BaseWidget, type BaseWidgetProps } from './BaseWidget'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/utils/helpers'
import { cn } from '@/libs/utils'
import type { Appointment } from '@/types/api'

interface CalendarWidgetProps extends Omit<BaseWidgetProps, 'children'> {
  appointments: Appointment[]
  onAppointmentClick?: (appointment: Appointment) => void
}

export const CalendarWidget = React.forwardRef<HTMLDivElement, CalendarWidgetProps>(
  ({ appointments, onAppointmentClick, ...props }, ref) => {
    const today = new Date()
    const todayAppointments = appointments.filter((apt) => {
      const aptDate = new Date(apt.date)
      return (
        aptDate.getDate() === today.getDate() &&
        aptDate.getMonth() === today.getMonth() &&
        aptDate.getFullYear() === today.getFullYear()
      )
    })

    return (
      <BaseWidget ref={ref} {...props} icon={<Calendar className="h-5 w-5" />}>
        {todayAppointments.length === 0 ? (
          <p className="text-center text-sm text-gray-500 py-8">Aucun rendez-vous aujourd'hui</p>
        ) : (
          <div className="space-y-3">
            {todayAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className={cn(
                  'flex items-center gap-3 rounded-lg border border-gray-200 p-3 transition-colors',
                  onAppointmentClick && 'cursor-pointer hover:bg-medical-blue-50'
                )}
                onClick={() => onAppointmentClick?.(appointment)}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-medical-blue-100">
                  <Clock className="h-5 w-5 text-medical-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{appointment.time}</p>
                  {appointment.patient && (
                    <p className="text-sm text-gray-600">
                      {appointment.patient.firstName} {appointment.patient.lastName}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    {appointment.type === 'consultation'
                      ? 'Consultation'
                      : appointment.type === 'follow-up'
                        ? 'Suivi'
                        : appointment.type === 'emergency'
                          ? 'Urgence'
                          : 'Chirurgie'}
                  </p>
                </div>
                <Badge
                  variant={
                    appointment.status === 'scheduled'
                      ? 'info'
                      : appointment.status === 'completed'
                        ? 'success'
                        : appointment.status === 'cancelled'
                          ? 'destructive'
                          : 'warning'
                  }
                >
                  {appointment.status === 'scheduled'
                    ? 'Programmé'
                    : appointment.status === 'completed'
                      ? 'Terminé'
                      : appointment.status === 'cancelled'
                        ? 'Annulé'
                        : 'Absent'}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </BaseWidget>
    )
  }
)
CalendarWidget.displayName = 'CalendarWidget'

