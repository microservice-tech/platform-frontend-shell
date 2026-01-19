import type { ReactNode } from 'react'
import { useCapabilities } from '../contexts/CapabilityContext'
import { UpgradePrompt } from './UpgradePrompt'

type RequireFeatureProps = {
  feature: string | string[]
  requireAll?: boolean
  fallback?: ReactNode
  paymentRequiredMessage?: string
  showUpgradePrompt?: boolean
  upgradePromptVariant?: 'card' | 'inline' | 'banner'
  children: ReactNode
}

export function RequireFeature({
  feature,
  requireAll = false,
  fallback = null,
  paymentRequiredMessage,
  showUpgradePrompt = true,
  upgradePromptVariant = 'inline',
  children,
}: RequireFeatureProps) {
  const { hasFeature } = useCapabilities()

  const features = Array.isArray(feature) ? feature : [feature]
  const hasAccess = requireAll
    ? features.every(hasFeature)
    : features.some(hasFeature)

  if (!hasAccess) {
    // If custom fallback is provided, use it
    if (fallback !== null) {
      return <>{fallback}</>
    }

    // Show upgrade prompt if enabled
    if (showUpgradePrompt) {
      const featureName = Array.isArray(feature) ? feature.join(', ') : feature
      return (
        <UpgradePrompt
          title="Feature Not Available"
          message={paymentRequiredMessage || `This feature requires ${featureName}. Upgrade your plan to access it.`}
          featureName={featureName}
          variant={upgradePromptVariant}
        />
      )
    }

    // Default: hide the content
    return null
  }

  return <>{children}</>
}
