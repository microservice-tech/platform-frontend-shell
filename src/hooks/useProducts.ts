import { useQuery } from '@tanstack/react-query'
import { config } from '../config'

export interface PriceInfo {
  amount: number
  currency: string
  type: string
  recurring_interval?: string
}

export interface Product {
  id: string
  name: string
  description: string
  price: PriceInfo
  benefits: string[]
}

interface ProductsResponse {
  products: Product[]
}

async function fetchProducts(): Promise<ProductsResponse> {
  const response = await fetch(`${config.api.baseUrl}/api/checkout/products`)

  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.statusText}`)
  }

  return response.json()
}

export function useProducts() {
  const { data, isLoading, error } = useQuery<ProductsResponse, Error>({
    queryKey: ['products'],
    queryFn: fetchProducts,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  })

  return {
    products: data?.products ?? [],
    loading: isLoading,
    error,
  }
}
