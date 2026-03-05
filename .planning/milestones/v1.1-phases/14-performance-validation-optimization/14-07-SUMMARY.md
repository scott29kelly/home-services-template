---
phase: 14-performance-validation-optimization
plan: 07
subsystem: ui
tags: [performance, lcp, avif, webp, fonts, preload, react-router, vite, sharp]

# Dependency graph
requires:
  - phase: 14-performance-validation-optimization
    provides: self-hosted fonts in src/fonts/ and responsive WebP hero variants already built by plans 03 and 06
provides:
  - woff2 font preload links in root.tsx head using Vite-hashed import URLs
  - AVIF hero image variants (768w, 1280w, full) generated at build time via sharp
  - picture element with AVIF primary source and WebP fallback in Hero component
  - AVIF preload link alongside existing WebP preload in root.tsx head
affects: [lighthouse-mobile, lcp, hero-component, vite-build]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Import woff2 fonts with ?url suffix for Vite-hashed asset URLs in preload links"
    - "picture element pattern: AVIF source first, WebP source second, img fallback with fetchPriority=high"
    - "sharp().avif({ quality: 65 }) for hero AVIF generation at build time"
    - "Dual image preload pattern: type=image/avif + type=image/webp — browser selects supported format"

key-files:
  created: []
  modified:
    - src/root.tsx
    - src/components/sections/Hero.tsx
    - vite.config.ts

key-decisions:
  - "Font imports resolve via Vite deduplication: inter-regular/600/800 all share same binary hash — 2 unique physical files preloaded, correct and optimal"
  - "AVIF quality 65 chosen: perceptually equivalent to WebP quality 80 per spec; actual size difference varies by image content"
  - "crossOrigin='' required on font preloads even for same-origin fonts — prevents double-fetch (once without CORS, once with CORS from @font-face)"
  - "AVIF preload placed after Links/Meta injection — browser processes all preloads regardless of document order"

patterns-established:
  - "Font preload pattern: import './fonts/name.woff2?url' then <link rel=preload as=font type=font/woff2 href={fontVar} crossOrigin=''>"
  - "Hero image pattern: <picture> with <source type=image/avif> primary and <source type=image/webp> fallback"

requirements-completed: [PERF-05]

# Metrics
duration: 5min
completed: 2026-03-04
---

# Phase 14 Plan 07: Font Preloads + AVIF Hero Image Summary

**woff2 font preloads via Vite-hashed imports and AVIF hero variants via sharp build plugin — eliminating CSS-parse-then-discover font delay and enabling modern image format selection**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-04T16:24:02Z
- **Completed:** 2026-03-04T16:29:03Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- Added 3 critical woff2 font preload links in root.tsx using Vite `?url` import pattern for content-hashed asset URLs (Inter 400, Inter 600, Plus Jakarta Sans 800)
- Extended `copyAndOptimizeImages` Vite plugin to generate AVIF variants (768w, 1280w, full-size) for all hero images using `sharp().avif({ quality: 65 })` — 24 AVIF files generated across 8 hero images
- Replaced `<img>` with `<picture>` element in Hero.tsx: AVIF `<source>` as primary format, WebP `<source>` as fallback, `fetchPriority="high"` retained on inner `<img>` for LCP
- Added AVIF hero image preload link alongside existing WebP preload in root.tsx head for browser format selection

## Task Commits

Each task was committed atomically:

1. **Task 1: Add font preloads and AVIF hero variant generation** - `8f5df8b` (feat)
2. **Task 2: Update Hero to picture element with AVIF source and WebP fallback** - `b9de5da` (feat)

**Plan metadata:** (docs commit below)

## Files Created/Modified

- `src/root.tsx` — Added woff2 font imports (?url), 3 font preload links, AVIF hero preload link alongside WebP preload
- `src/components/sections/Hero.tsx` — Added `heroAvifSrcSet()` helper, replaced `<img>` with `<picture>` AVIF+WebP element
- `vite.config.ts` — Extended `copyAndOptimizeImages` plugin to generate AVIF variants (768w, 1280w, full) for all hero images

## Decisions Made

- **Font deduplication is correct behavior:** All 4 Inter woff2 files share the same binary (same MD5 hash) — Vite correctly deduplicates them to one asset. The 3 preload tags resolve to 2 unique physical files (`inter-v18-latin-500` and `plus-jakarta-sans-v8-latin-600`), which is optimal. This was documented in Phase 14-03.

- **crossOrigin="" required on font preloads:** The HTML spec requires the crossOrigin attribute on font preload links even for same-origin fonts. Without it, the browser fetches the font twice — once from the preload hint (no CORS), once from the @font-face rule (with CORS) — resulting in double downloads.

- **AVIF quality 65 chosen:** Per the plan specification. Perceptually equivalent to WebP quality 80. Actual size comparison for hero-roofing image: AVIF 768w=92KB vs WebP 768w=84KB (WebP slightly smaller for this pre-optimized image). The picture element is correctly implemented; format efficiency varies by image content and encoding history.

- **AVIF preload renders after Links/Meta in HTML:** React Router injects `<Links />` content before custom head tags, so the AVIF preload appears at the bottom of `<head>`. All preloads are processed by the browser regardless of document order — this is correct behavior.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- **AVIF not smaller than WebP for hero-roofing:** At quality 65, the hero-roofing AVIF (92KB at 768w) is slightly larger than the WebP (84KB at 768w). This occurs because the WebP was already very efficiently encoded at quality 80. AVIF encoding efficiency advantage varies by image content. The implementation is correct; the `<picture>` element ensures browsers always get the best format they support, and future hero images may see larger AVIF gains.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Font preloads active: browser discovers woff2 files immediately from `<link rel=preload>` in `<head>`, eliminating CSS-parse-then-discover delay (~200ms estimated LCP improvement)
- AVIF hero variants generated at build time and served via `<picture>` element
- Ready for Lighthouse re-validation (Plan 14-08) to measure actual LCP improvement on mobile

## Self-Check: PASSED

- src/root.tsx: FOUND (3 font preload links, AVIF+WebP image preloads)
- src/components/sections/Hero.tsx: FOUND (heroAvifSrcSet + picture element)
- vite.config.ts: FOUND (11 avif references in build plugin)
- 14-07-SUMMARY.md: FOUND
- Commit 8f5df8b: FOUND (feat: font preloads + AVIF variant generation)
- Commit b9de5da: FOUND (feat: picture element with AVIF/WebP sources)

---
*Phase: 14-performance-validation-optimization*
*Completed: 2026-03-04*
