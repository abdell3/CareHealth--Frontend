import * as React from 'react'
import { QrCode, Download, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/libs/utils'

interface PrescriptionQRProps {
  prescriptionId: string
  qrCode?: string
  className?: string
}

export const PrescriptionQR: React.FC<PrescriptionQRProps> = ({
  prescriptionId,
  qrCode,
  className,
}) => {
  const [copied, setCopied] = React.useState(false)

  // Generate QR code data URL (mock - in real app, use a QR code library)
  const qrDataUrl = qrCode || `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${prescriptionId}`

  const handleCopy = () => {
    navigator.clipboard.writeText(prescriptionId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = qrDataUrl
    link.download = `prescription-${prescriptionId}-qr.png`
    link.click()
  }

  return (
    <Card className={cn('border-medical-blue-200', className)}>
      <CardContent className="p-6">
        <div className="flex flex-col items-center">
          <div className="mb-4 flex items-center gap-2">
            <QrCode className="h-5 w-5 text-medical-blue-600" />
            <h4 className="font-semibold text-gray-900">Code QR de dispensation</h4>
          </div>

          <div className="mb-4 rounded-lg border-2 border-medical-blue-200 bg-white p-4">
            <img
              src={qrDataUrl}
              alt="QR Code"
              className="h-48 w-48"
            />
          </div>

          <div className="mb-4 text-center">
            <p className="text-sm text-gray-600">ID Prescription</p>
            <p className="mt-1 font-mono text-sm font-semibold text-gray-900">{prescriptionId}</p>
          </div>

          <div className="mb-4 rounded-lg bg-blue-50 p-3">
            <p className="text-xs text-blue-900">
              Présentez ce code QR à la pharmacie pour récupérer vos médicaments.
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy}>
              {copied ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Copié
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copier ID
                </>
              )}
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Télécharger
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

