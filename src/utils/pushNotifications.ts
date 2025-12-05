/**
 * Push Notifications Utility
 * Handles browser push notification permissions and registration
 */

export interface PushSubscriptionData {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

/**
 * Request push notification permission
 */
export async function requestPushPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    throw new Error('This browser does not support notifications')
  }

  if (Notification.permission === 'granted') {
    return 'granted'
  }

  if (Notification.permission === 'denied') {
    throw new Error('Notification permission was previously denied')
  }

  const permission = await Notification.requestPermission()
  return permission
}

/**
 * Register service worker for push notifications
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service workers are not supported')
    return null
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    })

    console.log('Service Worker registered:', registration)
    return registration
  } catch (error) {
    console.error('Service Worker registration failed:', error)
    return null
  }
}

/**
 * Get push subscription
 */
export async function getPushSubscription(): Promise<PushSubscription | null> {
  const registration = await navigator.serviceWorker.ready

  try {
    const subscription = await registration.pushManager.getSubscription()
    return subscription
  } catch (error) {
    console.error('Error getting push subscription:', error)
    return null
  }
}

/**
 * Subscribe to push notifications
 */
export async function subscribeToPush(
  registration: ServiceWorkerRegistration
): Promise<PushSubscription | null> {
  try {
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        import.meta.env.VITE_VAPID_PUBLIC_KEY || ''
      ),
    })

    return subscription
  } catch (error) {
    console.error('Error subscribing to push:', error)
    return null
  }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPush(): Promise<boolean> {
  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()

    if (subscription) {
      await subscription.unsubscribe()
      return true
    }

    return false
  } catch (error) {
    console.error('Error unsubscribing from push:', error)
    return false
  }
}

/**
 * Convert VAPID key from base64 URL to Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }

  return outputArray
}

/**
 * Initialize push notifications
 */
export async function initializePushNotifications(): Promise<{
  permission: NotificationPermission
  subscription: PushSubscription | null
  registration: ServiceWorkerRegistration | null
}> {
  const permission = await requestPushPermission()
  const registration = await registerServiceWorker()
  let subscription: PushSubscription | null = null

  if (permission === 'granted' && registration) {
    subscription = await subscribeToPush(registration)
  }

  return {
    permission,
    subscription,
    registration,
  }
}

