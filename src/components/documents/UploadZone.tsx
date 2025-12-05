import * as React from 'react'
import { Upload, X, FileText, Image as ImageIcon, CheckCircle2, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { cn } from '@/libs/utils'
import { formatFileSize } from '@/utils/helpers'

interface UploadFile {
  id: string
  file: File
  category: 'imaging' | 'report' | 'lab-result' | 'administrative' | 'other'
  tags: string[]
  confidentiality: 'public' | 'internal' | 'confidential'
  documentDate?: string
  patientId?: string
  progress: number
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
  preview?: string
  thumbnail?: string
}

interface UploadZoneProps {
  onFilesSelected: (files: UploadFile[]) => void
  onFileUpdate?: (fileId: string, updates: Partial<UploadFile>) => void
  onFileRemove?: (fileId: string) => void
  maxFiles?: number
  maxSizeMB?: number
  acceptedTypes?: string[]
  defaultPatientId?: string
  className?: string
}

export const UploadZone: React.FC<UploadZoneProps> = ({
  onFilesSelected,
  onFileUpdate,
  onFileRemove,
  maxFiles = 50,
  maxSizeMB = 100,
  acceptedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/jpg',
    'image/gif',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  defaultPatientId,
  className,
}) => {
  const [isDragging, setIsDragging] = React.useState(false)
  const [uploadFiles, setUploadFiles] = React.useState<UploadFile[]>([])
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const droppedFiles = Array.from(e.dataTransfer.files)
    processFiles(droppedFiles)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)
      processFiles(selectedFiles)
    }
  }

  const processFiles = async (newFiles: File[]) => {
    const validFiles: UploadFile[] = []

    for (const file of newFiles) {
      // Check file count
      if (uploadFiles.length + validFiles.length >= maxFiles) {
        break
      }

      // Check file type
      if (!acceptedTypes.includes(file.type)) {
        continue
      }

      // Check file size
      const sizeMB = file.size / (1024 * 1024)
      if (sizeMB > maxSizeMB) {
        continue
      }

      // Auto-categorize by extension
      const category = getCategoryFromFile(file)

      // Generate preview for images
      let preview: string | undefined
      let thumbnail: string | undefined
      if (file.type.startsWith('image/')) {
        preview = URL.createObjectURL(file)
        thumbnail = preview
      }

      const uploadFile: UploadFile = {
        id: `${Date.now()}-${Math.random()}`,
        file,
        category,
        tags: [],
        confidentiality: category === 'imaging' ? 'confidential' : 'internal',
        documentDate: new Date().toISOString().split('T')[0],
        patientId: defaultPatientId,
        progress: 0,
        status: 'pending',
        preview,
        thumbnail,
      }

      validFiles.push(uploadFile)
    }

    if (validFiles.length > 0) {
      const updatedFiles = [...uploadFiles, ...validFiles]
      setUploadFiles(updatedFiles)
      onFilesSelected(updatedFiles)
    }
  }

  const getCategoryFromFile = (file: File): UploadFile['category'] => {
    const name = file.name.toLowerCase()
    if (name.includes('scan') || name.includes('irm') || name.includes('rx') || name.includes('echographie')) {
      return 'imaging'
    }
    if (name.includes('rapport') || name.includes('compte-rendu') || name.includes('lettre')) {
      return 'report'
    }
    if (name.includes('lab') || name.includes('resultat')) {
      return 'lab-result'
    }
    if (name.includes('facture') || name.includes('consentement') || name.includes('ordonnance')) {
      return 'administrative'
    }
    return 'other'
  }

  const handleFileUpdate = (fileId: string, updates: Partial<UploadFile>) => {
    setUploadFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, ...updates } : f))
    )
    onFileUpdate?.(fileId, updates)
  }

  const handleFileRemove = (fileId: string) => {
    setUploadFiles((prev) => {
      const file = prev.find((f) => f.id === fileId)
      if (file?.preview) {
        URL.revokeObjectURL(file.preview)
      }
      return prev.filter((f) => f.id !== fileId)
    })
    onFileRemove?.(fileId)
  }

  const getFileIcon = (file: File) => {
    if (file.type === 'application/pdf') return <FileText className="h-5 w-5 text-red-600" />
    if (file.type.startsWith('image/')) return <ImageIcon className="h-5 w-5 text-blue-600" />
    return <FileText className="h-5 w-5 text-gray-600" />
  }

  const categoryColors: Record<UploadFile['category'], string> = {
    imaging: 'bg-blue-100 text-blue-800',
    report: 'bg-green-100 text-green-800',
    'lab-result': 'bg-purple-100 text-purple-800',
    administrative: 'bg-gray-100 text-gray-800',
    other: 'bg-yellow-100 text-yellow-800',
  }

  const categoryLabels: Record<UploadFile['category'], string> = {
    imaging: 'Imagerie',
    report: 'Rapport',
    'lab-result': 'Labo',
    administrative: 'Admin',
    other: 'Autre',
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Drop Zone */}
      <Card
        className={cn(
          'border-2 border-dashed transition-all',
          isDragging
            ? 'border-medical-blue-500 bg-medical-blue-50'
            : 'border-gray-300 hover:border-medical-blue-400',
          'cursor-pointer'
        )}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <CardContent className="flex flex-col items-center justify-center p-12">
          <Upload className="mb-4 h-12 w-12 text-gray-400" />
          <p className="mb-2 text-lg font-semibold text-gray-900">
            Glissez-déposez vos documents ici
          </p>
          <p className="mb-4 text-sm text-gray-600">ou cliquez pour sélectionner des fichiers</p>
          <div className="text-xs text-gray-500">
            <p>Formats acceptés: PDF, Images, Word</p>
            <p>
              Maximum {maxFiles} fichiers, {maxSizeMB}MB par fichier
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedTypes.join(',')}
            onChange={handleFileInput}
            className="hidden"
          />
        </CardContent>
      </Card>

      {/* Files List */}
      {uploadFiles.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-900">
              {uploadFiles.length} fichier{uploadFiles.length > 1 ? 's' : ''} sélectionné
              {uploadFiles.length > 1 ? 's' : ''}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setUploadFiles([])
                onFilesSelected([])
              }}
            >
              Tout supprimer
            </Button>
          </div>

          {uploadFiles.map((uploadFile) => (
            <Card key={uploadFile.id} className="border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Thumbnail/Preview */}
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border bg-gray-50">
                    {uploadFile.thumbnail ? (
                      <img
                        src={uploadFile.thumbnail}
                        alt={uploadFile.file.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        {getFileIcon(uploadFile.file)}
                      </div>
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{uploadFile.file.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(uploadFile.file.size)}</p>
                      </div>
                      {onFileRemove && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleFileRemove(uploadFile.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    {/* Metadata Editor */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-700">
                          Catégorie
                        </label>
                        <select
                          value={uploadFile.category}
                          onChange={(e) =>
                            handleFileUpdate(uploadFile.id, {
                              category: e.target.value as UploadFile['category'],
                            })
                          }
                          className="h-8 w-full rounded border border-input bg-background px-2 text-xs"
                        >
                          <option value="imaging">Imagerie</option>
                          <option value="report">Rapport</option>
                          <option value="lab-result">Labo</option>
                          <option value="administrative">Admin</option>
                          <option value="other">Autre</option>
                        </select>
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-700">
                          Confidentialité
                        </label>
                        <select
                          value={uploadFile.confidentiality}
                          onChange={(e) =>
                            handleFileUpdate(uploadFile.id, {
                              confidentiality: e.target.value as UploadFile['confidentiality'],
                            })
                          }
                          className="h-8 w-full rounded border border-input bg-background px-2 text-xs"
                        >
                          <option value="public">Public</option>
                          <option value="internal">Interne</option>
                          <option value="confidential">Confidentiel</option>
                        </select>
                      </div>
                    </div>

                    {/* Progress */}
                    {uploadFile.status === 'uploading' && (
                      <div>
                        <Progress value={uploadFile.progress} className="h-2" />
                        <p className="mt-1 text-xs text-gray-500">
                          {uploadFile.progress}% uploadé
                        </p>
                      </div>
                    )}

                    {/* Status */}
                    {uploadFile.status === 'success' && (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="text-xs">Upload réussi</span>
                      </div>
                    )}
                    {uploadFile.status === 'error' && uploadFile.error && (
                      <p className="text-xs text-red-600">{uploadFile.error}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

