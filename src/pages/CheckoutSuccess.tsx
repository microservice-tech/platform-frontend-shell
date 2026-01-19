import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { useCapabilities } from '../contexts/CapabilityContext'

export function CheckoutSuccess() {
  const { refetch } = useCapabilities()

  useEffect(() => {
    // Refetch capabilities after successful checkout
    // This will update the UI with new entitlements
    const timer = setTimeout(() => {
      refetch()
    }, 2000) // Small delay to allow webhook processing

    return () => clearTimeout(timer)
  }, [refetch])

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-3xl">Welcome to Your New Plan!</CardTitle>
            <CardDescription className="text-lg mt-2">
              Your subscription is now active and ready to use.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted p-6 rounded-lg">
              <h3 className="font-semibold mb-2">What's Next?</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Explore your new features and capabilities</li>
                <li>• Check your profile to see activated modules</li>
                <li>• Manage your subscription anytime in settings</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild className="flex-1">
                <Link to="/dashboard">Go to Dashboard</Link>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link to="/settings/profile">View Profile</Link>
              </Button>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              <p>
                Questions? <Link to="/support" className="text-primary hover:underline">Contact Support</Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
