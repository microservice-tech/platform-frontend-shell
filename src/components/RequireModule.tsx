import type { ReactNode } from 'react'
import { useCapabilities } from '../contexts/CapabilityContext'
import { UpgradePrompt } from './UpgradePrompt'

type RequireModuleProps = {
  module: string | string[]
  requireAll?: boolean
  fallback?: ReactNode
  paymentRequiredMessage?: string
  showUpgradePrompt?: boolean
  upgradePromptVariant?: 'card' | 'inline' | 'banner'
  children: ReactNode
}

export function RequireModule({
  module,
  requireAll = false,
  fallback = null,
  paymentRequiredMessage,
  showUpgradePrompt = true,
  upgradePromptVariant = 'inline',
  children,
}: RequireModuleProps) {
  const { hasModule } = useCapabilities()

  const modules = Array.isArray(module) ? module : [module]
  const hasAccess = requireAll
    ? modules.every(hasModule)
    : modules.some(hasModule)

  if (!hasAccess) {
    // If custom fallback is provided, use it
    if (fallback !== null) {
      return <>{fallback}</>
    }

    // Show upgrade prompt if enabled
    if (showUpgradePrompt) {
      const moduleName = Array.isArray(module) ? module.join(', ') : module
      return (
        <UpgradePrompt
          title="Module Not Enabled"
          message={paymentRequiredMessage || `This feature requires the ${moduleName} module. Upgrade your plan to access it.`}
          featureName={moduleName}
          variant={upgradePromptVariant}
        />
      )
    }

    // Default: hide the content
    return null
  }

  return <>{children}</>
}
