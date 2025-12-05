import * as React from 'react'
import { cn } from '@/libs/utils'
import type { LabResult } from '@/types/api'

interface VitalsChartProps {
  results: LabResult[]
  testName: string
  className?: string
}

export const VitalsChart = React.forwardRef<HTMLDivElement, VitalsChartProps>(
  ({ results, testName, className }, ref) => {
    if (results.length === 0) {
      return (
        <div ref={ref} className={cn('text-center text-sm text-gray-500', className)}>
          Aucune donnée disponible
        </div>
      )
    }

    // Simple bar chart representation
    const maxValue = Math.max(
      ...results.map((r) => (typeof r.value === 'number' ? r.value : parseFloat(String(r.value)) || 0))
    )
    const minValue = Math.min(
      ...results.map((r) => (typeof r.value === 'number' ? r.value : parseFloat(String(r.value)) || 0))
    )

    return (
      <div ref={ref} className={cn('space-y-4', className)}>
        <h4 className="text-sm font-semibold text-gray-700">{testName}</h4>
        <div className="space-y-2">
          {results.map((result, index) => {
            const value = typeof result.value === 'number' ? result.value : parseFloat(String(result.value)) || 0
            const percentage = maxValue > minValue ? ((value - minValue) / (maxValue - minValue)) * 100 : 50

            return (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">
                    {result.value} {result.unit || ''}
                  </span>
                  <span
                    className={cn(
                      'rounded px-2 py-0.5 text-xs font-medium',
                      result.status === 'normal'
                        ? 'bg-green-100 text-green-700'
                        : result.status === 'abnormal'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                    )}
                  >
                    {result.status === 'normal'
                      ? 'Normal'
                      : result.status === 'abnormal'
                        ? 'Anormal'
                        : 'Critique'}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                  <div
                    className={cn(
                      'h-full transition-all',
                      result.status === 'normal'
                        ? 'bg-green-500'
                        : result.status === 'abnormal'
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                    )}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                {result.referenceRange && (
                  <p className="text-xs text-gray-500">Référence: {result.referenceRange}</p>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }
)
VitalsChart.displayName = 'VitalsChart'

