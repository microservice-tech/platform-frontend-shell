# Frontend Shell Authentication Enhancement Design

## Overview

This document outlines enhancements to the platform-frontend-shell to provide a complete, reusable authentication and authorization solution for all frontend applications.

**Goal**: Create a frontend equivalent of `platform-auth-go` - a library that provides complete auth with minimal configuration.

## Current State

### What Works
- ✅ Keycloak integration with `check-sso`
- ✅ Token management with auto-refresh
- ✅ Capability fetching from backend
- ✅ WebSocket notifications with reconnection
- ✅ Context providers for auth, capabilities, notifications

### What's Missing
- ⚠️ Full OIDC redirect login flow
- ⚠️ Proper logout with redirect
- ⚠️ Permission/role checking helpers
- ⚠️ Conditional rendering components
- ⚠️ Notification bell UI component
- ⚠️ Example app not using the shell library

## Three-Axis Auth in Frontend

```
┌─────────────────────────────────────────────────────────────┐
│                     Platform Frontend Shell                  │
│                                                               │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │ Keycloak    │  │ Capabilities │  │  Notifications    │  │
│  │ (Identity)  │  │ (Entitlements│  │  (WebSocket)      │  │
│  │             │  │              │  │                   │  │
│  │ - user_id   │  │ - modules    │  │ - Real-time msgs │  │
│  │ - tenant_id │  │ - features   │  │ - Unread count   │  │
│  │ - roles     │  │ - limits     │  │                   │  │
│  │ - perms     │  │              │  │                   │  │
│  └─────────────┘  └──────────────┘  └───────────────────┘  │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │         Conditional Rendering Components               │ │
│  │                                                          │ │
│  │  <RequireRole role="admin">                            │ │
│  │  <RequirePermission permission="can_manage_users">     │ │
│  │  <RequireModule module="billing_module">               │ │
│  │  <RequireFeature feature="api_access">                 │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Reusable UI Components                     │ │
│  │                                                          │ │
│  │  <NotificationBell />                                  │ │
│  │  <UserMenu />                                          │ │
│  │  <LoginButton />                                       │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Enhancement 1: AuthContext - Full OIDC Flows

### Login Flow

**Current**: Uses `check-sso` which silently checks auth
**Needed**: Full redirect-based login

```typescript
// Add to AuthContext
const login = useCallback(() => {
  keycloak?.login({
    redirectUri: window.location.origin,
  })
}, [keycloak])
```

### Logout Flow

**Current**: No proper logout
**Needed**: Logout with redirect to Keycloak

```typescript
// Add to AuthContext
const logout = useCallback(() => {
  keycloak?.logout({
    redirectUri: window.location.origin,
  })
}, [keycloak])
```

### Permission/Role Helpers

**Current**: Roles extracted but no helper methods
**Needed**: Easy checking methods

```typescript
// Add to AuthContext
const hasRole = useCallback(
  (role: string) => user?.roles?.includes(role) ?? false,
  [user?.roles]
)

const hasPermission = useCallback(
  (permission: string) => {
    if (!user?.roles) return false
    // Map roles to permissions
    const rolePermissions = getRolePermissions(user.roles)
    return rolePermissions.includes(permission)
  },
  [user?.roles]
)

const hasAnyRole = useCallback(
  (roles: string[]) => roles.some(hasRole),
  [hasRole]
)

const hasAllRoles = useCallback(
  (roles: string[]) => roles.every(hasRole),
  [hasRole]
)
```

### Role-Permission Mapping

```typescript
// Default permission mapping (can be overridden)
const DEFAULT_ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: [
    'can_manage_users',
    'can_manage_projects',
    'can_view_billing',
    'can_manage_settings',
  ],
  user: [
    'can_view_own_data',
    'can_create_projects',
  ],
  viewer: [
    'can_view_own_data',
  ],
}
```

## Enhancement 2: Conditional Rendering Components

### RequireRole Component

```typescript
type RequireRoleProps = {
  role: string | string[]
  requireAll?: boolean
  fallback?: ReactNode
  children: ReactNode
}

export function RequireRole({
  role,
  requireAll = false,
  fallback = null,
  children,
}: RequireRoleProps) {
  const { user, authenticated } = useAuth()

  if (!authenticated) return <>{fallback}</>

  const roles = Array.isArray(role) ? role : [role]
  const hasAccess = requireAll
    ? roles.every((r) => user?.roles?.includes(r))
    : roles.some((r) => user?.roles?.includes(r))

  return hasAccess ? <>{children}</> : <>{fallback}</>
}
```

**Usage**:
```tsx
<RequireRole role="admin">
  <AdminPanel />
</RequireRole>

<RequireRole role={['admin', 'moderator']}>
  <ModeratorTools />
</RequireRole>
```

### RequirePermission Component

```typescript
type RequirePermissionProps = {
  permission: string | string[]
  requireAll?: boolean
  fallback?: ReactNode
  children: ReactNode
}

export function RequirePermission({
  permission,
  requireAll = false,
  fallback = null,
  children,
}: RequirePermissionProps) {
  const { hasPermission, authenticated } = useAuth()

  if (!authenticated) return <>{fallback}</>

  const permissions = Array.isArray(permission) ? permission : [permission]
  const hasAccess = requireAll
    ? permissions.every(hasPermission)
    : permissions.some(hasPermission)

  return hasAccess ? <>{children}</> : <>{fallback}</>
}
```

**Usage**:
```tsx
<RequirePermission permission="can_manage_users">
  <UserManagement />
</RequirePermission>
```

### RequireModule Component

```typescript
type RequireModuleProps = {
  module: string | string[]
  requireAll?: boolean
  fallback?: ReactNode
  paymentRequiredMessage?: string
  children: ReactNode
}

export function RequireModule({
  module,
  requireAll = false,
  fallback = null,
  paymentRequiredMessage,
  children,
}: RequireModuleProps) {
  const { hasModule } = useCapabilities()

  const modules = Array.isArray(module) ? module : [module]
  const hasAccess = requireAll
    ? modules.every(hasModule)
    : modules.some(hasModule)

  if (!hasAccess && paymentRequiredMessage) {
    return (
      <div className="upgrade-required">
        <h3>Upgrade Required</h3>
        <p>{paymentRequiredMessage}</p>
        <button className="btn-primary">Upgrade Plan</button>
      </div>
    )
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>
}
```

**Usage**:
```tsx
<RequireModule
  module="billing_module"
  paymentRequiredMessage="Upgrade to Pro to access billing features"
>
  <BillingDashboard />
</RequireModule>
```

### RequireFeature Component

```typescript
type RequireFeatureProps = {
  feature: string | string[]
  requireAll?: boolean
  fallback?: ReactNode
  paymentRequiredMessage?: string
  children: ReactNode
}

export function RequireFeature({
  feature,
  requireAll = false,
  fallback = null,
  paymentRequiredMessage,
  children,
}: RequireFeatureProps) {
  const { hasFeature } = useCapabilities()

  const features = Array.isArray(feature) ? feature : [feature]
  const hasAccess = requireAll
    ? features.every(hasFeature)
    : features.some(hasFeature)

  if (!hasAccess && paymentRequiredMessage) {
    return (
      <div className="upgrade-required">
        <h3>Feature Not Available</h3>
        <p>{paymentRequiredMessage}</p>
        <button className="btn-primary">Upgrade Plan</button>
      </div>
    )
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>
}
```

## Enhancement 3: NotificationBell Component

### Component Design

```typescript
export function NotificationBell() {
  const { notifications, unreadCount, connected, markAllAsRead } = useNotifications()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="notification-bell">
      <button
        className="bell-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Notifications (${unreadCount} unread)`}
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span className="badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
        {!connected && <span className="offline-indicator" />}
      </button>

      {isOpen && (
        <NotificationDropdown
          notifications={notifications}
          onClose={() => setIsOpen(false)}
          onMarkAllRead={markAllAsRead}
        />
      )}
    </div>
  )
}
```

### Features
- Badge with unread count
- Dropdown with notification list
- Mark as read / mark all as read
- Offline indicator when WebSocket disconnected
- Auto-close on outside click
- Keyboard navigation (Escape to close)

## Enhancement 4: Type Updates

### User Type Enhancement

```typescript
export type User = {
  id: string
  email: string
  name: string
  roles?: string[]
  permissions?: string[]  // Derived from roles
  tenantId?: string
  avatar?: string
}
```

### AuthContext Type Enhancement

```typescript
export type AuthContextType = {
  // Existing
  keycloak: Keycloak | null
  authenticated: boolean
  user: User | null
  token: string | undefined
  loading: boolean

  // New
  login: () => void
  logout: () => void
  hasRole: (role: string) => boolean
  hasPermission: (permission: string) => boolean
  hasAnyRole: (roles: string[]) => boolean
  hasAllRoles: (roles: string[]) => boolean
}
```

## Enhancement 5: Example App Integration

### Replace Custom Shell

**Before** (app-example-frontend/src/components/Shell.tsx):
```typescript
// Custom implementation with mock data
const mockUser = { ... }
```

**After** (app-example-frontend/src/App.tsx):
```typescript
import { Shell } from '@microservice-tech/frontend-shell'

export function App() {
  return (
    <Shell
      modules={modules}
      publicRoutes={publicRoutes}
      keycloakConfig={config.keycloak}
      apiBaseUrl={config.api.baseUrl}
      websocketUrl={config.websocket.url}
      title="Example App"
    />
  )
}
```

### Update Profile Page to Use User Service API

```typescript
// Instead of mock data
const { user } = useAuth()
const { data: profile, isLoading } = useQuery({
  queryKey: ['user', 'me'],
  queryFn: () => fetch('/api/users/me').then(r => r.json()),
})

const updateProfile = useMutation({
  mutationFn: (data) => fetch('/api/users/me', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
})
```

## Implementation Order

1. ✅ **Analyze current state** (DONE)
2. 🔄 **Design enhancements** (THIS DOCUMENT)
3. ⏳ **Enhance AuthContext** with login/logout/permission helpers
4. ⏳ **Create conditional components** (RequireRole, RequirePermission, RequireModule, RequireFeature)
5. ⏳ **Create NotificationBell component**
6. ⏳ **Update types** for User and AuthContext
7. ⏳ **Update example app** to use shell instead of custom implementation
8. ⏳ **Connect Profile page** to user service API
9. ⏳ **Test end-to-end** authentication flow
10. ⏳ **Document** in README and CLAUDE.md

## Success Criteria

- [ ] User can click "Login" and redirect to Keycloak
- [ ] User can logout and redirect back
- [ ] UI elements show/hide based on roles
- [ ] UI elements show/hide based on permissions
- [ ] UI elements show/hide based on modules/features
- [ ] Notification bell shows unread count
- [ ] Notification bell dropdown works
- [ ] Profile page loads real user data
- [ ] Profile page saves changes to user service
- [ ] Example app uses shell library (no mock data)
- [ ] All tests pass

## File Changes Required

### platform-frontend-shell/
- `src/contexts/AuthContext.tsx` - Add login/logout/permission helpers
- `src/types/index.ts` - Update User and AuthContext types
- `src/components/RequireRole.tsx` - NEW
- `src/components/RequirePermission.tsx` - NEW
- `src/components/RequireModule.tsx` - NEW
- `src/components/RequireFeature.tsx` - NEW
- `src/components/NotificationBell.tsx` - NEW
- `src/components/NotificationBell.css` - NEW
- `src/index.ts` - Export new components
- `README.md` - Document usage
- `CLAUDE.md` - Update with new features

### app-example-frontend/
- `src/components/Shell.tsx` - DELETE (replace with shell library)
- `src/App.tsx` - Use Shell from platform-frontend-shell
- `src/modules/settings/pages/Profile.tsx` - Connect to API
- `src/services/user.service.ts` - NEW (user API calls)
- `CLAUDE.md` - Update to reflect shell usage

## Design Decisions

### Why Full OIDC Redirect Instead of Check-SSO?

**Check-SSO** (`onLoad: 'check-sso'`):
- Silently checks if user is logged in
- Good for optional authentication
- No interruption if not authenticated

**Login Redirect** (`onLoad: 'login-required'`):
- Forces login if not authenticated
- Clear user action (click "Login" button)
- Better UX for protected apps

**Decision**: Use BOTH
- Public routes: check-sso
- Protected routes: Require authentication, offer login button

### Why Separate Permission and Role Components?

**Roles**: Identity labels (admin, user, viewer)
**Permissions**: Action capabilities (can_manage_users, can_view_billing)

**Benefits**:
1. **Flexibility**: Change role permissions without changing components
2. **Clarity**: `<RequirePermission>` is more explicit than `<RequireRole>`
3. **Reusability**: Same permission can be granted to multiple roles

### Why Include Payment Required Messages?

**Consistency with Backend**: Backend returns 402 Payment Required
**Better UX**: User knows why they can't access feature and how to fix it
**Conversion**: Direct call-to-action to upgrade

## Testing Strategy

### Unit Tests
- RequireRole with single/multiple roles
- RequirePermission with permissions
- RequireModule with enabled/disabled modules
- NotificationBell rendering and interactions

### Integration Tests
- Full login flow (Keycloak redirect)
- Logout flow
- Profile page CRUD operations
- Notification bell with real WebSocket

### E2E Tests (Playwright)
- User logs in via Keycloak
- User sees only modules they have access to
- User can update profile
- Notification bell shows real notifications
- User logs out successfully
