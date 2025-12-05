import * as React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { Activity } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageLayout } from '@/components/layouts/PageLayout'
import { StatsWidget } from './StatsWidget'
import { TableWidget } from './TableWidget'
import { ListWidget } from './ListWidget'
import { CalendarWidget } from './CalendarWidget'
import { dashboardConfigs, type DashboardWidget } from './dashboard.config'
import type { UserRole } from '@/store/auth.store'
import type { Appointment } from '@/types/api'
import {
  Users,
  Calendar,
  Activity as ActivityIcon,
  AlertTriangle,
  FileText,
  Clock,
  Stethoscope,
  TestTube,
  Package,
  Server,
  Database,
  Heart,
  Syringe,
} from 'lucide-react'

// Icon mapping
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Users,
  Calendar,
  Activity: ActivityIcon,
  AlertTriangle,
  FileText,
  Clock,
  Stethoscope,
  TestTube,
  Package,
  Server,
  Database,
  Heart,
  Syringe,
}

export const DynamicDashboard: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [refreshKey, setRefreshKey] = React.useState(0)

  if (!user) {
    return null
  }

  const role = user.role as UserRole
  const widgets = dashboardConfigs[role] || []

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1)
  }

  const handleAppointmentClick = (appointment: Appointment) => {
    navigate(`/dashboard/appointments/${appointment.id}`)
  }

  return (
    <PageLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Bienvenue, {user.firstName} {user.lastName}
          </h1>
          <p className="mt-2 text-gray-600">
            Tableau de bord personnalisé - {role === 'admin' ? 'Administration' : role === 'doctor' ? 'Médecin' : role === 'nurse' ? 'Infirmier' : role === 'receptionist' ? 'Réceptionniste' : 'Utilisateur'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <Activity className="mr-2 h-4 w-4" />
            Actualiser
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {widgets.map((widget) => {
          const sizeClasses = {
            small: '',
            medium: 'md:col-span-2',
            large: 'md:col-span-2 lg:col-span-3',
          }
          return (
            <div key={`${widget.id}-${refreshKey}`} className={sizeClasses[widget.size]}>
              <WidgetRenderer
                widget={widget}
                user={user}
                onAppointmentClick={handleAppointmentClick}
              />
            </div>
          )
        })}
      </div>
    </PageLayout>
  )
}

interface WidgetRendererProps {
  widget: DashboardWidget
  user: NonNullable<ReturnType<typeof useAuth>['user']>
  onAppointmentClick?: (appointment: Appointment) => void
}

const WidgetRenderer: React.FC<WidgetRendererProps> = ({
  widget,
  user,
  onAppointmentClick,
}) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [widget.id, widget.dataSource],
    queryFn: widget.dataSource,
    refetchInterval: widget.refreshInterval,
  })

  const IconComponent = widget.iconName ? iconMap[widget.iconName] : undefined
  const icon = IconComponent ? <IconComponent className="h-5 w-5" /> : undefined

  const commonProps = {
    id: widget.id,
    title: widget.title,
    size: widget.size,
    icon,
    isLoading,
    error: error ? 'Erreur lors du chargement' : null,
    onRefresh: () => refetch(),
    ...widget.props,
  }

  switch (widget.type) {
    case 'stats':
      return <StatsWidget {...commonProps} {...(data as { value: string | number; trend?: unknown; subtitle?: string })} />
    case 'table':
      return <TableWidget {...commonProps} {...(data as { columns: unknown[]; data: unknown[] })} />
    case 'list':
      return <ListWidget {...commonProps} {...(data as { items: unknown[] })} />
    case 'calendar':
      return (
        <CalendarWidget
          {...commonProps}
          appointments={(data as Appointment[]) || []}
          onAppointmentClick={onAppointmentClick}
        />
      )
    default:
      return null
  }
}

