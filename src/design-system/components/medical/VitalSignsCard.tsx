import { memo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react'
import { cn } from '@/libs/utils'

export interface VitalSign {
  name: string
  value: string | number
  unit: string
  normalRange?: { min: number; max: number }
  trend?: 'up' | 'down' | 'stable'
  status?: 'normal' | 'warning' | 'critical'
  timestamp?: string
}

interface VitalSignsCardProps {
  title?: string
  vitals: VitalSign[]
  showTrends?: boolean
  showNormalRange?: boolean
  className?: string
}

const getTrendIcon = (trend?: 'up' | 'down' | 'stable') => {
  switch (trend) {
    case 'up':
      return <TrendingUp className="h-4 w-4 text-red-600" />
    case 'down':
      return <TrendingDown className="h-4 w-4 text-blue-600" />
    case 'stable':
      return <Minus className="h-4 w-4 text-gray-400" />
    default:
      return null
  }
}

const getStatusBadge = (status?: 'normal' | 'warning' | 'critical') => {
  switch (status) {
    case 'critical':
      return (
        <Badge variant="destructive" className="text-xs">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Critique
        </Badge>
      )
    case 'warning':
      return (
        <Badge variant="warning" className="text-xs">
          Attention
        </Badge>
      )
    case 'normal':
      return (
        <Badge variant="success" className="text-xs">
          Normal
        </Badge>
      )
    default:
      return null
  }
}

const isValueInRange = (value: number, range?: { min: number; max: number }): boolean => {
  if (!range) return true
  return value >= range.min && value <= range.max
}

const getValueStatus = (vital: VitalSign): 'normal' | 'warning' | 'critical' => {
  if (vital.status) return vital.status

  const numValue = typeof vital.value === 'string' ? parseFloat(vital.value) : vital.value
  if (isNaN(numValue)) return 'normal'

  if (vital.normalRange) {
    const isInRange = isValueInRange(numValue, vital.normalRange)
    if (!isInRange) {
      // Determine if critical or warning based on how far from range
      const distance = Math.min(
        Math.abs(numValue - vital.normalRange.min),
        Math.abs(numValue - vital.normalRange.max)
      )
      const rangeSize = vital.normalRange.max - vital.normalRange.min
      return distance > rangeSize * 0.5 ? 'critical' : 'warning'
    }
  }

  return 'normal'
}

export const VitalSignsCard = memo<VitalSignsCardProps>(
  ({ title = 'Signes vitaux', vitals, showTrends = true, showNormalRange = true, className }) => {
    return (
      <Card className={cn('border-medical-blue-200 shadow-medical-card', className)}>
        <CardHeader className="border-b border-medical-blue-100 bg-gradient-to-r from-medical-blue-50 to-medical-green-50">
          <CardTitle className="text-lg font-semibold text-medical-blue-700">{title}</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vitals.map((vital, index) => {
              const status = getValueStatus(vital)
              const numValue = typeof vital.value === 'string' ? parseFloat(vital.value) : vital.value

              return (
                <div
                  key={index}
                  className={cn(
                    'p-3 rounded-lg border transition-colors',
                    status === 'critical'
                      ? 'bg-red-50 border-red-200'
                      : status === 'warning'
                        ? 'bg-yellow-50 border-yellow-200'
                        : 'bg-gray-50 border-gray-200'
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 mb-1">{vital.name}</div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-gray-900">
                          {typeof vital.value === 'number' ? vital.value.toFixed(1) : vital.value}
                        </span>
                        <span className="text-sm text-gray-600">{vital.unit}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {showTrends && vital.trend && getTrendIcon(vital.trend)}
                      {getStatusBadge(status)}
                    </div>
                  </div>

                  {showNormalRange && vital.normalRange && (
                    <div className="mt-2">
                      <div className="text-xs text-gray-500 mb-1">
                        Normal: {vital.normalRange.min} - {vital.normalRange.max} {vital.unit}
                      </div>
                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            'h-full transition-all',
                            status === 'critical'
                              ? 'bg-red-500'
                              : status === 'warning'
                                ? 'bg-yellow-500'
                                : 'bg-medical-green-500'
                          )}
                          style={{
                            width: `${
                              isNaN(numValue)
                                ? 0
                                : Math.min(
                                    100,
                                    Math.max(
                                      0,
                                      ((numValue - vital.normalRange.min) /
                                        (vital.normalRange.max - vital.normalRange.min)) *
                                        100
                                    )
                                  )
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {vital.timestamp && (
                    <div className="text-xs text-gray-400 mt-2">
                      {new Date(vital.timestamp).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    )
  }
)

VitalSignsCard.displayName = 'VitalSignsCard'

