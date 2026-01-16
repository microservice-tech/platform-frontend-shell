import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import Keycloak from 'keycloak-js'
import type { AuthContextType, User, KeycloakConfig } from '../types'
import { config } from '../config'

const AuthContext = createContext<AuthContextType | null>(null)

type AuthProviderProps = {
  children: ReactNode
  keycloakConfig?: KeycloakConfig
  onAuthSuccess?: (token: string) => void
  onAuthError?: (error: Error) => void
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

  useEffect(() => {
    if (!keycloakConfig.url || !keycloakConfig.realm || !keycloakConfig.clientId) {
      setLoading(false)
      return
    }

    const kc = new Keycloak({
      url: keycloakConfig.url,
      realm: keycloakConfig.realm,
      clientId: keycloakConfig.clientId,
    })

    kc.init({
      onLoad: 'check-sso',
      silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
      checkLoginIframe: false,
    })
      .then((auth) => {
        setKeycloak(kc)
        setAuthenticated(auth)

        if (auth && kc.tokenParsed) {
          const userData: User = {
            id: kc.tokenParsed.sub || '',
            email: kc.tokenParsed.email || '',
            name: kc.tokenParsed.name || kc.tokenParsed.preferred_username || '',
            roles: kc.tokenParsed.realm_access?.roles,
          }
          setUser(userData)
          onAuthSuccess?.(kc.token || '')
        }

        setLoading(false)
      })
      .catch((err) => {
        console.error('Keycloak init failed:', err)
        onAuthError?.(err)
        setLoading(false)
      })

    kc.onTokenExpired = () => {
      kc.updateToken(30)
        .then((refreshed) => {
          if (refreshed && kc.token) {
            onAuthSuccess?.(kc.token)
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

  const value: AuthContextType = {
    keycloak,
    authenticated,
    user,
    loading,
    login,
    logout,
    token: keycloak?.token,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
