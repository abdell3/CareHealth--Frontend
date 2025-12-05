import * as React from 'react'
import { Pill, Clock, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/utils/helpers'
import type { Prescription } from '@/types/api'

interface MedicationReminderProps {
  prescriptions: Prescription[]
  className?: string
}

export const MedicationReminder = React.forwardRef<HTMLDivElement, MedicationReminderProps>(
  ({ prescriptions, className }, ref) => {
    const activePrescriptions = prescriptions.filter((p) => p.status === 'active')

    if (activePrescriptions.length === 0) {
      return (
        <Card ref={ref} className={className}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pill className="h-5 w-5 text-medical-green-600" />
              Médicaments en cours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-sm text-gray-500">Aucun médicament en cours</p>
          </CardContent>
        </Card>
      )
    }

    return (
      <Card ref={ref} className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5 text-medical-green-600" />
            Médicaments en cours
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activePrescriptions.slice(0, 3).map((prescription) => (
              <div
                key={prescription.id}
                className="rounded-lg border border-green-200 bg-green-50/50 p-4"
              >
                <div className="mb-2 flex items-center justify-between">
                  <Badge variant="success" className="text-xs">
                    Actif
                  </Badge>
                  <span className="text-xs text-gray-500">
                    Depuis le {formatDate(prescription.startDate)}
                  </span>
                </div>
                <div className="space-y-2">
                  {prescription.medications.map((med, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="mt-1 rounded-full bg-medical-green-100 p-1">
                        <Pill className="h-3 w-3 text-medical-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{med.name}</p>
                        <p className="text-sm text-gray-600">
                          {med.dosage} - {med.frequency}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <button className="flex items-center gap-1 rounded-lg border border-green-300 bg-white px-2 py-1 text-xs text-green-700 hover:bg-green-50">
                            <CheckCircle2 className="h-3 w-3" />
                            Prise effectuée
                          </button>
                          <span className="text-xs text-gray-500">
                            <Clock className="inline h-3 w-3" /> Prochaine: {med.frequency}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }
)
MedicationReminder.displayName = 'MedicationReminder'

