export type CapabilitiesResponse = {
  enabledModules: string[]
  enabledFeatures: string[]
  limits: Record<string, number>
}

export type CapabilityContextType = {
  enabledModules: string[]
  enabledFeatures: string[]
  limits: Record<string, number>
  loading: boolean
  error: Error | null
  hasModule: (module: string) => boolean
  hasFeature: (feature: string) => boolean
  getLimit: (key: string) => number
  refetch: () => void
}
