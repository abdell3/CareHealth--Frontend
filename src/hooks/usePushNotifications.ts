import { useEffect, useState } from 'react'
import { initializePushNotifications, subscribeToPush, getPushSubscription } from '@/utils/pushNotifications'
import { notificationsService } from '@/api/notifications.service'

/**
 * Hook to initialize and manage push notifications
 */
export const usePushNotifications = () => {
  const [isSupported, setIsSupported] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // Check if browser supports notifications
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      setIsSupported(false)
      return
    }

    setIsSupported(true)
    setPermission(Notification.permission)

    // Initialize push notifications
    const init = async () => {
      try {
        const { permission: newPermission, subscription, registration } =
          await initializePushNotifications()

        setPermission(newPermission)

        // If permission granted and subscription exists, send to backend
        if (newPermission === 'granted' && subscription) {
          try {
            // Send subscription to backend
            // This would typically be done via an API call
            // await notificationsService.subscribePush(subscription)
            console.log('Push subscription ready:', subscription)
          } catch (error) {
            console.error('Error sending subscription to backend:', error)
          }
        }

        setIsInitialized(true)
      } catch (error) {
        console.error('Error initializing push notifications:', error)
        setIsInitialized(true) // Mark as initialized even on error
      }
    }

    init()
  }, [])

  const requestPermission = async () => {
    if (!isSupported) return false

    try {
      const { permission: newPermission, subscription, registration } =
        await initializePushNotifications()

      setPermission(newPermission)

      if (newPermission === 'granted' && subscription && registration) {
        // Send subscription to backend
        // await notificationsService.subscribePush(subscription)
        return true
      }

      return false
    } catch (error) {
      console.error('Error requesting push permission:', error)
      return false
    }
  }

  return {
    isSupported,
    permission,
    isInitialized,
    requestPermission,
  }
}

