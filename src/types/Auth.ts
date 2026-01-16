import type Keycloak from 'keycloak-js'

export type User = {
  id: string
  email: string
  name: string
  roles?: string[]
}

export type AuthContextType = {
  keycloak: Keycloak | null
  authenticated: boolean
  user: User | null
  loading: boolean
  login: () => void
  logout: () => void
  token: string | undefined
}

export type KeycloakConfig = {
  url: string
  realm: string
  clientId: string
}
