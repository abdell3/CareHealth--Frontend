import { memo, useState, ReactNode } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp, AlertTriangle, User, Calendar, FileText, Pill } from 'lucide-react'
import { cn } from '@/libs/utils'
import { roleColors } from '@/design-system/tokens'

export type MedicalCardVariant = 'default' | 'patient' | 'prescription' | 'appointment' | 'alert'

interface MedicalCardProps {
  variant?: MedicalCardVariant
  title: string
  description?: string
  children?: ReactNode
  headerActions?: ReactNode
  footerActions?: ReactNode
  badge?: {
    label: string
    variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
  }
  expandable?: boolean
  defaultExpanded?: boolean
  role?: keyof typeof roleColors
  className?: string
  onClick?: () => void
}

const variantStyles: Record<MedicalCardVariant, { gradient: string; border: string; icon: React.ComponentType<{ className?: string }> }> = {
  default: {
    gradient: 'from-medical-blue-50 to-medical-blue-100',
    border: 'border-medical-blue-200',
    icon: FileText,
  },
  patient: {
    gradient: 'from-medical-blue-50 to-medical-green-50',
    border: 'border-medical-blue-300',
    icon: User,
  },
  prescription: {
    gradient: 'from-purple-50 to-purple-100',
    border: 'border-purple-200',
    icon: Pill,
  },
  appointment: {
    gradient: 'from-medical-green-50 to-medical-green-100',
    border: 'border-medical-green-200',
    icon: Calendar,
  },
  alert: {
    gradient: 'from-red-50 to-red-100',
    border: 'border-red-300',
    icon: AlertTriangle,
  },
}

export const MedicalCard = memo<MedicalCardProps>(
  ({
    variant = 'default',
    title,
    description,
    children,
    headerActions,
    footerActions,
    badge,
    expandable = false,
    defaultExpanded = false,
    role,
    className,
    onClick,
  }) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded)
    const styles = variantStyles[variant]
    const Icon = styles.icon

    const roleGradient = role
      ? `from-[${roleColors[role]}] to-[${roleColors[role]}] opacity-20`
      : styles.gradient

    return (
      <Card
        className={cn(
          'transition-all duration-200 hover:shadow-medical-card border-l-4 cursor-pointer',
          styles.border,
          onClick && 'hover:scale-[1.01]',
          className
        )}
        onClick={onClick}
      >
        {/* Header with gradient */}
        <div className={cn('bg-gradient-to-r rounded-t-lg', roleGradient, styles.gradient)}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg bg-white/80 shrink-0')}>
                  <Icon className={cn('h-5 w-5', variant === 'alert' ? 'text-red-600' : 'text-medical-blue-600')} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <CardTitle className="text-lg font-semibold text-gray-900">{title}</CardTitle>
                    {badge && (
                      <Badge
                        variant={
                          badge.variant === 'success'
                            ? 'success'
                            : badge.variant === 'warning'
                              ? 'warning'
                              : badge.variant === 'error'
                                ? 'destructive'
                                : badge.variant === 'info'
                                  ? 'info'
                                  : 'default'
                        }
                        className="text-xs"
                      >
                        {badge.label}
                      </Badge>
                    )}
                  </div>
                  {description && (
                    <CardDescription className="text-sm text-gray-600 mt-1">{description}</CardDescription>
                  )}
                </div>
              </div>
              {headerActions && <div className="shrink-0">{headerActions}</div>}
              {expandable && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 shrink-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsExpanded(!isExpanded)
                  }}
                >
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          </CardHeader>
        </div>

        {/* Content */}
        {(isExpanded || !expandable) && (
          <>
            {children && <CardContent className="pt-4">{children}</CardContent>}
            {footerActions && (
              <CardFooter className="pt-4 border-t bg-gray-50/50">
                <div className="flex items-center gap-2 w-full">{footerActions}</div>
              </CardFooter>
            )}
          </>
        )}
      </Card>
    )
  }
)

MedicalCard.displayName = 'MedicalCard'

