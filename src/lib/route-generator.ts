/**
 * Route generation from services and city config.
 * Used by App.tsx to dynamically create routes for all configured services and city pages.
 */
import { services } from '../config/services'
import { cityPages } from '../config/service-areas'
import { features } from '../config/features'

export interface ServiceRoute {
  path: string
  slug: string
  name: string
}

export interface CityRoute {
  path: string
  slug: string
  name: string
}

/** Generate routes for all configured services */
export function getServiceRoutes(): ServiceRoute[] {
  return services.map((s) => ({
    path: s.slug,
    slug: s.slug,
    name: s.name,
  }))
}

/** Generate routes for all configured city/service-area pages */
export function getCityRoutes(): CityRoute[] {
  if (!features.cityPages) return []
  return cityPages.map(c => ({
    path: `service-areas/${c.slug}`,
    slug: c.slug,
    name: c.name,
  }))
}
