import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from 'react'
import Keycloak from 'keycloak-js'
import type { AuthContextType, User, KeycloakConfig } from '../types'
import { config } from '../config'

const AuthContext = createContext<AuthContextType | null>(null)

// Default role-permission mapping
const DEFAULT_ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: [
    'can_manage_users',
    'can_manage_projects',
    'can_view_billing',
    'can_manage_settings',
    'can_view_analytics',
  ],
  user: [
    'can_view_own_data',
    'can_create_projects',
    'can_edit_own_projects',
  ],
  viewer: [
    'can_view_own_data',
  ],
}

function getRolePermissions(roles: string[]): string[] {
  const permissions = new Set<string>()
  roles.forEach((role) => {
    const rolePerms = DEFAULT_ROLE_PERMISSIONS[role] || []
    rolePerms.forEach((perm) => permissions.add(perm))
  })
  return Array.from(permissions)
}

type AuthProviderProps = {
  children: ReactNode
  keycloakConfig?: KeycloakConfig
  onAuthSuccess?: (token: string) => void
  onAuthError?: (error: Error) => void
  rolePermissions?: Record<string, string[]>
}

export function AuthProvider({
  children,
  keycloakConfig = config.keycloak,
  onAuthSuccess,
  onAuthError,
}: AuthProviderProps) {
  const [keycloak, setKeycloak] = useState<Keycloak | null>(null)
  const [authenticated, setAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Store callbacks in refs to avoid dependency issues
  const onAuthSuccessRef = useRef(onAuthSuccess)
  const onAuthErrorRef = useRef(onAuthError)

  useEffect(() => {
    onAuthSuccessRef.current = onAuthSuccess
    onAuthErrorRef.current = onAuthError
  }, [onAuthSuccess, onAuthError])

  // Prevent double initialization in React StrictMode
  const initRef = useRef(false)

  useEffect(() => {
    // Prevent double init in React 18+ StrictMode
    if (initRef.current) return
    initRef.current = true

    if (!keycloakConfig.url || !keycloakConfig.realm || !keycloakConfig.clientId) {
      // Use queueMicrotask to avoid sync setState in effect
      queueMicrotask(() => setLoading(false))
      return
    }

    const kc = new Keycloak({
      url: keycloakConfig.url,
      realm: keycloakConfig.realm,
      clientId: keycloakConfig.clientId,
    })

    // Use check-sso with silent check to avoid full page redirects
    // Disable silentCheckSsoFallback to prevent redirect loops when third-party cookies are blocked
    kc.init({
      onLoad: 'check-sso',
      silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
      silentCheckSsoFallback: false, // Disable fallback to prevent redirect loops
      checkLoginIframe: false, // Disable session iframe to avoid third-party cookie issues
      pkceMethod: 'S256',
      enableLogging: false,
    })
      .then((auth) => {
        setKeycloak(kc)
        setAuthenticated(auth)

        if (auth && kc.tokenParsed) {
          const roles = kc.tokenParsed.realm_access?.roles || []
          const userData: User = {
            id: kc.tokenParsed.sub || '',
            email: kc.tokenParsed.email || '',
            name: kc.tokenParsed.name || kc.tokenParsed.preferred_username || '',
            roles,
            permissions: getRolePermissions(roles),
            tenantId: kc.tokenParsed.tenant_id,
            avatar: kc.tokenParsed.avatar,
          }
          setUser(userData)
          onAuthSuccessRef.current?.(kc.token || '')
        }

        setLoading(false)
      })
      .catch((err) => {
        console.error('Keycloak init failed (silent SSO check failed, user not logged in):', err)
        // Silent SSO check failed - user is not logged in
        // This is expected behavior when user has no active session
        setKeycloak(kc)
        setLoading(false)
        setAuthenticated(false)
      })

    kc.onTokenExpired = () => {
      kc.updateToken(30)
        .then((refreshed) => {
          if (refreshed && kc.token) {
            onAuthSuccessRef.current?.(kc.token)
          }
        })
        .catch(() => {
          setAuthenticated(false)
          setUser(null)
        })
    }

    return () => {
      kc.onTokenExpired = undefined
    }
  }, [keycloakConfig.url, keycloakConfig.realm, keycloakConfig.clientId])

  const login = useCallback(() => {
    keycloak?.login()
  }, [keycloak])

  const logout = useCallback(() => {
    keycloak?.logout({ redirectUri: window.location.origin })
  }, [keycloak])

  const hasRole = useCallback(
    (role: string) => user?.roles?.includes(role) ?? false,
    [user?.roles]
  )

  const hasPermission = useCallback(
    (permission: string) => user?.permissions?.includes(permission) ?? false,
    [user?.permissions]
  )

  const hasAnyRole = useCallback(
    (roles: string[]) => roles.some(hasRole),
    [hasRole]
  )

  const hasAllRoles = useCallback(
    (roles: string[]) => roles.every(hasRole),
    [hasRole]
  )

  const getAccountUrl = useCallback(() => {
    if (!keycloak) return '#'
    return keycloak.createAccountUrl()
  }, [keycloak])

  const value: AuthContextType = {
    keycloak,
    authenticated,
    user,
    loading,
    login,
    logout,
    token: keycloak?.token,
    hasRole,
    hasPermission,
    hasAnyRole,
    hasAllRoles,
    getAccountUrl,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
