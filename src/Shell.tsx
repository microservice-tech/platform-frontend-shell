import { Suspense, useMemo } from 'react'
import {
  RouterProvider,
  createBrowserRouter,
  type RouteObject,
} from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './contexts/AuthContext'
import { CapabilityProvider, useCapabilities } from './contexts/CapabilityContext'
import { NotificationProvider } from './contexts/NotificationContext'
import { PublicLayout } from './layouts/PublicLayout'
import { ProtectedLayout } from './layouts/ProtectedLayout'
import { Spinner } from './layouts/components/Spinner'
import type { FeatureModule, KeycloakConfig } from './types'

type ShellProps = {
  modules: FeatureModule[]
  publicRoutes?: RouteObject[]
  keycloakConfig?: KeycloakConfig
  apiBaseUrl?: string
  websocketUrl?: string
  title?: string
  logo?: React.ReactNode
  queryClient?: QueryClient
}

const defaultQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 2,
    },
  },
})

function ModuleRoutes({
  modules,
  publicRoutes,
  title,
  logo,
}: {
  modules: FeatureModule[]
  publicRoutes?: RouteObject[]
  title?: string
  logo?: React.ReactNode
}) {
  const { hasModule } = useCapabilities()

  const enabledModules = useMemo(() => {
    return modules.filter((module) =>
      module.requiredCapabilities.every((cap) => hasModule(cap))
    )
  }, [modules, hasModule])

  const router = useMemo(() => {
    const protectedRoutes: RouteObject[] = enabledModules.flatMap(
      (module) => module.routes
    )

    return createBrowserRouter([
      {
        path: '/',
        element: <PublicLayout title={title} logo={logo} />,
        children: publicRoutes || [],
      },
      {
        path: '/app',
        element: <ProtectedLayout modules={modules} title={title} logo={logo} />,
        children: protectedRoutes,
      },
    ])
  }, [enabledModules, publicRoutes, modules, title, logo])

  return <RouterProvider router={router} />
}

export function Shell({
  modules,
  publicRoutes,
  keycloakConfig,
  apiBaseUrl,
  websocketUrl,
  title = 'Platform',
  logo,
  queryClient = defaultQueryClient,
}: ShellProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider keycloakConfig={keycloakConfig}>
        <CapabilityProvider apiBaseUrl={apiBaseUrl}>
          <NotificationProvider websocketUrl={websocketUrl}>
            <Suspense fallback={<Spinner size="lg" message="Loading module..." />}>
              <ModuleRoutes
                modules={modules}
                publicRoutes={publicRoutes}
                title={title}
                logo={logo}
              />
            </Suspense>
          </NotificationProvider>
        </CapabilityProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}
