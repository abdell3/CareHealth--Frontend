import * as React from 'react'
import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CalendarEventComponent } from './CalendarEvent'
import { useCalendarEvents, type CalendarEvent } from '@/hooks/useCalendarEvents'
import { cn } from '@/libs/utils'
import type { Appointment } from '@/types/api'

interface MedicalCalendarProps {
  appointments: Appointment[]
  onEventClick?: (appointment: Appointment) => void
  onDateClick?: (date: Date) => void
  viewMode?: 'month' | 'week' | 'day'
  className?: string
}

const DAYS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
const MONTHS = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre',
]

export const MedicalCalendar = React.forwardRef<HTMLDivElement, MedicalCalendarProps>(
  ({ appointments, onEventClick, onDateClick, viewMode = 'month', className }, ref) => {
    const [currentDate, setCurrentDate] = useState(new Date())
    const events = useCalendarEvents(appointments)

    // Get start and end of month
    const monthStart = useMemo(() => {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      date.setDate(date.getDate() - date.getDay()) // Start from Sunday
      return date
    }, [currentDate])

    const monthEnd = useMemo(() => {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
      const lastDay = date.getDate()
      const lastDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), lastDay)
      const daysToAdd = 6 - lastDate.getDay()
      lastDate.setDate(lastDate.getDate() + daysToAdd)
      return lastDate
    }, [currentDate])

    // Generate calendar days
    const calendarDays = useMemo(() => {
      const days: Date[] = []
      const current = new Date(monthStart)
      while (current <= monthEnd) {
        days.push(new Date(current))
        current.setDate(current.getDate() + 1)
      }
      return days
    }, [monthStart, monthEnd])

    // Get events for a specific date
    const getEventsForDate = (date: Date): CalendarEvent[] => {
      return events.filter((event) => {
        const eventDate = new Date(event.start)
        return (
          eventDate.getDate() === date.getDate() &&
          eventDate.getMonth() === date.getMonth() &&
          eventDate.getFullYear() === date.getFullYear()
        )
      })
    }

    // Check if date is today
    const isToday = (date: Date): boolean => {
      const today = new Date()
      return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      )
    }

    // Check if date is weekend
    const isWeekend = (date: Date): boolean => {
      const day = date.getDay()
      return day === 0 || day === 6
    }

    // Check if date is in current month
    const isCurrentMonth = (date: Date): boolean => {
      return date.getMonth() === currentDate.getMonth()
    }

    // Navigation
    const goToPreviousMonth = () => {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
    }

    const goToNextMonth = () => {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
    }

    const goToToday = () => {
      setCurrentDate(new Date())
    }

    return (
      <Card ref={ref} className={cn('border-medical-blue-200 shadow-medical-card', className)}>
        <CardContent className="p-6">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold text-medical-blue-700">
                {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <Button variant="outline" size="sm" onClick={goToToday}>
                Aujourd'hui
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={goToNextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Day headers */}
            {DAYS.map((day) => (
              <div
                key={day}
                className="p-2 text-center text-sm font-semibold text-gray-700"
              >
                {day}
              </div>
            ))}

            {/* Calendar cells */}
            {calendarDays.map((date, index) => {
              const dayEvents = getEventsForDate(date)
              const isCurrentMonthDay = isCurrentMonth(date)
              const isTodayDay = isToday(date)
              const isWeekendDay = isWeekend(date)

              return (
                <div
                  key={index}
                  className={cn(
                    'min-h-[100px] border border-gray-200 p-2',
                    isWeekendDay && 'bg-gray-50',
                    !isCurrentMonthDay && 'bg-gray-50/50 opacity-50',
                    isTodayDay && 'ring-2 ring-medical-blue-500'
                  )}
                  onClick={() => onDateClick?.(date)}
                >
                  <div
                    className={cn(
                      'mb-1 text-sm font-medium',
                      isTodayDay && 'text-medical-blue-600',
                      !isCurrentMonthDay && 'text-gray-400'
                    )}
                  >
                    {date.getDate()}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map((event) => (
                      <CalendarEventComponent
                        key={event.id}
                        event={event}
                        onClick={() => onEventClick?.(event.appointment)}
                      />
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-gray-500">
                        +{dayEvents.length - 3} autres
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Legend */}
          <div className="mt-6 flex flex-wrap items-center gap-4 border-t pt-4">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded border border-blue-200 bg-blue-50" />
              <span className="text-sm text-gray-700">Consultation</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded border border-green-200 bg-green-50" />
              <span className="text-sm text-gray-700">Suivi</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded border border-dashed border-red-300 bg-red-50" />
              <span className="text-sm text-gray-700">Urgence</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded border border-purple-300 bg-purple-50" />
              <span className="text-sm text-gray-700">Chirurgie</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }
)
MedicalCalendar.displayName = 'MedicalCalendar'

