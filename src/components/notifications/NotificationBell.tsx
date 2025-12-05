import { memo, useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Settings, CheckCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { NotificationCard } from './NotificationCard'
import { useNotifications } from '@/hooks/useNotifications'
import { cn } from '@/libs/utils'

interface NotificationBellProps {
  maxItems?: number
  onPreferencesClick?: () => void
}

export const NotificationBell = memo<NotificationBellProps>(
  ({ maxItems = 5, onPreferencesClick }) => {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const navigate = useNavigate()

    const {
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      isLoading,
    } = useNotifications({
      limit: maxItems,
      status: ['unread', 'read'],
    })

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsOpen(false)
        }
      }

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside)
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }, [isOpen])

    const handleNotificationClick = (notification: { id: string; metadata?: { url?: string } }) => {
      if (notification.metadata?.url) {
        navigate(notification.metadata.url)
      }
      setIsOpen(false)
    }

    const handleMarkAllAsRead = async () => {
      const unreadIds = notifications
        .filter((n) => n.status === 'unread')
        .map((n) => n.id)
      if (unreadIds.length > 0) {
        await markAllAsRead(unreadIds)
      }
    }

    const handleViewAll = () => {
      navigate('/dashboard/notifications')
      setIsOpen(false)
    }

    const unreadNotifications = notifications.filter((n) => n.status === 'unread')
    const displayNotifications = notifications.slice(0, maxItems)

    return (
      <div className="relative" ref={dropdownRef}>
        {/* Bell Button */}
        <Button
          variant="ghost"
          size="sm"
          className="relative h-9 w-9 p-0"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              className={cn(
                'absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs font-bold',
                unreadCount > 99 ? 'px-1' : '',
                'bg-red-600 text-white border-2 border-white animate-pulse'
              )}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute right-0 top-12 z-50 w-96 rounded-lg border bg-white shadow-medical-card animate-in fade-in slide-in-from-top-2">
            {/* Header */}
            <div className="flex items-center justify-between border-b p-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                {unreadCount > 0 && (
                  <p className="text-sm text-gray-500">
                    {unreadCount} non {unreadCount === 1 ? 'lue' : 'lues'}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {onPreferencesClick && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => {
                      onPreferencesClick()
                      setIsOpen(false)
                    }}
                    title="Préférences"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                )}
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={handleMarkAllAsRead}
                    title="Tout marquer comme lu"
                  >
                    <CheckCheck className="h-4 w-4 mr-1" />
                    Tout lu
                  </Button>
                )}
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-[500px] overflow-y-auto">
              {isLoading ? (
                <div className="p-8 text-center text-gray-500">
                  <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-medical-blue-600 border-t-transparent" />
                  <p className="mt-2 text-sm">Chargement...</p>
                </div>
              ) : displayNotifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                  <p className="text-sm font-medium">Aucune notification</p>
                  <p className="text-xs mt-1">Vous êtes à jour !</p>
                </div>
              ) : (
                <div className="divide-y">
                  {displayNotifications.map((notification) => (
                    <div key={notification.id} className="p-2">
                      <NotificationCard
                        notification={notification}
                        onMarkAsRead={markAsRead}
                        onClick={handleNotificationClick}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {displayNotifications.length > 0 && (
              <div className="border-t p-3 text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-sm font-medium text-medical-blue-600 hover:text-medical-blue-700"
                  onClick={handleViewAll}
                >
                  Voir toutes les notifications
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }
)

NotificationBell.displayName = 'NotificationBell'

