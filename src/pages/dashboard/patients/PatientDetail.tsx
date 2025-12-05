import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { memo, useMemo } from 'react'
import {
  User,
  Phone,
  Mail,
  Calendar,
  MapPin,
  AlertTriangle,
  FileText,
  Pill,
  FileImage,
  FlaskConical,
  Edit,
  Printer,
  Plus,
  Download,
  Eye,
} from 'lucide-react'
import { DetailPage } from '@/components/layouts/DetailPage'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MedicalCard } from '@/components/medical/MedicalCard'
import { Timeline } from '@/components/medical/Timeline'
import { VitalsChart } from '@/components/medical/VitalsChart'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { patientsService } from '@/api/patients.service'
import { appointmentsService } from '@/api/appointments.service'
import { pharmacyService } from '@/api/pharmacy.service'
import { documentsService } from '@/api/documents.service'
import { labService } from '@/api/lab.service'
import { useApiError } from '@/hooks/useApiError'
import { useAuth } from '@/hooks/useAuth'
import { formatPhoneNumber, formatDate, getUserInitials } from '@/utils/helpers'
import { cn } from '@/libs/utils'
import type { Patient, Appointment, Prescription, Document, LabOrder } from '@/types/api'

const PatientDetail = memo(() => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  // Fetch patient data
  const {
    data: patientData,
    isLoading: isLoadingPatient,
    isError: isErrorPatient,
    error: patientError,
  } = useQuery({
    queryKey: ['patient', id],
    queryFn: async () => {
      if (!id) throw new Error('Patient ID is required')
      const response = await patientsService.getPatientById(id)
      return response.data
    },
    enabled: !!id,
  })

  // Fetch appointments
  const { data: appointmentsData } = useQuery({
    queryKey: ['appointments', 'patient', id],
    queryFn: async () => {
      if (!id) throw new Error('Patient ID is required')
      const response = await appointmentsService.getAppointments({
        patientId: id,
        limit: 10,
      })
      return response.data
    },
    enabled: !!id,
  })

  // Fetch prescriptions
  const { data: prescriptionsData } = useQuery({
    queryKey: ['prescriptions', 'patient', id],
    queryFn: async () => {
      if (!id) throw new Error('Patient ID is required')
      const response = await pharmacyService.getPrescriptions({
        patientId: id,
        limit: 20,
      })
      return response.data
    },
    enabled: !!id,
  })

  // Fetch documents
  const { data: documentsData } = useQuery({
    queryKey: ['documents', 'patient', id],
    queryFn: async () => {
      if (!id) throw new Error('Patient ID is required')
      const response = await documentsService.getDocuments({
        patientId: id,
        limit: 50,
      })
      return response.data
    },
    enabled: !!id,
  })

  // Fetch lab orders
  const { data: labOrdersData } = useQuery({
    queryKey: ['labOrders', 'patient', id],
    queryFn: async () => {
      if (!id) throw new Error('Patient ID is required')
      const response = await labService.getLabOrders({
        patientId: id,
        limit: 20,
      })
      return response.data
    },
    enabled: !!id,
  })

  const patient = patientData
  const errorMessage = useApiError(patientError)

  // Calculate age
  const age = useMemo(() => {
    if (!patient?.dateOfBirth) return null
    const birthDate = new Date(patient.dateOfBirth)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }, [patient?.dateOfBirth])

  // Check permissions
  const canEdit = useMemo(
    () => user?.role === 'admin' || user?.role === 'doctor' || user?.role === 'nurse',
    [user?.role]
  )

  // Prepare timeline items
  const timelineItems = useMemo(() => {
    const items: Array<{
      id: string
      date: string
      title: string
      description?: string
      type: 'allergy' | 'surgery' | 'vaccination' | 'medical-history' | 'other'
    }> = []

    // Allergies
    patient?.allergies?.forEach((allergy, index) => {
      items.push({
        id: `allergy-${index}`,
        date: patient.createdAt,
        title: `Allergie: ${allergy}`,
        type: 'allergy',
      })
    })

    // Medical history
    patient?.medicalHistory?.forEach((history, index) => {
      items.push({
        id: `history-${index}`,
        date: patient.createdAt,
        title: history,
        type: 'medical-history',
      })
    })

    return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [patient])

  // Get status badge variant
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="info">Programmé</Badge>
      case 'completed':
        return <Badge variant="success">Terminé</Badge>
      case 'cancelled':
        return <Badge variant="destructive">Annulé</Badge>
      case 'no-show':
        return <Badge variant="warning">Absent</Badge>
      case 'active':
        return <Badge variant="success">Actif</Badge>
      case 'pending':
        return <Badge variant="info">En attente</Badge>
      case 'in-progress':
        return <Badge variant="info">En cours</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  // Loading state
  if (isLoadingPatient) {
    return (
      <DetailPage title="Détails du patient" id={id} backTo="/dashboard/patients">
        <div className="space-y-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 w-1/4 rounded bg-gray-200" />
                <div className="mt-4 space-y-2">
                  <div className="h-3 w-full rounded bg-gray-200" />
                  <div className="h-3 w-3/4 rounded bg-gray-200" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </DetailPage>
    )
  }

  // Error state
  if (isErrorPatient || !patient) {
    return (
      <DetailPage title="Détails du patient" id={id} backTo="/dashboard/patients">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <p className="text-sm text-red-600">
              {errorMessage || 'Une erreur est survenue lors du chargement des données du patient.'}
            </p>
            <Button
              onClick={() => navigate('/dashboard/patients')}
              variant="outline"
              className="mt-4"
            >
              Retour à la liste
            </Button>
          </CardContent>
        </Card>
      </DetailPage>
    )
  }

  return (
    <DetailPage title={`${patient.firstName} ${patient.lastName}`} id={id} backTo="/dashboard/patients">
      <div className="space-y-6">
        {/* Patient Header Card */}
        <MedicalCard>
          <div className="flex flex-col gap-6 md:flex-row md:items-start">
            <Avatar
              initials={getUserInitials(patient.firstName, patient.lastName)}
              size="xl"
              className="mx-auto md:mx-0"
            />
            <div className="flex-1 space-y-4">
              <div className="flex flex-wrap items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {patient.firstName} {patient.lastName}
                </h2>
                {canEdit && (
                  <div className="ml-auto flex gap-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                      Modifier
                    </Button>
                    <Button variant="outline" size="sm">
                      <Printer className="h-4 w-4" />
                      Imprimer fiche
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-gray-500">Date de naissance</p>
                    <p className="font-medium text-gray-900">
                      {formatDate(patient.dateOfBirth)} {age !== null && `(${age} ans)`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-gray-500">Genre</p>
                    <p className="font-medium text-gray-900">
                      {patient.gender === 'male' ? 'Homme' : patient.gender === 'female' ? 'Femme' : 'Autre'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">{patient.email}</p>
                  </div>
                </div>
                {patient.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-gray-500">Téléphone</p>
                      <p className="font-medium text-gray-900">{formatPhoneNumber(patient.phone)}</p>
                    </div>
                  </div>
                )}
                {patient.address && (
                  <div className="flex items-center gap-3 text-sm md:col-span-2">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-gray-500">Adresse</p>
                      <p className="font-medium text-gray-900">{patient.address}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Emergency Contact */}
              {patient.emergencyContact && (
                <div className="rounded-lg border-2 border-red-200 bg-red-50 p-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <h3 className="font-semibold text-red-900">Contact d'urgence</h3>
                    <Badge variant="destructive" className="ml-auto">
                      Urgence
                    </Badge>
                  </div>
                  <div className="mt-2 space-y-1 text-sm">
                    <p className="font-medium text-gray-900">{patient.emergencyContact.name}</p>
                    <p className="text-gray-600">
                      {patient.emergencyContact.relationship} - {formatPhoneNumber(patient.emergencyContact.phone)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </MedicalCard>

        {/* Tabs */}
        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
            <TabsTrigger value="personal">Personnel</TabsTrigger>
            <TabsTrigger value="medical">Médical</TabsTrigger>
            <TabsTrigger value="appointments">Rendez-vous</TabsTrigger>
            <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="laboratory">Laboratoire</TabsTrigger>
          </TabsList>

          {/* Personal Information Tab */}
          <TabsContent value="personal" className="mt-6">
            <MedicalCard title="Informations Personnelles">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <h4 className="mb-4 font-semibold text-gray-900">Démographie</h4>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm text-gray-500">Nom complet</dt>
                      <dd className="mt-1 font-medium text-gray-900">
                        {patient.firstName} {patient.lastName}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Date de naissance</dt>
                      <dd className="mt-1 font-medium text-gray-900">
                        {formatDate(patient.dateOfBirth)} {age !== null && `(${age} ans)`}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Genre</dt>
                      <dd className="mt-1 font-medium text-gray-900">
                        {patient.gender === 'male' ? 'Homme' : patient.gender === 'female' ? 'Femme' : 'Autre'}
                      </dd>
                    </div>
                  </dl>
                </div>
                <div>
                  <h4 className="mb-4 font-semibold text-gray-900">Contact</h4>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm text-gray-500">Email</dt>
                      <dd className="mt-1 font-medium text-gray-900">{patient.email}</dd>
                    </div>
                    {patient.phone && (
                      <div>
                        <dt className="text-sm text-gray-500">Téléphone</dt>
                        <dd className="mt-1 font-medium text-gray-900">{formatPhoneNumber(patient.phone)}</dd>
                      </div>
                    )}
                    {patient.address && (
                      <div>
                        <dt className="text-sm text-gray-500">Adresse</dt>
                        <dd className="mt-1 font-medium text-gray-900">{patient.address}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>
            </MedicalCard>
          </TabsContent>

          {/* Medical History Tab */}
          <TabsContent value="medical" className="mt-6">
            <div className="space-y-6">
              {/* Allergies */}
              {patient.allergies && patient.allergies.length > 0 && (
                <MedicalCard title="Allergies">
                  <div className="flex flex-wrap gap-2">
                    {patient.allergies.map((allergy, index) => (
                      <Badge key={index} variant="destructive" className="text-sm">
                        ⚠️ {allergy}
                      </Badge>
                    ))}
                  </div>
                </MedicalCard>
              )}

              {/* Medical History Timeline */}
              <MedicalCard title="Historique Médical">
                {timelineItems.length > 0 ? (
                  <Timeline items={timelineItems} />
                ) : (
                  <p className="text-center text-sm text-gray-500">Aucun historique médical enregistré</p>
                )}
              </MedicalCard>
            </div>
          </TabsContent>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="mt-6">
            <MedicalCard
              title="Rendez-vous"
              headerClassName="flex items-center justify-between"
            >
              <div className="mb-4 flex justify-end">
                {canEdit && (
                  <Button
                    size="sm"
                    onClick={() => navigate(`/dashboard/appointments/new?patientId=${id}`)}
                    className="bg-medical-blue-500 hover:bg-medical-blue-600 text-white"
                  >
                    <Plus className="h-4 w-4" />
                    Nouveau rendez-vous
                  </Button>
                )}
              </div>
              {appointmentsData && appointmentsData.appointments.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Heure</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Médecin</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {appointmentsData.appointments.map((appointment: Appointment) => (
                        <TableRow key={appointment.id}>
                          <TableCell>{formatDate(appointment.date)}</TableCell>
                          <TableCell>{appointment.time}</TableCell>
                          <TableCell>
                            {appointment.type === 'consultation'
                              ? 'Consultation'
                              : appointment.type === 'follow-up'
                                ? 'Suivi'
                                : appointment.type === 'emergency'
                                  ? 'Urgence'
                                  : 'Chirurgie'}
                          </TableCell>
                          <TableCell>
                            {appointment.doctor
                              ? `${appointment.doctor.firstName} ${appointment.doctor.lastName}`
                              : '-'}
                          </TableCell>
                          <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                          <TableCell>
                            <Link
                              to={`/dashboard/appointments/${appointment.id}`}
                              className="text-medical-blue-600 hover:underline"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-center text-sm text-gray-500">Aucun rendez-vous enregistré</p>
              )}
            </MedicalCard>
          </TabsContent>

          {/* Prescriptions Tab */}
          <TabsContent value="prescriptions" className="mt-6">
            <MedicalCard title="Prescriptions">
              {prescriptionsData && prescriptionsData.prescriptions.length > 0 ? (
                <div className="space-y-4">
                  {prescriptionsData.prescriptions.map((prescription: Prescription) => (
                    <Card key={prescription.id} className="border-medical-blue-200">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Pill className="h-5 w-5 text-medical-blue-600" />
                              <h4 className="font-semibold text-gray-900">
                                Prescription du {formatDate(prescription.startDate)}
                              </h4>
                              {getStatusBadge(prescription.status)}
                            </div>
                            <div className="mt-3 space-y-2">
                              {prescription.medications.map((med, index) => (
                                <div key={index} className="rounded-lg bg-gray-50 p-3">
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
                              <p className="mt-3 text-sm text-gray-700">{prescription.instructions}</p>
                            )}
                          </div>
                          <Link
                            to={`/dashboard/prescriptions/${prescription.id}`}
                            className="ml-4 text-medical-blue-600 hover:underline"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-center text-sm text-gray-500">Aucune prescription enregistrée</p>
              )}
            </MedicalCard>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="mt-6">
            <MedicalCard title="Documents & Résultats">
              <div className="mb-4 flex justify-end">
                {canEdit && (
                  <Button size="sm" variant="outline">
                    <Plus className="h-4 w-4" />
                    Upload document
                  </Button>
                )}
              </div>
              {documentsData && documentsData.documents.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {documentsData.documents.map((document: Document) => (
                    <Card key={document.id} className="border-medical-blue-200 hover:shadow-md">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <FileImage className="h-8 w-8 text-medical-blue-600" />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{document.name}</h4>
                            <p className="mt-1 text-xs text-gray-500">
                              {document.category} • {formatDate(document.createdAt)}
                            </p>
                            <div className="mt-2 flex gap-2">
                              <Button size="sm" variant="ghost" className="h-7 text-xs">
                                <Eye className="h-3 w-3" />
                                Voir
                              </Button>
                              <Button size="sm" variant="ghost" className="h-7 text-xs">
                                <Download className="h-3 w-3" />
                                Télécharger
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-center text-sm text-gray-500">Aucun document enregistré</p>
              )}
            </MedicalCard>
          </TabsContent>

          {/* Laboratory Tab */}
          <TabsContent value="laboratory" className="mt-6">
            <MedicalCard title="Résultats de Laboratoire">
              {labOrdersData && labOrdersData.orders.length > 0 ? (
                <div className="space-y-6">
                  {labOrdersData.orders.map((order: LabOrder) => (
                    <Card key={order.id} className="border-medical-blue-200">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <FlaskConical className="h-5 w-5 text-medical-blue-600" />
                              <h4 className="font-semibold text-gray-900">
                                Analyse du {formatDate(order.createdAt)}
                              </h4>
                              {getStatusBadge(order.status)}
                            </div>
                            <div className="mt-3 space-y-2">
                              {order.tests.map((test, index) => (
                                <div key={index} className="text-sm text-gray-700">
                                  {test.name} ({test.code})
                                </div>
                              ))}
                            </div>
                            {order.results && order.results.length > 0 && (
                              <div className="mt-4 space-y-4">
                                {order.results.map((result, index) => (
                                  <VitalsChart
                                    key={index}
                                    results={[result]}
                                    testName={result.testName}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                          <Link
                            to={`/dashboard/lab-orders/${order.id}`}
                            className="ml-4 text-medical-blue-600 hover:underline"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-center text-sm text-gray-500">Aucun résultat de laboratoire enregistré</p>
              )}
            </MedicalCard>
          </TabsContent>
        </Tabs>
      </div>
    </DetailPage>
  )
})

PatientDetail.displayName = 'PatientDetail'

export { PatientDetail }
