import type { RouteObject } from 'react-router-dom'
import type { ComponentType } from 'react'

export type MenuItem = {
  label: string
  path?: string
  icon?: ComponentType<{ className?: string }>
  requiredCapabilities?: string[]
  children?: MenuItem[]
}

export type FeatureModule = {
  id: string
  name: string
  routes: RouteObject[]
  menuItems: MenuItem[]
  requiredCapabilities: string[]
  lazy: () => Promise<{ default: ComponentType }>
}

export type ModuleConfig = {
  modules: FeatureModule[]
  publicRoutes?: RouteObject[]
}
