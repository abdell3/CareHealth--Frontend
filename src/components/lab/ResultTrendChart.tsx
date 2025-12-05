import * as React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/libs/utils'
import { formatDate } from '@/utils/helpers'
import type { LabResult } from '@/types/api'

interface ResultTrendChartProps {
  testName: string
  testCode?: string
  results: Array<LabResult & { date: string }>
  unit?: string
  referenceRange?: string
  className?: string
}

export const ResultTrendChart: React.FC<ResultTrendChartProps> = ({
  testName,
  testCode,
  results,
  unit,
  referenceRange,
  className,
}) => {
  if (results.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center text-gray-500">
          Aucune donnée historique disponible
        </CardContent>
      </Card>
    )
  }

  // Parse numeric values
  const numericResults = results
    .map((r) => {
      const numValue = typeof r.value === 'number' ? r.value : parseFloat(String(r.value))
      return isNaN(numValue) ? null : { ...r, numericValue: numValue }
    })
    .filter((r): r is typeof r & { numericValue: number } => r !== null)

  if (numericResults.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">{testName}</CardTitle>
          {testCode && <Badge variant="outline" className="mt-1 w-fit">{testCode}</Badge>}
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">Données non numériques - voir détails</p>
        </CardContent>
      </Card>
    )
  }

  // Calculate trend
  const firstValue = numericResults[0].numericValue
  const lastValue = numericResults[numericResults.length - 1].numericValue
  const trend = lastValue - firstValue
  const trendPercent = ((trend / firstValue) * 100).toFixed(1)

  // Find min/max for chart scaling
  const values = numericResults.map((r) => r.numericValue)
  const minValue = Math.min(...values)
  const maxValue = Math.max(...values)
  const range = maxValue - minValue || 1

  // Parse reference range if available
  let refMin: number | null = null
  let refMax: number | null = null
  if (referenceRange) {
    const match = referenceRange.match(/(\d+\.?\d*)\s*-\s*(\d+\.?\d*)/)
    if (match) {
      refMin = parseFloat(match[1])
      refMax = parseFloat(match[2])
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-semibold">{testName}</CardTitle>
            {testCode && <Badge variant="outline" className="mt-1">{testCode}</Badge>}
          </div>
          <div className="flex items-center gap-1 text-sm">
            {trend > 0 ? (
              <TrendingUp className="h-4 w-4 text-red-600" />
            ) : trend < 0 ? (
              <TrendingDown className="h-4 w-4 text-green-600" />
            ) : (
              <Minus className="h-4 w-4 text-gray-400" />
            )}
            <span className={cn(
              'font-medium',
              trend > 0 ? 'text-red-600' : trend < 0 ? 'text-green-600' : 'text-gray-600'
            )}>
              {trend > 0 ? '+' : ''}{trendPercent}%
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Simple bar chart */}
        <div className="space-y-2">
          {numericResults.map((result, index) => {
            const normalizedValue = ((result.numericValue - minValue) / range) * 100
            const isAbnormal = result.status === 'abnormal' || result.status === 'critical'
            
            return (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">{formatDate(result.date)}</span>
                  <span className={cn(
                    'font-mono font-semibold',
                    isAbnormal ? 'text-red-600' : 'text-gray-900'
                  )}>
                    {result.numericValue.toFixed(1)} {unit || result.unit || ''}
                  </span>
                </div>
                <div className="relative h-4 w-full rounded bg-gray-100">
                  {/* Reference range indicator */}
                  {refMin !== null && refMax !== null && (
                    <div
                      className="absolute h-full rounded bg-green-200 opacity-30"
                      style={{
                        left: `${((refMin - minValue) / range) * 100}%`,
                        width: `${((refMax - refMin) / range) * 100}%`,
                      }}
                    />
                  )}
                  {/* Value bar */}
                  <div
                    className={cn(
                      'h-full rounded transition-all',
                      isAbnormal
                        ? 'bg-red-500'
                        : 'bg-medical-blue-500'
                    )}
                    style={{ width: `${normalizedValue}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* Latest value highlight */}
        <div className="mt-4 rounded-lg border border-medical-blue-200 bg-medical-blue-50 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Dernière valeur</p>
              <p className="text-lg font-bold text-gray-900">
                {lastValue.toFixed(1)} {unit || numericResults[0].unit || ''}
              </p>
            </div>
            {referenceRange && (
              <div className="text-right">
                <p className="text-xs text-gray-600">Plage normale</p>
                <p className="text-sm font-medium text-gray-900">{referenceRange}</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

