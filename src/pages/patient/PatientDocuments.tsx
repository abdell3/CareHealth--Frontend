import { useState, useMemo, memo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { FileText, Upload, Download, Eye, Image, File } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { documentsService } from '@/api/documents.service'
import { useAuth } from '@/hooks/useAuth'
import { formatDate } from '@/utils/helpers'
import type { Document } from '@/types/api'

const PatientDocuments = memo(() => {
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<Document['category'] | ''>('')

  // Fetch documents
  const { data: documentsData, isLoading } = useQuery({
    queryKey: ['documents', 'patient', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User ID is required')
      const response = await documentsService.getDocuments({
        patientId: user.id,
        limit: 100,
      })
      return response.data
    },
    enabled: !!user?.id,
  })

  // Filter documents
  const filteredDocuments = useMemo(() => {
    if (!documentsData?.documents) return []
    let filtered = documentsData.documents

    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter((doc) => doc.name.toLowerCase().includes(searchLower))
    }

    if (categoryFilter) {
      filtered = filtered.filter((doc) => doc.category === categoryFilter)
    }

    return filtered
  }, [documentsData?.documents, search, categoryFilter])

  const getFileIcon = (type: string) => {
    if (type.includes('image')) return Image
    if (type.includes('pdf')) return FileText
    return File
  }

  const categoryLabels = {
    'medical-record': 'Dossier médical',
    prescription: 'Prescription',
    'lab-result': 'Résultat labo',
    image: 'Image',
    other: 'Autre',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mes documents</h1>
          <p className="mt-1 text-sm text-gray-600">
            Consultez et gérez vos documents médicaux
          </p>
        </div>
        <Button variant="outline">
          <Upload className="h-5 w-5" />
          <span className="ml-2">Uploader un document</span>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Rechercher un document..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                icon={<FileText className="h-4 w-4" />}
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as Document['category'] | '')}
              className="h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Toutes les catégories</option>
              {Object.entries(categoryLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Documents Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-32 rounded bg-gray-200" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredDocuments.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredDocuments.map((document: Document) => {
            const FileIcon = getFileIcon(document.type)
            return (
              <Card key={document.id} className="border-medical-blue-200 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="mb-3 flex items-center justify-center rounded-lg bg-medical-blue-100 p-4">
                    <FileIcon className="h-8 w-8 text-medical-blue-600" />
                  </div>
                  <h3 className="mb-2 font-semibold text-gray-900 line-clamp-2">{document.name}</h3>
                  <div className="mb-3 space-y-1">
                    <p className="text-xs text-gray-500">
                      {formatDate(document.createdAt)}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {categoryLabels[document.category]}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-4 w-4" />
                      <span className="ml-1">Voir</span>
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Download className="h-4 w-4" />
                      <span className="ml-1">Télécharger</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              {search || categoryFilter ? 'Aucun document trouvé' : 'Aucun document'}
            </h3>
            <p className="text-sm text-gray-600">
              {search || categoryFilter
                ? 'Essayez de modifier vos critères de recherche'
                : 'Vos documents apparaîtront ici'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
})

PatientDocuments.displayName = 'PatientDocuments'

export { PatientDocuments }

