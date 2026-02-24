import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'

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
  ],
  // In dev, Vite serves /images/* directly from the project root
  publicDir: false,
  build: {
    rollupOptions: {
      input: 'index.html',
    },
  },
})
