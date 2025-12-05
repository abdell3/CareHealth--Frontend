import * as React from 'react'
import { RefreshCw, AlertCircle, MoreVertical } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/libs/utils'

export interface BaseWidgetProps {
  id: string
  title: string
  icon?: React.ReactNode
  className?: string
  headerClassName?: string
  children: React.ReactNode
  isLoading?: boolean
  error?: string | null
  onRefresh?: () => void
  actions?: React.ReactNode
  size?: 'small' | 'medium' | 'large'
}

export const BaseWidget = React.forwardRef<HTMLDivElement, BaseWidgetProps>(
  (
    {
      id,
      title,
      icon,
      className,
      headerClassName,
      children,
      isLoading,
      error,
      onRefresh,
      actions,
      size = 'medium',
    },
    ref
  ) => {
    const sizeClasses = {
      small: 'col-span-1',
      medium: 'col-span-1 md:col-span-2',
      large: 'col-span-1 md:col-span-2 lg:col-span-3',
    }

    return (
      <Card
        ref={ref}
        id={id}
        className={cn(
          'border-medical-blue-200 shadow-medical-card transition-all hover:shadow-lg',
          sizeClasses[size],
          className
        )}
      >
        <CardHeader
          className={cn(
            'flex flex-row items-center justify-between border-b border-medical-blue-200 bg-gradient-to-r from-medical-blue-50 to-medical-green-50 px-6 py-4',
            headerClassName
          )}
        >
          <div className="flex items-center gap-3">
            {icon && <div className="text-medical-blue-600">{icon}</div>}
            <CardTitle className="text-lg font-semibold text-medical-blue-700">{title}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {onRefresh && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onRefresh}
                disabled={isLoading}
                className="h-8 w-8"
              >
                <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
              </Button>
            )}
            {actions}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {error ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <AlertCircle className="mb-2 h-8 w-8 text-red-500" />
              <p className="text-sm text-red-600">{error}</p>
              {onRefresh && (
                <Button variant="outline" size="sm" onClick={onRefresh} className="mt-4">
                  Réessayer
                </Button>
              )}
            </div>
          ) : isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-4 animate-pulse rounded bg-gray-200" />
              ))}
            </div>
          ) : (
            children
          )}
        </CardContent>
      </Card>
    )
  }
)
BaseWidget.displayName = 'BaseWidget'

