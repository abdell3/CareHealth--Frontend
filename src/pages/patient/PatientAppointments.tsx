import { useState, useMemo, memo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { Calendar, Plus, Eye, X, Clock, User, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { appointmentsService } from '@/api/appointments.service'
import { useAuth } from '@/hooks/useAuth'
import { formatDate, formatDateTime } from '@/utils/helpers'
import { cn } from '@/libs/utils'
import type { Appointment } from '@/types/api'

const PatientAppointments = memo(() => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming')

  // Fetch appointments
  const { data: appointmentsData, isLoading } = useQuery({
    queryKey: ['appointments', 'patient', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User ID is required')
      const response = await appointmentsService.getAppointments({
        patientId: user.id,
        limit: 100,
      })
      return response.data
    },
    enabled: !!user?.id,
  })

  // Filter appointments
  const upcomingAppointments = useMemo(() => {
    if (!appointmentsData?.appointments) return []
    const now = new Date()
    return appointmentsData.appointments.filter((apt) => {
      const aptDate = new Date(`${apt.date}T${apt.time}`)
      return aptDate >= now && apt.status === 'scheduled'
    })
  }, [appointmentsData])

  const pastAppointments = useMemo(() => {
    if (!appointmentsData?.appointments) return []
    const now = new Date()
    return appointmentsData.appointments.filter((apt) => {
      const aptDate = new Date(`${apt.date}T${apt.time}`)
      return aptDate < now || apt.status !== 'scheduled'
    })
  }, [appointmentsData])

  const getStatusBadge = (status: Appointment['status']) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="info">Programmé</Badge>
      case 'completed':
        return <Badge variant="success">Terminé</Badge>
      case 'cancelled':
        return <Badge variant="destructive">Annulé</Badge>
      case 'no-show':
        return <Badge variant="warning">Absent</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const handleCancel = (appointmentId: string) => {
    // TODO: Implement cancel appointment
    if (window.confirm('Êtes-vous sûr de vouloir annuler ce rendez-vous ?')) {
      console.log('Cancel appointment:', appointmentId)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mes rendez-vous</h1>
          <p className="mt-1 text-sm text-gray-600">
            Gérez vos rendez-vous médicaux et prenez de nouveaux rendez-vous
          </p>
        </div>
        <Button
          onClick={() => navigate('/patient/appointments/new')}
          className="bg-medical-blue-500 hover:bg-medical-blue-600 text-white"
        >
          <Plus className="h-5 w-5" />
          <span className="ml-2">Prendre un rendez-vous</span>
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'upcoming' | 'past')}>
        <TabsList>
          <TabsTrigger value="upcoming">
            À venir ({upcomingAppointments.length})
          </TabsTrigger>
          <TabsTrigger value="past">Passés ({pastAppointments.length})</TabsTrigger>
        </TabsList>

        {/* Upcoming Appointments */}
        <TabsContent value="upcoming" className="mt-6">
          {isLoading ? (
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-20 animate-pulse rounded bg-gray-200" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : upcomingAppointments.length > 0 ? (
            <div className="space-y-4">
              {upcomingAppointments.map((appointment: Appointment) => {
                const appointmentDate = new Date(`${appointment.date}T${appointment.time}`)
                const isToday = appointmentDate.toDateString() === new Date().toDateString()

                return (
                  <Card
                    key={appointment.id}
                    className={cn(
                      'border-medical-blue-200 transition-all hover:shadow-md',
                      isToday && 'border-2 border-medical-blue-400 bg-blue-50/50'
                    )}
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-medical-blue-100 p-2">
                              <Calendar className="h-5 w-5 text-medical-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {formatDate(appointment.date)} à {appointment.time}
                              </h3>
                              {isToday && (
                                <Badge variant="info" className="mt-1">
                                  Aujourd'hui
                                </Badge>
                              )}
                            </div>
                          </div>
                          {appointment.doctor && (
                            <div className="flex items-center gap-3">
                              <User className="h-4 w-4 text-gray-400" />
                              <p className="text-sm text-gray-700">
                                Dr. {appointment.doctor.firstName} {appointment.doctor.lastName}
                                {appointment.doctor.profile?.specialization &&
                                  ` - ${appointment.doctor.profile.specialization}`}
                              </p>
                            </div>
                          )}
                          <div className="flex items-center gap-3">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <p className="text-sm text-gray-700">
                              Durée : {appointment.duration} minutes
                            </p>
                            {getStatusBadge(appointment.status)}
                          </div>
                          {appointment.notes && (
                            <p className="text-sm text-gray-600">{appointment.notes}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/patient/appointments/${appointment.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                            <span className="ml-2">Détails</span>
                          </Button>
                          {appointment.status === 'scheduled' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCancel(appointment.id)}
                              className="border-red-300 text-red-700 hover:bg-red-50"
                            >
                              <X className="h-4 w-4" />
                              <span className="ml-2">Annuler</span>
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Calendar className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  Aucun rendez-vous à venir
                </h3>
                <p className="mb-4 text-sm text-gray-600">
                  Prenez rendez-vous pour consulter un médecin
                </p>
                <Button
                  onClick={() => navigate('/patient/appointments/new')}
                  className="bg-medical-blue-500 hover:bg-medical-blue-600 text-white"
                >
                  <Plus className="h-5 w-5" />
                  <span className="ml-2">Prendre un rendez-vous</span>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Past Appointments */}
        <TabsContent value="past" className="mt-6">
          {isLoading ? (
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-20 animate-pulse rounded bg-gray-200" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : pastAppointments.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Heure</TableHead>
                    <TableHead>Médecin</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pastAppointments.map((appointment: Appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">
                            {formatDate(appointment.date)}
                          </p>
                          <p className="text-sm text-gray-500">{appointment.time}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {appointment.doctor ? (
                          <p className="text-sm text-gray-700">
                            Dr. {appointment.doctor.firstName} {appointment.doctor.lastName}
                          </p>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-700">
                          {appointment.type === 'consultation'
                            ? 'Consultation'
                            : appointment.type === 'follow-up'
                              ? 'Suivi'
                              : appointment.type === 'emergency'
                                ? 'Urgence'
                                : 'Chirurgie'}
                        </span>
                      </TableCell>
                      <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/patient/appointments/${appointment.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  Aucun rendez-vous passé
                </h3>
                <p className="text-sm text-gray-600">
                  Vos rendez-vous passés apparaîtront ici
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
})

PatientAppointments.displayName = 'PatientAppointments'

export { PatientAppointments }

