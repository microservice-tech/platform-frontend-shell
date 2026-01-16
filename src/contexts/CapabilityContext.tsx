import {
  createContext,
  useContext,
  useCallback,
  type ReactNode,
} from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { CapabilityContextType, CapabilitiesResponse } from '../types'
import { config } from '../config'
import { useAuth } from './AuthContext'

const CapabilityContext = createContext<CapabilityContextType | null>(null)

type CapabilityProviderProps = {
  children: ReactNode
  apiBaseUrl?: string
}

async function fetchCapabilities(
  baseUrl: string,
  token: string | undefined
): Promise<CapabilitiesResponse> {
  if (!token) {
    return { enabledModules: [], enabledFeatures: [], limits: {} }
  }

  const response = await fetch(`${baseUrl}/api/capabilities/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch capabilities: ${response.statusText}`)
  }

  return response.json()
}

export function CapabilityProvider({
  children,
  apiBaseUrl = config.api.baseUrl,
}: CapabilityProviderProps) {
  const { token, authenticated } = useAuth()
  const queryClient = useQueryClient()

  const {
    data,
    isLoading,
    error,
  } = useQuery<CapabilitiesResponse, Error>({
    queryKey: ['capabilities', token],
    queryFn: () => fetchCapabilities(apiBaseUrl, token),
    enabled: authenticated && !!token && !!apiBaseUrl,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  })

  const hasModule = useCallback(
    (module: string) => data?.enabledModules.includes(module) ?? false,
    [data?.enabledModules]
  )

  const hasFeature = useCallback(
    (feature: string) => data?.enabledFeatures.includes(feature) ?? false,
    [data?.enabledFeatures]
  )

  const getLimit = useCallback(
    (key: string) => data?.limits[key] ?? 0,
    [data?.limits]
  )

  const refetch = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['capabilities'] })
  }, [queryClient])

  const value: CapabilityContextType = {
    enabledModules: data?.enabledModules ?? [],
    enabledFeatures: data?.enabledFeatures ?? [],
    limits: data?.limits ?? {},
    loading: isLoading,
    error: error,
    hasModule,
    hasFeature,
    getLimit,
    refetch,
  }

  return (
    <CapabilityContext.Provider value={value}>
      {children}
    </CapabilityContext.Provider>
  )
}

export function useCapabilities(): CapabilityContextType {
  const context = useContext(CapabilityContext)
  if (!context) {
    throw new Error('useCapabilities must be used within a CapabilityProvider')
  }
  return context
}
