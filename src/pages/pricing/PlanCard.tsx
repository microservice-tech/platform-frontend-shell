import { Check } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card'
import type { Product } from '../../hooks/useProducts'

interface PlanCardProps {
  product: Product
  onSelect: () => void
  loading: boolean
  currentPlan?: boolean
}

export function PlanCard({ product, onSelect, loading, currentPlan }: PlanCardProps) {
  const formatPrice = () => {
    const amount = product.price.amount / 100 // Convert cents to dollars
    const interval = product.price.recurring_interval || ''

    if (product.price.type === 'recurring' && interval) {
      return (
        <>
          <span className="text-4xl font-bold">${amount}</span>
          <span className="text-muted-foreground">/{interval}</span>
        </>
      )
    }

    return <span className="text-4xl font-bold">${amount}</span>
  }

  return (
    <Card className={currentPlan ? 'border-primary border-2' : ''}>
      <CardHeader>
        {currentPlan && (
          <div className="text-xs font-semibold text-primary mb-2">CURRENT PLAN</div>
        )}
        <CardTitle className="text-2xl">{product.name}</CardTitle>
        <CardDescription>{product.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-baseline gap-1">
          {formatPrice()}
        </div>

        <div className="space-y-3">
          {product.benefits && product.benefits.length > 0 && (
            <>
              <div className="text-sm font-medium">What's included:</div>
              <ul className="space-y-2">
                {product.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          onClick={onSelect}
          disabled={loading || currentPlan}
          variant={currentPlan ? 'outline' : 'default'}
        >
          {currentPlan ? 'Current Plan' : 'Select Plan'}
        </Button>
      </CardFooter>
    </Card>
  )
}
