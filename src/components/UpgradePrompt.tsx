import { Link } from 'react-router-dom'
import { Lock, ArrowRight } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'

interface UpgradePromptProps {
  title?: string
  message?: string
  featureName?: string
  variant?: 'card' | 'inline' | 'banner'
}

export function UpgradePrompt({
  title = 'Upgrade Required',
  message,
  featureName = 'this feature',
  variant = 'card',
}: UpgradePromptProps) {
  const defaultMessage = `Upgrade your plan to access ${featureName} and unlock more capabilities.`

  if (variant === 'inline') {
    return (
      <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg border border-border">
        <Lock className="h-5 w-5 text-muted-foreground shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium">{title}</p>
          <p className="text-sm text-muted-foreground">{message || defaultMessage}</p>
        </div>
        <Button asChild size="sm">
          <Link to="/pricing">
            Upgrade
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    )
  }

  if (variant === 'banner') {
    return (
      <div className="bg-primary/10 border-l-4 border-primary p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Lock className="h-5 w-5 text-primary shrink-0" />
          <div>
            <p className="font-medium text-primary">{title}</p>
            <p className="text-sm text-muted-foreground">{message || defaultMessage}</p>
          </div>
        </div>
        <Button asChild variant="default" size="sm">
          <Link to="/pricing">View Plans</Link>
        </Button>
      </div>
    )
  }

  // Card variant (default)
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{message || defaultMessage}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button asChild className="flex-1">
            <Link to="/pricing">
              View Pricing Plans
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="flex-1">
            <Link to="/support">Contact Sales</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
