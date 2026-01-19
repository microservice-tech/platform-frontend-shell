import { Suspense, useMemo } from 'react'
import {
  RouterProvider,
  createBrowserRouter,
  type RouteObject,
} from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './contexts/AuthContext'
import { CapabilityProvider } from './contexts/CapabilityContext'
// import { useCapabilities } from './contexts/CapabilityContext' // Temporarily disabled for testing
import { NotificationProvider } from './contexts/NotificationContext'
import { PublicLayout } from './layouts/PublicLayout'
import { ProtectedLayout } from './layouts/ProtectedLayout'
import { Spinner } from './layouts/components/Spinner'
import type { HeaderLink } from './layouts/components/Header'
import type { FooterLink } from './layouts/components/Footer'
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
  headerLinks?: HeaderLink[]
  footerLinks?: FooterLink[]
  language?: string
  version?: string
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
  headerLinks,
  footerLinks,
  language,
  version,
}: {
  modules: FeatureModule[]
  publicRoutes?: RouteObject[]
  title?: string
  logo?: React.ReactNode
  headerLinks?: HeaderLink[]
  footerLinks?: FooterLink[]
  language?: string
  version?: string
}) {
  // const { hasModule } = useCapabilities()

  const enabledModules = useMemo(() => {
    // TODO: Re-enable capability filtering once capabilities API is working
    // For now, enable all modules to unblock basic auth testing
    return modules
    // return modules.filter((module) =>
    //   module.requiredCapabilities.every((cap) => hasModule(cap))
    // )
  }, [modules])

  const router = useMemo(() => {
    const protectedRoutes: RouteObject[] = enabledModules.flatMap(
      (module) => module.routes
    )

    // Wrap protected routes with ProtectedLayout
    const wrappedProtectedRoutes: RouteObject[] = protectedRoutes.map(route => {
      const { Component: RouteComponent, element: routeElement, ...rest } = route as RouteObject & { Component?: React.ComponentType; element?: React.ReactNode }

      return {
        ...rest,
        element: (
          <ProtectedLayout
            modules={modules}
            title={title}
            logo={logo}
            headerLinks={headerLinks}
            footerLinks={footerLinks}
            language={language}
            version={version}
          >
            {RouteComponent ? <RouteComponent /> : routeElement}
          </ProtectedLayout>
        ),
      }
    })

    // Wrap public routes with PublicLayout
    const wrappedPublicRoutes: RouteObject[] = (publicRoutes || []).map(route => {
      const { Component: RouteComponent, element: routeElement, ...rest } = route as RouteObject & { Component?: React.ComponentType; element?: React.ReactNode }

      return {
        ...rest,
        element: (
          <PublicLayout
            title={title}
            logo={logo}
            headerLinks={headerLinks}
            footerLinks={footerLinks}
            language={language}
            version={version}
          >
            {RouteComponent ? <RouteComponent /> : routeElement}
          </PublicLayout>
        ),
      }
    })

    return createBrowserRouter([
      ...wrappedProtectedRoutes,
      ...wrappedPublicRoutes,
    ])
  }, [enabledModules, publicRoutes, modules, title, logo, headerLinks, footerLinks, language, version])

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
  headerLinks,
  footerLinks,
  language,
  version,
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
                headerLinks={headerLinks}
                footerLinks={footerLinks}
                language={language}
                version={version}
              />
            </Suspense>
          </NotificationProvider>
        </CapabilityProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}
