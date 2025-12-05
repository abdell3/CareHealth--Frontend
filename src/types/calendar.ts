import type { Appointment, Patient, User } from './api'

export interface CalendarResource {
  id: string
  title: string
  type: 'doctor' | 'room' | 'equipment'
  color?: string
  availability?: {
    start: string // HH:mm
    end: string // HH:mm
    daysOfWeek?: number[] // 0-6, Sunday-Saturday
  }
  unavailability?: Array<{
    start: Date
    end: Date
    reason?: string
  }>
}

export interface MedicalEvent {
  id: string
  title: string
  start: Date
  end: Date
  resourceId: string
  type: 'consultation' | 'surgery' | 'emergency' | 'teleconsultation' | 'follow-up'
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'no-show'
  patient: { id: string; name: string; photo?: string }
  doctor?: { id: string; name: string }
  priority: 'low' | 'normal' | 'high' | 'urgent'
  metadata: {
    duration: number
    location?: string
    notes?: string
    preparation?: string[]
    bufferBefore?: number
    bufferAfter?: number
  }
  appointment: Appointment
}

export interface ScheduleConflict {
  eventId: string
  conflictingEventIds: string[]
  reason: 'overlap' | 'resource_unavailable' | 'buffer_violation' | 'rule_violation'
  severity: 'warning' | 'error'
  suggestions?: Array<{
    start: Date
    end: Date
    resourceId?: string
  }>
}

export type CalendarViewMode = 'day' | 'week' | 'month' | 'resources' | 'agenda'

