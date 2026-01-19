import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { Button } from './ui/button'

interface NoSubscriptionStateProps {
  title?: string
  message?: string
}

export function NoSubscriptionState({
  title = 'Get Started with a Plan',
  message = 'Choose a plan to unlock all features and start building amazing things.',
}: NoSubscriptionStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="max-w-md text-center space-y-6">
        <div className="flex justify-center">
          <div className="p-4 bg-primary/10 rounded-full">
            <Sparkles className="h-12 w-12 text-primary" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold">{title}</h2>
          <p className="text-muted-foreground">{message}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild size="lg">
            <Link to="/pricing">View Pricing Plans</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/documentation">Learn More</Link>
          </Button>
        </div>

        <p className="text-sm text-muted-foreground">
          All plans include a 14-day free trial
        </p>
      </div>
    </div>
  )
}
