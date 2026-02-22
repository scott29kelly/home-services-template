/**
 * Backward-compatible SITE object.
 * New code should import from '@/config' directly.
 * This file re-assembles the legacy shape from modular configs.
 */
import { company } from './company'
import { serviceAreas } from './service-areas'
import { assistant } from './assistant'

export const SITE = {
  name: company.name,
  tagline: company.tagline,
  phone: company.phone,
  email: company.email,
  url: company.url,
  address: company.address,
  hours: company.hours,
  serviceArea: serviceAreas,
  certifications: company.certifications,
  stats: company.stats,
  social: company.social,
  assistant,
} as const

export type SiteConfig = typeof SITE
