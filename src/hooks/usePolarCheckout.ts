import { useCallback, useEffect, useState } from 'react'
import { PolarEmbedCheckout } from '@polar-sh/checkout/embed'
import { useAuth } from '../contexts/AuthContext'
import { config } from '../config'

export interface CreateCheckoutOptions {
  productId: string
  successUrl?: string
  returnUrl?: string
  embedOrigin?: string
}

export function usePolarCheckout() {
  const { token } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Initialize Polar checkout on mount
    PolarEmbedCheckout.init()
  }, [])

  const createCheckout = useCallback(
    async (options: CreateCheckoutOptions) => {
      if (!token) {
        setError('Not authenticated')
        return
      }

      setLoading(true)
      setError(null)

      try {
        // Default URLs
        const successUrl = options.successUrl || `${window.location.origin}/checkout/success`
        const returnUrl = options.returnUrl || `${window.location.origin}/pricing`
        const embedOrigin = options.embedOrigin || window.location.origin

        // Call backend to create checkout session
        const response = await fetch(`${config.api.baseUrl}/api/checkout/create`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            product_id: options.productId,
            success_url: successUrl,
            return_url: returnUrl,
            embed_origin: embedOrigin,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.message || 'Failed to create checkout')
        }

        const { checkout_url } = await response.json()

        // Open embedded checkout
        const checkout = await PolarEmbedCheckout.create(checkout_url, 'light')

        // Handle events using addEventListener
        checkout.addEventListener('success', () => {
          console.log('Checkout successful!')
          setLoading(false)
          // Redirect to success page
          window.location.href = successUrl
        })

        checkout.addEventListener('close', () => {
          setLoading(false)
        })

        checkout.addEventListener('confirmed', () => {
          console.log('Payment confirmed, processing...')
        })
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Checkout failed'
        console.error('Checkout failed:', err)
        setError(errorMessage)
        setLoading(false)
      }
    },
    [token]
  )

  return { createCheckout, loading, error }
}
