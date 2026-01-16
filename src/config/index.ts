export const config = {
  keycloak: {
    url: import.meta.env.VITE_KEYCLOAK_URL || '',
    realm: import.meta.env.VITE_KEYCLOAK_REALM || '',
    clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || '',
  },
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || '',
  },
  websocket: {
    url: import.meta.env.VITE_WEBSOCKET_URL || '',
  },
}

export type Config = typeof config
