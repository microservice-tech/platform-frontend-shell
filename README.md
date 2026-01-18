# Platform Frontend Shell

Reusable React shell providing authentication, authorization, capabilities management, and real-time notifications for all platform frontend applications.

**Frontend equivalent of `platform-auth-go`** - provides complete auth and UI infrastructure with minimal configuration.

## Features

- **Keycloak Authentication**: Full OIDC login/logout flows
- **Three-Axis Authorization**: Identity + Permissions + Entitlements
- **Conditional Rendering**: Show/hide UI based on roles, permissions, modules, features
- **Real-time Notifications**: WebSocket connection with notification bell
- **Module System**: Dynamic module loading and routing
- **Token Management**: Automatic token refresh
- **TypeScript**: Full type safety

## Installation

```bash
npm install @platform/frontend-shell
```

## Quick Start

### 1. Wrap your app with Shell

```tsx
import { Shell } from '@platform/frontend-shell'
import type { FeatureModule } from '@platform/frontend-shell'

const dashboardModule: FeatureModule = {
  id: 'dashboard',
  name: 'Dashboard',
  routes: [{ path: '/dashboard', element: <Dashboard /> }],
  menuItems: [{ label: 'Dashboard', path: '/dashboard' }],
  requiredCapabilities: ['dashboard_module'],
  lazy: async () => ({ default: () => <Dashboard /> }),
}

const modules = [dashboardModule]
const publicRoutes = [{ path: '/', element: <Landing /> }]

export function App() {
  return (
    <Shell
      modules={modules}
      publicRoutes={publicRoutes}
      keycloakConfig={{
        url: 'https://auth.example.com',
        realm: 'microservice-tech',
        clientId: 'your-app',
      }}
      apiBaseUrl="https://api.example.com"
      websocketUrl="wss://api.example.com/ws"
      title="My App"
    />
  )
}
```

### 2. Use hooks in components

```tsx
import { useAuth, useCapabilities, useNotifications } from '@platform/frontend-shell'

function MyComponent() {
  const { user, login, logout, hasRole, hasPermission } = useAuth()
  const { hasModule, hasFeature, getLimit } = useCapabilities()
  const { notifications, unreadCount } = useNotifications()

  return (
    <div>
      <p>Welcome, {user?.name}</p>
      {hasRole('admin') && <AdminPanel />}
      {hasPermission('can_manage_users') && <UserManagement />}
      {hasModule('billing_module') && <BillingSection />}
    </div>
  )
}
```

### 3. Use conditional rendering components

```tsx
import {
  RequireRole,
  RequirePermission,
  RequireModule,
  RequireFeature,
} from '@platform/frontend-shell'

function Dashboard() {
  return (
    <div>
      <RequireRole role="admin">
        <AdminPanel />
      </RequireRole>

      <RequirePermission permission="can_manage_users">
        <UserManagement />
      </RequirePermission>

      <RequireModule
        module="billing_module"
        paymentRequiredMessage="Upgrade to Pro to access billing features"
      >
        <BillingDashboard />
      </RequireModule>

      <RequireFeature
        feature="api_access"
        paymentRequiredMessage="Enable API access in your plan"
      >
        <APISettings />
      </RequireFeature>
    </div>
  )
}
```

## Three-Axis Authorization

```
Access Granted = Permission AND Entitlement
```

### Axis 1: Identity (Keycloak)

**Question**: "Who are you?"

**Answers**: `user_id`, `email`, `name`, `tenant_id`, `roles`

**Source**: Keycloak JWT

### Axis 2: Permissions (Roles)

**Question**: "What actions can you perform?"

**Answers**: Roles like `admin`, `user`, `viewer`

**Enforcement**: `RequireRole()`, `RequirePermission()`, `hasRole()`, `hasPermission()`

### Axis 3: Entitlements (Subscriptions)

**Question**: "What did your tenant pay for?"

**Answers**: `enabled_modules`, `enabled_features`, `limits`

**Source**: Capabilities API (`/api/capabilities/me`)

**Enforcement**: `RequireModule()`, `RequireFeature()`, `hasModule()`, `hasFeature()`

## Authentication

### Login Flow

```tsx
import { useAuth } from '@platform/frontend-shell'

function LoginButton() {
  const { login, authenticated } = useAuth()

  if (authenticated) return null

  return <button onClick={login}>Login with Keycloak</button>
}
```

### Logout Flow

```tsx
import { useAuth } from '@platform/frontend-shell'

function LogoutButton() {
  const { logout, user } = useAuth()

  return (
    <div>
      <span>Welcome, {user?.name}</span>
      <button onClick={logout}>Logout</button>
    </div>
  )
}
```

### Role Checking

```tsx
import { useAuth } from '@platform/frontend-shell'

function MyComponent() {
  const { hasRole, hasAnyRole, hasAllRoles } = useAuth()

  return (
    <div>
      {hasRole('admin') && <AdminButton />}
      {hasAnyRole(['admin', 'moderator']) && <ModeratorTools />}
      {hasAllRoles(['admin', 'super_admin']) && <SuperAdminPanel />}
    </div>
  )
}
```

### Permission Checking

```tsx
import { useAuth } from '@platform/frontend-shell'

function MyComponent() {
  const { hasPermission } = useAuth()

  return (
    <div>
      {hasPermission('can_manage_users') && <UserManagement />}
      {hasPermission('can_view_billing') && <BillingLink />}
    </div>
  )
}
```

## Capabilities (Entitlements)

### Module Checking

```tsx
import { useCapabilities } from '@platform/frontend-shell'

function Navigation() {
  const { hasModule } = useCapabilities()

  return (
    <nav>
      {hasModule('dashboard_module') && <Link to="/dashboard">Dashboard</Link>}
      {hasModule('projects_module') && <Link to="/projects">Projects</Link>}
      {hasModule('billing_module') && <Link to="/billing">Billing</Link>}
    </nav>
  )
}
```

### Feature Checking

```tsx
import { useCapabilities } from '@platform/frontend-shell'

function Settings() {
  const { hasFeature } = useCapabilities()

  return (
    <div>
      {hasFeature('api_access') && <APIKeysSection />}
      {hasFeature('advanced_analytics') && <AnalyticsSection />}
    </div>
  )
}
```

### Limit Checking

```tsx
import { useCapabilities } from '@platform/frontend-shell'

function ProjectList() {
  const { getLimit } = useCapabilities()
  const projectLimit = getLimit('projects')

  return (
    <div>
      <p>Projects: {projects.length} / {projectLimit}</p>
      {projects.length >= projectLimit && (
        <p>Upgrade your plan to create more projects</p>
      )}
    </div>
  )
}
```

## Notifications

### Notification Bell

The shell includes a pre-built notification bell component in the header. It:
- Shows unread count badge
- Displays notification dropdown
- Connects to WebSocket automatically
- Handles reconnection
- Provides mark as read / clear functionality

### Using Notifications in Components

```tsx
import { useNotifications } from '@platform/frontend-shell'

function MyComponent() {
  const {
    notifications,
    unreadCount,
    connected,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAll,
  } = useNotifications()

  return (
    <div>
      <p>You have {unreadCount} unread notifications</p>
      <button onClick={markAllAsRead}>Mark all as read</button>
      {notifications.map((notification) => (
        <div key={notification.id}>
          <h4>{notification.title}</h4>
          <p>{notification.message}</p>
          <button onClick={() => markAsRead(notification.id)}>Mark read</button>
          <button onClick={() => clearNotification(notification.id)}>Clear</button>
        </div>
      ))}
    </div>
  )
}
```

## Conditional Rendering Components

### RequireRole

```tsx
<RequireRole role="admin">
  <AdminPanel />
</RequireRole>

<RequireRole role={['admin', 'moderator']} requireAll={false}>
  <ModeratorTools />
</RequireRole>

<RequireRole role="admin" fallback={<AccessDenied />}>
  <AdminPanel />
</RequireRole>
```

### RequirePermission

```tsx
<RequirePermission permission="can_manage_users">
  <UserManagement />
</RequirePermission>

<RequirePermission
  permission={['can_view_billing', 'can_manage_billing']}
  requireAll={false}
>
  <BillingSection />
</RequirePermission>
```

### RequireModule

```tsx
<RequireModule module="billing_module">
  <BillingDashboard />
</RequireModule>

<RequireModule
  module="billing_module"
  paymentRequiredMessage="Upgrade to Pro to access billing features"
>
  <BillingDashboard />
</RequireModule>
```

### RequireFeature

```tsx
<RequireFeature feature="api_access">
  <APISettings />
</RequireFeature>

<RequireFeature
  feature="advanced_analytics"
  paymentRequiredMessage="Enable advanced analytics in your plan"
>
  <AnalyticsCharts />
</RequireFeature>
```

## Role-Permission Mapping

By default, the shell maps roles to permissions:

```typescript
{
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
```

You can customize this mapping by passing `rolePermissions` to the Shell:

```tsx
<Shell
  rolePermissions={{
    custom_admin: ['custom_permission_1', 'custom_permission_2'],
    custom_user: ['custom_permission_3'],
  }}
  {...otherProps}
/>
```

## Configuration

### Required Props

```typescript
type ShellProps = {
  modules: FeatureModule[]
  keycloakConfig: {
    url: string
    realm: string
    clientId: string
  }
  apiBaseUrl: string
  websocketUrl: string
}
```

### Optional Props

```typescript
type ShellProps = {
  // ... required props
  publicRoutes?: RouteObject[]
  title?: string
  logo?: React.ComponentType
  queryClient?: QueryClient
  rolePermissions?: Record<string, string[]>
}
```

## Module Definition

```typescript
type FeatureModule = {
  id: string
  name: string
  routes: RouteObject[]
  menuItems: MenuItem[]
  requiredCapabilities: string[]
  lazy: () => Promise<{ default: React.ComponentType }>
}
```

## TypeScript Types

The shell exports all necessary types:

```typescript
import type {
  User,
  AuthContextType,
  KeycloakConfig,
  CapabilitiesResponse,
  CapabilityContextType,
  Notification,
  NotificationType,
  NotificationContextType,
  FeatureModule,
  MenuItem,
  ModuleConfig,
} from '@platform/frontend-shell'
```

## Examples

### Complete Example App

See `app-example-frontend` for a full working example demonstrating:
- Module registration
- Authentication flows
- Permission-based UI
- Entitlement-based routing
- Notification integration
- User profile management

### Example Module Registration

```tsx
const dashboardModule: FeatureModule = {
  id: 'dashboard',
  name: 'Dashboard',
  routes: [
    { path: '/dashboard', element: <Dashboard /> },
  ],
  menuItems: [
    { label: 'Dashboard', path: '/dashboard' },
  ],
  requiredCapabilities: ['dashboard_module'],
  lazy: async () => ({ default: () => <Dashboard /> }),
}

const projectsModule: FeatureModule = {
  id: 'projects',
  name: 'Projects',
  routes: [
    { path: '/projects', element: <ProjectList /> },
    { path: '/projects/new', element: <ProjectCreate /> },
    { path: '/projects/:id', element: <ProjectDetail /> },
  ],
  menuItems: [
    { label: 'Projects', path: '/projects' },
  ],
  requiredCapabilities: ['projects_module'],
  lazy: async () => ({ default: () => <ProjectList /> }),
}
```

## Benefits

### For Developers
- **3-line integration** - just import and configure
- **No boilerplate** - auth, routing, notifications all handled
- **Type-safe** - full TypeScript support
- **Consistent** - same patterns across all apps

### For Security
- **Centralized auth** - security updates in one place
- **3-axis enforcement** - always checks identity + permissions + entitlements
- **Token management** - automatic refresh handled
- **Zero trust** - capabilities validated from backend

### For Architecture
- **Portable** - easy to add to new apps
- **Maintainable** - single codebase for shell logic
- **Testable** - easy to mock contexts
- **Scalable** - module-based architecture

## Backend Integration

The shell expects these backend endpoints:

### Capabilities API

```
GET /api/capabilities/me
Authorization: Bearer {keycloak_token}

Response:
{
  "enabledModules": ["dashboard_module", "projects_module"],
  "enabledFeatures": ["api_access", "advanced_analytics"],
  "limits": {
    "projects": 10,
    "api_calls": 1000,
    "users": 5
  }
}
```

### WebSocket

```
WS /ws?token={keycloak_token}

Messages:
{
  "type": "notification",
  "payload": {
    "id": "123",
    "type": "info",
    "title": "New Project",
    "message": "Project 'Example' was created",
    "timestamp": "2025-01-18T12:00:00Z",
    "read": false,
    "actionUrl": "/projects/123"
  }
}
```

## License

MIT
