import type { ReactNode } from 'react'
import { useCapabilities } from '../contexts/CapabilityContext'

type RequireFeatureProps = {
  feature: string | string[]
  requireAll?: boolean
  fallback?: ReactNode
  paymentRequiredMessage?: string
  children: ReactNode
}

export function RequireFeature({
  feature,
  requireAll = false,
  fallback = null,
  paymentRequiredMessage,
  children,
}: RequireFeatureProps) {
  const { hasFeature } = useCapabilities()

  const features = Array.isArray(feature) ? feature : [feature]
  const hasAccess = requireAll
    ? features.every(hasFeature)
    : features.some(hasFeature)

  if (!hasAccess && paymentRequiredMessage) {
    return (
      <div className="upgrade-required">
        <h3>Feature Not Available</h3>
        <p>{paymentRequiredMessage}</p>
        <button type="button" className="btn-primary">
          Upgrade Plan
        </button>
      </div>
    )
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>
}
