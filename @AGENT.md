# Frontend Shell - Agent Build Instructions

## Project Setup

```bash
npm create vite@latest . -- --template react-ts
npm install keycloak-js react-router-dom @tanstack/react-query
npm install @microservice-tech/design-tokens @microservice-tech/ui-library
```

## Running Tests

```bash
npm test
```

## Development Server

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Environment Variables

```bash
VITE_KEYCLOAK_URL=https://auth.example.com
VITE_KEYCLOAK_REALM=master
VITE_KEYCLOAK_CLIENT_ID=saas-frontend
VITE_API_URL=https://api.example.com
VITE_WS_URL=wss://ws.example.com/ws
```

## Package Structure

```
platform-frontend-shell/
├── src/
│   ├── App.tsx
│   ├── contexts/
│   ├── hooks/
│   ├── layouts/
│   └── types/
├── public/
├── package.json
└── vite.config.ts
```

## Publishing as NPM Package

```json
{
  "name": "@microservice-tech/frontend-shell",
  "main": "dist/index.js",
  "peerDependencies": {
    "react": "^18.0.0",
    "keycloak-js": "^23.0.0"
  }
}
```
