import * as React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  FileText,
  Edit,
  Printer,
  Download,
  Building,
  MapPin,
  Phone,
  Clock,
  AlertTriangle,
  RefreshCw,
  QrCode,
  Pill,
  User,
  Calendar,
} from 'lucide-react'
import { DetailPage } from '@/components/layouts/DetailPage'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { StatusMachine } from '@/components/prescriptions/StatusMachine'
import { PharmacySelector } from '@/components/prescriptions/PharmacySelector'
import { MedicationStockCheck } from '@/components/prescriptions/MedicationStockCheck'
import { PrescriptionQR } from '@/components/prescriptions/PrescriptionQR'
import { RenewalModal } from '@/components/prescriptions/RenewalModal'
import { pharmacyService } from '@/api/pharmacy.service'
import { useApiError } from '@/hooks/useApiError'
import { useAuth } from '@/hooks/useAuth'
import { formatDate, formatPhoneNumber } from '@/utils/helpers'
import { cn } from '@/libs/utils'
import type { Prescription } from '@/types/api'

export const PrescriptionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [showPharmacySelector, setShowPharmacySelector] = React.useState(false)
  const [showRenewalModal, setShowRenewalModal] = React.useState(false)

  // Fetch prescription
  const {
    data: prescriptionData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['prescription', id],
    queryFn: async () => {
      if (!id) throw new Error('Prescription ID is required')
      const response = await pharmacyService.getPrescriptionById(id)
      return response.data
    },
    enabled: !!id,
  })

  // Status change mutation
  const statusMutation = useMutation({
    mutationFn: async (newStatus: Prescription['status']) => {
      if (!id) throw new Error('Prescription ID is required')
      // In real app: await pharmacyService.updatePrescriptionStatus(id, newStatus)
      return { success: true }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prescription', id] })
    },
  })

  const errorMessage = useApiError(error || statusMutation.error)

  const prescription = prescriptionData

  // Check permissions
  const isDoctor = user?.role === 'doctor'
  const isPharmacist = user?.role === 'pharmacist' || user?.role === 'admin'
  const isPatient = user?.role === 'patient'

  // Get status badge
  const getStatusBadge = (status: Prescription['status']) => {
    const variants: Record<string, 'default' | 'success' | 'warning' | 'destructive' | 'info'> = {
      pending: 'warning',
      assigned: 'info',
      ready: 'success',
      dispensed: 'default',
      unavailable: 'destructive',
      active: 'info',
      completed: 'success',
      cancelled: 'destructive',
    }
    const labels: Record<string, string> = {
      pending: 'En attente',
      assigned: 'Assignée',
      ready: 'Prête',
      dispensed: 'Dispensée',
      unavailable: 'Indisponible',
      active: 'Active',
      completed: 'Terminée',
      cancelled: 'Annulée',
    }
    return (
      <Badge variant={variants[status] || 'default'}>{labels[status] || status}</Badge>
    )
  }

  // Handle status change
  const handleStatusChange = (newStatus: Prescription['status']) => {
    statusMutation.mutate(newStatus)
  }

  if (isLoading) {
    return (
      <DetailPage title="Chargement..." id={id} backTo="/dashboard/prescriptions">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-medical-blue-200 border-t-medical-blue-600 mx-auto" />
            <p className="text-sm text-gray-600">Chargement de la prescription...</p>
          </div>
        </div>
      </DetailPage>
    )
  }

  if (isError || !prescription) {
    return (
      <DetailPage title="Erreur" id={id} backTo="/dashboard/prescriptions">
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {errorMessage || 'Erreur lors du chargement de la prescription'}
            </AlertDescription>
          </Alert>
        </div>
      </DetailPage>
    )
  }

  return (
    <DetailPage title="Détails de la prescription" id={id} backTo="/dashboard/prescriptions">
      {/* Header with Status */}
      <div className="mb-6 rounded-xl border border-medical-blue-200 bg-white p-6 shadow-medical-card">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-medical-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Prescription #{prescription.id.slice(0, 8)}</h1>
                <div className="mt-2 flex items-center gap-2">
                  {getStatusBadge(prescription.status)}
                  <span className="text-sm text-gray-600">
                    Créée le {formatDate(prescription.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {(isDoctor || isPharmacist) && (
              <>
                <Button variant="outline" size="sm">
                  <Edit className="mr-2 h-4 w-4" />
                  Modifier
                </Button>
                <Button variant="outline" size="sm">
                  <Printer className="mr-2 h-4 w-4" />
                  Imprimer
                </Button>
              </>
            )}
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Status Machine */}
      <div className="mb-6">
        <StatusMachine
          prescription={prescription}
          onStatusChange={handleStatusChange}
          canChangeStatus={isDoctor || isPharmacist}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Medications Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="h-5 w-5 text-medical-blue-600" />
                Médicaments prescrits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Médicament</TableHead>
                    <TableHead>Dosage</TableHead>
                    <TableHead>Fréquence</TableHead>
                    <TableHead>Durée</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {prescription.medications.map((med, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{med.name}</TableCell>
                      <TableCell>{med.dosage}</TableCell>
                      <TableCell>{med.frequency}</TableCell>
                      <TableCell>{med.duration}</TableCell>
                      <TableCell>
                        <Badge variant="info">Prescrit</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Instructions */}
          {prescription.instructions && (
            <Card>
              <CardHeader>
                <CardTitle>Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{prescription.instructions}</p>
              </CardContent>
            </Card>
          )}

          {/* Stock Check */}
          {prescription.pharmacyId && (
            <MedicationStockCheck
              medications={prescription.medications}
              pharmacyId={prescription.pharmacyId}
            />
          )}

          {/* Alerts */}
          {prescription.status === 'unavailable' && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Cette prescription contient des médicaments actuellement indisponibles en pharmacie.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Patient Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-medical-blue-600" />
                Patient
              </CardTitle>
            </CardHeader>
            <CardContent>
              {prescription.patient ? (
                <div className="space-y-2">
                  <p className="font-semibold text-gray-900">
                    {prescription.patient.firstName} {prescription.patient.lastName}
                  </p>
                  {prescription.patient.phone && (
                    <p className="text-sm text-gray-600">
                      <Phone className="mr-2 inline h-4 w-4" />
                      {formatPhoneNumber(prescription.patient.phone)}
                    </p>
                  )}
                  {prescription.patient.email && (
                    <p className="text-sm text-gray-600">{prescription.patient.email}</p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Informations patient non disponibles</p>
              )}
            </CardContent>
          </Card>

          {/* Doctor Info */}
          {prescription.doctor && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-medical-blue-600" />
                  Médecin prescripteur
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-semibold text-gray-900">
                    {prescription.doctor.firstName} {prescription.doctor.lastName}
                  </p>
                  {prescription.doctor.profile?.specialization && (
                    <p className="text-sm text-gray-600">
                      {prescription.doctor.profile.specialization}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pharmacy Info */}
          {prescription.pharmacy ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-medical-blue-600" />
                  Pharmacie assignée
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="font-semibold text-gray-900">{prescription.pharmacy.name}</p>
                    <p className="mt-1 text-sm text-gray-600">
                      <MapPin className="mr-1 inline h-4 w-4" />
                      {prescription.pharmacy.address}
                    </p>
                    <p className="text-sm text-gray-600">
                      <Phone className="mr-1 inline h-4 w-4" />
                      {prescription.pharmacy.phone}
                    </p>
                  </div>
                  {prescription.pharmacy.isOpen !== undefined && (
                    <Badge variant={prescription.pharmacy.isOpen ? 'success' : 'default'}>
                      {prescription.pharmacy.isOpen ? 'Ouvert' : 'Fermé'}
                    </Badge>
                  )}
                  {isDoctor && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => setShowPharmacySelector(true)}
                    >
                      <Building className="mr-2 h-4 w-4" />
                      Changer de pharmacie
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            isDoctor && (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="p-4">
                  <div className="text-center">
                    <AlertTriangle className="mx-auto h-8 w-8 text-yellow-600" />
                    <p className="mt-2 text-sm font-medium text-yellow-900">
                      Aucune pharmacie assignée
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={() => setShowPharmacySelector(true)}
                    >
                      <Building className="mr-2 h-4 w-4" />
                      Assigner une pharmacie
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          )}

          {/* QR Code */}
          {(prescription.status === 'ready' || prescription.status === 'assigned') && (
            <PrescriptionQR prescriptionId={prescription.id} qrCode={prescription.qrCode} />
          )}

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {isDoctor && (
                <>
                  {prescription.status === 'pending' && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setShowPharmacySelector(true)}
                    >
                      <Building className="mr-2 h-4 w-4" />
                      Assigner une pharmacie
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowRenewalModal(true)}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Renouveler
                  </Button>
                </>
              )}
              {isPharmacist && (
                <>
                  {prescription.status === 'assigned' && (
                    <Button
                      className="w-full bg-medical-green-600 hover:bg-medical-green-700"
                      onClick={() => handleStatusChange('ready')}
                    >
                      Marquer comme prête
                    </Button>
                  )}
                  {prescription.status === 'ready' && (
                    <Button
                      className="w-full bg-medical-blue-600 hover:bg-medical-blue-700"
                      onClick={() => handleStatusChange('dispensed')}
                    >
                      Marquer comme dispensée
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => handleStatusChange('unavailable')}
                  >
                    Marquer indisponible
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <PharmacySelector
        open={showPharmacySelector}
        onOpenChange={setShowPharmacySelector}
        prescriptionId={prescription.id}
        currentPharmacyId={prescription.pharmacyId}
        onAssign={(pharmacyId) => {
          // Handle assignment
          console.log('Pharmacy assigned:', pharmacyId)
        }}
      />

      <RenewalModal
        open={showRenewalModal}
        onOpenChange={setShowRenewalModal}
        prescription={prescription}
        onRenewed={(newPrescription) => {
          navigate(`/dashboard/prescriptions/${newPrescription.id}`)
        }}
      />
    </DetailPage>
  )
}
