# Platform Frontend Shell

React application shell with Keycloak auth, capability management, and module orchestration.

## Installation

```bash
npm install @microservice-tech/frontend-shell
```

## Usage

```tsx
import { App } from '@microservice-tech/frontend-shell'
import { dashboardModule } from './modules/dashboard'
import { projectsModule } from './modules/projects'

ReactDOM.render(
  <App
    modules={[dashboardModule, projectsModule]}
    publicRoutes={[
      { path: '/', element: <LandingPage /> },
      { path: '/pricing', element: <PricingPage /> }
    ]}
  />,
  document.getElementById('root')
)
```

## Creating a Module

```typescript
export const dashboardModule: FeatureModule = {
  id: 'dashboard',
  name: 'Dashboard',
  routes: [
    { path: '/dashboard', element: <DashboardPage /> }
  ],
  menuItems: [
    { label: 'Dashboard', path: '/dashboard', icon: HomeIcon }
  ],
  requiredCapabilities: ['dashboard_module'],
  lazy: () => import('./DashboardPage')
}
```

## Hooks

```typescript
const { authenticated, user, login, logout } = useAuth()
const { hasModule, hasFeature, limits } = useCapabilities()
const { notifications, unreadCount } = useNotifications()
```

## Environment Variables

- `VITE_KEYCLOAK_URL` - Keycloak base URL
- `VITE_KEYCLOAK_REALM` - Keycloak realm
- `VITE_KEYCLOAK_CLIENT_ID` - Frontend client ID
- `VITE_API_URL` - API gateway URL
- `VITE_WS_URL` - WebSocket URL
