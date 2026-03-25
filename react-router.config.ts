import { vercelPreset } from '@vercel/react-router/vite'
import type { Config } from '@react-router/dev/config'
import { readFeatureFlags, getServiceSlugs, getCitySlugs, getBlogSlugs, getPortfolioSlugs } from './src/lib/build-routes'

export default {
  appDirectory: 'src',
  buildDirectory: 'build',
  ssr: false,
  presets: [vercelPreset()],
  async prerender({ getStaticPaths }) {
    const flags = readFeatureFlags()

    // Static paths auto-discovered from routes.ts (paths with no dynamic segments)
    const staticPaths = getStaticPaths()

    // Dynamic: service pages (roofing, siding, storm-damage)
    // Note: explicit service routes ARE static paths — getStaticPaths() includes them.
    // Adding here is fine — React Router deduplicates pre-render paths.
    const servicePaths = getServiceSlugs().map((s) => `/${s}`)

    // Dynamic: city pages (feature-flag guarded)
    const cityPaths = flags.cityPages
      ? getCitySlugs().map((s) => `/service-areas/${s}`)
      : []

    // Dynamic: blog posts (feature-flag guarded)
    const blogPaths = flags.blog
      ? getBlogSlugs().map((s) => `/resources/${s}`)
      : []

    // Dynamic: portfolio detail pages
    const portfolioPaths = getPortfolioSlugs().map((s) => `/portfolio/${s}`)

    return [
      ...staticPaths,
      ...servicePaths,
      ...cityPaths,
      ...blogPaths,
      ...portfolioPaths,
    ]
  },
} satisfies Config
