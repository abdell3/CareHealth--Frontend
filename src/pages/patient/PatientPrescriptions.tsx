import { useMemo, memo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Pill, QrCode, Download, RefreshCw, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { pharmacyService } from '@/api/pharmacy.service'
import { useAuth } from '@/hooks/useAuth'
import { formatDate } from '@/utils/helpers'
import type { Prescription } from '@/types/api'

const PatientPrescriptions = memo(() => {
  const { user } = useAuth()

  // Fetch prescriptions
  const { data: prescriptionsData, isLoading } = useQuery({
    queryKey: ['prescriptions', 'patient', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User ID is required')
      const response = await pharmacyService.getPrescriptions({
        patientId: user.id,
        limit: 100,
      })
      return response.data
    },
    enabled: !!user?.id,
  })

  // Filter prescriptions
  const activePrescriptions = useMemo(() => {
    if (!prescriptionsData?.prescriptions) return []
    return prescriptionsData.prescriptions.filter((p) => p.status === 'active')
  }, [prescriptionsData])

  const completedPrescriptions = useMemo(() => {
    if (!prescriptionsData?.prescriptions) return []
    return prescriptionsData.prescriptions.filter((p) => p.status === 'completed')
  }, [prescriptionsData])

  const getStatusBadge = (status: Prescription['status']) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>
      case 'completed':
        return <Badge variant="info">Terminée</Badge>
      case 'cancelled':
        return <Badge variant="destructive">Annulée</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mes prescriptions</h1>
        <p className="mt-1 text-sm text-gray-600">
          Consultez vos ordonnances et médicaments en cours
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList>
          <TabsTrigger value="active">Actives ({activePrescriptions.length})</TabsTrigger>
          <TabsTrigger value="completed">Terminées ({completedPrescriptions.length})</TabsTrigger>
        </TabsList>

        {/* Active Prescriptions */}
        <TabsContent value="active" className="mt-6">
          {isLoading ? (
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-32 animate-pulse rounded bg-gray-200" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : activePrescriptions.length > 0 ? (
            <div className="space-y-4">
              {activePrescriptions.map((prescription: Prescription) => (
                <Card key={prescription.id} className="border-medical-green-200">
                  <CardContent className="p-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-medical-green-100 p-2">
                            <Pill className="h-5 w-5 text-medical-green-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              Prescription du {formatDate(prescription.startDate)}
                            </h3>
                            {prescription.doctor && (
                              <p className="text-sm text-gray-600">
                                Par Dr. {prescription.doctor.firstName} {prescription.doctor.lastName}
                              </p>
                            )}
                          </div>
                          {getStatusBadge(prescription.status)}
                        </div>

                        <div className="space-y-2">
                          {prescription.medications.map((med, index) => (
                            <div
                              key={index}
                              className="rounded-lg border border-gray-200 bg-gray-50 p-3"
                            >
                              <p className="font-medium text-gray-900">{med.name}</p>
                              <p className="text-sm text-gray-600">
                                {med.dosage} - {med.frequency} - {med.duration}
                              </p>
                              {med.instructions && (
                                <p className="mt-1 text-xs text-gray-500">{med.instructions}</p>
                              )}
                            </div>
                          ))}
                        </div>

                        {prescription.instructions && (
                          <div className="rounded-lg bg-blue-50 p-3">
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Instructions :</span>{' '}
                              {prescription.instructions}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button variant="outline" size="sm" className="w-full">
                          <QrCode className="h-4 w-4" />
                          <span className="ml-2">QR Code</span>
                        </Button>
                        <Button variant="outline" size="sm" className="w-full">
                          <Download className="h-4 w-4" />
                          <span className="ml-2">Télécharger</span>
                        </Button>
                        {prescription.endDate && new Date(prescription.endDate) > new Date() && (
                          <Button variant="outline" size="sm" className="w-full border-medical-green-300 text-medical-green-700 hover:bg-medical-green-50">
                            <RefreshCw className="h-4 w-4" />
                            <span className="ml-2">Renouveler</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Pill className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  Aucune prescription active
                </h3>
                <p className="text-sm text-gray-600">
                  Vos prescriptions actives apparaîtront ici
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Completed Prescriptions */}
        <TabsContent value="completed" className="mt-6">
          {isLoading ? (
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-32 animate-pulse rounded bg-gray-200" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : completedPrescriptions.length > 0 ? (
            <div className="space-y-4">
              {completedPrescriptions.map((prescription: Prescription) => (
                <Card key={prescription.id} className="border-gray-200 opacity-75">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Prescription du {formatDate(prescription.startDate)}
                        </h3>
                        {prescription.doctor && (
                          <p className="text-sm text-gray-600">
                            Par Dr. {prescription.doctor.firstName} {prescription.doctor.lastName}
                          </p>
                        )}
                      </div>
                      {getStatusBadge(prescription.status)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  Aucune prescription terminée
                </h3>
                <p className="text-sm text-gray-600">
                  Vos prescriptions terminées apparaîtront ici
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
})

PatientPrescriptions.displayName = 'PatientPrescriptions'

export { PatientPrescriptions }

