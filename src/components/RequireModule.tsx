import type { ReactNode } from 'react'
import { useCapabilities } from '../contexts/CapabilityContext'

type RequireModuleProps = {
  module: string | string[]
  requireAll?: boolean
  fallback?: ReactNode
  paymentRequiredMessage?: string
  children: ReactNode
}

export function RequireModule({
  module,
  requireAll = false,
  fallback = null,
  paymentRequiredMessage,
  children,
}: RequireModuleProps) {
  const { hasModule } = useCapabilities()

  const modules = Array.isArray(module) ? module : [module]
  const hasAccess = requireAll
    ? modules.every(hasModule)
    : modules.some(hasModule)

  if (!hasAccess && paymentRequiredMessage) {
    return (
      <div className="upgrade-required">
        <h3>Upgrade Required</h3>
        <p>{paymentRequiredMessage}</p>
        <button type="button" className="btn-primary">
          Upgrade Plan
        </button>
      </div>
    )
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>
}
