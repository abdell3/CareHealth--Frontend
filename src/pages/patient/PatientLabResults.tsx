import { useMemo, memo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { FlaskConical, Download, AlertTriangle, CheckCircle2, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { VitalsChart } from '@/components/medical/VitalsChart'
import { labService } from '@/api/lab.service'
import { useAuth } from '@/hooks/useAuth'
import { formatDate } from '@/utils/helpers'
import type { LabOrder } from '@/types/api'

const PatientLabResults = memo(() => {
  const { user } = useAuth()

  // Fetch lab orders
  const { data: labOrdersData, isLoading } = useQuery({
    queryKey: ['labOrders', 'patient', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User ID is required')
      const response = await labService.getLabOrders({
        patientId: user.id,
        limit: 50,
      })
      return response.data
    },
    enabled: !!user?.id,
  })

  // Get orders with results
  const ordersWithResults = useMemo(() => {
    if (!labOrdersData?.orders) return []
    return labOrdersData.orders.filter((order) => order.results && order.results.length > 0)
  }, [labOrdersData])

  // Get abnormal results
  const abnormalResults = useMemo(() => {
    const abnormal: Array<{ order: LabOrder; result: typeof LabOrder.results[0] }> = []
    ordersWithResults.forEach((order) => {
      order.results?.forEach((result) => {
        if (result.status === 'abnormal' || result.status === 'critical') {
          abnormal.push({ order, result })
        }
      })
    })
    return abnormal
  }, [ordersWithResults])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mes résultats de laboratoire</h1>
        <p className="mt-1 text-sm text-gray-600">
          Consultez vos analyses et résultats de laboratoire
        </p>
      </div>

      {/* Abnormal Results Alert */}
      {abnormalResults.length > 0 && (
        <Card className="border-red-300 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-red-100 p-3">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="mb-2 font-semibold text-red-900">
                  {abnormalResults.length} résultat(s) nécessitent votre attention
                </h3>
                <p className="text-sm text-red-700">
                  Certains de vos résultats sont anormaux. Veuillez consulter votre médecin pour
                  discuter de ces résultats.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results List */}
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
      ) : ordersWithResults.length > 0 ? (
        <div className="space-y-6">
          {ordersWithResults.map((order: LabOrder) => (
            <Card key={order.id} className="border-medical-blue-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-medical-blue-100 p-2">
                      <FlaskConical className="h-5 w-5 text-medical-blue-600" />
                    </div>
                    <div>
                      <CardTitle>Analyse du {formatDate(order.createdAt)}</CardTitle>
                      {order.doctor && (
                        <p className="text-sm text-gray-600">
                          Prescrit par Dr. {order.doctor.firstName} {order.doctor.lastName}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {order.status === 'completed' && (
                      <Badge variant="success">Terminé</Badge>
                    )}
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                      <span className="ml-2">PDF</span>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Tests */}
                <div>
                  <h4 className="mb-3 font-semibold text-gray-900">Tests effectués</h4>
                  <div className="space-y-2">
                    {order.tests.map((test, index) => (
                      <div key={index} className="rounded-lg border border-gray-200 p-3">
                        <p className="font-medium text-gray-900">{test.name}</p>
                        <p className="text-sm text-gray-600">
                          {test.code} - {test.category}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Results */}
                {order.results && order.results.length > 0 && (
                  <div>
                    <h4 className="mb-3 flex items-center gap-2 font-semibold text-gray-900">
                      <TrendingUp className="h-5 w-5 text-medical-blue-600" />
                      Résultats
                    </h4>
                    <div className="space-y-4">
                      {order.results.map((result, index) => (
                        <VitalsChart
                          key={index}
                          results={[result]}
                          testName={result.testName}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {order.notes && (
                  <div className="rounded-lg bg-blue-50 p-3">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Notes :</span> {order.notes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <FlaskConical className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              Aucun résultat disponible
            </h3>
            <p className="text-sm text-gray-600">
              Vos résultats de laboratoire apparaîtront ici une fois disponibles
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
})

PatientLabResults.displayName = 'PatientLabResults'

export { PatientLabResults }

