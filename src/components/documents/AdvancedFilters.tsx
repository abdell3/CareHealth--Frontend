import * as React from 'react'
import { Filter, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { TagManager } from './TagManager'
import type { Document } from '@/types/api'

interface AdvancedFiltersProps {
  filters: DocumentFilters
  onFiltersChange: (filters: DocumentFilters) => void
  availableTags?: string[]
  className?: string
}

export interface DocumentFilters {
  search?: string
  categories?: Document['category'][]
  tags?: string[]
  dateFrom?: string
  dateTo?: string
  patientId?: string
  minSizeMB?: number
  maxSizeMB?: number
  confidentiality?: Document['confidentiality'][]
  status?: Document['status'][]
}

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  filters,
  onFiltersChange,
  availableTags = [],
  className,
}) => {
  const [isOpen, setIsOpen] = React.useState(false)

  const updateFilter = <K extends keyof DocumentFilters>(
    key: K,
    value: DocumentFilters[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const clearFilters = () => {
    onFiltersChange({})
  }

  const activeFiltersCount = React.useMemo(() => {
    let count = 0
    if (filters.search) count++
    if (filters.categories && filters.categories.length > 0) count++
    if (filters.tags && filters.tags.length > 0) count++
    if (filters.dateFrom || filters.dateTo) count++
    if (filters.patientId) count++
    if (filters.minSizeMB || filters.maxSizeMB) count++
    if (filters.confidentiality && filters.confidentiality.length > 0) count++
    if (filters.status && filters.status.length > 0) count++
    return count
  }, [filters])

  const categories: Document['category'][] = ['imaging', 'report', 'lab-result', 'administrative', 'other']
  const confidentialityLevels: Document['confidentiality'][] = ['public', 'internal', 'confidential']
  const statuses: Document['status'][] = ['pending', 'validated', 'rejected']

  return (
    <div className={className}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Filter className="mr-2 h-4 w-4" />
        Filtres avancés
        {activeFiltersCount > 0 && (
          <Badge variant="default" className="ml-2">
            {activeFiltersCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <Card className="absolute right-0 z-50 mt-2 w-80 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm">Filtres</CardTitle>
            <div className="flex items-center gap-2">
              {activeFiltersCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Réinitialiser
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search */}
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                Recherche
              </label>
              <Input
                placeholder="Nom, contenu..."
                value={filters.search || ''}
                onChange={(e) => updateFilter('search', e.target.value)}
              />
            </div>

            {/* Categories */}
            <div>
              <label className="mb-2 block text-xs font-medium text-gray-700">
                Catégories
              </label>
              <div className="space-y-2">
                {categories.map((category) => (
                  <label key={category} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters.categories?.includes(category) || false}
                      onChange={(e) => {
                        const current = filters.categories || []
                        if (e.target.checked) {
                          updateFilter('categories', [...current, category])
                        } else {
                          updateFilter('categories', current.filter((c) => c !== category))
                        }
                      }}
                    />
                    <span className="text-sm text-gray-700">{category}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Tags */}
            <TagManager
              tags={filters.tags || []}
              onTagsChange={(tags) => updateFilter('tags', tags)}
              suggestions={availableTags}
            />

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  Date début
                </label>
                <Input
                  type="date"
                  value={filters.dateFrom || ''}
                  onChange={(e) => updateFilter('dateFrom', e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  Date fin
                </label>
                <Input
                  type="date"
                  value={filters.dateTo || ''}
                  onChange={(e) => updateFilter('dateTo', e.target.value)}
                />
              </div>
            </div>

            {/* Confidentiality */}
            <div>
              <label className="mb-2 block text-xs font-medium text-gray-700">
                Confidentialité
              </label>
              <div className="space-y-2">
                {confidentialityLevels.map((level) => (
                  <label key={level} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters.confidentiality?.includes(level) || false}
                      onChange={(e) => {
                        const current = filters.confidentiality || []
                        if (e.target.checked) {
                          updateFilter('confidentiality', [...current, level])
                        } else {
                          updateFilter('confidentiality', current.filter((c) => c !== level))
                        }
                      }}
                    />
                    <span className="text-sm text-gray-700 capitalize">{level}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="mb-2 block text-xs font-medium text-gray-700">
                Statut
              </label>
              <div className="space-y-2">
                {statuses.map((status) => (
                  <label key={status} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters.status?.includes(status) || false}
                      onChange={(e) => {
                        const current = filters.status || []
                        if (e.target.checked) {
                          updateFilter('status', [...current, status])
                        } else {
                          updateFilter('status', current.filter((s) => s !== status))
                        }
                      }}
                    />
                    <span className="text-sm text-gray-700 capitalize">{status}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Size Range */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  Taille min (MB)
                </label>
                <Input
                  type="number"
                  value={filters.minSizeMB || ''}
                  onChange={(e) => updateFilter('minSizeMB', e.target.value ? Number(e.target.value) : undefined)}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  Taille max (MB)
                </label>
                <Input
                  type="number"
                  value={filters.maxSizeMB || ''}
                  onChange={(e) => updateFilter('maxSizeMB', e.target.value ? Number(e.target.value) : undefined)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

