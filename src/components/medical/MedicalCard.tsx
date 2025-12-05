import * as React from 'react'
import { cn } from '@/libs/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface MedicalCardProps {
  title?: string
  children: React.ReactNode
  className?: string
  headerClassName?: string
}

export const MedicalCard = React.forwardRef<HTMLDivElement, MedicalCardProps>(
  ({ title, children, className, headerClassName }, ref) => {
    return (
      <Card
        ref={ref}
        className={cn(
          'border-medical-blue-200 bg-white shadow-medical-card',
          className
        )}
      >
        {title && (
          <CardHeader className={cn('border-b border-medical-blue-100 bg-gradient-to-r from-medical-blue-50 to-medical-green-50 px-6 py-4', headerClassName)}>
            <CardTitle className="text-lg font-semibold text-medical-blue-700">
              {title}
            </CardTitle>
          </CardHeader>
        )}
        <CardContent className={cn('px-6 py-8', !title && 'p-6')}>
          {children}
        </CardContent>
      </Card>
    )
  }
)
MedicalCard.displayName = 'MedicalCard'

