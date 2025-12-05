import { useMemo, memo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { Calendar, Plus, FileText, MessageSquare, AlertCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { NextAppointmentCard } from '@/components/patient/NextAppointmentCard'
import { MedicationReminder } from '@/components/patient/MedicationReminder'
import { EmergencyButton } from '@/components/patient/EmergencyButton'
import { HealthTimeline } from '@/components/patient/HealthTimeline'
import { appointmentsService } from '@/api/appointments.service'
import { pharmacyService } from '@/api/pharmacy.service'
import { documentsService } from '@/api/documents.service'
import { useAuth } from '@/hooks/useAuth'
import { formatDate } from '@/utils/helpers'
import type { Appointment, Prescription, Document } from '@/types/api'

const PatientDashboard = memo(() => {
  const { user } = useAuth()
  const navigate = useNavigate()

  // Fetch upcoming appointments
  const { data: appointmentsData } = useQuery({
    queryKey: ['appointments', 'patient', user?.id, 'upcoming'],
    queryFn: async () => {
      if (!user?.id) throw new Error('User ID is required')
      const response = await appointmentsService.getAppointments({
        patientId: user.id,
        status: 'scheduled',
        limit: 5,
      })
      return response.data
    },
    enabled: !!user?.id,
  })

  // Fetch active prescriptions
  const { data: prescriptionsData } = useQuery({
    queryKey: ['prescriptions', 'patient', user?.id, 'active'],
    queryFn: async () => {
      if (!user?.id) throw new Error('User ID is required')
      const response = await pharmacyService.getPrescriptions({
        patientId: user.id,
        status: 'active',
        limit: 5,
      })
      return response.data
    },
    enabled: !!user?.id,
  })

  // Fetch recent documents
  const { data: documentsData } = useQuery({
    queryKey: ['documents', 'patient', user?.id, 'recent'],
    queryFn: async () => {
      if (!user?.id) throw new Error('User ID is required')
      const response = await documentsService.getDocuments({
        patientId: user.id,
        limit: 3,
      })
      return response.data
    },
    enabled: !!user?.id,
  })

  // Get next appointment
  const nextAppointment = useMemo(() => {
    if (!appointmentsData?.appointments || appointmentsData.appointments.length === 0) return null
    return appointmentsData.appointments[0]
  }, [appointmentsData])

  // Build timeline items
  const timelineItems = useMemo(() => {
    const items: Array<{
      id: string
      type: 'appointment' | 'prescription' | 'lab' | 'document'
      title: string
      date: string
      description?: string
    }> = []

    appointmentsData?.appointments.slice(0, 3).forEach((apt) => {
      items.push({
        id: apt.id,
        type: 'appointment',
        title: `Rendez-vous avec ${apt.doctor ? `Dr. ${apt.doctor.firstName} ${apt.doctor.lastName}` : 'médecin'}`,
        date: apt.date,
        description: `${apt.time} - ${apt.type}`,
      })
    })

    prescriptionsData?.prescriptions.slice(0, 2).forEach((pres) => {
      items.push({
        id: pres.id,
        type: 'prescription',
        title: `Prescription - ${pres.medications.length} médicament(s)`,
        date: pres.startDate,
        description: pres.instructions,
      })
    })

    documentsData?.documents.slice(0, 2).forEach((doc) => {
      items.push({
        id: doc.id,
        type: 'document',
        title: doc.name,
        date: doc.createdAt,
        description: doc.category,
      })
    })

    return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [appointmentsData, prescriptionsData, documentsData])

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="rounded-xl bg-gradient-to-r from-medical-blue-500 to-medical-green-500 p-6 text-white shadow-medical-card">
        <h1 className="mb-2 text-3xl font-bold">
          Bonjour {user?.firstName} {user?.lastName}
        </h1>
        <p className="text-blue-100">
          Bienvenue sur votre espace patient CareHealth. Gérez vos rendez-vous, prescriptions et
          documents en toute simplicité.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Next Appointment */}
          {nextAppointment ? (
            <NextAppointmentCard
              appointment={nextAppointment}
              onViewDetails={() => navigate(`/patient/appointments/${nextAppointment.id}`)}
              onCancel={() => {
                // TODO: Implement cancel appointment
                console.log('Cancel appointment')
              }}
            />
          ) : (
            <Card className="border-medical-blue-200 bg-gradient-to-br from-medical-blue-50 to-medical-green-50">
              <CardContent className="p-6 text-center">
                <Calendar className="mx-auto mb-4 h-12 w-12 text-medical-blue-400" />
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  Aucun rendez-vous à venir
                </h3>
                <p className="mb-4 text-sm text-gray-600">
                  Prenez rendez-vous pour consulter un médecin
                </p>
                <Button
                  onClick={() => navigate('/patient/appointments')}
                  className="bg-medical-blue-500 hover:bg-medical-blue-600 text-white"
                >
                  <Plus className="h-5 w-5" />
                  <span className="ml-2">Prendre un rendez-vous</span>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Medications */}
          <MedicationReminder prescriptions={prescriptionsData?.prescriptions || []} />

          {/* Recent Documents */}
          <Card>
            <CardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                  <FileText className="h-5 w-5 text-medical-blue-600" />
                  Documents récents
                </h3>
                <Link
                  to="/patient/documents"
                  className="text-sm text-medical-blue-600 hover:underline"
                >
                  Voir tout
                </Link>
              </div>
              {documentsData && documentsData.documents.length > 0 ? (
                <div className="space-y-3">
                  {documentsData.documents.map((doc: Document) => (
                    <Link
                      key={doc.id}
                      to={`/patient/documents/${doc.id}`}
                      className="flex items-center justify-between rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{doc.name}</p>
                        <p className="text-sm text-gray-500">
                          {formatDate(doc.createdAt)} • {doc.category}
                        </p>
                      </div>
                      <Badge variant="outline">{doc.type}</Badge>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-center text-sm text-gray-500">Aucun document récent</p>
              )}
            </CardContent>
          </Card>

          {/* Health Timeline */}
          <HealthTimeline items={timelineItems} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Emergency Button */}
          <EmergencyButton />

          {/* Quick Actions */}
          <Card>
            <CardContent className="p-6">
              <h3 className="mb-4 font-semibold text-gray-900">Actions rapides</h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate('/patient/appointments')}
                >
                  <Calendar className="h-4 w-4" />
                  <span className="ml-2">Mes rendez-vous</span>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate('/patient/prescriptions')}
                >
                  <FileText className="h-4 w-4" />
                  <span className="ml-2">Mes prescriptions</span>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate('/patient/documents')}
                >
                  <FileText className="h-4 w-4" />
                  <span className="ml-2">Mes documents</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Messages */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Messages</h3>
                <Badge variant="info" className="ml-auto">
                  0 nouveau
                </Badge>
              </div>
              <p className="text-sm text-gray-600">
                Aucun nouveau message de la clinique
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
})

PatientDashboard.displayName = 'PatientDashboard'

export { PatientDashboard }

