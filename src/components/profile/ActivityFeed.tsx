import * as React from 'react'
import { Clock, FileText, Calendar, Pill, FlaskConical } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDateTime } from '@/utils/helpers'

interface ActivityItem {
  id: string
  type: 'appointment' | 'prescription' | 'document' | 'lab' | 'login' | 'other'
  title: string
  description?: string
  timestamp: string
  icon?: React.ReactNode
}

interface ActivityFeedProps {
  activities?: ActivityItem[]
  className?: string
}

const getActivityIcon = (type: ActivityItem['type']) => {
  switch (type) {
    case 'appointment':
      return Calendar
    case 'prescription':
      return Pill
    case 'document':
      return FileText
    case 'lab':
      return FlaskConical
    case 'login':
      return Clock
    default:
      return Clock
  }
}

export const ActivityFeed = React.forwardRef<HTMLDivElement, ActivityFeedProps>(
  ({ activities = [], className }, ref) => {
    return (
      <Card ref={ref} className={className}>
        <CardHeader>
          <CardTitle>Historique d'activité</CardTitle>
        </CardHeader>
        <CardContent>
          {activities.length === 0 ? (
            <p className="text-center text-sm text-gray-500">Aucune activité récente</p>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => {
                const Icon = getActivityIcon(activity.type)
                return (
                  <div key={activity.id} className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-medical-blue-100">
                      <Icon className="h-5 w-5 text-medical-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{activity.title}</p>
                      {activity.description && (
                        <p className="mt-1 text-sm text-gray-600">{activity.description}</p>
                      )}
                      <p className="mt-1 text-xs text-gray-500">
                        {formatDateTime(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }
)
ActivityFeed.displayName = 'ActivityFeed'

