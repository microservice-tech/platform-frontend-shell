import { useAuth } from '../../contexts/AuthContext'
import { NotificationBell } from './NotificationBell'

type HeaderProps = {
  title?: string
  logo?: React.ReactNode
}

export function Header({ title = 'Platform', logo }: HeaderProps) {
  const { authenticated, user, login, logout } = useAuth()

  return (
    <header className="shell-header">
      <div className="shell-header-left">
        {logo && <div className="shell-header-logo">{logo}</div>}
        <h1 className="shell-header-title">{title}</h1>
      </div>

      <div className="shell-header-right">
        {authenticated ? (
          <>
            <NotificationBell />
            <div className="shell-header-user">
              <span className="shell-header-user-name">{user?.name || user?.email}</span>
              <button
                type="button"
                onClick={logout}
                className="shell-header-logout-btn"
              >
                Logout
              </button>
            </div>
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
      </div>
    </header>
  )
}
