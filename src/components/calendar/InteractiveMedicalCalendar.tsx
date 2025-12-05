import * as React from 'react'
import { useState, useMemo, useCallback } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Grid,
  Calendar as CalendarIcon,
  List,
  Users,
  Settings,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CalendarEventComponent } from './CalendarEvent'
import { EventTooltip } from './EventTooltip'
import { ScheduleConflictAlert } from './ScheduleConflictAlert'
import { ResourceScheduler } from './ResourceScheduler'
import { useCalendarEvents } from '@/hooks/useCalendarEvents'
import { cn } from '@/libs/utils'
import { formatDate, formatDateTime } from '@/utils/helpers'
import type { Appointment } from '@/types/api'
import type { CalendarResource, MedicalEvent, CalendarViewMode, ScheduleConflict } from '@/types/calendar'

interface InteractiveMedicalCalendarProps {
  appointments: Appointment[]
  resources?: CalendarResource[]
  onEventClick?: (appointment: Appointment) => void
  onEventMove?: (appointmentId: string, newStart: Date, newResourceId?: string) => void
  onEventResize?: (appointmentId: string, newDuration: number) => void
  onDateClick?: (date: Date, resourceId?: string) => void
  onResourceChange?: (resources: CalendarResource[]) => void
  className?: string
}

const DAYS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
const HOURS = Array.from({ length: 15 }, (_, i) => i + 7) // 7h to 21h

export const InteractiveMedicalCalendar: React.FC<InteractiveMedicalCalendarProps> = ({
  appointments,
  resources = [],
  onEventClick,
  onEventMove,
  onEventResize,
  onDateClick,
  onResourceChange,
  className,
}) => {
  const [viewMode, setViewMode] = useState<CalendarViewMode>('week')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedResources, setSelectedResources] = useState<Set<string>>(
    new Set(resources.map((r) => r.id))
  )
  const [hoveredEvent, setHoveredEvent] = useState<{ event: MedicalEvent; position: { x: number; y: number } } | null>(null)
  const [conflicts, setConflicts] = useState<ScheduleConflict[]>([])
  const [showConflicts, setShowConflicts] = useState(false)
  const [showResourceScheduler, setShowResourceScheduler] = useState(false)
  const [draggedEvent, setDraggedEvent] = useState<{ event: MedicalEvent; offset: { x: number; y: number } } | null>(null)

  const events = useCalendarEvents(appointments)

  // Convert to MedicalEvent format
  const medicalEvents = useMemo((): MedicalEvent[] => {
    return events.map((event) => ({
      id: event.id,
      title: event.title,
      start: event.start,
      end: event.end,
      resourceId: event.appointment.doctorId || 'default',
      type: event.type,
      status: event.status,
      patient: {
        id: event.appointment.patientId,
        name: event.patientName,
      },
      doctor: event.appointment.doctor
        ? {
            id: event.appointment.doctorId,
            name: event.doctorName,
          }
        : undefined,
      priority: event.appointment.priority || 'normal',
      metadata: {
        duration: event.duration,
        location: event.appointment.location,
        notes: event.appointment.notes,
        bufferBefore: event.appointment.metadata?.bufferBefore,
        bufferAfter: event.appointment.metadata?.bufferAfter,
      },
      appointment: event.appointment,
    }))
  }, [events])

  // Detect conflicts
  const detectConflicts = useCallback(() => {
    const detectedConflicts: ScheduleConflict[] = []

    medicalEvents.forEach((event) => {
      const overlapping = medicalEvents.filter((other) => {
        if (other.id === event.id) return false
        if (other.resourceId !== event.resourceId) return false

        // Check time overlap
        return (
          (other.start < event.end && other.end > event.start) ||
          (event.start < other.end && event.end > other.start)
        )
      })

      if (overlapping.length > 0) {
        detectedConflicts.push({
          eventId: event.id,
          conflictingEventIds: overlapping.map((e) => e.id),
          reason: 'overlap',
          severity: 'error',
          suggestions: generateSuggestions(event, medicalEvents, resources),
        })
      }
    })

    setConflicts(detectedConflicts)
    if (detectedConflicts.length > 0) {
      setShowConflicts(true)
    }
  }, [medicalEvents, resources])

  // Generate suggestions for conflicts
  const generateSuggestions = (
    event: MedicalEvent,
    allEvents: MedicalEvent[],
    availableResources: CalendarResource[]
  ): Array<{ start: Date; end: Date; resourceId?: string }> => {
    const suggestions: Array<{ start: Date; end: Date; resourceId?: string }> = []
    const duration = event.end.getTime() - event.start.getTime()

    // Try same day, different times
    const sameDay = new Date(event.start)
    sameDay.setHours(9, 0, 0, 0) // Start at 9 AM
    for (let i = 0; i < 8; i++) {
      const suggestionStart = new Date(sameDay)
      suggestionStart.setHours(9 + i, 0, 0, 0)
      const suggestionEnd = new Date(suggestionStart.getTime() + duration)

      const hasConflict = allEvents.some(
        (e) =>
          e.id !== event.id &&
          e.resourceId === event.resourceId &&
          e.start < suggestionEnd &&
          e.end > suggestionStart
      )

      if (!hasConflict) {
        suggestions.push({ start: suggestionStart, end: suggestionEnd })
      }
    }

    // Try different resources
    availableResources.forEach((resource) => {
      if (resource.id !== event.resourceId) {
        suggestions.push({
          start: event.start,
          end: event.end,
          resourceId: resource.id,
        })
      }
    })

    return suggestions.slice(0, 5) // Limit to 5 suggestions
  }

  // Get week start and end
  const weekStart = useMemo(() => {
    const date = new Date(currentDate)
    const day = date.getDay()
    const diff = date.getDate() - day + (day === 0 ? -6 : 1) // Monday
    return new Date(date.setDate(diff))
  }, [currentDate])

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(weekStart)
      date.setDate(weekStart.getDate() + i)
      return date
    })
  }, [weekStart])

  // Get events for a specific day and resource
  const getEventsForDayAndResource = (date: Date, resourceId: string) => {
    return medicalEvents.filter((event) => {
      const eventDate = new Date(event.start)
      return (
        eventDate.toDateString() === date.toDateString() &&
        event.resourceId === resourceId
      )
    })
  }

  // Handle drag start
  const handleDragStart = (event: MedicalEvent, e: React.MouseEvent) => {
    setDraggedEvent({
      event,
      offset: {
        x: e.clientX - e.currentTarget.getBoundingClientRect().left,
        y: e.clientY - e.currentTarget.getBoundingClientRect().top,
      },
    })
  }

  // Handle drag end
  const handleDragEnd = () => {
    if (draggedEvent) {
      // In real app, calculate new position and call onEventMove
      setDraggedEvent(null)
    }
  }

  // Handle mouse move for drag
  React.useEffect(() => {
    if (!draggedEvent) return

    const handleMouseMove = (e: MouseEvent) => {
      // Calculate new position based on mouse position
      // This is simplified - in real app, snap to grid
    }

    const handleMouseUp = () => {
      handleDragEnd()
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [draggedEvent])

  // Navigate dates
  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1))
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7))
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1))
    }
    setCurrentDate(newDate)
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" onClick={() => navigateDate('prev')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-center">
                <h2 className="text-xl font-bold text-gray-900">
                  {viewMode === 'day'
                    ? formatDate(currentDate)
                    : viewMode === 'week'
                      ? `Semaine du ${formatDate(weekStart)}`
                      : currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                </h2>
              </div>
              <Button variant="outline" size="icon" onClick={() => navigateDate('next')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                Aujourd'hui
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as CalendarViewMode)}>
                <TabsList>
                  <TabsTrigger value="day">
                    <CalendarIcon className="h-4 w-4" />
                  </TabsTrigger>
                  <TabsTrigger value="week">
                    <Grid className="h-4 w-4" />
                  </TabsTrigger>
                  <TabsTrigger value="month">
                    <CalendarIcon className="h-4 w-4" />
                  </TabsTrigger>
                  <TabsTrigger value="resources">
                    <Users className="h-4 w-4" />
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <Button variant="outline" size="icon" onClick={() => setShowResourceScheduler(true)}>
                <Settings className="h-4 w-4" />
              </Button>
              {conflicts.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowConflicts(true)}
                  className="border-red-300 text-red-700"
                >
                  {conflicts.length} conflit{conflicts.length > 1 ? 's' : ''}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Calendar View */}
      {viewMode === 'week' && (
        <Card className="border-medical-blue-200 shadow-medical-card">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <div className="min-w-[1200px]">
                {/* Header with resources */}
                <div className="grid grid-cols-[200px_repeat(7,1fr)] border-b">
                  <div className="border-r p-2 font-semibold text-gray-900">Ressources</div>
                  {weekDays.map((day) => (
                    <div
                      key={day.toISOString()}
                      className={cn(
                        'border-r p-2 text-center',
                        day.toDateString() === new Date().toDateString() &&
                          'bg-medical-blue-50 font-semibold text-medical-blue-900'
                      )}
                    >
                      <div className="text-sm">{DAYS[day.getDay()]}</div>
                      <div className="text-lg">{day.getDate()}</div>
                    </div>
                  ))}
                </div>

                {/* Resources rows */}
                {resources
                  .filter((r) => selectedResources.has(r.id))
                  .map((resource) => (
                    <div key={resource.id} className="grid grid-cols-[200px_repeat(7,1fr)] border-b">
                      <div className="border-r p-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-4 w-4 rounded"
                            style={{ backgroundColor: resource.color || '#3b82f6' }}
                          />
                          <span className="font-medium text-gray-900">{resource.title}</span>
                        </div>
                      </div>
                      {weekDays.map((day) => {
                        const dayEvents = getEventsForDayAndResource(day, resource.id)
                        return (
                          <div
                            key={day.toISOString()}
                            className={cn(
                              'relative min-h-[200px] border-r p-2',
                              day.toDateString() === new Date().toDateString() &&
                                'bg-medical-blue-50/30'
                            )}
                            onDoubleClick={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect()
                              const x = e.clientX - rect.left
                              const hour = Math.floor((x / rect.width) * 15) + 7
                              const clickDate = new Date(day)
                              clickDate.setHours(hour, 0, 0, 0)
                              onDateClick?.(clickDate, resource.id)
                            }}
                          >
                            {dayEvents.map((event) => {
                              const startHour = event.start.getHours() + event.start.getMinutes() / 60
                              const durationHours = (event.end.getTime() - event.start.getTime()) / (1000 * 60 * 60)
                              const topPercent = ((startHour - 7) / 15) * 100
                              const heightPercent = (durationHours / 15) * 100

                              return (
                                <div
                                  key={event.id}
                                  className="absolute cursor-move rounded border p-1 text-xs transition-all hover:z-10 hover:shadow-lg"
                                  style={{
                                    top: `${topPercent}%`,
                                    height: `${heightPercent}%`,
                                    left: '4px',
                                    right: '4px',
                                  }}
                                  onMouseDown={(e) => handleDragStart(event, e)}
                                  onMouseEnter={(e) => {
                                    setHoveredEvent({
                                      event,
                                      position: { x: e.clientX, y: e.clientY },
                                    })
                                  }}
                                  onMouseLeave={() => setHoveredEvent(null)}
                                  onClick={() => onEventClick?.(event.appointment)}
                                >
                                  <CalendarEventComponent
                                    event={{
                                      id: event.id,
                                      title: event.title,
                                      start: event.start,
                                      end: event.end,
                                      appointment: event.appointment,
                                      type: event.type,
                                      status: event.status,
                                      patientName: event.patient.name,
                                      doctorName: event.doctor?.name || '',
                                      duration: event.metadata.duration,
                                    }}
                                  />
                                </div>
                              )
                            })}
                          </div>
                        )
                      })}
                    </div>
                  ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Day View */}
      {viewMode === 'day' && (
        <Card className="border-medical-blue-200 shadow-medical-card">
          <CardContent className="p-0">
            <div className="grid grid-cols-[100px_1fr]">
              {/* Time column */}
              <div className="border-r">
                {HOURS.map((hour) => (
                  <div key={hour} className="border-b p-2 text-right text-sm text-gray-600">
                    {hour}:00
                  </div>
                ))}
              </div>
              {/* Events column */}
              <div className="relative min-h-[600px]">
                {HOURS.map((hour) => (
                  <div
                    key={hour}
                    className="border-b p-2"
                    onDoubleClick={(e) => {
                      const clickDate = new Date(currentDate)
                      clickDate.setHours(hour, 0, 0, 0)
                      onDateClick?.(clickDate)
                    }}
                  >
                    {medicalEvents
                      .filter((event) => {
                        const eventHour = event.start.getHours()
                        return eventHour === hour && event.start.toDateString() === currentDate.toDateString()
                      })
                      .map((event) => (
                        <CalendarEventComponent
                          key={event.id}
                          event={{
                            id: event.id,
                            title: event.title,
                            start: event.start,
                            end: event.end,
                            appointment: event.appointment,
                            type: event.type,
                            status: event.status,
                            patientName: event.patient.name,
                            doctorName: event.doctor?.name || '',
                            duration: event.metadata.duration,
                          }}
                          onClick={() => onEventClick?.(event.appointment)}
                        />
                      ))}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tooltip */}
      {hoveredEvent && (
        <EventTooltip
          event={hoveredEvent.event}
          position={hoveredEvent.position}
          onEdit={(e) => onEventClick?.(e.appointment)}
        />
      )}

      {/* Conflict Alert */}
      <ScheduleConflictAlert
        open={showConflicts}
        onOpenChange={setShowConflicts}
        conflicts={conflicts}
        events={medicalEvents}
        onResolve={(eventId, solution) => {
          onEventMove?.(eventId, solution.start, solution.resourceId)
          detectConflicts()
        }}
        canForceOverride={true}
      />

      {/* Resource Scheduler */}
      {showResourceScheduler && onResourceChange && (
        <Card>
          <CardHeader>
            <CardTitle>Gestion des ressources</CardTitle>
          </CardHeader>
          <CardContent>
            <ResourceScheduler
              resources={resources}
              onResourcesChange={onResourceChange}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}

