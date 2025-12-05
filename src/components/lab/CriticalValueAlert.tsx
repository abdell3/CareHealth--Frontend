import * as React from 'react'
import { AlertTriangle, Bell, X } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/libs/utils'
import type { LabResult } from '@/types/api'

interface CriticalValueAlertProps {
  results: LabResult[]
  onDismiss?: (resultId: string) => void
  onView?: (resultId: string) => void
  className?: string
}

export const CriticalValueAlert: React.FC<CriticalValueAlertProps> = ({
  results,
  onDismiss,
  onView,
  className,
}) => {
  const criticalResults = results.filter((r) => r.status === 'critical' || r.isCritical)

  if (criticalResults.length === 0) {
    return null
  }

  return (
    <div className={cn('space-y-3', className)}>
      {criticalResults.map((result) => (
        <Card
          key={result.id}
          className="border-red-500 bg-red-50 animate-pulse"
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-red-900">Valeur critique détectée</h4>
                  <Badge variant="destructive">CRITIQUE</Badge>
                </div>
                <p className="text-sm font-medium text-red-800">
                  {result.testName}: {result.value} {result.unit}
                </p>
                {result.referenceRange && (
                  <p className="text-xs text-red-700 mt-1">
                    Plage normale: {result.referenceRange}
                  </p>
                )}
                {result.technicianNotes && (
                  <p className="text-xs text-red-600 mt-2">{result.technicianNotes}</p>
                )}
                <div className="mt-3 flex gap-2">
                  {onView && result.id && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-300 text-red-700 hover:bg-red-100"
                      onClick={() => onView(result.id!)}
                    >
                      Voir détails
                    </Button>
                  )}
                  {onDismiss && result.id && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDismiss(result.id!)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

