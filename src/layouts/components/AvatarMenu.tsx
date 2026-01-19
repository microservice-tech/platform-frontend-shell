import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export function AvatarMenu() {
  const { user, logout, getAccountUrl } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleAccount = () => {
    const accountUrl = getAccountUrl()
    window.open(accountUrl, '_blank', 'noopener,noreferrer')
    setIsOpen(false)
  }

  const handleLogout = () => {
    setIsOpen(false)
    logout()
  }

  // Get initials from name or email
  const getInitials = () => {
    const name = user?.name || user?.email || 'U'
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="shell-avatar-menu" ref={menuRef}>
      <button
        type="button"
        className="shell-avatar-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="shell-avatar">
          {getInitials()}
        </div>
        <span className="shell-avatar-name">{user?.name || user?.email}</span>
        <svg
          className={`shell-avatar-chevron ${isOpen ? 'open' : ''}`}
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4 6L8 10L12 6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="shell-avatar-dropdown">
          <div className="shell-avatar-dropdown-section">
            <Link
              to="/settings/profile"
              className="shell-avatar-dropdown-item"
              onClick={() => setIsOpen(false)}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M8 8C9.65685 8 11 6.65685 11 5C11 3.34315 9.65685 2 8 2C6.34315 2 5 3.34315 5 5C5 6.65685 6.34315 8 8 8Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M13 14C13 11.7909 10.7614 10 8 10C5.23858 10 3 11.7909 3 14"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Profile
            </Link>

            <Link
              to="/settings"
              className="shell-avatar-dropdown-item"
              onClick={() => setIsOpen(false)}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M8 10C9.10457 10 10 9.10457 10 8C10 6.89543 9.10457 6 8 6C6.89543 6 6 6.89543 6 8C6 9.10457 6.89543 10 8 10Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M13 8C13 8.36 13 8.71 12.96 9.06L14.03 9.88C14.14 9.96 14.17 10.11 14.1 10.23L13.1 11.87C13.03 11.99 12.88 12.03 12.76 11.99L11.46 11.5C11.17 11.71 10.86 11.89 10.53 12.03L10.32 13.42C10.3 13.55 10.19 13.65 10.06 13.65H8.06C7.93 13.65 7.82 13.55 7.8 13.42L7.59 12.03C7.26 11.89 6.95 11.71 6.66 11.5L5.36 11.99C5.24 12.03 5.09 11.99 5.02 11.87L4.02 10.23C3.95 10.11 3.98 9.96 4.09 9.88L5.16 9.06C5.12 8.71 5.12 8.36 5.12 8C5.12 7.64 5.12 7.29 5.16 6.94L4.09 6.12C3.98 6.04 3.95 5.89 4.02 5.77L5.02 4.13C5.09 4.01 5.24 3.97 5.36 4.01L6.66 4.5C6.95 4.29 7.26 4.11 7.59 3.97L7.8 2.58C7.82 2.45 7.93 2.35 8.06 2.35H10.06C10.19 2.35 10.3 2.45 10.32 2.58L10.53 3.97C10.86 4.11 11.17 4.29 11.46 4.5L12.76 4.01C12.88 3.97 13.03 4.01 13.1 4.13L14.1 5.77C14.17 5.89 14.14 6.04 14.03 6.12L12.96 6.94C13 7.29 13 7.64 13 8Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Settings
            </Link>

            <button
              type="button"
              className="shell-avatar-dropdown-item"
              onClick={handleAccount}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M8 8C9.65685 8 11 6.65685 11 5C11 3.34315 9.65685 2 8 2C6.34315 2 5 3.34315 5 5C5 6.65685 6.34315 8 8 8Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M13 14C13 11.7909 10.7614 10 8 10C5.23858 10 3 11.7909 3 14"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Account
            </button>

            <button
              type="button"
              className="shell-avatar-dropdown-item"
              onClick={handleLogout}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M10 14H3C2.44772 14 2 13.5523 2 13V3C2 2.44772 2.44772 2 3 2H10"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M6 8H14M14 8L11.5 5.5M14 8L11.5 10.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
