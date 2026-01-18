// Import Shell CSS
import './shell.css'

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

// Conditional Rendering Components
export { RequireRole, RequirePermission, RequireModule, RequireFeature } from './components'

// shadcn UI Components
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from './components/ui/card'
export { Button, buttonVariants } from './components/ui/button'
export { Input } from './components/ui/input'
export { Label } from './components/ui/label'
export { Separator } from './components/ui/separator'
export {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
} from './components/ui/form'

// Utils
export { cn } from './lib/utils'

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
