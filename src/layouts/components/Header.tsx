import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { NotificationBell } from './NotificationBell'
import { AvatarMenu } from './AvatarMenu'

export type HeaderLink = {
  label: string
  href?: string
  onClick?: () => void
  icon?: React.ReactNode
}

type HeaderProps = {
  title?: string
  logo?: React.ReactNode
  showAuthButtons?: boolean
  utilityLinks?: HeaderLink[]
}

export function Header({ title = 'Platform', logo, showAuthButtons = true, utilityLinks }: HeaderProps) {
  const { authenticated, login } = useAuth()

  return (
    <header className="shell-header">
      <div className="shell-header-left">
        <Link to="/dashboard" className="shell-header-logo">
          {logo}
          <h1 className="shell-header-title">{title}</h1>
        </Link>
      </div>

      <div className="shell-header-right">
        {utilityLinks && utilityLinks.length > 0 && (
          <nav className="shell-header-links">
            {utilityLinks.map((link, index) => {
              if (link.href) {
                // External link - open in new tab
                if (link.href.startsWith('http')) {
                  return (
                    <a
                      key={index}
                      href={link.href}
                      className="shell-header-link"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {link.icon && <span className="shell-header-link-icon">{link.icon}</span>}
                      {link.label}
                    </a>
                  )
                }
                // Internal link - use Link component
                return (
                  <Link
                    key={index}
                    to={link.href}
                    className="shell-header-link"
                  >
                    {link.icon && <span className="shell-header-link-icon">{link.icon}</span>}
                    {link.label}
                  </Link>
                )
              }
              // Button with onClick
              return (
                <button
                  key={index}
                  type="button"
                  onClick={link.onClick}
                  className="shell-header-link"
                >
                  {link.icon && <span className="shell-header-link-icon">{link.icon}</span>}
                  {link.label}
                </button>
              )
            })}
          </nav>
        )}

        {showAuthButtons && (
          <>
            {authenticated ? (
              <>
                <NotificationBell />
                <AvatarMenu />
              </>
            ) : (
              <button
                type="button"
                onClick={login}
                className="shell-header-login-btn"
              >
                Login
              </button>
            )}
          </>
        )}
      </div>
    </header>
  )
}
