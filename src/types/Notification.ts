export type NotificationType = 'info' | 'success' | 'warning' | 'error'

export type Notification = {
  id: string
  type: NotificationType
  title: string
  message: string
  timestamp: Date
  read: boolean
  actionUrl?: string
}

export type NotificationContextType = {
  notifications: Notification[]
  unreadCount: number
  connected: boolean
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clearNotification: (id: string) => void
  clearAll: () => void
}

export type WebSocketMessage = {
  type: 'notification' | 'ping' | 'pong'
  payload?: Notification
}
