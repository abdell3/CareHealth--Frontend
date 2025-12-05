import { useState, useMemo, memo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import {
  Users,
  Plus,
  Search,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
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
import { patientsService } from '@/api/patients.service'
import { useDebounce } from '@/hooks/useDebounce'
import { useApiError } from '@/hooks/useApiError'
import { useAuth } from '@/hooks/useAuth'
import { formatPhoneNumber, formatDate, getUserInitials } from '@/utils/helpers'
import type { Patient } from '@/types/api'
import { cn } from '@/libs/utils'

const PatientsList = memo(() => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [search, setSearch] = useState('')
  const [genderFilter, setGenderFilter] = useState<'male' | 'female' | 'other' | ''>('')
  const [cityFilter, setCityFilter] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null)

  const debouncedSearch = useDebounce(search, 300)

  // Check permissions for "Nouveau patient" button
  const canCreatePatient = useMemo(
    () => user?.role === 'admin' || user?.role === 'doctor' || user?.role === 'nurse',
    [user?.role]
  )

  // Fetch patients
  const {
    data: patientsData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['patients', page, limit, debouncedSearch, genderFilter, cityFilter],
    queryFn: async () => {
      const params: {
        page?: number
        limit?: number
        search?: string
        gender?: 'male' | 'female' | 'other'
        city?: string
      } = {
        page,
        limit,
      }
      if (debouncedSearch) params.search = debouncedSearch
      if (genderFilter) params.gender = genderFilter as 'male' | 'female' | 'other'
      if (cityFilter) params.city = cityFilter

      const response = await patientsService.getPatients(params)
      return response.data
    },
  })

  const errorMessage = useApiError(error)

  // Calculate statistics
  const stats = useMemo(() => {
    if (!patientsData) return { total: 0, newThisMonth: 0 }
    const total = patientsData.total
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const newThisMonth = patientsData.patients.filter((p) => {
      const createdAt = new Date(p.createdAt)
      return createdAt >= startOfMonth
    }).length
    return { total, newThisMonth }
  }, [patientsData])

  // Calculate pagination
  const totalPages = useMemo(() => {
    if (!patientsData) return 0
    return Math.ceil(patientsData.total / patientsData.limit)
  }, [patientsData])

  const startIndex = useMemo(() => {
    if (!patientsData) return 0
    return (patientsData.page - 1) * patientsData.limit + 1
  }, [patientsData])

  const endIndex = useMemo(() => {
    if (!patientsData) return 0
    return Math.min(patientsData.page * patientsData.limit, patientsData.total)
  }, [patientsData])

  // Check if patient is new (< 7 days)
  const isNewPatient = (createdAt: string): boolean => {
    const created = new Date(createdAt)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - created.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 7
  }

  // Extract city from address
  const getCity = (address?: string): string => {
    if (!address) return '-'
    // Simple extraction - assumes city is at the end or after comma
    const parts = address.split(',')
    return parts[parts.length - 1]?.trim() || address
  }

  // Handle actions
  const handleView = (patientId: string) => {
    navigate(`/dashboard/patients/${patientId}`)
    setActionMenuOpen(null)
  }

  const handleEdit = (patientId: string) => {
    // TODO: Implement edit functionality
    console.log('Edit patient:', patientId)
    setActionMenuOpen(null)
  }

  const handleDelete = (patientId: string) => {
    // TODO: Implement delete functionality
    console.log('Delete patient:', patientId)
    setActionMenuOpen(null)
  }

  return (
    <PageLayout
      title="Patients"
      description="Gérez la liste de vos patients"
      actionButton={
        canCreatePatient ? (
          <Button
            onClick={() => navigate('/dashboard/patients/new')}
            className="bg-medical-blue-500 hover:bg-medical-blue-600 text-white"
          >
            <Plus className="h-5 w-5" />
            Nouveau patient
          </Button>
        ) : undefined
      }
    >
      {/* Statistics Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="bg-gradient-to-r from-medical-blue-50 to-medical-green-50 border-medical-blue-200 shadow-medical">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total patients</p>
                <p className="mt-2 text-3xl font-bold text-medical-blue-600">
                  {isLoading ? '...' : stats.total}
                </p>
              </div>
              <div className="rounded-full bg-medical-blue-100 p-3">
                <Users className="h-6 w-6 text-medical-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-medical-green-50 to-medical-blue-50 border-medical-green-200 shadow-medical">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Nouveaux ce mois</p>
                <p className="mt-2 text-3xl font-bold text-medical-green-600">
                  {isLoading ? '...' : stats.newThisMonth}
                </p>
              </div>
              <div className="rounded-full bg-medical-green-100 p-3">
                <Users className="h-6 w-6 text-medical-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <Card className="mb-6 shadow-medical">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Search */}
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Rechercher un patient..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                icon={<Search className="h-4 w-4" />}
                className="w-full"
              />
            </div>

            {/* Filters Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filtres
              {showFilters && <X className="h-4 w-4" />}
            </Button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 flex flex-wrap gap-4 border-t pt-4">
              <div className="flex-1 min-w-[150px]">
                <label className="mb-2 block text-sm font-medium text-gray-700">Genre</label>
                <select
                  value={genderFilter}
                  onChange={(e) => {
                    setGenderFilter(e.target.value as 'male' | 'female' | 'other' | '')
                    setPage(1)
                  }}
                  className="h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Tous</option>
                  <option value="male">Homme</option>
                  <option value="female">Femme</option>
                  <option value="other">Autre</option>
                </select>
              </div>
              <div className="flex-1 min-w-[150px]">
                <label className="mb-2 block text-sm font-medium text-gray-700">Ville</label>
                <Input
                  type="text"
                  placeholder="Filtrer par ville..."
                  value={cityFilter}
                  onChange={(e) => {
                    setCityFilter(e.target.value)
                    setPage(1)
                  }}
                  className="w-full"
                />
              </div>
              {(genderFilter || cityFilter) && (
                <div className="flex items-end">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setGenderFilter('')
                      setCityFilter('')
                      setPage(1)
                    }}
                    className="text-sm"
                  >
                    Réinitialiser
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error State */}
      {isError && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="p-6">
            <p className="text-sm text-red-600">
              {errorMessage || 'Une erreur est survenue lors du chargement des patients.'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <Card className="shadow-medical">
          <CardContent className="p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="h-12 w-12 animate-pulse rounded-full bg-gray-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-1/4 animate-pulse rounded bg-gray-200" />
                    <div className="h-3 w-1/3 animate-pulse rounded bg-gray-200" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && !isError && patientsData?.patients.length === 0 && (
        <Card className="shadow-medical">
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="mb-4 rounded-full bg-medical-blue-100 p-4">
                <Users className="h-12 w-12 text-medical-blue-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Aucun patient trouvé</h3>
              <p className="mt-1 text-sm text-gray-600">
                {search || genderFilter || cityFilter
                  ? 'Aucun patient ne correspond à vos critères de recherche.'
                  : 'Commencez par ajouter votre premier patient.'}
              </p>
              {canCreatePatient && (
                <Button
                  onClick={() => navigate('/dashboard/patients/new')}
                  className="mt-4 bg-medical-blue-500 hover:bg-medical-blue-600 text-white"
                >
                  <Plus className="h-5 w-5" />
                  Nouveau patient
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Patients Table */}
      {!isLoading && !isError && patientsData && patientsData.patients.length > 0 && (
        <>
          <Card className="mb-6 overflow-hidden shadow-medical">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-medical-blue-50 to-medical-green-50">
                    <TableHead className="font-semibold text-gray-900">Patient</TableHead>
                    <TableHead className="font-semibold text-gray-900">Téléphone</TableHead>
                    <TableHead className="font-semibold text-gray-900">Ville</TableHead>
                    <TableHead className="font-semibold text-gray-900">Date d'inscription</TableHead>
                    <TableHead className="font-semibold text-gray-900">Statut</TableHead>
                    <TableHead className="w-[50px] font-semibold text-gray-900"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patientsData.patients.map((patient: Patient, index: number) => (
                    <TableRow
                      key={patient.id}
                      className={cn(
                        'transition-all hover:bg-medical-blue-50/50 hover:shadow-sm hover:scale-[1.01]'
                      )}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {/* Avatar with initials */}
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-medical-blue-400 to-medical-green-400 text-sm font-semibold text-white shadow-sm">
                            {getUserInitials(patient.firstName, patient.lastName)}
                          </div>
                          <div>
                            <Link
                              to={`/dashboard/patients/${patient.id}`}
                              className="font-medium text-gray-900 hover:text-medical-blue-600 transition-colors"
                            >
                              {patient.firstName} {patient.lastName}
                            </Link>
                            <p className="text-xs text-gray-500">{patient.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-700">
                          {patient.phone ? formatPhoneNumber(patient.phone) : '-'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-700">{getCity(patient.address)}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-700">
                          {formatDate(patient.createdAt)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {isNewPatient(patient.createdAt) && (
                          <Badge variant="success">Nouveau</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="relative">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              setActionMenuOpen(actionMenuOpen === patient.id ? null : patient.id)
                            }
                            className="h-8 w-8"
                            aria-label="Actions"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                          {actionMenuOpen === patient.id && (
                            <div className="absolute right-0 top-10 z-10 w-48 rounded-lg border bg-white shadow-lg">
                              <button
                                onClick={() => handleView(patient.id)}
                                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 first:rounded-t-lg"
                              >
                                <Eye className="h-4 w-4" />
                                Voir
                              </button>
                              <button
                                onClick={() => handleEdit(patient.id)}
                                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <Edit className="h-4 w-4" />
                                Modifier
                              </button>
                              <button
                                onClick={() => handleDelete(patient.id)}
                                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 last:rounded-b-lg"
                              >
                                <Trash2 className="h-4 w-4" />
                                Supprimer
                              </button>
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>

          {/* Pagination */}
          <Card className="shadow-medical">
            <CardContent className="p-4">
              <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                <div className="text-sm text-gray-600">
                  Résultats <span className="font-medium">{startIndex}</span> -{' '}
                  <span className="font-medium">{endIndex}</span> sur{' '}
                  <span className="font-medium">{patientsData.total}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1 || isLoading}
                    aria-label="Page précédente"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-gray-700">
                    Page {patientsData.page} sur {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages || isLoading}
                    aria-label="Page suivante"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <select
                    value={limit}
                    onChange={(e) => {
                      setLimit(Number(e.target.value))
                      setPage(1)
                    }}
                    className="h-9 rounded-lg border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label="Résultats par page"
                  >
                    <option value="10">10 par page</option>
                    <option value="25">25 par page</option>
                    <option value="50">50 par page</option>
                    <option value="100">100 par page</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Close action menu when clicking outside */}
      {actionMenuOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setActionMenuOpen(null)}
          aria-hidden="true"
        />
      )}
    </PageLayout>
  )
})

PatientsList.displayName = 'PatientsList'

export { PatientsList }
