import { useState, useEffect, useMemo } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import {
  Search,
  Filter,
  Grid,
  List,
  SortAsc,
  SortDesc,
  Calendar,
  X,
  Users,
  FileText,
  Pill,
  FlaskConical,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SearchResultsCard } from '@/components/search/SearchResultsCard'
import { useSearch } from '@/hooks/useSearch'
import { useApiError } from '@/hooks/useApiError'
import { Alert } from '@/components/ui/alert'
import { cn } from '@/libs/utils'
import type { SearchResultType, SearchParams } from '@/types/api'

export const SearchResultsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [selectedTypes, setSelectedTypes] = useState<SearchResultType[]>([])
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [status, setStatus] = useState('')
  const [city, setCity] = useState('')
  const [doctorId, setDoctorId] = useState('')
  const [medication, setMedication] = useState('')
  const [viewMode, setViewMode] = useState<'compact' | 'extended'>('extended')
  const [sortBy, setSortBy] = useState<'relevance' | 'date' | 'alphabetical'>('relevance')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [page, setPage] = useState(1)
  const limit = 20

  // Construire les paramètres de recherche
  const searchParams_obj: SearchParams = useMemo(
    () => ({
      q: query,
      types: selectedTypes.length > 0 ? selectedTypes : undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      status: status || undefined,
      city: city || undefined,
      doctorId: doctorId || undefined,
      medication: medication || undefined,
      limit,
      offset: (page - 1) * limit,
      sortBy,
    }),
    [query, selectedTypes, dateFrom, dateTo, status, city, doctorId, medication, page, limit, sortBy]
  )

  const { results, isLoading, error } = useSearch(searchParams_obj)
  const errorMessage = useApiError(error)

  // Initialiser depuis URL params
  useEffect(() => {
    const q = searchParams.get('q')
    if (q) setQuery(q)

    const types = searchParams.get('types')
    if (types) {
      setSelectedTypes(types.split(',') as SearchResultType[])
    }
  }, [searchParams])

  // Mettre à jour l'URL quand les filtres changent
  useEffect(() => {
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (selectedTypes.length > 0) params.set('types', selectedTypes.join(','))
    if (dateFrom) params.set('dateFrom', dateFrom)
    if (dateTo) params.set('dateTo', dateTo)
    if (status) params.set('status', status)
    if (city) params.set('city', city)

    navigate(`/dashboard/search?${params.toString()}`, { replace: true })
  }, [query, selectedTypes, dateFrom, dateTo, status, city, navigate])

  const handleTypeToggle = (type: SearchResultType) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
    setPage(1)
  }

  const handleSearch = () => {
    setPage(1)
  }

  const resetFilters = () => {
    setQuery('')
    setSelectedTypes([])
    setDateFrom('')
    setDateTo('')
    setStatus('')
    setCity('')
    setDoctorId('')
    setMedication('')
    setPage(1)
  }

  const hasActiveFilters =
    selectedTypes.length > 0 || dateFrom || dateTo || status || city || doctorId || medication

  const allTypes: SearchResultType[] = ['patient', 'appointment', 'prescription', 'document', 'lab']
  const typeLabels: Record<SearchResultType, string> = {
    patient: 'Patients',
    appointment: 'Rendez-vous',
    prescription: 'Prescriptions',
    document: 'Documents',
    lab: 'Laboratoire',
  }

  const typeIcons = {
    patient: Users,
    appointment: Calendar,
    prescription: Pill,
    document: FileText,
    lab: FlaskConical,
  }

  // Trier les résultats
  const sortedResults = useMemo(() => {
    if (!results?.results) return []

    const sorted = [...results.results]

    if (sortBy === 'relevance') {
      return sorted.sort((a, b) => b.relevance - a.relevance)
    } else if (sortBy === 'date') {
      return sorted.sort((a, b) => {
        const dateA = a.metadata.date ? new Date(a.metadata.date).getTime() : 0
        const dateB = b.metadata.date ? new Date(b.metadata.date).getTime() : 0
        return dateB - dateA
      })
    } else {
      return sorted.sort((a, b) => a.title.localeCompare(b.title))
    }
  }, [results?.results, sortBy])

  const totalPages = results ? Math.ceil(results.total / limit) : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Recherche médicale</h1>
        <p className="mt-1 text-sm text-gray-600">
          {results
            ? `${results.total} résultat${results.total > 1 ? 's' : ''} trouvé${results.total > 1 ? 's' : ''}`
            : 'Recherchez dans tous les dossiers médicaux'}
        </p>
      </div>

      {/* Search Bar */}
      <Card className="p-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Rechercher patients, RDVs, prescriptions, documents..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') handleSearch()
            }}
            icon={<Search className="h-4 w-4" />}
            className="flex-1"
          />
          <Button onClick={handleSearch} disabled={!query || query.length < 2}>
            Rechercher
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtres
          </Button>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="mt-4 pt-4 border-t space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Date de début</label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Date de fin</label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Statut</label>
                <Input
                  placeholder="Statut..."
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Ville</label>
                <Input
                  placeholder="Ville..."
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Médecin ID</label>
                <Input
                  placeholder="ID médecin..."
                  value={doctorId}
                  onChange={(e) => setDoctorId(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Médicament</label>
                <Input
                  placeholder="Médicament..."
                  value={medication}
                  onChange={(e) => setMedication(e.target.value)}
                />
              </div>
            </div>
            {hasActiveFilters && (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={resetFilters}>
                  <X className="h-4 w-4 mr-2" />
                  Réinitialiser
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Filters Sidebar + Results */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Filters */}
        <div className="lg:col-span-1">
          <Card className="p-4 sticky top-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Types</h3>
                <div className="space-y-2">
                  {allTypes.map((type) => {
                    const Icon = typeIcons[type]
                    const count = results?.byType[type] || 0
                    const isSelected = selectedTypes.includes(type)

                    return (
                      <button
                        key={type}
                        onClick={() => handleTypeToggle(type)}
                        className={cn(
                          'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors',
                          isSelected
                            ? 'bg-medical-blue-50 text-medical-blue-700 border border-medical-blue-200'
                            : 'hover:bg-gray-50 text-gray-700'
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <span>{typeLabels[type]}</span>
                        </div>
                        {count > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {count}
                          </Badge>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Results */}
        <div className="lg:col-span-3 space-y-4">
          {/* Toolbar */}
          {results && results.total > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'compact' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('compact')}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'extended' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('extended')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Trier par:</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortBy('relevance')}
                  className={sortBy === 'relevance' ? 'bg-medical-blue-50' : ''}
                >
                  Pertinence
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortBy('date')}
                  className={sortBy === 'date' ? 'bg-medical-blue-50' : ''}
                >
                  <SortDesc className="h-4 w-4 mr-1" />
                  Date
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortBy('alphabetical')}
                  className={sortBy === 'alphabetical' ? 'bg-medical-blue-50' : ''}
                >
                  <SortAsc className="h-4 w-4 mr-1" />
                  A-Z
                </Button>
              </div>
            </div>
          )}

          {/* Error */}
          {errorMessage && (
            <Alert variant="destructive">{errorMessage}</Alert>
          )}

          {/* Loading */}
          {isLoading && (
            <Card className="p-12 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-medical-blue-600 border-t-transparent" />
              <p className="mt-4 text-gray-600">Recherche en cours...</p>
            </Card>
          )}

          {/* No Results */}
          {!isLoading && results && results.total === 0 && (
            <Card className="p-12 text-center">
              <Search className="mx-auto h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Aucun résultat trouvé
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Essayez avec d'autres mots-clés ou modifiez les filtres
              </p>
              <Button variant="outline" onClick={resetFilters}>
                Réinitialiser les filtres
              </Button>
            </Card>
          )}

          {/* Results List */}
          {!isLoading && sortedResults.length > 0 && (
            <>
              <div className="space-y-3">
                {sortedResults.map((result) => (
                  <SearchResultsCard
                    key={result.id}
                    result={result}
                    query={query}
                    viewMode={viewMode}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Précédent
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = Math.max(1, Math.min(totalPages - 4, page - 2)) + i
                      if (pageNum > totalPages) return null
                      return (
                        <Button
                          key={pageNum}
                          variant={pageNum === page ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setPage(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      )
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Suivant
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

