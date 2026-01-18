import type { ReactNode } from 'react'
import { useAuth } from '../contexts/AuthContext'

type RequireRoleProps = {
  role: string | string[]
  requireAll?: boolean
  fallback?: ReactNode
  children: ReactNode
}

export function RequireRole({
  role,
  requireAll = false,
  fallback = null,
  children,
}: RequireRoleProps) {
  const { hasRole, authenticated } = useAuth()

  if (!authenticated) return <>{fallback}</>

  const roles = Array.isArray(role) ? role : [role]
  const hasAccess = requireAll
    ? roles.every(hasRole)
    : roles.some(hasRole)

  return hasAccess ? <>{children}</> : <>{fallback}</>
}
