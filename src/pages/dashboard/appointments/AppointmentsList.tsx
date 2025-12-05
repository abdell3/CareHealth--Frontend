import { useState, useMemo, memo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import {
  Calendar,
  Plus,
  Table as TableIcon,
  CalendarDays,
  Download,
  RefreshCw,
  Eye,
  Search,
  AlertCircle,
} from 'lucide-react'
import { PageLayout } from '@/components/layouts/PageLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MedicalCalendar } from '@/components/calendar/MedicalCalendar'
import { AdvancedFilters, type AppointmentFilters } from '@/components/filters/AdvancedFilters'
import { QuickCreateModal, type QuickCreateData } from '@/components/appointments/QuickCreateModal'
import { appointmentsService } from '@/api/appointments.service'
import { usersService } from '@/api/users.service'
import { useDebounce } from '@/hooks/useDebounce'
import { useApiError } from '@/hooks/useApiError'
import { useAuth } from '@/hooks/useAuth'
import { formatDate, formatDateTime } from '@/utils/helpers'
import { cn } from '@/libs/utils'
import type { Appointment } from '@/types/api'

type ViewMode = 'calendar' | 'table' | 'day'

const AppointmentsList = memo(() => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [viewMode, setViewMode] = useState<ViewMode>('calendar')
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<AppointmentFilters>({ status: [] })
  const [showQuickCreate, setShowQuickCreate] = useState(false)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(50)

  const debouncedSearch = useDebounce(search, 300)

  // Fetch doctors for filters
  const { data: doctorsData } = useQuery({
    queryKey: ['doctors'],
    queryFn: async () => {
      const response = await usersService.getUsers({ role: 'doctor', limit: 100 })
      return response.data
    },
  })

  // Build query params
  const queryParams = useMemo(() => {
    const params: {
      page?: number
      limit?: number
      doctorId?: string
      patientId?: string
      status?: Appointment['status']
      date?: string
    } = {
      page,
      limit,
    }

    if (filters.doctorId) params.doctorId = filters.doctorId
    if (filters.patientId) params.patientId = filters.patientId
    if (filters.status && filters.status.length === 1) {
      params.status = filters.status[0]
    }
    if (filters.dateRange?.start) {
      params.date = filters.dateRange.start.toISOString().split('T')[0]
    }

    return params
  }, [filters, page, limit])

  // Fetch appointments
  const {
    data: appointmentsData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['appointments', queryParams, debouncedSearch],
    queryFn: async () => {
      const response = await appointmentsService.getAppointments(queryParams)
      return response.data
    },
  })

  // Create appointment mutation
  const createMutation = useMutation({
    mutationFn: async (data: QuickCreateData) => {
      const response = await appointmentsService.createAppointment({
        patientId: data.patientId,
        doctorId: data.doctorId,
        date: data.date,
        time: data.time,
        duration: data.duration,
        type: data.type,
        notes: data.notes,
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      setShowQuickCreate(false)
    },
  })

  const errorMessage = useApiError(error)

  // Filter appointments by search
  const filteredAppointments = useMemo(() => {
    if (!appointmentsData?.appointments) return []
    let filtered = appointmentsData.appointments

    // Apply search filter
    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase()
      filtered = filtered.filter((apt) => {
        const patientName = apt.patient
          ? `${apt.patient.firstName} ${apt.patient.lastName}`.toLowerCase()
          : ''
        const doctorName = apt.doctor
          ? `${apt.doctor.firstName} ${apt.doctor.lastName}`.toLowerCase()
          : ''
        return (
          patientName.includes(searchLower) ||
          doctorName.includes(searchLower) ||
          apt.type.toLowerCase().includes(searchLower)
        )
      })
    }

    // Apply status filter (multiple)
    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter((apt) => filters.status?.includes(apt.status))
    }

    return filtered
  }, [appointmentsData?.appointments, debouncedSearch, filters.status])

  // Check permissions
  const canCreate = useMemo(
    () => user?.role === 'admin' || user?.role === 'doctor' || user?.role === 'nurse' || user?.role === 'receptionist',
    [user?.role]
  )

  // Get status badge
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

  // Handle quick create
  const handleQuickCreate = (data: QuickCreateData) => {
    createMutation.mutate(data)
  }

  // Handle event click in calendar
  const handleEventClick = (appointment: Appointment) => {
    navigate(`/dashboard/appointments/${appointment.id}`)
  }

  // Handle date click in calendar
  const handleDateClick = (date: Date) => {
    if (canCreate) {
      setShowQuickCreate(true)
    }
  }

  // Count appointments per status
  const statusCounts = useMemo(() => {
    if (!appointmentsData?.appointments) return {}
    const counts: Record<string, number> = {}
    appointmentsData.appointments.forEach((apt) => {
      counts[apt.status] = (counts[apt.status] || 0) + 1
    })
    return counts
  }, [appointmentsData?.appointments])

  return (
    <PageLayout
      title="Rendez-vous"
      description="Gérez tous vos rendez-vous médicaux"
      actionButton={
        canCreate ? (
          <Button
            onClick={() => setShowQuickCreate(true)}
            className="bg-medical-blue-500 hover:bg-medical-blue-600 text-white"
          >
            <Plus className="h-5 w-5" />
            Nouveau rendez-vous
          </Button>
        ) : undefined
      }
    >
      <div className="space-y-6">
        {/* Statistics */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card className="bg-gradient-to-r from-medical-blue-50 to-medical-green-50 border-medical-blue-200 shadow-medical">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-medical-blue-600">
                    {isLoading ? '...' : appointmentsData?.total || 0}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-medical-blue-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-medical-blue-200 shadow-medical">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Programmés</p>
                  <p className="text-2xl font-bold text-medical-blue-600">
                    {statusCounts.scheduled || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-medical-green-200 shadow-medical">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Terminés</p>
                  <p className="text-2xl font-bold text-medical-green-600">
                    {statusCounts.completed || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-red-200 shadow-medical">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Annulés</p>
                  <p className="text-2xl font-bold text-red-600">
                    {statusCounts.cancelled || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Toolbar */}
        <Card className="shadow-medical">
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              {/* View Mode Toggle */}
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
                <TabsList>
                  <TabsTrigger value="calendar" className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    Calendrier
                  </TabsTrigger>
                  <TabsTrigger value="table" className="flex items-center gap-2">
                    <TableIcon className="h-4 w-4" />
                    Tableau
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex flex-1 items-center gap-4 md:justify-end">
                {/* Search */}
                <div className="flex-1 md:max-w-xs">
                  <Input
                    type="text"
                    placeholder="Rechercher..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    icon={<Search className="h-4 w-4" />}
                  />
                </div>

                {/* Advanced Filters */}
                <div className="relative">
                  <AdvancedFilters
                    doctors={doctorsData?.users || []}
                    onFiltersChange={setFilters}
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={() => refetch()}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" title="Exporter">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error State */}
        {isError && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <p className="text-sm text-red-600">
                  {errorMessage || 'Une erreur est survenue lors du chargement des rendez-vous.'}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {isLoading && (
          <Card className="shadow-medical">
            <CardContent className="p-6">
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 animate-pulse rounded bg-gray-200" />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!isLoading && !isError && filteredAppointments.length === 0 && (
          <Card className="shadow-medical">
            <CardContent className="p-12">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="mb-4 rounded-full bg-medical-blue-100 p-4">
                  <Calendar className="h-12 w-12 text-medical-blue-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Aucun rendez-vous trouvé</h3>
                <p className="mt-1 text-sm text-gray-600">
                  {search || filters.doctorId || filters.status?.length
                    ? 'Aucun rendez-vous ne correspond à vos critères de recherche.'
                    : 'Commencez par créer votre premier rendez-vous.'}
                </p>
                {canCreate && (
                  <Button
                    onClick={() => setShowQuickCreate(true)}
                    className="mt-4 bg-medical-blue-500 hover:bg-medical-blue-600 text-white"
                  >
                    <Plus className="h-5 w-5" />
                    Créer un rendez-vous
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Calendar View */}
        {!isLoading && !isError && viewMode === 'calendar' && filteredAppointments.length > 0 && (
          <MedicalCalendar
            appointments={filteredAppointments}
            onEventClick={handleEventClick}
            onDateClick={handleDateClick}
          />
        )}

        {/* Table View */}
        {!isLoading && !isError && viewMode === 'table' && filteredAppointments.length > 0 && (
          <Card className="shadow-medical">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-medical-blue-50 to-medical-green-50">
                    <TableHead className="font-semibold text-gray-900">Date & Heure</TableHead>
                    <TableHead className="font-semibold text-gray-900">Patient</TableHead>
                    <TableHead className="font-semibold text-gray-900">Médecin</TableHead>
                    <TableHead className="font-semibold text-gray-900">Type</TableHead>
                    <TableHead className="font-semibold text-gray-900">Durée</TableHead>
                    <TableHead className="font-semibold text-gray-900">Statut</TableHead>
                    <TableHead className="w-[50px] font-semibold text-gray-900"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAppointments.map((appointment: Appointment) => {
                    const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}`)
                    const isOverdue =
                      appointment.status === 'scheduled' && appointmentDateTime < new Date()

                    return (
                      <TableRow
                        key={appointment.id}
                        className={cn(
                          'transition-all hover:bg-medical-blue-50/50',
                          isOverdue && 'bg-red-50/50'
                        )}
                      >
                        <TableCell>
                          <div>
                            <p className="font-medium text-gray-900">
                              {formatDate(appointment.date)}
                            </p>
                            <p className="text-sm text-gray-500">{appointment.time}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {appointment.patient ? (
                            <Link
                              to={`/dashboard/patients/${appointment.patientId}`}
                              className="font-medium text-medical-blue-600 hover:underline"
                            >
                              {appointment.patient.firstName} {appointment.patient.lastName}
                            </Link>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {appointment.doctor ? (
                            <span className="text-gray-900">
                              {appointment.doctor.firstName} {appointment.doctor.lastName}
                            </span>
                          ) : (
                            <span className="text-gray-500">-</span>
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
                        <TableCell>
                          <span className="text-sm text-gray-700">{appointment.duration} min</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(appointment.status)}
                            {isOverdue && (
                              <Badge variant="destructive" className="animate-pulse">
                                En retard
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Link
                            to={`/dashboard/appointments/${appointment.id}`}
                            className="text-medical-blue-600 hover:underline"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </Card>
        )}

        {/* Pagination */}
        {!isLoading &&
          !isError &&
          appointmentsData &&
          appointmentsData.total > limit && (
            <Card className="shadow-medical">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Affichage de {(page - 1) * limit + 1} à {Math.min(page * limit, appointmentsData.total)} sur{' '}
                    {appointmentsData.total} rendez-vous
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Précédent
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => p + 1)}
                      disabled={page * limit >= appointmentsData.total}
                    >
                      Suivant
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

        {/* Quick Create Modal */}
        <QuickCreateModal
          isOpen={showQuickCreate}
          onClose={() => setShowQuickCreate(false)}
          onSubmit={handleQuickCreate}
        />
      </div>
    </PageLayout>
  )
})

AppointmentsList.displayName = 'AppointmentsList'

export { AppointmentsList }
