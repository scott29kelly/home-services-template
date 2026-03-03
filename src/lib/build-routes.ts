/**
 * Shared build-time route enumeration.
 *
 * Node.js-safe: uses only fs/path/gray-matter — NO import.meta.glob (Vite-only).
 * Used by both react-router.config.ts (prerender function) and vite.config.ts (sitemap plugin).
 */
import { readdirSync, readFileSync } from 'fs'
import { resolve } from 'path'
import matter from 'gray-matter'

/**
 * Reads feature flags from src/config/features.ts by parsing the source text.
 * Cannot use ESM import in Node build context.
 */
export function readFeatureFlags(): Record<string, boolean> {
  try {
    const src = readFileSync(resolve('src/config/features.ts'), 'utf-8')
    // Strip block and line comments to avoid false matches
    const stripped = src
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*/g, '')
    const flags: Record<string, boolean> = {}
    for (const [, key, val] of stripped.matchAll(/(\w+):\s*(true|false)/g)) {
      flags[key] = val === 'true'
    }
    return flags
  } catch {
    // Fallback: all features enabled (safe default — include all routes in sitemap/prerender)
    return { assistant: true, blog: true, financingCalculator: true, cityPages: true, beforeAfter: true, onlineBooking: true }
  }
}

/**
 * Returns all service slugs extracted from src/config/services.ts.
 */
export function getServiceSlugs(): string[] {
  try {
    const svcFile = readFileSync(resolve('src/config/services.ts'), 'utf-8')
    const stripped = svcFile
      .replace(/\/\*[\s\S]*?\*\//g, '')   // remove block comments
      .replace(/\/\/.*/g, '')              // remove line comments
    const slugMatches = stripped.matchAll(/slug:\s*'([^']+)'/g)
    return [...slugMatches].map((m) => m[1])
  } catch {
    // Fallback to known slugs if file read fails
    return ['roofing', 'siding', 'storm-damage']
  }
}

/**
 * Returns all city slugs extracted from src/config/service-areas.ts.
 */
export function getCitySlugs(): string[] {
  try {
    const saFile = readFileSync(resolve('src/config/service-areas.ts'), 'utf-8')
    const stripped = saFile
      .replace(/\/\*[\s\S]*?\*\//g, '')   // remove block comments
      .replace(/\/\/.*/g, '')              // remove line comments
    const slugMatches = stripped.matchAll(/slug:\s*'([^']+)'/g)
    return [...slugMatches].map((m) => m[1])
  } catch {
    return []
  }
}

/**
 * Returns all published blog post slugs by reading markdown frontmatter from src/content/blog/.
 */
export function getBlogSlugs(): string[] {
  try {
    const blogDir = resolve('src/content/blog')
    return readdirSync(blogDir)
      .filter((f) => f.endsWith('.md'))
      .map((f) => {
        const { data } = matter(readFileSync(resolve(blogDir, f), 'utf-8'))
        return data.published !== false ? (data.slug as string) : null
      })
      .filter(Boolean) as string[]
  } catch {
    return []
  }
}

/**
 * Returns all portfolio project slugs extracted from src/config/projects.ts.
 */
export function getPortfolioSlugs(): string[] {
  try {
    const projFile = readFileSync(resolve('src/config/projects.ts'), 'utf-8')
    const stripped = projFile
      .replace(/\/\*[\s\S]*?\*\//g, '')   // remove block comments
      .replace(/\/\/.*/g, '')              // remove line comments
    const slugMatches = stripped.matchAll(/slug:\s*'([^']+)'/g)
    return [...slugMatches].map((m) => m[1])
  } catch {
    return []
  }
}

/**
 * Returns all site routes for sitemap/prerender enumeration.
 * Combines static routes (feature-flag-aware) with all dynamic route paths.
 */
export function getAllRoutes(): string[] {
  const flags = readFeatureFlags()

  // Static pages — feature-flag-aware
  const staticRoutes = [
    '/', '/services', '/projects', '/testimonials',
    '/about', '/contact', '/service-areas',
    ...(flags.assistant ? ['/ava'] : []),
    ...(flags.financingCalculator ? ['/financing'] : []),
    ...(flags.blog ? ['/resources'] : []),
  ]

  // Service routes — derived from config slugs
  const serviceRoutes = getServiceSlugs().map((s) => `/${s}`)

  // City routes — feature-flag guarded
  const cityRoutes = flags.cityPages
    ? getCitySlugs().map((s) => `/service-areas/${s}`)
    : []

  // Blog routes — feature-flag guarded
  const blogRoutes = flags.blog
    ? getBlogSlugs().map((s) => `/resources/${s}`)
    : []

  // Portfolio routes
  const portfolioRoutes = getPortfolioSlugs().map((s) => `/portfolio/${s}`)

  return [...staticRoutes, ...serviceRoutes, ...cityRoutes, ...blogRoutes, ...portfolioRoutes]
}
