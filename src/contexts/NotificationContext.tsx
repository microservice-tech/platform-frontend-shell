import {
  createContext,
  useContext,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from 'react'
import { create } from 'zustand'
import type { Notification, NotificationContextType, WebSocketMessage } from '../types'
import { config } from '../config'
import { useAuth } from './AuthContext'

type NotificationStore = {
  notifications: Notification[]
  connected: boolean
  addNotification: (notification: Notification) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clearNotification: (id: string) => void
  clearAll: () => void
  setConnected: (connected: boolean) => void
}

const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  connected: false,
  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications].slice(0, 100),
    })),
  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),
  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    })),
  clearNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
  clearAll: () => set({ notifications: [] }),
  setConnected: (connected) => set({ connected }),
}))

const NotificationContext = createContext<NotificationContextType | null>(null)

type NotificationProviderProps = {
  children: ReactNode
  websocketUrl?: string
  reconnectInterval?: number
  maxReconnectAttempts?: number
}

export function NotificationProvider({
  children,
  websocketUrl = config.websocket.url,
  reconnectInterval = 5000,
  maxReconnectAttempts = 10,
}: NotificationProviderProps) {
  const { token, authenticated } = useAuth()
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout>>()

  const store = useNotificationStore()

  const connect = useCallback(() => {
    if (!websocketUrl || !token || !authenticated) {
      return
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return
    }

    try {
      const wsUrl = `${websocketUrl}?token=${token}`
      wsRef.current = new WebSocket(wsUrl)

      wsRef.current.onopen = () => {
        store.setConnected(true)
        reconnectAttemptsRef.current = 0
      }

      wsRef.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)

          if (message.type === 'notification' && message.payload) {
            store.addNotification({
              ...message.payload,
              timestamp: new Date(message.payload.timestamp),
            })
          } else if (message.type === 'ping') {
            wsRef.current?.send(JSON.stringify({ type: 'pong' }))
          }
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err)
        }
      }

      wsRef.current.onclose = () => {
        store.setConnected(false)

        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++
            connect()
          }, reconnectInterval)
        }
      }

      wsRef.current.onerror = (err) => {
        console.error('WebSocket error:', err)
      }
    } catch (err) {
      console.error('Failed to create WebSocket connection:', err)
    }
  }, [websocketUrl, token, authenticated, store, reconnectInterval, maxReconnectAttempts])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    reconnectAttemptsRef.current = maxReconnectAttempts
    wsRef.current?.close()
    wsRef.current = null
    store.setConnected(false)
  }, [store, maxReconnectAttempts])

  useEffect(() => {
    if (authenticated && token && websocketUrl) {
      connect()
    } else {
      disconnect()
    }

    return () => {
      disconnect()
    }
  }, [authenticated, token, websocketUrl, connect, disconnect])

  const unreadCount = store.notifications.filter((n) => !n.read).length

  const value: NotificationContextType = {
    notifications: store.notifications,
    unreadCount,
    connected: store.connected,
    markAsRead: store.markAsRead,
    markAllAsRead: store.markAllAsRead,
    clearNotification: store.clearNotification,
    clearAll: store.clearAll,
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications(): NotificationContextType {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}
