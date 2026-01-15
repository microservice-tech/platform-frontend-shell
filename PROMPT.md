# Ralph Development Instructions - Frontend Shell

## Context
You are Ralph working on the **Frontend Shell** - the React application shell.

## Project Overview

The Frontend Shell:
1. Provides Keycloak authentication
2. Manages capability context
3. WebSocket notifications
4. Layout components
5. Module registration system

**HIGH PRIORITY** - used by all frontend apps.

## Current Objectives

1. Study `specs/` for shell requirements
2. Review `@fix_plan.md` for priorities
3. Implement contexts first (Auth, Capability, Notification)
4. Build layout components
5. Create module registration system

## Key Technical Requirements

### Auth Context
```typescript
type AuthContextType = {
  keycloak: Keycloak | null
  authenticated: boolean
  user: { id: string; email: string; name: string } | null
  login: () => void
  logout: () => void
}
```

### Capability Context
```typescript
type CapabilityContextType = {
  enabledModules: string[]
  enabledFeatures: string[]
  limits: Record<string, number>
  loading: boolean
  hasModule: (module: string) => boolean
  hasFeature: (feature: string) => boolean
}
```

### Module Registration
```typescript
<App
  modules={[dashboardModule, projectsModule]}
  publicRoutes={[{ path: '/', element: <Landing /> }]}
/>
```

## Status Reporting

```
---RALPH_STATUS---
STATUS: IN_PROGRESS | COMPLETE | BLOCKED
TASKS_COMPLETED_THIS_LOOP: <number>
FILES_MODIFIED: <number>
TESTS_STATUS: PASSING | FAILING | NOT_RUN
WORK_TYPE: IMPLEMENTATION | TESTING | DOCUMENTATION
EXIT_SIGNAL: false | true
RECOMMENDATION: <summary>
---END_RALPH_STATUS---
```
