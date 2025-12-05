import * as React from 'react'
import { AlertTriangle, CheckCircle, X, ArrowRight } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { formatDateTime } from '@/utils/helpers'
import { cn } from '@/libs/utils'
import type { ScheduleConflict, MedicalEvent } from '@/types/calendar'

interface ScheduleConflictAlertProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  conflicts: ScheduleConflict[]
  events: MedicalEvent[]
  onResolve?: (conflictId: string, solution: { start: Date; end: Date; resourceId?: string }) => void
  onForceOverride?: (conflictId: string) => void
  canForceOverride?: boolean
}

export const ScheduleConflictAlert: React.FC<ScheduleConflictAlertProps> = ({
  open,
  onOpenChange,
  conflicts,
  events,
  onResolve,
  onForceOverride,
  canForceOverride = false,
}) => {
  const [selectedSolutions, setSelectedSolutions] = React.useState<Record<string, number>>({})

  const getEvent = (eventId: string) => events.find((e) => e.id === eventId)

  const getConflictReason = (reason: ScheduleConflict['reason']) => {
    switch (reason) {
      case 'overlap':
        return 'Chevauchement avec un autre rendez-vous'
      case 'resource_unavailable':
        return 'Ressource indisponible'
      case 'buffer_violation':
        return 'Violation du buffer entre rendez-vous'
      case 'rule_violation':
        return 'Violation des règles métier'
      default:
        return 'Conflit détecté'
    }
  }

  const handleResolve = (conflict: ScheduleConflict) => {
    const solutionIndex = selectedSolutions[conflict.eventId]
    if (solutionIndex !== undefined && conflict.suggestions) {
      const solution = conflict.suggestions[solutionIndex]
      onResolve?.(conflict.eventId, solution)
    }
  }

  if (conflicts.length === 0) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Conflits de planning détectés
          </DialogTitle>
          <DialogDescription>
            {conflicts.length} conflit{conflicts.length > 1 ? 's' : ''} détecté
            {conflicts.length > 1 ? 's' : ''}. Veuillez les résoudre avant de continuer.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {conflicts.map((conflict, index) => {
            const event = getEvent(conflict.eventId)
            if (!event) return null

            return (
              <Alert
                key={conflict.eventId}
                variant={conflict.severity === 'error' ? 'destructive' : 'default'}
                className="border-yellow-200 bg-yellow-50"
              >
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-3">
                    <div>
                      <p className="font-semibold text-gray-900">
                        Conflit #{index + 1}: {event.patient.name}
                      </p>
                      <p className="mt-1 text-sm text-gray-600">
                        {getConflictReason(conflict.reason)}
                      </p>
                      <p className="mt-1 text-sm text-gray-600">
                        {formatDateTime(event.start)} - {event.end.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>

                    {/* Conflicting Events */}
                    {conflict.conflictingEventIds.length > 0 && (
                      <div className="mt-2 rounded-lg border border-yellow-200 bg-white p-3">
                        <p className="mb-2 text-xs font-medium text-gray-700">
                          En conflit avec:
                        </p>
                        <div className="space-y-1">
                          {conflict.conflictingEventIds.map((conflictId) => {
                            const conflictEvent = getEvent(conflictId)
                            if (!conflictEvent) return null
                            return (
                              <div key={conflictId} className="flex items-center justify-between text-xs">
                                <span className="text-gray-700">
                                  {conflictEvent.patient.name} - {formatDateTime(conflictEvent.start)}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {conflictEvent.type}
                                </Badge>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Suggestions */}
                    {conflict.suggestions && conflict.suggestions.length > 0 && (
                      <div className="mt-3">
                        <p className="mb-2 text-xs font-medium text-gray-700">
                          Créneaux alternatifs suggérés:
                        </p>
                        <div className="space-y-2">
                          {conflict.suggestions.map((suggestion, suggestionIndex) => (
                            <div
                              key={suggestionIndex}
                              className={cn(
                                'flex cursor-pointer items-center justify-between rounded-lg border p-2 transition-colors',
                                selectedSolutions[conflict.eventId] === suggestionIndex
                                  ? 'border-medical-blue-500 bg-medical-blue-50'
                                  : 'border-gray-200 hover:border-medical-blue-300'
                              )}
                              onClick={() =>
                                setSelectedSolutions({
                                  ...selectedSolutions,
                                  [conflict.eventId]: suggestionIndex,
                                })
                              }
                            >
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {formatDateTime(suggestion.start)}
                                </p>
                                <p className="text-xs text-gray-600">
                                  {suggestion.end.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                  {suggestion.resourceId && ` • Ressource: ${suggestion.resourceId}`}
                                </p>
                              </div>
                              {selectedSolutions[conflict.eventId] === suggestionIndex && (
                                <CheckCircle className="h-5 w-5 text-medical-blue-600" />
                              )}
                            </div>
                          ))}
                        </div>
                        <Button
                          size="sm"
                          className="mt-2 w-full"
                          onClick={() => handleResolve(conflict)}
                          disabled={selectedSolutions[conflict.eventId] === undefined}
                        >
                          <ArrowRight className="mr-2 h-4 w-4" />
                          Appliquer cette solution
                        </Button>
                      </div>
                    )}

                    {/* Force Override */}
                    {canForceOverride && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 w-full border-red-300 text-red-700 hover:bg-red-50"
                        onClick={() => onForceOverride?.(conflict.eventId)}
                      >
                        Forcer l'override (Admin uniquement)
                      </Button>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )
          })}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

