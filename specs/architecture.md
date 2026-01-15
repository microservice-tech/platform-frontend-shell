# Frontend Shell - Architecture

## Auth Flow

```
1. User visits app
2. App initializes Keycloak
3. If not authenticated -> redirect to Keycloak login
4. Keycloak redirects back with token
5. App stores token
6. App fetches capabilities: GET /api/capabilities/me
7. App builds navigation based on capabilities
8. App lazy-loads enabled modules
```

## Context Hierarchy

```tsx
<AuthProvider>
  <CapabilityProvider>
    <NotificationProvider>
      <Router>
        <Routes />
      </Router>
    </NotificationProvider>
  </CapabilityProvider>
</AuthProvider>
```

## Module Contract

```typescript
type FeatureModule = {
  id: string              // Unique identifier
  name: string            // Display name
  routes: RouteObject[]   // React Router routes
  menuItems: MenuItem[]   // Sidebar menu items
  requiredCapabilities: string[]  // Required modules
  lazy: () => Promise<{ default: React.ComponentType }>
}

type MenuItem = {
  label: string
  path: string
  icon?: React.ComponentType
  requiredCapabilities?: string[]
}
```

## Protected Layout Flow

```tsx
function ProtectedLayout({ modules }) {
  const { authenticated } = useAuth()
  const { loading, hasModule } = useCapabilities()

  if (!authenticated) return <Navigate to="/login" />
  if (loading) return <Spinner />

  const enabledModules = modules.filter(m =>
    m.requiredCapabilities.every(hasModule)
  )

  return (
    <div>
      <Header />
      <Sidebar modules={enabledModules} />
      <main><Outlet /></main>
    </div>
  )
}
```
