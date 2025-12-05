import * as React from 'react'
import { Upload, X, FileText, Image, File, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/libs/utils'

interface UploadFile {
  id: string
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
  preview?: string
}

interface DragDropUploadProps {
  onFilesSelected: (files: File[]) => void
  onFileRemove?: (fileId: string) => void
  maxFiles?: number
  maxSizeMB?: number
  acceptedTypes?: string[]
  className?: string
  files?: UploadFile[]
}

export const DragDropUpload: React.FC<DragDropUploadProps> = ({
  onFilesSelected,
  onFileRemove,
  maxFiles = 10,
  maxSizeMB = 50,
  acceptedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'text/csv'],
  className,
  files = [],
}) => {
  const [isDragging, setIsDragging] = React.useState(false)
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

  const processFiles = (newFiles: File[]) => {
    const validFiles: File[] = []
    const errors: string[] = []

    newFiles.forEach((file) => {
      // Check file count
      if (files.length + validFiles.length >= maxFiles) {
        errors.push(`Maximum ${maxFiles} fichiers autorisés`)
        return
      }

      // Check file type
      if (!acceptedTypes.includes(file.type)) {
        errors.push(`${file.name}: Type de fichier non accepté`)
        return
      }

      // Check file size
      const sizeMB = file.size / (1024 * 1024)
      if (sizeMB > maxSizeMB) {
        errors.push(`${file.name}: Taille maximale ${maxSizeMB}MB`)
        return
      }

      validFiles.push(file)
    })

    if (validFiles.length > 0) {
      onFilesSelected(validFiles)
    }

    if (errors.length > 0) {
      // In real app, show toast notifications
      console.error('Upload errors:', errors)
    }
  }

  const getFileIcon = (file: File) => {
    if (file.type === 'application/pdf') return <FileText className="h-5 w-5 text-red-600" />
    if (file.type.startsWith('image/')) return <Image className="h-5 w-5 text-blue-600" />
    return <File className="h-5 w-5 text-gray-600" />
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const totalSize = files.reduce((sum, f) => sum + f.file.size, 0)
  const totalSizeMB = totalSize / (1024 * 1024)

  return (
    <div className={cn('space-y-4', className)}>
      {/* Drop Zone */}
      <Card
        className={cn(
          'border-2 border-dashed transition-colors',
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
            Glissez-déposez vos fichiers ici
          </p>
          <p className="mb-4 text-sm text-gray-600">
            ou cliquez pour sélectionner des fichiers
          </p>
          <div className="text-xs text-gray-500">
            <p>Formats acceptés: PDF, JPG, PNG, CSV</p>
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
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-900">
              {files.length} fichier{files.length > 1 ? 's' : ''} sélectionné
              {files.length > 1 ? 's' : ''}
            </p>
            <Badge variant={totalSizeMB > maxSizeMB ? 'destructive' : 'default'}>
              {totalSizeMB.toFixed(1)} MB / {maxSizeMB * maxFiles} MB
            </Badge>
          </div>

          {files.map((uploadFile) => (
            <Card key={uploadFile.id} className="border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1">{getFileIcon(uploadFile.file)}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{uploadFile.file.name}</p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(uploadFile.file.size)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {uploadFile.status === 'success' && (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        )}
                        {uploadFile.status === 'error' && (
                          <AlertCircle className="h-5 w-5 text-red-600" />
                        )}
                        {uploadFile.status === 'uploading' && (
                          <Loader2 className="h-5 w-5 animate-spin text-medical-blue-600" />
                        )}
                        {onFileRemove && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => onFileRemove(uploadFile.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {uploadFile.status === 'uploading' && (
                      <div className="mt-2">
                        <Progress value={uploadFile.progress} className="h-2" />
                        <p className="mt-1 text-xs text-gray-500">
                          {uploadFile.progress}% uploadé
                        </p>
                      </div>
                    )}

                    {/* Error Message */}
                    {uploadFile.status === 'error' && uploadFile.error && (
                      <p className="mt-2 text-xs text-red-600">{uploadFile.error}</p>
                    )}

                    {/* Preview for images */}
                    {uploadFile.preview && uploadFile.file.type.startsWith('image/') && (
                      <div className="mt-3">
                        <img
                          src={uploadFile.preview}
                          alt={uploadFile.file.name}
                          className="h-32 w-32 rounded border object-cover"
                        />
                      </div>
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

