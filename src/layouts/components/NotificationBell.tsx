import { useState, useRef, useEffect } from 'react'
import { clsx } from 'clsx'
import { useNotifications } from '../../contexts/NotificationContext'
import type { Notification } from '../../types'

function formatTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

function NotificationItem({
  notification,
  onMarkRead,
  onClear,
}: {
  notification: Notification
  onMarkRead: (id: string) => void
  onClear: (id: string) => void
}) {
  return (
    <div
      className={clsx('shell-notification-item', notification.type, {
        unread: !notification.read,
      })}
    >
      <div className="shell-notification-item-content">
        <div className="shell-notification-item-header">
          <span className="shell-notification-item-title">{notification.title}</span>
          <span className="shell-notification-item-time">
            {formatTime(notification.timestamp)}
          </span>
        </div>
        <p className="shell-notification-item-message">{notification.message}</p>
        {notification.actionUrl && (
          <a
            href={notification.actionUrl}
            className="shell-notification-item-action"
            onClick={() => onMarkRead(notification.id)}
          >
            View
          </a>
        )}
      </div>
      <button
        type="button"
        className="shell-notification-item-close"
        onClick={() => onClear(notification.id)}
        aria-label="Dismiss notification"
      >
        ×
      </button>
    </div>
  )
}

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const {
    notifications,
    unreadCount,
    connected,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAll,
  } = useNotifications()

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
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

  return (
    <div className="shell-notification-bell" ref={dropdownRef}>
      <button
        type="button"
        className={clsx('shell-notification-bell-btn', { connected })}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Notifications (${unreadCount} unread)`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 2C11.172 2 10.5 2.672 10.5 3.5C10.5 3.776 10.572 4.034 10.697 4.26C8.182 5.014 6.5 7.318 6.5 10V15L4 17.5V18.5H20V17.5L17.5 15V10C17.5 7.318 15.818 5.014 13.303 4.26C13.428 4.034 13.5 3.776 13.5 3.5C13.5 2.672 12.828 2 12 2ZM10 20C10 21.105 10.895 22 12 22C13.105 22 14 21.105 14 20H10Z" />
        </svg>
        {unreadCount > 0 && (
          <span className="shell-notification-bell-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="shell-notification-dropdown">
          <div className="shell-notification-dropdown-header">
            <span className="shell-notification-dropdown-title">Notifications</span>
            <div className="shell-notification-dropdown-actions">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="shell-notification-action-btn"
                >
                  Mark all read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="shell-notification-action-btn"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>

          <div className="shell-notification-dropdown-list">
            {notifications.length === 0 ? (
              <p className="shell-notification-empty">No notifications</p>
            ) : (
              notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkRead={markAsRead}
                  onClear={clearNotification}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
