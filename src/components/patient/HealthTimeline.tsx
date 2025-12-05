import * as React from 'react'
import { Calendar, FileText, FlaskConical, Pill } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/utils/helpers'
import { cn } from '@/libs/utils'

interface TimelineItem {
  id: string
  type: 'appointment' | 'prescription' | 'lab' | 'document'
  title: string
  date: string
  description?: string
}

interface HealthTimelineProps {
  items: TimelineItem[]
  className?: string
}

const typeIcons = {
  appointment: Calendar,
  prescription: Pill,
  lab: FlaskConical,
  document: FileText,
}

const typeColors = {
  appointment: 'text-blue-600 bg-blue-100',
  prescription: 'text-green-600 bg-green-100',
  lab: 'text-purple-600 bg-purple-100',
  document: 'text-gray-600 bg-gray-100',
}

export const HealthTimeline = React.forwardRef<HTMLDivElement, HealthTimelineProps>(
  ({ items, className }, ref) => {
    if (items.length === 0) {
      return (
        <Card ref={ref} className={className}>
          <CardHeader>
            <CardTitle>Historique de santé</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-sm text-gray-500">Aucun historique disponible</p>
          </CardContent>
        </Card>
      )
    }

    return (
      <Card ref={ref} className={className}>
        <CardHeader>
          <CardTitle>Historique de santé</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />

            <div className="space-y-6">
              {items.map((item, index) => {
                const Icon = typeIcons[item.type]
                const colorClass = typeColors[item.type]

                return (
                  <div key={item.id} className="relative flex gap-4">
                    {/* Icon */}
                    <div
                      className={cn(
                        'relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full',
                        colorClass
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-6">
                      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{item.title}</h4>
                            {item.description && (
                              <p className="mt-1 text-sm text-gray-600">{item.description}</p>
                            )}
                          </div>
                          <span className="ml-4 text-xs text-gray-500">{formatDate(item.date)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }
)
HealthTimeline.displayName = 'HealthTimeline'

