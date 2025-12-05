import * as React from 'react'
import { FileText, Image as ImageIcon, Download, ZoomIn, ZoomOut } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/libs/utils'
import { formatDate } from '@/utils/helpers'
import type { LabResult } from '@/types/api'

interface ResultViewerProps {
  result: LabResult
  onDownload?: () => void
  className?: string
  viewMode?: 'doctor' | 'patient'
}

export const ResultViewer: React.FC<ResultViewerProps> = ({
  result,
  onDownload,
  className,
  viewMode = 'doctor',
}) => {
  const [zoom, setZoom] = React.useState(100)
  const [showFullscreen, setShowFullscreen] = React.useState(false)

  const isPDF = result.fileType === 'pdf' || result.fileUrl?.endsWith('.pdf')
  const isImage = result.fileType === 'image' || result.fileUrl?.match(/\.(jpg|jpeg|png|gif)$/i)

  const getStatusColor = (status: LabResult['status']) => {
    switch (status) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300'
      case 'abnormal':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      default:
        return 'bg-green-100 text-green-800 border-green-300'
    }
  }

  const getStatusLabel = (status: LabResult['status']) => {
    switch (status) {
      case 'critical':
        return 'Critique'
      case 'abnormal':
        return 'Anormal'
      default:
        return 'Normal'
    }
  }

  // Patient-friendly explanation
  const getPatientExplanation = () => {
    if (viewMode !== 'patient') return null

    const explanations: Record<string, string> = {
      normal: 'Vos résultats sont dans la plage normale. Continuez à prendre soin de votre santé.',
      abnormal: 'Vos résultats sont légèrement en dehors de la plage normale. Discutez-en avec votre médecin.',
      critical: 'Vos résultats nécessitent une attention immédiate. Contactez votre médecin rapidement.',
    }

    return explanations[result.status] || ''
  }

  return (
    <Card className={cn('border-medical-blue-200', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">{result.testName}</CardTitle>
            {result.testCode && (
              <Badge variant="outline" className="mt-1 font-mono">
                {result.testCode}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge className={cn('border', getStatusColor(result.status))}>
              {getStatusLabel(result.status)}
            </Badge>
            {onDownload && (
              <Button variant="outline" size="sm" onClick={onDownload}>
                <Download className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Value Display */}
        <div className="rounded-lg border-2 border-medical-blue-200 bg-medical-blue-50 p-4">
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-sm text-gray-600">Valeur</p>
              <p className="mt-1 font-mono text-3xl font-bold text-gray-900">
                {result.value} {result.unit || ''}
              </p>
            </div>
            {result.referenceRange && (
              <div className="text-right">
                <p className="text-sm text-gray-600">Plage normale</p>
                <p className="mt-1 font-mono text-sm font-semibold text-gray-700">
                  {result.referenceRange}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Patient Explanation */}
        {viewMode === 'patient' && getPatientExplanation() && (
          <div className="rounded-lg bg-blue-50 p-4">
            <p className="text-sm text-blue-900">{getPatientExplanation()}</p>
          </div>
        )}

        {/* File Viewer */}
        {result.fileUrl && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-700">Document</p>
              {isImage && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setZoom(Math.max(50, zoom - 25))}
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setZoom(Math.min(200, zoom + 25))}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            <div className="relative overflow-hidden rounded-lg border bg-gray-50">
              {isPDF ? (
                <div className="flex h-96 items-center justify-center">
                  <div className="text-center">
                    <FileText className="mx-auto h-16 w-16 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">Document PDF</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={() => window.open(result.fileUrl, '_blank')}
                    >
                      Ouvrir le PDF
                    </Button>
                  </div>
                </div>
              ) : isImage ? (
                <div className="flex items-center justify-center overflow-auto bg-gray-100 p-4">
                  <img
                    src={result.fileUrl}
                    alt={result.testName}
                    className="max-w-full"
                    style={{ transform: `scale(${zoom / 100})` }}
                  />
                </div>
              ) : (
                <div className="flex h-48 items-center justify-center">
                  <div className="text-center">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">
                      {result.fileName || 'Document'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="space-y-2 border-t pt-4 text-sm">
          {result.sampleDate && (
            <div className="flex justify-between">
              <span className="text-gray-600">Date de prélèvement:</span>
              <span className="font-medium">{formatDate(result.sampleDate)}</span>
            </div>
          )}
          {result.uploadedAt && (
            <div className="flex justify-between">
              <span className="text-gray-600">Date d'upload:</span>
              <span className="font-medium">{formatDate(result.uploadedAt)}</span>
            </div>
          )}
          {result.technicianNotes && (
            <div>
              <span className="text-gray-600">Notes technicien:</span>
              <p className="mt-1 text-gray-900">{result.technicianNotes}</p>
            </div>
          )}
          {viewMode === 'doctor' && result.doctorComments && (
            <div>
              <span className="text-gray-600">Commentaires médecin:</span>
              <p className="mt-1 text-gray-900">{result.doctorComments}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

