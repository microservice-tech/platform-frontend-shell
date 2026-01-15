# Platform Frontend Shell

## Overview

React application shell providing layout, authentication (Keycloak), capability management, and module orchestration for all frontend applications.

## Architecture Role

```
Frontend Shell (NPM Package or Template)
         │
         ├── Auth Context (Keycloak)
         ├── Capability Context (Entitlements)
         ├── Notification Context (WebSocket)
         ├── Layout (Header, Sidebar, Footer)
         │
         └──► Feature Modules (lazy loaded)
```

## Core Responsibilities

1. **Authentication**: Keycloak integration with token management
2. **Capabilities**: Fetch and manage entitlements
3. **Notifications**: WebSocket connection for real-time updates
4. **Layout**: Header, sidebar, footer components
5. **Module Loading**: Dynamic registration and lazy loading

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

## Configuration Required

```yaml
keycloak:
  url: ""  # https://auth.example.com
  realm: ""
  client_id: ""

api:
  base_url: ""  # https://api.example.com

websocket:
  url: ""  # wss://ws.example.com/ws
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
