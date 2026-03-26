/**
 * Shared build-time route enumeration.
 *
 * Node.js-safe: imports only plain config/data modules plus fs/path helpers.
 * Used by both react-router.config.ts (prerender function) and vite.config.ts (sitemap plugin).
 */
import { readdirSync, readFileSync } from 'fs'
import { resolve } from 'path'
import { features } from '../config/features'
import { services } from '../config/services'
import { cityPages } from '../config/service-areas'
import { projects } from '../config/projects'
import { parseFrontmatter } from './frontmatter'

/**
 * Returns feature flags from the live config module so build-time discovery stays
 * aligned with the runtime app.
 */
export function readFeatureFlags(): Record<string, boolean> {
  return { ...features }
}

/**
 * Returns all service slugs from the live service config.
 */
export function getServiceSlugs(): string[] {
  return services.map((service) => service.slug)
}

/**
 * Returns all city slugs from the live service-area config.
 */
export function getCitySlugs(): string[] {
  return cityPages.map((city) => city.slug)
}

/**
 * Returns all published blog post slugs by reading markdown frontmatter from src/content/blog/.
 */
export function getBlogSlugs(): string[] {
  try {
    const blogDir = resolve('src/content/blog')
    return readdirSync(blogDir)
      .filter((fileName: string) => fileName.endsWith('.md'))
      .map((fileName: string) => {
        const { data } = parseFrontmatter(readFileSync(resolve(blogDir, fileName), 'utf-8'))
        return data.published !== false && typeof data.slug === 'string' ? data.slug : null
      })
      .filter(Boolean) as string[]
  } catch {
    return []
  }
}

/**
 * Returns all portfolio project slugs from the live project config.
 */
export function getPortfolioSlugs(): string[] {
  return projects.items.map((project) => project.slug)
}

function dedupeRoutes(routes: string[]): string[] {
  return [...new Set(routes)]
}

/**
 * Returns the non-parameterized marketing routes that should exist in the built site.
 */
export function getStaticRoutes(): string[] {
  const flags = readFeatureFlags()

  return dedupeRoutes([
    '/',
    '/services',
    '/projects',
    '/testimonials',
    '/about',
    '/contact',
    '/thank-you',
    '/service-areas',
    ...(flags.assistant ? ['/ava'] : []),
    ...(flags.financingCalculator ? ['/financing'] : []),
    ...(flags.blog ? ['/resources'] : []),
  ])
}

/**
 * Returns config- or content-driven routes that are discovered outside the static
 * route table declared in src/routes.ts.
 */
export function getConfigDrivenRoutes(): string[] {
  const flags = readFeatureFlags()

  return dedupeRoutes([
    ...getServiceSlugs().map((slug) => `/${slug}`),
    ...(flags.cityPages ? getCitySlugs().map((slug) => `/service-areas/${slug}`) : []),
    ...(flags.blog ? getBlogSlugs().map((slug) => `/resources/${slug}`) : []),
    ...getPortfolioSlugs().map((slug) => `/portfolio/${slug}`),
  ])
}

/**
 * Merges React Router's statically discovered paths with config-driven paths used
 * for prerendering.
 */
export function getPrerenderRoutes(staticPaths: string[]): string[] {
  return dedupeRoutes([...staticPaths, ...getConfigDrivenRoutes()])
}

/**
 * Returns all site routes for sitemap/prerender enumeration.
 * Combines static routes (feature-flag-aware) with config-driven route paths.
 */
export function getAllRoutes(): string[] {
  return dedupeRoutes([...getStaticRoutes(), ...getConfigDrivenRoutes()])
}
