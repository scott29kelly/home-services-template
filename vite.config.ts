import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'
import { readdirSync, readFileSync } from 'fs'
import { resolve } from 'path'
import matter from 'gray-matter'

/**
 * Custom plugin to copy and optimize images from the root images/ directory.
 *
 * The project keeps source images in /images (not public/) for template
 * portability. In dev, Vite serves /images/* from the project root.
 * In production, this plugin copies them to dist/images/ and runs sharp
 * optimization, working around a symlink/junction bug in
 * vite-plugin-image-optimizer's readAllFiles (uses lstatSync which
 * doesn't follow junctions on Windows).
 */
function copyAndOptimizeImages(): Plugin {
  let outDir: string

  return {
    name: 'copy-optimize-images',
    enforce: 'post',
    apply: 'build',
    configResolved(config) {
      outDir = config.build.outDir
    },
    async closeBundle() {
      const { default: sharp } = await import('sharp')
      const fs = await import('fs/promises')
      const path = await import('path')

      const srcDir = path.resolve('images')
      const destDir = path.resolve(outDir, 'images')

      // Recursively collect all image files from srcDir and subdirectories
      async function collectImageFiles(dir: string): Promise<{ srcPath: string; relPath: string }[]> {
        const entries = await fs.readdir(dir, { withFileTypes: true })
        const results: { srcPath: string; relPath: string }[] = []
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name)
          if (entry.isDirectory()) {
            const sub = await collectImageFiles(fullPath)
            results.push(...sub)
          } else if (/\.(jpe?g|png|webp|gif|avif|tiff)$/i.test(entry.name)) {
            results.push({ srcPath: fullPath, relPath: path.relative(srcDir, fullPath) })
          }
        }
        return results
      }

      const imageFiles = await collectImageFiles(srcDir)

      let totalSaved = 0
      let totalOriginal = 0
      const results: string[] = []

      await Promise.all(
        imageFiles.map(async ({ srcPath, relPath }) => {
          const file = relPath
          const destPath = path.join(destDir, relPath)
          const ext = path.extname(relPath).toLowerCase()

          // Ensure subdirectory exists in dest
          await fs.mkdir(path.dirname(destPath), { recursive: true })

          const srcBuffer = await fs.readFile(srcPath)
          const originalSize = srcBuffer.byteLength

          let optimized: Buffer
          try {
            const sharpInstance = sharp(srcBuffer)
            switch (ext) {
              case '.jpg':
              case '.jpeg':
                optimized = await sharpInstance.jpeg({ quality: 80 }).toBuffer()
                break
              case '.png':
                optimized = await sharpInstance.png({ quality: 80 }).toBuffer()
                break
              case '.webp':
                optimized = await sharpInstance
                  .webp({ quality: 80, lossless: false })
                  .toBuffer()
                break
              default:
                // Copy without optimization
                await fs.copyFile(srcPath, destPath)
                return
            }

            // Only write optimized version if it's actually smaller
            if (optimized.byteLength < originalSize) {
              await fs.writeFile(destPath, optimized)
              const saved = originalSize - optimized.byteLength
              totalSaved += saved
              totalOriginal += originalSize
              results.push(
                `  ${file}: ${(originalSize / 1024).toFixed(0)}kB -> ${(optimized.byteLength / 1024).toFixed(0)}kB (-${Math.round((saved / originalSize) * 100)}%)`
              )
            } else {
              await fs.copyFile(srcPath, destPath)
              totalOriginal += originalSize
              results.push(`  ${file}: ${(originalSize / 1024).toFixed(0)}kB (already optimal)`)
            }
          } catch {
            // Fallback: copy without optimization
            await fs.copyFile(srcPath, destPath)
          }
        })
      )

      if (results.length > 0) {
        console.log(`\n[copy-optimize-images] Processed ${results.length} images:`)
        results.sort().forEach((r) => console.log(r))
        if (totalSaved > 0) {
          console.log(
            `  Total: ${(totalSaved / 1024).toFixed(0)}kB saved (${Math.round((totalSaved / totalOriginal) * 100)}% reduction)\n`
          )
        }
      }
    },
  }
}

/**
 * Reads feature flags from src/config/features.ts by parsing the source text.
 * Cannot use ESM import in Vite's Node build context.
 * Same approach as slug extraction — regex on comment-stripped source.
 */
function readFeatureFlags(): Record<string, boolean> {
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
    // Fallback: all features enabled (safe default — include all routes in sitemap)
    return { assistant: true, blog: true, financingCalculator: true, cityPages: true, beforeAfter: true, onlineBooking: true }
  }
}

/**
 * Discovers all site routes for sitemap generation.
 * Cannot use import.meta.glob here (Node context, not app bundle).
 * Dynamic routes are extracted by reading the TypeScript config source files.
 */
function getRouteList(): string[] {
  const flags = readFeatureFlags()

  // Static pages — feature-flag-aware
  const staticRoutes = [
    '/', '/services', '/projects', '/testimonials',
    '/about', '/contact', '/service-areas',
    ...(flags.assistant ? ['/ava'] : []),
    ...(flags.financingCalculator ? ['/financing'] : []),
    ...(flags.blog ? ['/resources'] : []),
  ]

  // Service routes — hardcoded list matching src/config/services.ts slugs
  const serviceRoutes = ['/roofing', '/siding', '/storm-damage']

  // City routes — parse service-areas.ts for slug values
  // Strip comments first to avoid matching slug values in JSDoc examples
  let cityRoutes: string[] = []
  if (flags.cityPages) {
    try {
      const saFile = readFileSync(resolve('src/config/service-areas.ts'), 'utf-8')
      const stripped = saFile
        .replace(/\/\*[\s\S]*?\*\//g, '')   // remove block comments
        .replace(/\/\/.*/g, '')              // remove line comments
      const slugMatches = stripped.matchAll(/slug:\s*'([^']+)'/g)
      cityRoutes = [...slugMatches].map((m) => `/service-areas/${m[1]}`)
    } catch {
      /* fallback: empty */
    }
  }

  // Blog routes — read markdown frontmatter from content/blog
  let blogRoutes: string[] = []
  if (flags.blog) {
    try {
      const blogDir = resolve('src/content/blog')
      blogRoutes = readdirSync(blogDir)
        .filter((f) => f.endsWith('.md'))
        .map((f) => {
          const { data } = matter(readFileSync(resolve(blogDir, f), 'utf-8'))
          return data.published !== false ? `/resources/${data.slug}` : null
        })
        .filter(Boolean) as string[]
    } catch {
      /* no blog posts */
    }
  }

  // Portfolio routes — parse projects.ts for slug values
  // Strip comments to avoid false matches in JSDoc examples
  let portfolioRoutes: string[] = []
  try {
    const projFile = readFileSync(resolve('src/config/projects.ts'), 'utf-8')
    const stripped = projFile
      .replace(/\/\*[\s\S]*?\*\//g, '')   // remove block comments
      .replace(/\/\/.*/g, '')              // remove line comments
    const slugMatches = stripped.matchAll(/slug:\s*'([^']+)'/g)
    portfolioRoutes = [...slugMatches].map((m) => `/portfolio/${m[1]}`)
  } catch {
    /* fallback: empty */
  }

  return [...staticRoutes, ...serviceRoutes, ...cityRoutes, ...blogRoutes, ...portfolioRoutes]
}

/**
 * Custom Vite plugin that generates sitemap.xml and robots.txt at build time.
 * Runs after bundle close so dist/ directory exists.
 *
 * hostname must match company.url. Since this is Node context (cannot import
 * ESM config), the value is hardcoded here — keep in sync with src/config/company.ts.
 */
function generateSitemap(): Plugin {
  return {
    name: 'generate-sitemap',
    enforce: 'post',
    apply: 'build',
    async closeBundle() {
      const fs = await import('fs/promises')
      const path = await import('path')

      // Keep in sync with company.url in src/config/company.ts
      const hostname = 'https://example.com'
      const routes = getRouteList()
      const excludeSet = new Set(['/thank-you', '/404'])
      const filteredRoutes = routes.filter((r) => !excludeSet.has(r))

      // Build sitemap XML
      const urlEntries = filteredRoutes
        .map(
          (route) =>
            `  <url>\n    <loc>${hostname}${route}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`
        )
        .join('\n')

      const sitemap = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        urlEntries,
        '</urlset>',
      ].join('\n')

      const robots = `User-agent: *\nAllow: /\n\nSitemap: ${hostname}/sitemap.xml`

      const distDir = path.resolve('dist')
      await fs.writeFile(path.join(distDir, 'sitemap.xml'), sitemap, 'utf-8')
      await fs.writeFile(path.join(distDir, 'robots.txt'), robots, 'utf-8')
      console.log(
        `[generate-sitemap] Generated sitemap.xml with ${filteredRoutes.length} URLs`
      )
      console.log(`[generate-sitemap] Generated robots.txt`)
    },
  }
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Optimizes any images imported through the JS/CSS build pipeline
    ViteImageOptimizer({
      logStats: true,
      png: { quality: 80 },
      jpeg: { quality: 80 },
      webp: { lossless: false, quality: 80 },
    }),
    // Copies and optimizes images from /images to dist/images
    copyAndOptimizeImages(),
    // Generates dist/sitemap.xml and dist/robots.txt at build time
    generateSitemap(),
  ],
  // In dev, Vite serves /images/* directly from the project root
  publicDir: false,
  build: {
    rollupOptions: {
      input: 'index.html',
    },
  },
})
