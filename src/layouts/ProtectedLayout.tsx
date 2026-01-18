import { useState, useMemo, useEffect } from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCapabilities } from '../contexts/CapabilityContext'
import { Header, type HeaderLink } from './components/Header'
import { Sidebar } from './components/Sidebar'
import { Spinner } from './components/Spinner'
import { Footer, type FooterLink } from './components/Footer'
import type { FeatureModule } from '../types'

type ProtectedLayoutProps = {
  modules: FeatureModule[]
  title?: string
  logo?: React.ReactNode
  loginPath?: string
  headerLinks?: HeaderLink[]
  footerLinks?: FooterLink[]
  language?: string
  version?: string
  children?: React.ReactNode
}

export function ProtectedLayout({
  modules,
  title,
  logo,
  loginPath = '/',
  headerLinks,
  footerLinks,
  language,
  version,
  children,
}: ProtectedLayoutProps) {
  const { authenticated, loading: authLoading } = useAuth()
  const { loading: capLoading, hasModule } = useCapabilities()

  // Initialize sidebar state from localStorage
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed')
    return saved !== null ? JSON.parse(saved) : false
  })

  // Save sidebar state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', JSON.stringify(sidebarCollapsed))
  }, [sidebarCollapsed])

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
      <Header title={title} logo={logo} utilityLinks={headerLinks} />
      <div className="shell-layout-body">
        <Sidebar
          modules={enabledModules}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <main className="shell-main">
          {children || <Outlet />}
        </main>
      </div>
      <Footer links={footerLinks} language={language} version={version} />
    </div>
  )
}
