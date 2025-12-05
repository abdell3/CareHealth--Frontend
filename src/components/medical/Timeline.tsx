import * as React from 'react'
import { cn } from '@/libs/utils'
import { formatDate } from '@/utils/helpers'

interface TimelineItem {
  id: string
  date: string
  title: string
  description?: string
  type?: 'allergy' | 'surgery' | 'vaccination' | 'medical-history' | 'other'
  icon?: React.ReactNode
}

interface TimelineProps {
  items: TimelineItem[]
  className?: string
}

const typeColors = {
  allergy: 'bg-red-100 text-red-700 border-red-300',
  surgery: 'bg-orange-100 text-orange-700 border-orange-300',
  vaccination: 'bg-green-100 text-green-700 border-green-300',
  'medical-history': 'bg-blue-100 text-blue-700 border-blue-300',
  other: 'bg-gray-100 text-gray-700 border-gray-300',
}

export const Timeline = React.forwardRef<HTMLDivElement, TimelineProps>(
  ({ items, className }, ref) => {
    return (
      <div ref={ref} className={cn('relative', className)}>
        {/* Vertical line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-medical-blue-200" />

        <div className="space-y-6">
          {items.map((item, index) => (
            <div key={item.id} className="relative flex gap-4">
              {/* Icon/Dot */}
              <div
                className={cn(
                  'relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 bg-white',
                  typeColors[item.type || 'other']
                )}
              >
                {item.icon || (
                  <div className="h-3 w-3 rounded-full bg-current" />
                )}
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
                    <span className="ml-4 text-xs text-gray-500">
                      {formatDate(item.date)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }
)
Timeline.displayName = 'Timeline'

