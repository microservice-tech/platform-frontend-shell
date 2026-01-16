import { useState, useMemo } from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCapabilities } from '../contexts/CapabilityContext'
import { Header } from './components/Header'
import { Sidebar } from './components/Sidebar'
import { Spinner } from './components/Spinner'
import type { FeatureModule } from '../types'

type ProtectedLayoutProps = {
  modules: FeatureModule[]
  title?: string
  logo?: React.ReactNode
  loginPath?: string
}

export function ProtectedLayout({
  modules,
  title,
  logo,
  loginPath = '/login',
}: ProtectedLayoutProps) {
  const { authenticated, loading: authLoading } = useAuth()
  const { loading: capLoading, hasModule } = useCapabilities()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const enabledModules = useMemo(() => {
    return modules.filter((module) =>
      module.requiredCapabilities.every((cap) => hasModule(cap))
    )
  }, [modules, hasModule])

  if (authLoading || capLoading) {
    return (
      <div className="shell-layout shell-layout-loading">
        <Spinner size="lg" message="Loading..." />
      </div>
    )
  }

  if (!authenticated) {
    return <Navigate to={loginPath} replace />
  }

  return (
    <div className="shell-layout shell-layout-protected">
      <Header title={title} logo={logo} />
      <div className="shell-layout-body">
        <Sidebar
          modules={enabledModules}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <main className="shell-main">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
