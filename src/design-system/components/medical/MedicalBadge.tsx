import { memo, ReactNode } from 'react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/libs/utils'
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  User,
  Calendar,
  Pill,
  FlaskConical,
  Bell,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react'
import { roleColors } from '@/design-system/tokens'

export type MedicalBadgeType = 'status' | 'role' | 'priority' | 'medical' | 'number'

interface MedicalBadgeProps {
  type: MedicalBadgeType
  label: string
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  role?: keyof typeof roleColors
  count?: number
  icon?: ReactNode
  pulse?: boolean
  glow?: boolean
  className?: string
}

const statusIcons = {
  active: CheckCircle,
  completed: CheckCircle,
  pending: AlertTriangle,
  cancelled: XCircle,
  scheduled: Calendar,
  'in-progress': TrendingUp,
}

const priorityIcons = {
  low: Minus,
  medium: Info,
  high: AlertTriangle,
  urgent: Bell,
}

const medicalIcons = {
  allergy: AlertTriangle,
  condition: Info,
  alert: Bell,
  medication: Pill,
  test: FlaskConical,
}

export const MedicalBadge = memo<MedicalBadgeProps>(
  ({
    type,
    label,
    variant = 'default',
    priority,
    role,
    count,
    icon,
    pulse = false,
    glow = false,
    className,
  }) => {
    let badgeIcon: ReactNode = null
    let badgeVariant: 'default' | 'secondary' | 'destructive' | 'success' | 'info' | 'warning' = 'default'

    // Determine icon and variant based on type
    if (type === 'status') {
      const StatusIcon = statusIcons[label.toLowerCase() as keyof typeof statusIcons]
      if (StatusIcon) {
        badgeIcon = <StatusIcon className="h-3 w-3" />
      }
      badgeVariant =
        label.toLowerCase() === 'active' || label.toLowerCase() === 'completed'
          ? 'success'
          : label.toLowerCase() === 'cancelled'
            ? 'destructive'
            : label.toLowerCase() === 'pending'
              ? 'warning'
              : 'info'
    } else if (type === 'role') {
      badgeIcon = <User className="h-3 w-3" />
      badgeVariant = 'info'
    } else if (type === 'priority') {
      if (priority) {
        const PriorityIcon = priorityIcons[priority]
        if (PriorityIcon) {
          badgeIcon = <PriorityIcon className="h-3 w-3" />
        }
        badgeVariant =
          priority === 'urgent'
            ? 'destructive'
            : priority === 'high'
              ? 'warning'
              : priority === 'medium'
                ? 'info'
                : 'default'
      }
    } else if (type === 'medical') {
      const MedicalIcon = medicalIcons[label.toLowerCase() as keyof typeof medicalIcons]
      if (MedicalIcon) {
        badgeIcon = <MedicalIcon className="h-3 w-3" />
      }
      badgeVariant = 'warning'
    } else if (type === 'number') {
      badgeVariant = 'info'
    }

    // Override with explicit variant if provided
    if (variant !== 'default') {
      badgeVariant =
        variant === 'success'
          ? 'success'
          : variant === 'warning'
            ? 'warning'
            : variant === 'error'
              ? 'destructive'
              : variant === 'info'
                ? 'info'
                : 'default'
    }

    // Custom icon override
    if (icon) {
      badgeIcon = icon
    }

    // Role-specific styling
    const roleStyle = role ? { backgroundColor: `${roleColors[role]}20`, color: roleColors[role] } : undefined

    return (
      <Badge
        variant={badgeVariant}
        className={cn(
          'inline-flex items-center gap-1.5 text-xs font-medium',
          pulse && 'animate-pulse',
          glow && 'ring-2 ring-current ring-opacity-50',
          className
        )}
        style={roleStyle}
      >
        {badgeIcon}
        {type === 'number' && count !== undefined ? (
          <>
            {label} <span className="font-bold">{count}</span>
          </>
        ) : (
          label
        )}
      </Badge>
    )
  }
)

MedicalBadge.displayName = 'MedicalBadge'

