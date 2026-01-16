# Frontend Shell - Fix Plan

## High Priority

- [x] Initialize React/TypeScript project
- [x] Implement AuthContext with Keycloak
- [x] Implement CapabilityContext
- [x] Implement NotificationContext with WebSocket
- [x] Create ProtectedLayout with auth check

## Medium Priority

- [x] Create Header component
- [x] Create Sidebar with dynamic menu
- [x] Create NotificationBell component
- [x] Implement module registration system
- [x] Create PublicLayout

## Low Priority

- [ ] Add Storybook for layout components
- [x] Create example app showing integration
- [ ] Add theme customization
- [x] Create NPM package build (vite.config.ts)
- [x] Write integration tests (Playwright)

## Completed

- [x] Project scaffolding and ralph setup
- [x] All contexts (Auth, Capability, Notification)
- [x] All layout components (Header, Sidebar, NotificationBell)
- [x] Shell component with module orchestration
- [x] GitHub CI/CD workflow
- [x] Semantic release configuration

## Next Steps

- [ ] Run `npm install` to install dependencies
- [ ] Run `npm run build` to verify build
- [ ] Run `npm run dev` to test locally
- [ ] Configure Keycloak settings in .env
- [ ] Push changes and verify GitHub Actions

## Notes

- Auth flow: Keycloak login -> fetch capabilities -> render modules
- Only show menu items for enabled modules
- WebSocket reconnection handling important
