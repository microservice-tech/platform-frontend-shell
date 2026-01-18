import type { ReactNode } from 'react'
import { useAuth } from '../contexts/AuthContext'

type RequirePermissionProps = {
  permission: string | string[]
  requireAll?: boolean
  fallback?: ReactNode
  children: ReactNode
}

export function RequirePermission({
  permission,
  requireAll = false,
  fallback = null,
  children,
}: RequirePermissionProps) {
  const { hasPermission, authenticated } = useAuth()

  if (!authenticated) return <>{fallback}</>

  const permissions = Array.isArray(permission) ? permission : [permission]
  const hasAccess = requireAll
    ? permissions.every(hasPermission)
    : permissions.some(hasPermission)

  return hasAccess ? <>{children}</> : <>{fallback}</>
}
