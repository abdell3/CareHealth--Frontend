import * as React from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { RefreshCw, AlertTriangle, Loader2 } from 'lucide-react'
import { pharmacyService } from '@/api/pharmacy.service'
import { useApiError } from '@/hooks/useApiError'
import { formatDate } from '@/utils/helpers'
import type { Prescription } from '@/types/api'

interface RenewalModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  prescription: Prescription
  onRenewed?: (newPrescription: Prescription) => void
}

export const RenewalModal: React.FC<RenewalModalProps> = ({
  open,
  onOpenChange,
  prescription,
  onRenewed,
}) => {
  const queryClient = useQueryClient()

  const renewalMutation = useMutation({
    mutationFn: async () => {
      // Create new prescription based on current one
      const newPrescription = await pharmacyService.createPrescription({
        patientId: prescription.patientId,
        medications: prescription.medications,
        instructions: prescription.instructions,
        startDate: new Date().toISOString().split('T')[0],
      })
      return newPrescription.data
    },
    onSuccess: (newPrescription) => {
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] })
      onRenewed?.(newPrescription)
      onOpenChange(false)
    },
  })

  const errorMessage = useApiError(renewalMutation.error)

  const handleRenew = () => {
    renewalMutation.mutate()
  }

  // Check renewal rules
  const canRenew = React.useMemo(() => {
    // Check if prescription is completed
    if (prescription.status !== 'completed' && prescription.status !== 'dispensed') {
      return false
    }
    // Check if end date is in the past
    if (prescription.endDate) {
      const endDate = new Date(prescription.endDate)
      const today = new Date()
      return endDate < today
    }
    return true
  }, [prescription])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Renouveler la prescription</DialogTitle>
          <DialogDescription>
            Créer une nouvelle prescription identique à celle-ci pour le patient.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Prescription Info */}
          <div className="rounded-lg border bg-gray-50 p-4">
            <h4 className="mb-2 font-semibold text-gray-900">Prescription originale</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <p>
                <span className="font-medium">Date de début:</span>{' '}
                {formatDate(prescription.startDate)}
              </p>
              {prescription.endDate && (
                <p>
                  <span className="font-medium">Date de fin:</span>{' '}
                  {formatDate(prescription.endDate)}
                </p>
              )}
              <p>
                <span className="font-medium">Médicaments:</span> {prescription.medications.length}
              </p>
            </div>
          </div>

          {/* Renewal Info */}
          <Alert>
            <RefreshCw className="h-4 w-4" />
            <AlertDescription>
              La nouvelle prescription sera créée avec les mêmes médicaments et instructions. La
              date de début sera aujourd'hui.
            </AlertDescription>
          </Alert>

          {/* Warnings */}
          {!canRenew && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Cette prescription ne peut pas être renouvelée. Elle doit être terminée ou
                dispensée.
              </AlertDescription>
            </Alert>
          )}

          {errorMessage && (
            <Alert variant="destructive">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button
            onClick={handleRenew}
            disabled={!canRenew || renewalMutation.isPending}
            className="bg-medical-blue-600 hover:bg-medical-blue-700"
          >
            {renewalMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Renouvellement...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Renouveler
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

