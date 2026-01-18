import type Keycloak from 'keycloak-js'

export type User = {
  id: string
  email: string
  name: string
  roles?: string[]
  permissions?: string[]
  tenantId?: string
  avatar?: string
}

export type AuthContextType = {
  keycloak: Keycloak | null
  authenticated: boolean
  user: User | null
  loading: boolean
  login: () => void
  logout: () => void
  token: string | undefined
  hasRole: (role: string) => boolean
  hasPermission: (permission: string) => boolean
  hasAnyRole: (roles: string[]) => boolean
  hasAllRoles: (roles: string[]) => boolean
  getAccountUrl: () => string
}

export type KeycloakConfig = {
  url: string
  realm: string
  clientId: string
}
