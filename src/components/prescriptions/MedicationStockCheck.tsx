import * as React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Package, CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/libs/utils'
import type { Medication } from '@/types/api'

interface MedicationStockCheckProps {
  medications: Medication[]
  pharmacyId?: string
  onCheckStock?: () => void
  className?: string
}

interface StockStatus {
  medication: string
  available: boolean
  quantity?: number
  critical?: boolean
}

export const MedicationStockCheck: React.FC<MedicationStockCheckProps> = ({
  medications,
  pharmacyId,
  onCheckStock,
  className,
}) => {
  const [checked, setChecked] = React.useState(false)

  // Mock stock check - in real app, use pharmacyService.checkStock()
  const { data: stockData, isLoading, refetch } = useQuery({
    queryKey: ['medication-stock', pharmacyId, medications],
    queryFn: async () => {
      if (!pharmacyId) return null
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return {
        stock: medications.map((med) => ({
          medication: med.name,
          available: Math.random() > 0.3, // 70% available
          quantity: Math.floor(Math.random() * 50) + 10,
          critical: Math.random() > 0.8, // 20% critical
        })) as StockStatus[],
      }
    },
    enabled: checked && !!pharmacyId,
  })

  const handleCheck = () => {
    setChecked(true)
    refetch()
    onCheckStock?.()
  }

  if (!pharmacyId) {
    return (
      <Card className={cn('border-yellow-200 bg-yellow-50', className)}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <p className="text-sm text-yellow-900">
              Aucune pharmacie assignée. Assignez une pharmacie pour vérifier le stock.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-semibold text-gray-900">Vérification du stock</h4>
            <p className="text-sm text-gray-600">Vérifiez la disponibilité des médicaments</p>
          </div>
          {!checked && (
            <Button onClick={handleCheck} size="sm" variant="outline">
              <Package className="mr-2 h-4 w-4" />
              Vérifier le stock
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-medical-blue-600" />
            <span className="ml-2 text-sm text-gray-600">Vérification en cours...</span>
          </div>
        ) : stockData?.stock ? (
          <div className="space-y-3">
            {stockData.stock.map((item, index) => (
              <div
                key={index}
                className={cn(
                  'flex items-center justify-between rounded-lg border p-3',
                  item.available
                    ? 'border-green-200 bg-green-50'
                    : 'border-red-200 bg-red-50'
                )}
              >
                <div className="flex items-center gap-3">
                  {item.available ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{item.medication}</p>
                    {item.available && item.quantity !== undefined && (
                      <p className="text-sm text-gray-600">
                        Stock: {item.quantity} unités
                        {item.critical && (
                          <Badge variant="warning" className="ml-2">
                            Stock faible
                          </Badge>
                        )}
                      </p>
                    )}
                  </div>
                </div>
                <Badge
                  variant={item.available ? 'success' : 'destructive'}
                  className="ml-2"
                >
                  {item.available ? 'Disponible' : 'Indisponible'}
                </Badge>
              </div>
            ))}
          </div>
        ) : checked ? (
          <div className="py-4 text-center text-sm text-gray-500">
            Aucune information de stock disponible
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

