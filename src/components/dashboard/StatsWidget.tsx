import * as React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { BaseWidget, type BaseWidgetProps } from './BaseWidget'
import { cn } from '@/libs/utils'

interface StatsWidgetProps extends Omit<BaseWidgetProps, 'children'> {
  value: string | number
  trend?: {
    value: number
    label: string
  }
  subtitle?: string
  icon?: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger'
}

const variantClasses = {
  default: 'from-medical-blue-50 to-medical-green-50',
  success: 'from-green-50 to-emerald-50',
  warning: 'from-yellow-50 to-orange-50',
  danger: 'from-red-50 to-rose-50',
}

export const StatsWidget = React.forwardRef<HTMLDivElement, StatsWidgetProps>(
  ({ value, trend, subtitle, icon, variant = 'default', ...props }, ref) => {
    const getTrendIcon = () => {
      if (!trend) return null
      if (trend.value > 0) return <TrendingUp className="h-4 w-4 text-green-600" />
      if (trend.value < 0) return <TrendingDown className="h-4 w-4 text-red-600" />
      return <Minus className="h-4 w-4 text-gray-400" />
    }

    return (
      <BaseWidget
        ref={ref}
        {...props}
        headerClassName={cn(variantClasses[variant])}
        icon={icon}
      >
        <div className="flex items-end justify-between">
          <div>
            <p className="text-4xl font-bold text-gray-900">{value}</p>
            {subtitle && <p className="mt-2 text-sm text-gray-600">{subtitle}</p>}
            {trend && (
              <div className="mt-2 flex items-center gap-1 text-sm">
                {getTrendIcon()}
                <span
                  className={cn(
                    trend.value > 0 ? 'text-green-600' : trend.value < 0 ? 'text-red-600' : 'text-gray-600'
                  )}
                >
                  {Math.abs(trend.value)}% {trend.label}
                </span>
              </div>
            )}
          </div>
        </div>
      </BaseWidget>
    )
  }
)
StatsWidget.displayName = 'StatsWidget'

