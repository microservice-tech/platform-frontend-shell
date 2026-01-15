# Frontend Shell - Fix Plan

## High Priority

- [ ] Initialize React/TypeScript project
- [ ] Implement AuthContext with Keycloak
- [ ] Implement CapabilityContext
- [ ] Implement NotificationContext with WebSocket
- [ ] Create ProtectedLayout with auth check

## Medium Priority

- [ ] Create Header component
- [ ] Create Sidebar with dynamic menu
- [ ] Create NotificationBell component
- [ ] Implement module registration system
- [ ] Create PublicLayout

## Low Priority

- [ ] Add Storybook for layout components
- [ ] Create example app showing integration
- [ ] Add theme customization
- [ ] Create NPM package build
- [ ] Write integration tests

## Completed

- [x] Project scaffolding and ralph setup

## Notes

- Auth flow: Keycloak login -> fetch capabilities -> render modules
- Only show menu items for enabled modules
- WebSocket reconnection handling important
