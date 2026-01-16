// Main Shell Component
export { Shell } from './Shell'

// Contexts
export {
  AuthProvider,
  useAuth,
  CapabilityProvider,
  useCapabilities,
  NotificationProvider,
  useNotifications,
} from './contexts'

// Hooks
export * from './hooks'

// Layouts
export { PublicLayout, ProtectedLayout } from './layouts'
export { Header, Sidebar, NotificationBell, Spinner } from './layouts/components'

// Types
export type {
  FeatureModule,
  MenuItem,
  ModuleConfig,
  User,
  AuthContextType,
  KeycloakConfig,
  CapabilitiesResponse,
  CapabilityContextType,
  Notification,
  NotificationType,
  NotificationContextType,
} from './types'

// Config
export { config } from './config'
