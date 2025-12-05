import * as React from 'react'
import { FileText, Image, MoreVertical, Eye, Download, Share2, Trash2, Edit } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/libs/utils'
import { formatDate, formatFileSize } from '@/utils/helpers'
import type { Document } from '@/types/api'

interface DocumentCardProps {
  document: Document
  onView?: (document: Document) => void
  onDownload?: (document: Document) => void
  onShare?: (document: Document) => void
  onEdit?: (document: Document) => void
  onDelete?: (document: Document) => void
  isSelected?: boolean
  onSelect?: (document: Document, selected: boolean) => void
  viewMode?: 'grid' | 'list'
  className?: string
}

const categoryColors: Record<Document['category'], string> = {
  imaging: 'bg-blue-100 text-blue-800 border-blue-300',
  report: 'bg-green-100 text-green-800 border-green-300',
  'lab-result': 'bg-purple-100 text-purple-800 border-purple-300',
  administrative: 'bg-gray-100 text-gray-800 border-gray-300',
  other: 'bg-yellow-100 text-yellow-800 border-yellow-300',
}

const categoryLabels: Record<Document['category'], string> = {
  imaging: 'Imagerie',
  report: 'Rapport',
  'lab-result': 'Labo',
  administrative: 'Admin',
  other: 'Autre',
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  onView,
  onDownload,
  onShare,
  onEdit,
  onDelete,
  isSelected = false,
  onSelect,
  viewMode = 'grid',
  className,
}) => {
  const [menuOpen, setMenuOpen] = React.useState(false)

  const isImage = document.type.startsWith('image/')
  const isPDF = document.type === 'application/pdf'

  const getFileIcon = () => {
    if (isImage) return <Image className="h-8 w-8" />
    if (isPDF) return <FileText className="h-8 w-8" />
    return <FileText className="h-8 w-8" />
  }

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return
    onView?.(document)
  }

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation()
    onSelect?.(document, !isSelected)
  }

  if (viewMode === 'list') {
    return (
      <div
        className={cn(
          'flex items-center gap-4 rounded-lg border p-4 transition-all hover:shadow-md',
          isSelected && 'border-medical-blue-500 bg-medical-blue-50',
          className
        )}
        onClick={handleCardClick}
      >
        {onSelect && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation()
              onSelect(document, e.target.checked)
            }}
            className="h-4 w-4"
          />
        )}
        <div className={cn('text-medical-blue-600', categoryColors[document.category].split(' ')[0])}>
          {getFileIcon()}
        </div>
        <div className="flex-1">
          <p className="font-medium text-gray-900">{document.name}</p>
          <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
            <Badge variant="outline" className={cn('text-xs', categoryColors[document.category])}>
              {categoryLabels[document.category]}
            </Badge>
            <span>{formatFileSize(document.size)}</span>
            <span>•</span>
            <span>{formatDate(document.createdAt)}</span>
            {document.uploadedByUser && (
              <>
                <span>•</span>
                <span>
                  {document.uploadedByUser.firstName} {document.uploadedByUser.lastName}
                </span>
              </>
            )}
          </div>
          {document.tags && document.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {document.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {document.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{document.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onView && (
            <Button variant="ghost" size="icon" onClick={() => onView(document)}>
              <Eye className="h-4 w-4" />
            </Button>
          )}
          {onDownload && (
            <Button variant="ghost" size="icon" onClick={() => onDownload(document)}>
              <Download className="h-4 w-4" />
            </Button>
          )}
          <div className="relative">
            <Button variant="ghost" size="icon" onClick={() => setMenuOpen(!menuOpen)}>
              <MoreVertical className="h-4 w-4" />
            </Button>
            {menuOpen && (
              <div className="absolute right-0 top-full z-10 mt-1 w-48 rounded-lg border bg-white shadow-lg">
                {onShare && (
                  <button
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm hover:bg-gray-50"
                    onClick={() => {
                      onShare(document)
                      setMenuOpen(false)
                    }}
                  >
                    <Share2 className="h-4 w-4" />
                    Partager
                  </button>
                )}
                {onEdit && (
                  <button
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm hover:bg-gray-50"
                    onClick={() => {
                      onEdit(document)
                      setMenuOpen(false)
                    }}
                  >
                    <Edit className="h-4 w-4" />
                    Modifier
                  </button>
                )}
                {onDelete && (
                  <button
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                    onClick={() => {
                      onDelete(document)
                      setMenuOpen(false)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                    Supprimer
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card
      className={cn(
        'group cursor-pointer transition-all hover:scale-105 hover:shadow-lg',
        isSelected && 'border-medical-blue-500 ring-2 ring-medical-blue-200',
        className
      )}
      onClick={handleCardClick}
    >
      <CardContent className="p-0">
        {/* Thumbnail */}
        <div
          className={cn(
            'relative flex h-48 items-center justify-center overflow-hidden rounded-t-lg',
            categoryColors[document.category].split(' ')[0]
          )}
        >
          {document.thumbnailUrl ? (
            <img
              src={document.thumbnailUrl}
              alt={document.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="text-medical-blue-600">{getFileIcon()}</div>
          )}
          {onSelect && (
            <div className="absolute left-2 top-2">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => {
                  e.stopPropagation()
                  onSelect(document, e.target.checked)
                }}
                className="h-5 w-5 rounded border-gray-300"
              />
            </div>
          )}
          <div className="absolute right-2 top-2">
            <Badge className={cn('border', categoryColors[document.category])}>
              {categoryLabels[document.category]}
            </Badge>
          </div>
          {document.status === 'pending' && (
            <div className="absolute bottom-2 left-2">
              <Badge variant="warning">À valider</Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="mb-2 line-clamp-2 font-medium text-gray-900" title={document.name}>
            {document.name}
          </h3>
          <div className="mb-2 flex items-center gap-2 text-xs text-gray-600">
            <span>{formatFileSize(document.size)}</span>
            <span>•</span>
            <span>{formatDate(document.createdAt)}</span>
          </div>
          {document.tags && document.tags.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1">
              {document.tags.slice(0, 2).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {document.tags.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{document.tags.length - 2}
                </Badge>
              )}
            </div>
          )}
          <div className="mt-3 flex items-center justify-between border-t pt-3">
            {document.uploadedByUser && (
              <p className="text-xs text-gray-600">
                {document.uploadedByUser.firstName} {document.uploadedByUser.lastName}
              </p>
            )}
            <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              {onView && (
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onView(document)}>
                  <Eye className="h-4 w-4" />
                </Button>
              )}
              {onDownload && (
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onDownload(document)}>
                  <Download className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

