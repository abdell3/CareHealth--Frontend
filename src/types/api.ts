// ... existing code ...

export interface UploadDocumentRequest {
  file: File
  patientId?: string
  category: Document['category']
  tags?: string[]
  documentDate?: string
  confidentiality?: Document['confidentiality']
  metadata?: Record<string, unknown>
}

export interface UploadDocumentsBatchRequest {
  files: File[]
  patientId?: string
  defaultCategory?: Document['category']
  defaultTags?: string[]
  defaultConfidentiality?: Document['confidentiality']
}

// Notification Types
export type NotificationType = 'system' | 'appointment' | 'medical' | 'message' | 'reminder'
export type NotificationChannel = 'in-app' | 'push' | 'email' | 'sms'
export type NotificationPriority = 'info' | 'success' | 'warning' | 'error' | 'urgent'
export type NotificationStatus = 'unread' | 'read' | 'archived'

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  priority: NotificationPriority
  status: NotificationStatus
  title: string
  message: string
  channels: NotificationChannel[]
  metadata?: {
    appointmentId?: string
    patientId?: string
    prescriptionId?: string
    labOrderId?: string
    documentId?: string
    url?: string
    actionLabel?: string
    [key: string]: unknown
  }
  readAt?: string
  createdAt: string
  expiresAt?: string
}

export interface NotificationPreferences {
  userId: string
  types: {
    system: {
      enabled: boolean
      channels: NotificationChannel[]
      quietHours?: { start: string; end: string }
    }
    appointment: {
      enabled: boolean
      channels: NotificationChannel[]
      reminders?: {
        '24h': boolean
        '2h': boolean
        'on-time': boolean
      }
    }
    medical: {
      enabled: boolean
      channels: NotificationChannel[]
      criticalOnly?: boolean
    }
    message: {
      enabled: boolean
      channels: NotificationChannel[]
    }
    reminder: {
      enabled: boolean
      channels: NotificationChannel[]
    }
  }
  keywords?: string[]
  createdAt: string
  updatedAt: string
}

export interface NotificationsListResponse {
  notifications: Notification[]
  total: number
  unreadCount: number
  page: number
  limit: number
}

export interface NotificationStats {
  total: number
  unread: number
  byType: Record<NotificationType, number>
  byPriority: Record<NotificationPriority, number>
}

export interface CreateNotificationRequest {
  userId: string
  type: NotificationType
  priority: NotificationPriority
  title: string
  message: string
  channels?: NotificationChannel[]
  metadata?: Notification['metadata']
  expiresAt?: string
}

export interface MarkNotificationReadRequest {
  notificationIds: string[]
}

export interface NotificationFilters {
  type?: NotificationType[]
  status?: NotificationStatus[]
  priority?: NotificationPriority[]
  dateFrom?: string
  dateTo?: string
  search?: string
  page?: number
  limit?: number
}

// Search Types
export type SearchResultType = 'patient' | 'appointment' | 'prescription' | 'document' | 'lab'

export interface SearchResult {
  type: SearchResultType
  id: string
  title: string
  description: string
  relevance: number // 0-1
  metadata: {
    patientId?: string
    appointmentId?: string
    prescriptionId?: string
    documentId?: string
    labOrderId?: string
    date?: string
    status?: string
    [key: string]: unknown
  }
  actions: Array<{
    label: string
    url: string
    icon?: string
  }>
}

export interface SearchResponse {
  results: SearchResult[]
  suggestions: string[]
  filters: SearchFilter[]
  total: number
  byType: Record<SearchResultType, number>
}

export interface SearchFilter {
  type: SearchResultType
  label: string
  count: number
  enabled: boolean
}

export interface SearchParams {
  q: string
  types?: SearchResultType[]
  dateFrom?: string
  dateTo?: string
  status?: string
  city?: string
  doctorId?: string
  medication?: string
  limit?: number
  offset?: number
  sortBy?: 'relevance' | 'date' | 'alphabetical'
  advanced?: boolean
  operators?: {
    and?: string[]
    or?: string[]
    not?: string[]
  }
}