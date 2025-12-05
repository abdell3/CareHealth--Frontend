import { useMemo } from 'react'
import type { Appointment } from '@/types/api'

export interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  appointment: Appointment
  type: Appointment['type']
  status: Appointment['status']
  patientName: string
  doctorName: string
  duration: number
}

/**
 * Hook to transform appointments into calendar events
 */
export const useCalendarEvents = (appointments: Appointment[] = []): CalendarEvent[] => {
  return useMemo(() => {
    return appointments.map((appointment) => {
      const [hours, minutes] = appointment.time.split(':').map(Number)
      const appointmentDate = new Date(appointment.date)
      appointmentDate.setHours(hours, minutes, 0, 0)

      const start = appointmentDate
      const end = new Date(start.getTime() + appointment.duration * 60 * 1000)

      const patientName = appointment.patient
        ? `${appointment.patient.firstName} ${appointment.patient.lastName}`
        : 'Patient inconnu'

      const doctorName = appointment.doctor
        ? `${appointment.doctor.firstName} ${appointment.doctor.lastName}`
        : 'Médecin inconnu'

      return {
        id: appointment.id,
        title: `${patientName} - ${appointment.type === 'consultation' ? 'Consultation' : appointment.type === 'follow-up' ? 'Suivi' : appointment.type === 'emergency' ? 'Urgence' : 'Chirurgie'}`,
        start,
        end,
        appointment,
        type: appointment.type,
        status: appointment.status,
        patientName,
        doctorName,
        duration: appointment.duration,
      }
    })
  }, [appointments])
}

