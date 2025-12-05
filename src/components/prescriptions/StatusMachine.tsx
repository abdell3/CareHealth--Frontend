import * as React from 'react'
import { Clock, Building, Package, CheckCircle, XCircle, ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/libs/utils'
import { formatDate, formatDateTime } from '@/utils/helpers'
import type { Prescription } from '@/types/api'

interface StatusMachineProps {
  prescription: Prescription
  onStatusChange?: (newStatus: Prescription['status']) => void
  canChangeStatus?: boolean
  className?: string
}

type WorkflowStep = {
  status: Prescription['status']
  label: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  bgColor: string
}

const workflowSteps: WorkflowStep[] = [
  {
    status: 'pending',
    label: 'Créée',
    icon: Clock,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50 border-yellow-200',
  },
  {
    status: 'assigned',
    label: 'Assignée',
    icon: Building,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 border-blue-200',
  },
  {
    status: 'ready',
    label: 'Prête',
    icon: Package,
    color: 'text-green-600',
    bgColor: 'bg-green-50 border-green-200',
  },
  {
    status: 'dispensed',
    label: 'Dispensée',
    icon: CheckCircle,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 border-purple-200',
  },
  {
    status: 'unavailable',
    label: 'Indisponible',
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50 border-red-200',
  },
]

export const StatusMachine: React.FC<StatusMachineProps> = ({
  prescription,
  onStatusChange,
  canChangeStatus = false,
  className,
}) => {
  const currentStatus = prescription.status
  const currentStepIndex = workflowSteps.findIndex((step) => step.status === currentStatus)
  const isUnavailable = currentStatus === 'unavailable'

  // Get status history dates
  const getStatusDate = (status: Prescription['status']): string | null => {
    if (!prescription.statusHistory) return null
    const history = prescription.statusHistory.find((h) => h.status === status)
    return history ? history.createdAt : null
  }

  // Get next possible status
  const getNextStatus = (): Prescription['status'] | null => {
    if (currentStatus === 'pending') return 'assigned'
    if (currentStatus === 'assigned') return 'ready'
    if (currentStatus === 'ready') return 'dispensed'
    return null
  }

  const nextStatus = getNextStatus()

  return (
    <div className={cn('rounded-xl border bg-white p-6 shadow-sm', className)}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">État de la prescription</h3>
        <p className="mt-1 text-sm text-gray-600">Suivi du workflow de dispensation</p>
      </div>

      <div className="relative">
        {/* Timeline */}
        <div className="flex items-center justify-between">
          {workflowSteps.map((step, index) => {
            const Icon = step.icon
            const isActive = index <= currentStepIndex && !isUnavailable
            const isCurrent = step.status === currentStatus
            const isPast = index < currentStepIndex
            const statusDate = getStatusDate(step.status)

            // Skip unavailable if not current status
            if (step.status === 'unavailable' && !isUnavailable) return null

            return (
              <React.Fragment key={step.status}>
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      'flex h-16 w-16 items-center justify-center rounded-full border-2 transition-all',
                      isCurrent
                        ? `${step.bgColor} border-2 ring-4 ring-opacity-50 scale-110 animate-pulse`
                        : isActive
                          ? `${step.bgColor} border-2`
                          : 'bg-gray-50 border-gray-200',
                      isCurrent && step.color.replace('text-', 'ring-')
                    )}
                  >
                    <Icon
                      className={cn(
                        'h-6 w-6',
                        isActive ? step.color : 'text-gray-400',
                        isCurrent && 'animate-bounce'
                      )}
                    />
                  </div>
                  <p
                    className={cn(
                      'mt-2 text-xs font-medium',
                      isActive ? 'text-gray-900' : 'text-gray-500'
                    )}
                  >
                    {step.label}
                  </p>
                  {statusDate && (
                    <p className="mt-1 text-xs text-gray-500">{formatDate(statusDate)}</p>
                  )}
                </div>
                {index < workflowSteps.length - 1 && step.status !== 'unavailable' && (
                  <div
                    className={cn(
                      'h-1 flex-1 mx-2 rounded transition-all',
                      isPast ? 'bg-medical-green-500' : 'bg-gray-200'
                    )}
                  >
                    <div
                      className={cn(
                        'h-full rounded transition-all duration-500',
                        isPast ? 'bg-medical-green-500 w-full' : 'bg-gray-200 w-0'
                      )}
                    />
                  </div>
                )}
              </React.Fragment>
            )
          })}
        </div>

        {/* Unavailable branch */}
        {isUnavailable && (
          <div className="mt-6 rounded-lg border-2 border-red-200 bg-red-50 p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <p className="font-semibold text-red-900">Médicament indisponible</p>
            </div>
            {prescription.statusHistory && (
              <p className="mt-2 text-sm text-red-700">
                {prescription.statusHistory
                  .find((h) => h.status === 'unavailable')
                  ?.reason || 'Rupture de stock'}
              </p>
            )}
          </div>
        )}

        {/* Next step button */}
        {nextStatus && canChangeStatus && onStatusChange && !isUnavailable && (
          <div className="mt-6 flex justify-center">
            <Button
              onClick={() => onStatusChange(nextStatus)}
              className="bg-medical-blue-600 hover:bg-medical-blue-700"
            >
              Passer à l'étape suivante
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Status History */}
      {prescription.statusHistory && prescription.statusHistory.length > 0 && (
        <div className="mt-6 border-t pt-6">
          <h4 className="mb-4 text-sm font-semibold text-gray-900">Historique des changements</h4>
          <div className="space-y-3">
            {prescription.statusHistory
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map((history) => {
                const step = workflowSteps.find((s) => s.status === history.status)
                const Icon = step?.icon || Clock
                return (
                  <div key={history.id} className="flex items-start gap-3">
                    <div className={cn('rounded-full p-2', step?.bgColor || 'bg-gray-50')}>
                      <Icon className={cn('h-4 w-4', step?.color || 'text-gray-400')} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900">{step?.label}</p>
                        <span className="text-xs text-gray-500">
                          {formatDateTime(history.createdAt)}
                        </span>
                      </div>
                      {history.changedByUser && (
                        <p className="text-xs text-gray-600">
                          Par {history.changedByUser.firstName} {history.changedByUser.lastName}
                        </p>
                      )}
                      {history.comment && (
                        <p className="mt-1 text-xs text-gray-600">{history.comment}</p>
                      )}
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      )}
    </div>
  )
}

