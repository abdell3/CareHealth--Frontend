import * as React from 'react'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Building, MapPin, Phone, Clock, CheckCircle, Loader2 } from 'lucide-react'
import { pharmacyService } from '@/api/pharmacy.service'
import { useApiError } from '@/hooks/useApiError'
import { cn } from '@/libs/utils'
import type { Pharmacy } from '@/types/api'

interface PharmacySelectorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  prescriptionId: string
  onAssign?: (pharmacyId: string) => void
  currentPharmacyId?: string
}

export const PharmacySelector: React.FC<PharmacySelectorProps> = ({
  open,
  onOpenChange,
  prescriptionId,
  onAssign,
  currentPharmacyId,
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPharmacy, setSelectedPharmacy] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    openNow: false,
    hasStock: false,
    nearMe: false,
  })
  const queryClient = useQueryClient()

  // Get user location (mock for now)
  const [userLocation] = useState<{ lat: number; lng: number } | null>(null)

  // Fetch pharmacies
  const { data: pharmaciesData, isLoading } = useQuery({
    queryKey: ['pharmacies', searchTerm, filters, userLocation],
    queryFn: async () => {
      // Mock API call - in real app, use pharmacyService.getPharmacies()
      const params: Record<string, unknown> = {}
      if (searchTerm) params.search = searchTerm
      if (filters.openNow) params.openNow = true
      if (filters.hasStock) params.hasStock = true
      if (filters.nearMe && userLocation) {
        params.near = `${userLocation.lat},${userLocation.lng}`
        params.radius = 10
      }

      // Mock response
      return {
        pharmacies: [
          {
            id: '1',
            name: 'Pharmacie Centrale',
            address: '123 Rue de la Santé, 75001 Paris',
            phone: '01 23 45 67 89',
            email: 'contact@pharmacie-centrale.fr',
            latitude: 48.8566,
            longitude: 2.3522,
            isOpen: true,
            openingHours: {
              monday: { open: '08:00', close: '20:00' },
              tuesday: { open: '08:00', close: '20:00' },
              wednesday: { open: '08:00', close: '20:00' },
              thursday: { open: '08:00', close: '20:00' },
              friday: { open: '08:00', close: '20:00' },
              saturday: { open: '09:00', close: '19:00' },
            },
          },
          {
            id: '2',
            name: 'Pharmacie du Quartier',
            address: '456 Avenue des Fleurs, 75002 Paris',
            phone: '01 98 76 54 32',
            email: 'info@pharmacie-quartier.fr',
            latitude: 48.8606,
            longitude: 2.3376,
            isOpen: true,
            openingHours: {
              monday: { open: '09:00', close: '19:00' },
              tuesday: { open: '09:00', close: '19:00' },
              wednesday: { open: '09:00', close: '19:00' },
              thursday: { open: '09:00', close: '19:00' },
              friday: { open: '09:00', close: '19:00' },
              saturday: { open: '09:00', close: '18:00' },
            },
          },
        ] as Pharmacy[],
      }
    },
    enabled: open,
  })

  // Assign pharmacy mutation
  const assignMutation = useMutation({
    mutationFn: async (pharmacyId: string) => {
      // In real app: await pharmacyService.assignPharmacy(prescriptionId, pharmacyId)
      return { success: true }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prescription', prescriptionId] })
      onAssign?.(selectedPharmacy!)
      onOpenChange(false)
      setSelectedPharmacy(null)
    },
  })

  const errorMessage = useApiError(assignMutation.error)

  const handleAssign = () => {
    if (selectedPharmacy) {
      assignMutation.mutate(selectedPharmacy)
    }
  }

  const pharmacies = pharmaciesData?.pharmacies || []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assigner une pharmacie</DialogTitle>
          <DialogDescription>
            Sélectionnez une pharmacie pour cette prescription. Vous pouvez filtrer par
            disponibilité et proximité.
          </DialogDescription>
        </DialogHeader>

        {/* Search and Filters */}
        <div className="space-y-4">
          <Input
            placeholder="Rechercher une pharmacie..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <div className="flex flex-wrap gap-2">
            <Button
              variant={filters.openNow ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilters({ ...filters, openNow: !filters.openNow })}
            >
              <Clock className="mr-2 h-4 w-4" />
              Ouvert maintenant
            </Button>
            <Button
              variant={filters.hasStock ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilters({ ...filters, hasStock: !filters.hasStock })}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              A le stock
            </Button>
            <Button
              variant={filters.nearMe ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilters({ ...filters, nearMe: !filters.nearMe })}
            >
              <MapPin className="mr-2 h-4 w-4" />
              Proche de moi
            </Button>
          </div>
        </div>

        {/* Pharmacies List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-medical-blue-600" />
          </div>
        ) : pharmacies.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            Aucune pharmacie trouvée
          </div>
        ) : (
          <div className="space-y-3">
            {pharmacies.map((pharmacy) => (
              <Card
                key={pharmacy.id}
                className={cn(
                  'cursor-pointer transition-all hover:border-medical-blue-300 hover:shadow-md',
                  selectedPharmacy === pharmacy.id && 'border-medical-blue-500 ring-2 ring-medical-blue-200'
                )}
                onClick={() => setSelectedPharmacy(pharmacy.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Building className="h-5 w-5 text-medical-blue-600" />
                        <h4 className="font-semibold text-gray-900">{pharmacy.name}</h4>
                        {pharmacy.isOpen && (
                          <Badge variant="success" className="ml-2">
                            Ouvert
                          </Badge>
                        )}
                        {currentPharmacyId === pharmacy.id && (
                          <Badge variant="info">Actuelle</Badge>
                        )}
                      </div>
                      <div className="mt-2 space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{pharmacy.address}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          <span>{pharmacy.phone}</span>
                        </div>
                        {pharmacy.openingHours && (
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>
                              Aujourd'hui: {pharmacy.openingHours.monday?.open} -{' '}
                              {pharmacy.openingHours.monday?.close}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    {selectedPharmacy === pharmacy.id && (
                      <CheckCircle className="h-6 w-6 text-medical-blue-600" />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {errorMessage && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{errorMessage}</div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button
            onClick={handleAssign}
            disabled={!selectedPharmacy || assignMutation.isPending}
            className="bg-medical-blue-600 hover:bg-medical-blue-700"
          >
            {assignMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Assignation...
              </>
            ) : (
              'Assigner'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

