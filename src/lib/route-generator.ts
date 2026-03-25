/**
 * Route generation from services config.
 * Used by App.tsx to dynamically create routes for all configured services.
 */
import { services } from '../config/services'

export interface ServiceRoute {
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
