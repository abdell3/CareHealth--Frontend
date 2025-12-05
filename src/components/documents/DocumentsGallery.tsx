import * as React from 'react'
import { useState, useMemo } from 'react'
import { Grid, List, Download, Share2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DocumentCard } from './DocumentCard'
import { AdvancedFilters, type DocumentFilters } from './AdvancedFilters'
import { useQuery } from '@tanstack/react-query'
import { documentsService } from '@/api/documents.service'
import { useApiError } from '@/hooks/useApiError'
import { cn } from '@/libs/utils'
import type { Document } from '@/types/api'

interface DocumentsGalleryProps {
  patientId?: string
  onDocumentView?: (document: Document) => void
  onDocumentDownload?: (document: Document) => void
  onDocumentShare?: (document: Document) => void
  onDocumentDelete?: (document: Document) => void
  className?: string
}

export const DocumentsGallery: React.FC<DocumentsGalleryProps> = ({
  patientId,
  onDocumentView,
  onDocumentDownload,
  onDocumentShare,
  onDocumentDelete,
  className,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<DocumentFilters>({})
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set())
  const [page, setPage] = useState(1)
  const limit = 20

  // Fetch documents
  const { data: documentsData, isLoading, error } = useQuery({
    queryKey: ['documents', patientId, page, limit, search, filters],
    queryFn: async () => {
      const params: Parameters<typeof documentsService.getDocuments>[0] = {
        page,
        limit,
        patientId,
      }
      if (search) params.search = search
      if (filters.categories && filters.categories.length > 0) {
        params.category = filters.categories[0] // API might need array support
      }
      const response = await documentsService.getDocuments(params)
      return response.data
    },
  })

  const errorMessage = useApiError(error)

  // Filter documents client-side (for advanced filters)
  const filteredDocuments = useMemo(() => {
    if (!documentsData?.documents) return []
    let filtered = documentsData.documents

    // Apply client-side filters
    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter((doc) =>
        filters.tags!.some((tag) => doc.tags?.includes(tag))
      )
    }
    if (filters.dateFrom) {
      filtered = filtered.filter((doc) => new Date(doc.createdAt) >= new Date(filters.dateFrom!))
    }
    if (filters.dateTo) {
      filtered = filtered.filter((doc) => new Date(doc.createdAt) <= new Date(filters.dateTo!))
    }
    if (filters.minSizeMB) {
      filtered = filtered.filter((doc) => doc.size >= filters.minSizeMB! * 1024 * 1024)
    }
    if (filters.maxSizeMB) {
      filtered = filtered.filter((doc) => doc.size <= filters.maxSizeMB! * 1024 * 1024)
    }
    if (filters.confidentiality && filters.confidentiality.length > 0) {
      filtered = filtered.filter((doc) =>
        filters.confidentiality!.includes(doc.confidentiality)
      )
    }
    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter((doc) => doc.status && filters.status!.includes(doc.status))
    }

    return filtered
  }, [documentsData?.documents, filters])

  const handleSelectDocument = (document: Document, selected: boolean) => {
    setSelectedDocuments((prev) => {
      const newSet = new Set(prev)
      if (selected) {
        newSet.add(document.id)
      } else {
        newSet.delete(document.id)
      }
      return newSet
    })
  }

  const handleSelectAll = () => {
    if (selectedDocuments.size === filteredDocuments.length) {
      setSelectedDocuments(new Set())
    } else {
      setSelectedDocuments(new Set(filteredDocuments.map((d) => d.id)))
    }
  }

  const handleBulkDownload = () => {
    // In real app, create ZIP or download individually
    selectedDocuments.forEach((id) => {
      const doc = filteredDocuments.find((d) => d.id === id)
      if (doc) onDocumentDownload?.(doc)
    })
  }

  const handleBulkDelete = () => {
    selectedDocuments.forEach((id) => {
      const doc = filteredDocuments.find((d) => d.id === id)
      if (doc) onDocumentDelete?.(doc)
    })
    setSelectedDocuments(new Set())
  }

  // Get all available tags for suggestions
  const availableTags = useMemo(() => {
    const tags = new Set<string>()
    documentsData?.documents.forEach((doc) => {
      doc.tags?.forEach((tag) => tags.add(tag))
    })
    return Array.from(tags)
  }, [documentsData?.documents])

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header with Search and Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1">
            <Input
              placeholder="Rechercher des documents..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="pr-10"
            />
          </div>
          <AdvancedFilters
            filters={filters}
            onFiltersChange={(newFilters) => {
              setFilters(newFilters)
              setPage(1)
            }}
            availableTags={availableTags}
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Selection Actions */}
      {selectedDocuments.size > 0 && (
        <div className="flex items-center justify-between rounded-lg border border-medical-blue-200 bg-medical-blue-50 p-3">
          <p className="text-sm font-medium text-medical-blue-900">
            {selectedDocuments.size} document{selectedDocuments.size > 1 ? 's' : ''} sélectionné
            {selectedDocuments.size > 1 ? 's' : ''}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleBulkDownload}>
              <Download className="mr-2 h-4 w-4" />
              Télécharger
            </Button>
            <Button variant="outline" size="sm" onClick={handleBulkDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer
            </Button>
            <Button variant="outline" size="sm" onClick={() => setSelectedDocuments(new Set())}>
              Annuler
            </Button>
          </div>
        </div>
      )}

      {/* Documents Grid/List */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-lg bg-gray-200" />
          ))}
        </div>
      ) : errorMessage ? (
        <div className="rounded-lg bg-red-50 p-4 text-red-600">{errorMessage}</div>
      ) : filteredDocuments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-gray-500">Aucun document trouvé</p>
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredDocuments.map((document) => (
                <DocumentCard
                  key={document.id}
                  document={document}
                  onView={onDocumentView}
                  onDownload={onDocumentDownload}
                  onShare={onDocumentShare}
                  onDelete={onDocumentDelete}
                  isSelected={selectedDocuments.has(document.id)}
                  onSelect={handleSelectDocument}
                  viewMode="grid"
                />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredDocuments.map((document) => (
                <DocumentCard
                  key={document.id}
                  document={document}
                  onView={onDocumentView}
                  onDownload={onDocumentDownload}
                  onShare={onDocumentShare}
                  onDelete={onDocumentDelete}
                  isSelected={selectedDocuments.has(document.id)}
                  onSelect={handleSelectDocument}
                  viewMode="list"
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {documentsData && documentsData.total > limit && (
            <div className="flex items-center justify-between border-t pt-4">
              <p className="text-sm text-gray-600">
                Affichage de {(page - 1) * limit + 1} à {Math.min(page * limit, documentsData.total)} sur{' '}
                {documentsData.total}
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
                  disabled={page * limit >= documentsData.total}
                >
                  Suivant
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

