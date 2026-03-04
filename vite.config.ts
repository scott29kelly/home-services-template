import { defineConfig, type Plugin } from 'vite'
import { reactRouter } from '@react-router/dev/vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { getAllRoutes } from './src/lib/build-routes'

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

      // Hero images get responsive variants (768w, 1280w)
      const heroWidths = [768, 1280]
      function isHeroImage(filename: string) {
        return /hero/i.test(path.basename(filename))
      }

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

            // Generate responsive variants for hero images
            if (isHeroImage(relPath) && ext === '.webp') {
              for (const w of heroWidths) {
                const baseName = path.basename(relPath, ext)
                const variantName = `${baseName}-${w}w${ext}`
                const variantPath = path.join(path.dirname(destPath), variantName)
                const variant = await sharp(srcBuffer)
                  .resize(w, undefined, { withoutEnlargement: true })
                  .webp({ quality: 80, lossless: false })
                  .toBuffer()
                await fs.writeFile(variantPath, variant)
                results.push(
                  `  ${path.join(path.dirname(relPath), variantName)}: ${(variant.byteLength / 1024).toFixed(0)}kB (${w}w variant)`
                )
              }

              // Generate AVIF variants (primary format — 30-50% smaller than WebP)
              const avifWidths = [768, 1280]
              for (const w of avifWidths) {
                const baseName = path.basename(relPath, ext)
                const avifVariantName = `${baseName}-${w}w.avif`
                const avifVariantPath = path.join(path.dirname(destPath), avifVariantName)
                const avifVariant = await sharp(srcBuffer)
                  .resize(w, undefined, { withoutEnlargement: true })
                  .avif({ quality: 65 })
                  .toBuffer()
                await fs.writeFile(avifVariantPath, avifVariant)
                results.push(
                  `  ${path.join(path.dirname(relPath), avifVariantName)}: ${(avifVariant.byteLength / 1024).toFixed(0)}kB (${w}w AVIF variant)`
                )
              }
              // Full-size AVIF
              const fullAvifName = path.basename(relPath, ext) + '.avif'
              const fullAvifPath = path.join(path.dirname(destPath), fullAvifName)
              const fullAvif = await sharp(srcBuffer).avif({ quality: 65 }).toBuffer()
              await fs.writeFile(fullAvifPath, fullAvif)
              results.push(
                `  ${path.join(path.dirname(relPath), fullAvifName)}: ${(fullAvif.byteLength / 1024).toFixed(0)}kB (full AVIF)`
              )
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
 * Custom Vite plugin that generates sitemap.xml and robots.txt at build time.
 * Runs after bundle close so dist/ directory exists.
 *
 * Hostname and service routes are auto-read from config source files
 * using the same regex extraction pattern as city routes.
 */
function generateSitemap(): Plugin {
  return {
    name: 'generate-sitemap',
    enforce: 'post',
    apply: 'build',
    async closeBundle() {
      const fs = await import('fs/promises')
      const path = await import('path')

      // Read hostname from company.ts config
      // Match url: 'https://...' directly — strip only block comments to avoid
      // corrupting https:// URLs with the line-comment stripping regex
      let hostname = 'https://example.com'
      try {
        const companyFile = readFileSync(resolve('src/config/company.ts'), 'utf-8')
        const stripped = companyFile.replace(/\/\*[\s\S]*?\*\//g, '')
        const urlMatch = stripped.match(/url:\s*'(https?:\/\/[^']+)'/)
        if (urlMatch) hostname = urlMatch[1]
      } catch {
        // Fallback: keep default
      }
      const routes = getAllRoutes()
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

      const distDir = path.resolve('build/client')
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
    reactRouter(),
    tailwindcss(),
    tsconfigPaths(),
    // Optimizes any images imported through the JS/CSS build pipeline
    ViteImageOptimizer({
      logStats: true,
      png: { quality: 80 },
      jpeg: { quality: 80 },
      webp: { lossless: false, quality: 80 },
    }),
    // Copies and optimizes images from /images to build/client/images
    copyAndOptimizeImages(),
    // Generates build/client/sitemap.xml and build/client/robots.txt at build time
    generateSitemap(),
  ],
  // In dev, Vite serves /images/* directly from the project root
  publicDir: false,
})
