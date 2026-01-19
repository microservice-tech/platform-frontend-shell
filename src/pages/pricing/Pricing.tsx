import { Alert, AlertDescription } from '../../components/ui/alert'
import { useProducts } from '../../hooks/useProducts'
import { usePolarCheckout } from '../../hooks/usePolarCheckout'
import { useCapabilities } from '../../contexts/CapabilityContext'
import { PlanCard } from './PlanCard'
import { Loader2 } from 'lucide-react'

export function Pricing() {
  const { products, loading: productsLoading, error: productsError } = useProducts()
  const { createCheckout, loading: checkoutLoading, error: checkoutError } = usePolarCheckout()
  const { enabledModules } = useCapabilities()

  const handleSelectPlan = async (productId: string) => {
    await createCheckout({
      productId,
      successUrl: `${window.location.origin}/checkout/success`,
      returnUrl: `${window.location.origin}/pricing`,
    })
  }

  // Determine current plan - This is a simplified check
  // You might want to add plan_id to the capabilities response
  const hasAnyPlan = enabledModules.length > 0

  if (productsLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading pricing plans...</span>
        </div>
      </div>
    )
  }

  if (productsError) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load pricing plans. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-16">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Choose Your Plan
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Select the perfect plan for your needs. Upgrade or downgrade at any time.
        </p>
      </div>

      {/* Error Alert */}
      {checkoutError && (
        <Alert variant="destructive" className="mb-8">
          <AlertDescription>{checkoutError}</AlertDescription>
        </Alert>
      )}

      {/* Pricing Cards */}
      {products.length === 0 ? (
        <div className="text-center text-muted-foreground">
          <p>No pricing plans available at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {products.map((product) => (
            <PlanCard
              key={product.id}
              product={product}
              onSelect={() => handleSelectPlan(product.id)}
              loading={checkoutLoading}
              currentPlan={hasAnyPlan && product.name.toLowerCase().includes('free')}
            />
          ))}
        </div>
      )}

      {/* FAQ or Additional Info */}
      <div className="mt-16 text-center text-sm text-muted-foreground">
        <p>All plans include 14-day free trial. No credit card required.</p>
        <p className="mt-2">Need help choosing? <a href="/support" className="text-primary hover:underline">Contact our team</a></p>
      </div>
    </div>
  )
}
