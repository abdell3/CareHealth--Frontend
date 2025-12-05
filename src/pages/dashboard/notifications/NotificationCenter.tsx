import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Filter, Settings, CheckCheck, X, Calendar, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { NotificationCard } from '@/components/notifications/NotificationCard'
import { PreferencesModal } from '@/components/notifications/PreferencesModal'
import { useNotifications } from '@/hooks/useNotifications'
import { useDebounce } from '@/hooks/useDebounce'
import { useApiError } from '@/hooks/useApiError'
import { Alert } from '@/components/ui/alert'
import type { NotificationFilters, NotificationType, NotificationStatus, NotificationPriority } from '@/types/api'

export const NotificationCenter = () => {
  const navigate = useNavigate()
  const [showFilters, setShowFilters] = useState(false)
  const [showPreferences, setShowPreferences] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTypes, setSelectedTypes] = useState<NotificationType[]>([])
  const [selectedStatus, setSelectedStatus] = useState<NotificationStatus[]>(['unread', 'read'])
  const [selectedPriority, setSelectedPriority] = useState<NotificationPriority[]>([])
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all')

  const debouncedSearch = useDebounce(searchQuery, 300)

  const filters: NotificationFilters = useMemo(() => {
    const filter: NotificationFilters = {
      search: debouncedSearch || undefined,
      type: selectedTypes.length > 0 ? selectedTypes : undefined,
      status: selectedStatus.length > 0 ? selectedStatus : undefined,
      priority: selectedPriority.length > 0 ? selectedPriority : undefined,
      page: 1,
      limit: 50,
    }

    // Date filters
    if (dateFilter !== 'all') {
      const now = new Date()
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      
      if (dateFilter === 'today') {
        filter.dateFrom = startOfDay.toISOString()
      } else if (dateFilter === 'week') {
        const weekAgo = new Date(startOfDay)
        weekAgo.setDate(weekAgo.getDate() - 7)
        filter.dateFrom = weekAgo.toISOString()
      } else if (dateFilter === 'month') {
        const monthAgo = new Date(startOfDay)
        monthAgo.setMonth(monthAgo.getMonth() - 1)
        filter.dateFrom = monthAgo.toISOString()
      }
    }

    return filter
  }, [debouncedSearch, selectedTypes, selectedStatus, selectedPriority, dateFilter])

  const {
    notifications,
    total,
    unreadCount,
    stats,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications(filters)

  const errorMessage = useApiError(error)

  const handleTypeToggle = (type: NotificationType) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
  }

  const handleStatusToggle = (status: NotificationStatus) => {
    setSelectedStatus((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    )
  }

  const handlePriorityToggle = (priority: NotificationPriority) => {
    setSelectedPriority((prev) =>
      prev.includes(priority) ? prev.filter((p) => p !== priority) : [...prev, priority]
    )
  }

  const handleMarkAllAsRead = async () => {
    const unreadIds = notifications.filter((n) => n.status === 'unread').map((n) => n.id)
    if (unreadIds.length > 0) {
      await markAllAsRead(unreadIds)
    }
  }

  const handleNotificationClick = (notification: { id: string; metadata?: { url?: string } }) => {
    if (notification.metadata?.url) {
      navigate(notification.metadata.url)
    }
  }

  const resetFilters = () => {
    setSearchQuery('')
    setSelectedTypes([])
    setSelectedStatus(['unread', 'read'])
    setSelectedPriority([])
    setDateFilter('all')
  }

  const hasActiveFilters = searchQuery || selectedTypes.length > 0 || selectedPriority.length > 0 || dateFilter !== 'all'

  const notificationTypes: NotificationType[] = ['system', 'appointment', 'medical', 'message', 'reminder']
  const statusOptions: NotificationStatus[] = ['unread', 'read', 'archived']
  const priorityOptions: NotificationPriority[] = ['info', 'success', 'warning', 'error', 'urgent']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="mt-1 text-sm text-gray-600">
            {unreadCount > 0 ? (
              <>
                {unreadCount} notification{unreadCount > 1 ? 's' : ''} non {unreadCount > 1 ? 'lues' : 'lue'}
              </>
            ) : (
              'Vous êtes à jour'
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreferences(true)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Préférences
          </Button>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
            >
              <CheckCheck className="h-4 w-4 mr-2" />
              Tout marquer comme lu
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
          <Card className="p-4">
            <div className="text-sm text-gray-600">Total</div>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600">Non lues</div>
            <div className="text-2xl font-bold text-medical-blue-600">{stats.unread}</div>
          </Card>
          {notificationTypes.map((type) => (
            <Card key={type} className="p-4">
              <div className="text-sm text-gray-600 capitalize">{type}</div>
              <div className="text-2xl font-bold text-gray-900">
                {stats.byType[type] || 0}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="space-y-4">
          {/* Search */}
          <div className="flex items-center gap-2">
            <Input
              placeholder="Rechercher dans les notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="h-4 w-4" />}
              className="flex-1"
            />
            <Button
              variant={showFilters ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtres
            </Button>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                <X className="h-4 w-4 mr-2" />
                Réinitialiser
              </Button>
            )}
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="grid grid-cols-1 gap-4 pt-4 border-t md:grid-cols-4">
              {/* Date Filter */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Période</label>
                <div className="flex flex-wrap gap-2">
                  {(['all', 'today', 'week', 'month'] as const).map((period) => (
                    <Button
                      key={period}
                      variant={dateFilter === period ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setDateFilter(period)}
                    >
                      {period === 'all' ? 'Tout' : period === 'today' ? "Aujourd'hui" : period === 'week' ? 'Semaine' : 'Mois'}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Type Filter */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Type</label>
                <div className="flex flex-wrap gap-2">
                  {notificationTypes.map((type) => (
                    <Button
                      key={type}
                      variant={selectedTypes.includes(type) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleTypeToggle(type)}
                    >
                      {type === 'system' ? 'Système' : type === 'appointment' ? 'RDV' : type === 'medical' ? 'Médical' : type === 'message' ? 'Message' : 'Rappel'}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Statut</label>
                <div className="flex flex-wrap gap-2">
                  {statusOptions.map((status) => (
                    <Button
                      key={status}
                      variant={selectedStatus.includes(status) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleStatusToggle(status)}
                    >
                      {status === 'unread' ? 'Non lues' : status === 'read' ? 'Lues' : 'Archivées'}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Priority Filter */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Priorité</label>
                <div className="flex flex-wrap gap-2">
                  {priorityOptions.map((priority) => (
                    <Button
                      key={priority}
                      variant={selectedPriority.includes(priority) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handlePriorityToggle(priority)}
                    >
                      {priority === 'info' ? 'Info' : priority === 'success' ? 'Succès' : priority === 'warning' ? 'Avertissement' : priority === 'error' ? 'Erreur' : 'Urgent'}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Error Alert */}
      {errorMessage && (
        <Alert variant="destructive">
          {errorMessage}
        </Alert>
      )}

      {/* Notifications List */}
      <div className="space-y-3">
        {isLoading ? (
          <Card className="p-12 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-medical-blue-600 border-t-transparent" />
            <p className="mt-4 text-gray-600">Chargement des notifications...</p>
          </Card>
        ) : notifications.length === 0 ? (
          <Card className="p-12 text-center">
            <Bell className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune notification</h3>
            <p className="text-sm text-gray-600">
              {hasActiveFilters
                ? 'Aucune notification ne correspond à vos filtres.'
                : 'Vous êtes à jour ! Aucune nouvelle notification.'}
            </p>
            {hasActiveFilters && (
              <Button variant="outline" className="mt-4" onClick={resetFilters}>
                Réinitialiser les filtres
              </Button>
            )}
          </Card>
        ) : (
          <>
            <div className="text-sm text-gray-600 mb-2">
              {total} notification{total > 1 ? 's' : ''} trouvée{total > 1 ? 's' : ''}
            </div>
            {notifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onMarkAsRead={markAsRead}
                onDelete={deleteNotification}
                onClick={handleNotificationClick}
              />
            ))}
          </>
        )}
      </div>

      {/* Preferences Modal */}
      {showPreferences && (
        <PreferencesModal
          open={showPreferences}
          onClose={() => setShowPreferences(false)}
        />
      )}
    </div>
  )
}

