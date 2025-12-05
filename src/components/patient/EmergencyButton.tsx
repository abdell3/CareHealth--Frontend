import * as React from 'react'
import { AlertCircle, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/libs/utils'

interface EmergencyButtonProps {
  className?: string
}

export const EmergencyButton = React.forwardRef<HTMLDivElement, EmergencyButtonProps>(
  ({ className }, ref) => {
    const handleEmergency = () => {
      // TODO: Implement emergency contact flow
      if (window.confirm('Appeler le SAMU (15) ?')) {
        window.location.href = 'tel:15'
      }
    }

    return (
      <Card ref={ref} className={cn('border-2 border-red-300 bg-red-50', className)}>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-red-100 p-4">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <h3 className="mb-2 text-lg font-bold text-red-900">Besoin d'aide urgente ?</h3>
            <p className="mb-4 text-sm text-gray-700">
              En cas d'urgence médicale, contactez immédiatement le SAMU
            </p>
            <div className="space-y-2">
              <Button
                onClick={handleEmergency}
                className="w-full bg-red-600 text-white hover:bg-red-700"
                size="lg"
              >
                <Phone className="h-5 w-5" />
                <span className="ml-2">Appeler le 15 (SAMU)</span>
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 border-red-300 text-red-700 hover:bg-red-50"
                  onClick={() => (window.location.href = 'tel:18')}
                >
                  Pompiers (18)
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-red-300 text-red-700 hover:bg-red-50"
                  onClick={() => (window.location.href = 'tel:112')}
                >
                  Urgence EU (112)
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }
)
EmergencyButton.displayName = 'EmergencyButton'

