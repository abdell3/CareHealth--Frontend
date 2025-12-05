// Service Worker for Push Notifications
// CareHealth Frontend

const CACHE_NAME = 'carehealth-v1'
const MEDICAL_ICON = '/medical-icon-192.png'
const BADGE_ICON = '/badge-96.png'

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        MEDICAL_ICON,
        BADGE_ICON,
      ])
    })
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    })
  )
  self.clients.claim()
})

// Push event - handle push notifications
self.addEventListener('push', (event) => {
  let data = {}
  
  try {
    if (event.data) {
      data = event.data.json()
    }
  } catch (error) {
    console.error('Error parsing push data:', error)
    data = {
      title: 'CareHealth',
      body: event.data?.text() || 'Nouvelle notification',
    }
  }

  const options = {
    body: data.body || data.message || 'Nouvelle notification',
    icon: data.icon || MEDICAL_ICON,
    badge: BADGE_ICON,
    vibrate: data.priority === 'urgent' ? [200, 100, 200, 100, 200] : [200, 100, 200],
    data: {
      url: data.clickUrl || data.url || '/dashboard/notifications',
      notificationId: data.id,
      type: data.type,
      priority: data.priority || 'info',
    },
    tag: data.id || 'notification',
    requireInteraction: data.priority === 'urgent',
    actions: [
      {
        action: 'view',
        title: 'Voir',
        icon: '/action-view.png',
      },
      {
        action: 'dismiss',
        title: 'Fermer',
        icon: '/action-dismiss.png',
      },
    ],
    // Medical-specific styling
    image: data.image,
    timestamp: Date.now(),
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'CareHealth', options)
  )
})

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const data = event.notification.data || {}
  const urlToOpen = data.url || '/dashboard/notifications'

  if (event.action === 'view' || !event.action) {
    event.waitUntil(
      clients
        .matchAll({
          type: 'window',
          includeUncontrolled: true,
        })
        .then((clientList) => {
          // Check if there's already a window/tab open with the target URL
          for (let i = 0; i < clientList.length; i++) {
            const client = clientList[i]
            if (client.url === urlToOpen && 'focus' in client) {
              return client.focus()
            }
          }
          // If not, open a new window/tab
          if (clients.openWindow) {
            return clients.openWindow(urlToOpen)
          }
        })
    )
  } else if (event.action === 'dismiss') {
    // Just close the notification (already done above)
    return
  }
})

// Background sync (for offline notifications queue)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-notifications') {
    event.waitUntil(syncNotifications())
  }
})

async function syncNotifications() {
  // This would sync queued notifications when back online
  // Implementation depends on backend API
  try {
    // Example: fetch pending notifications from IndexedDB and sync
    console.log('Syncing notifications...')
  } catch (error) {
    console.error('Error syncing notifications:', error)
  }
}

// Message event - handle messages from main thread
self.addEventListener('message', (event) => {
  // Only handle messages with data
  if (!event.data) {
    return
  }

  // Handle SKIP_WAITING message
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting().catch((error) => {
      console.error('Error skipping waiting:', error)
    })
    // Send response if port is available
    if (event.ports && event.ports.length > 0) {
      try {
        event.ports[0].postMessage({ success: true, type: 'SKIP_WAITING' })
      } catch (error) {
        console.error('Error posting message:', error)
      }
    }
    return
  }
  
  // Handle CACHE_URLS message
  if (event.data.type === 'CACHE_URLS' && Array.isArray(event.data.urls)) {
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then((cache) => cache.addAll(event.data.urls))
        .then(() => {
          // Send success response if port is available
          if (event.ports && event.ports.length > 0) {
            try {
              event.ports[0].postMessage({ success: true, type: 'CACHE_URLS' })
            } catch (error) {
              console.error('Error posting message:', error)
            }
          }
        })
        .catch((error) => {
          console.error('Error caching URLs:', error)
          // Send error response if port is available
          if (event.ports && event.ports.length > 0) {
            try {
              event.ports[0].postMessage({ success: false, error: error.message, type: 'CACHE_URLS' })
            } catch (postError) {
              console.error('Error posting error message:', postError)
            }
          }
        })
    )
    return
  }
  
  // For other messages, send acknowledgment if port is available
  if (event.ports && event.ports.length > 0) {
    try {
      event.ports[0].postMessage({ received: true, type: event.data.type || 'UNKNOWN' })
    } catch (error) {
      console.error('Error posting acknowledgment:', error)
    }
  }
})

