/**
 * Barrel export with Zod validation.
 * All config is validated at import time — invalid config shows clear error messages.
 */
import { company as _company } from './company'
import { services as _services } from './services'
import { testimonials as _testimonials } from './testimonials'
import { projects as _projects } from './projects'
import { team as _team } from './team'
import { serviceAreas as _serviceAreas } from './service-areas'
import { assistant as _assistant } from './assistant'
import { seo } from './seo'
import { features } from './features'
import { theme } from './theme'
import { forms } from './forms'
import { financing } from './financing'
import { banner } from './banner'

import {
  companySchema,
  servicesSchema,
  testimonialsSchema,
  projectsSchema,
  teamSchema,
  serviceAreasSchema,
  assistantSchema,
} from './schema'

/* ── Validate all configs at import time ──────────────────────────── */

function validate<T>(schema: { parse: (data: unknown) => T }, data: unknown, label: string): T {
  try {
    return schema.parse(data)
  } catch (err) {
    console.error(`\n\u274C Config validation failed: ${label}\n`)
    throw err
  }
}

export const company = validate(companySchema, _company, 'company')
export const services = validate(servicesSchema, _services, 'services')
export const testimonials = validate(testimonialsSchema, _testimonials, 'testimonials')
export const projects = validate(projectsSchema, _projects, 'projects')
export const team = validate(teamSchema, _team, 'team')
export const serviceAreas = validate(serviceAreasSchema, _serviceAreas, 'serviceAreas')
export const assistant = validate(assistantSchema, _assistant, 'assistant')

// These don't need Zod validation (small utility configs)
export { seo, features, theme, forms, financing, banner }

// Re-export navigation helpers
export { getNavLinks, getFooterServiceLinks, getFooterCompanyLinks } from './navigation'

// Re-export service lookup
export { getServiceBySlug } from './services'

// Re-export testimonial filter helpers
export { getTestimonialsByCity, getTestimonialsByService } from './testimonials'

// Re-export types
export type { ServiceConfig, ServiceSection } from './services'
export type { Testimonial } from './testimonials'
export type { Project, BeforeAfter, ProjectCategory } from './projects'
export type { TeamMember, Value } from './team'
