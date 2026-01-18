# Platform Frontend Shell

## Overview

Reusable React shell providing authentication, authorization, capabilities management, and real-time notifications for all platform frontend applications.

**Frontend equivalent of `platform-auth-go`** - provides complete auth and UI infrastructure with minimal configuration.

## Architecture Role

```
Platform Frontend Shell (Reusable Library)
         │
         ├── Auth Context (Keycloak OIDC)
         │   ├── Login/Logout flows
         │   ├── Token management
         │   ├── Role checking
         │   └── Permission mapping
         │
         ├── Capability Context (Entitlements)
         │   ├── Module checking
         │   ├── Feature checking
         │   └── Limit checking
         │
         ├── Notification Context (WebSocket)
         │   ├── Real-time connection
         │   ├── Auto-reconnect
         │   └── Notification management
         │
         ├── Conditional Components
         │   ├── RequireRole
         │   ├── RequirePermission
         │   ├── RequireModule
         │   └── RequireFeature
         │
         └──► Feature Modules (lazy loaded)
```

## Core Responsibilities

1. **Authentication**: Full Keycloak OIDC with login/logout redirects
2. **Authorization**: 3-axis checking (identity + permissions + entitlements)
3. **Capabilities**: Fetch and manage tenant entitlements
4. **Notifications**: WebSocket connection for real-time updates
5. **Layout**: Header, sidebar, footer, notification bell components
6. **Module Loading**: Dynamic registration and lazy loading
7. **Conditional Rendering**: Show/hide UI based on roles/permissions/entitlements

## Technology Stack

- **Framework**: React 18+
- **Language**: TypeScript
- **Routing**: React Router 6+
- **Auth**: keycloak-js
- **State**: React Context or Zustand
- **Data**: TanStack Query

## Shell Structure

```
src/
├── layouts/
│   ├── PublicLayout.tsx
│   ├── ProtectedLayout.tsx
│   └── components/
│       ├── Header.tsx
│       ├── Sidebar.tsx
│       └── NotificationBell.tsx
├── contexts/
│   ├── AuthContext.tsx
│   ├── CapabilityContext.tsx
│   └── NotificationContext.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useCapabilities.ts
│   └── useNotifications.ts
└── types/
    └── Module.ts
```

## Three-Axis Authorization

```
Access Granted = Permission AND Entitlement
```

### Axis 1: Identity (Keycloak)
- **Question**: "Who are you?"
- **Answers**: `user_id`, `email`, `name`, `tenant_id`, `roles`
- **Source**: Keycloak JWT token

### Axis 2: Permissions (Roles)
- **Question**: "What actions can you perform?"
- **Answers**: Roles mapped to permissions (e.g., `admin` → `can_manage_users`)
- **Enforcement**: `RequireRole()`, `RequirePermission()`, `hasRole()`, `hasPermission()`

### Axis 3: Entitlements (Subscriptions)
- **Question**: "What did your tenant pay for?"
- **Answers**: `enabled_modules`, `enabled_features`, `limits`
- **Source**: Capabilities API (`/api/capabilities/me`)
- **Enforcement**: `RequireModule()`, `RequireFeature()`, `hasModule()`, `hasFeature()`

## Configuration Required

```yaml
keycloak:
  url: "https://auth.example.com"
  realm: "microservice-tech"
  client_id: "your-frontend-app"

api:
  base_url: "https://api.example.com"

websocket:
  url: "wss://api.example.com/ws"
```

## Module Contract

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

## Authentication Implementation

### Login Flow

```typescript
import { useAuth } from '@platform/frontend-shell'

function LoginButton() {
  const { login, authenticated } = useAuth()

  if (authenticated) return null

  return <button onClick={login}>Login with Keycloak</button>
}
```

The `login()` method redirects to Keycloak's login page and returns to your app after authentication.

### Logout Flow

```typescript
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

The `logout()` method clears the session and redirects to Keycloak's logout endpoint.

### Role and Permission Checking

```typescript
import { useAuth } from '@platform/frontend-shell'

function MyComponent() {
  const { hasRole, hasPermission, hasAnyRole, hasAllRoles } = useAuth()

  return (
    <div>
      {/* Check single role */}
      {hasRole('admin') && <AdminButton />}

      {/* Check any of multiple roles */}
      {hasAnyRole(['admin', 'moderator']) && <ModeratorTools />}

      {/* Check all roles required */}
      {hasAllRoles(['admin', 'super_admin']) && <SuperAdminPanel />}

      {/* Check permission */}
      {hasPermission('can_manage_users') && <UserManagement />}
    </div>
  )
}
```

## Conditional Rendering Components

### RequireRole

```typescript
import { RequireRole } from '@platform/frontend-shell'

// Single role
<RequireRole role="admin">
  <AdminPanel />
</RequireRole>

// Any of multiple roles
<RequireRole role={['admin', 'moderator']}>
  <ModeratorTools />
</RequireRole>

// All roles required
<RequireRole role={['admin', 'super_admin']} requireAll>
  <SuperAdminPanel />
</RequireRole>

// With fallback
<RequireRole role="admin" fallback={<AccessDenied />}>
  <AdminPanel />
</RequireRole>
```

### RequirePermission

```typescript
import { RequirePermission } from '@platform/frontend-shell'

<RequirePermission permission="can_manage_users">
  <UserManagement />
</RequirePermission>

<RequirePermission permission={['can_view_billing', 'can_manage_billing']}>
  <BillingSection />
</RequirePermission>
```

### RequireModule

```typescript
import { RequireModule } from '@platform/frontend-shell'

<RequireModule module="billing_module">
  <BillingDashboard />
</RequireModule>

// With upgrade message
<RequireModule
  module="billing_module"
  paymentRequiredMessage="Upgrade to Pro to access billing features"
>
  <BillingDashboard />
</RequireModule>
```

### RequireFeature

```typescript
import { RequireFeature } from '@platform/frontend-shell'

<RequireFeature feature="api_access">
  <APISettings />
</RequireFeature>

// With upgrade message
<RequireFeature
  feature="advanced_analytics"
  paymentRequiredMessage="Enable advanced analytics in your plan"
>
  <AnalyticsCharts />
</RequireFeature>
```

## Role-Permission Mapping

Default mapping:

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

Custom mapping (pass to Shell component):

```typescript
<Shell
  rolePermissions={{
    custom_admin: ['permission_1', 'permission_2'],
  }}
  {...otherProps}
/>
```

## Notifications

### Using the Notification Bell

The shell includes a pre-built notification bell in the header that:
- Shows unread count badge
- Displays dropdown with notifications
- Connects to WebSocket automatically
- Handles reconnection
- Provides mark as read / clear functionality

### Using Notifications in Components

```typescript
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
      {notifications.map((notification) => (
        <div key={notification.id}>
          <h4>{notification.title}</h4>
          <p>{notification.message}</p>
          <button onClick={() => markAsRead(notification.id)}>Mark read</button>
        </div>
      ))}
    </div>
  )
}
```

## Integration Example

```typescript
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

export function App() {
  return (
    <Shell
      modules={[dashboardModule]}
      publicRoutes={[{ path: '/', element: <Landing /> }]}
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
