---
phase: 13-rr7-framework-mode-migration
plan: 03
subsystem: build-infrastructure
tags: [react-router, framework-mode, prerender, static-site-generation, vercel, vite]

requires:
  - phase: 13-rr7-framework-mode-migration
    provides: framework-mode-infrastructure, entry-files, route-config, route-modules
  - phase: 13-rr7-framework-mode-migration
    provides: 16 route modules with loaders and static wrappers

provides:
  - src/lib/build-routes.ts — Node.js-safe route enumeration shared by prerender and sitemap
  - react-router.config.ts with vercelPreset() and async prerender() enumerating all routes
  - vercel.json pointing to build/client with cleanUrls, no SPA rewrites
  - Production build: 60+ HTML files pre-rendered in build/client/ with real crawlable content
  - sitemap.xml and robots.txt generated in build/client/

affects: [sitemap, SEO, lighthouse-performance, vercel-deployment]

tech-stack:
  added: []
  patterns:
    - "Shared build-routes module: Node.js-safe (fs/path/gray-matter) for both prerender and sitemap"
    - "prerender() function returns union of getStaticPaths() + explicit dynamic route arrays"
    - "Feature flags guard cityPages and blog route enumeration in prerender"
    - "Route deduplication: React Router handles duplicate paths from getStaticPaths + explicit service paths"
    - "Unique route id option in routes.ts for shared file routes to avoid duplicate route id error"

key-files:
  created:
    - src/lib/build-routes.ts
  modified:
    - react-router.config.ts
    - vite.config.ts
    - vercel.json
    - src/routes.ts
  deleted:
    - index.html
    - src/main.tsx
    - src/App.tsx
    - src/components/layout/Layout.tsx

key-decisions:
  - "Shared build-routes.ts module exports readFeatureFlags, getServiceSlugs, getCitySlugs, getBlogSlugs, getPortfolioSlugs, getAllRoutes — used by both prerender config and sitemap plugin"
  - "Unique id option added to routes.ts service routes (roofing/siding/storm-damage share service-page.tsx) to fix duplicate route id error"
  - "vercel.json: removed SPA rewrite, added cleanUrls:true — pre-rendered routes each have index.html"

patterns-established:
  - "build-routes.ts pattern: Node.js-safe slug extraction via fs.readdirSync + fs.readFileSync + regex/gray-matter"
  - "prerender() pattern: spread getStaticPaths() + explicit dynamic arrays, let React Router deduplicate"

requirements-completed: [PERF-03, PERF-04]

duration: 4min
completed: "2026-03-03"
---

# Phase 13 Plan 03: Pre-rendering Configuration Summary

**Static pre-rendering via react-router.config.ts prerender() function generates 60+ HTML files at build time using vercelPreset() — every route served from CDN with real crawlable content**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-03T17:28:27Z
- **Completed:** 2026-03-03T17:32:40Z
- **Tasks:** 2
- **Files modified:** 7 (4 modified, 1 created, 4 deleted)

## Accomplishments
- Created `src/lib/build-routes.ts` — Node.js-safe shared route enumeration (no import.meta.glob) used by both the prerender function and the sitemap plugin
- Updated `react-router.config.ts` with `vercelPreset()` and async `prerender()` enumerating all static and dynamic routes (services, cities, blog posts, portfolio)
- Production build succeeds: 60+ routes pre-rendered to HTML files in `build/client/` with real, crawlable content (home: 54kB, roofing: 48kB, blog posts: 125kB)
- Updated `vercel.json` — removed SPA rewrite, changed outputDirectory to `build/client`, added `cleanUrls: true`
- Removed legacy entry files (index.html, src/main.tsx, src/App.tsx, src/components/layout/Layout.tsx) — fully replaced by framework mode

## Task Commits

Each task was committed atomically:

1. **Task 1: Create shared build-routes module and react-router.config.ts** - `8f60830` (feat)
2. **Task 2: Update Vercel config, run production build, verify pre-rendered HTML** - `223426b` (feat)

## Files Created/Modified
- `src/lib/build-routes.ts` - New: Node.js-safe route enumeration with readFeatureFlags, getServiceSlugs, getCitySlugs, getBlogSlugs, getPortfolioSlugs, getAllRoutes
- `react-router.config.ts` - Updated: added vercelPreset() preset and async prerender() function
- `vite.config.ts` - Updated: replaced inline readFeatureFlags/getRouteList with import from build-routes
- `vercel.json` - Updated: outputDirectory build/client, cleanUrls true, removed SPA rewrites
- `src/routes.ts` - Fixed: added unique id option to shared service-page routes
- `index.html` - Deleted: replaced by src/root.tsx
- `src/main.tsx` - Deleted: replaced by src/entry.client.tsx
- `src/App.tsx` - Deleted: replaced by src/routes.ts + route modules
- `src/components/layout/Layout.tsx` - Deleted: only importer was App.tsx (now deleted)

## Decisions Made
- Extracted route enumeration into `src/lib/build-routes.ts` so the same logic is shared by both `react-router.config.ts` (prerender) and `vite.config.ts` (sitemap). The previous inline functions in vite.config.ts used identical patterns — extracting them avoids drift.
- Added `cleanUrls: true` to vercel.json so Vercel serves `/about` from `build/client/about/index.html` without requiring `.html` extension — matches the pre-rendered output structure.
- Removed `rewrites` from vercel.json entirely — the old SPA rewrite (`/(.*) -> /index.html`) is incompatible with pre-rendered routes which each have their own HTML file.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed duplicate route id error for shared service-page routes**
- **Found during:** Task 2 (npm run build)
- **Issue:** React Router generates route IDs from the file path. Three routes (roofing, siding, storm-damage) all reference `routes/service-page.tsx`, producing the same route ID `routes/service-page` — build failed with "Unable to define routes with duplicate route id"
- **Fix:** Added unique `id` option to each route in routes.ts: `{ id: 'routes/service-page/roofing' }`, `{ id: 'routes/service-page/siding' }`, `{ id: 'routes/service-page/storm-damage' }`
- **Files modified:** src/routes.ts
- **Verification:** Build completed successfully after fix
- **Committed in:** 223426b (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Auto-fix necessary for the build to succeed. The `id` option is the documented solution for sharing a route file across multiple paths in React Router 7.

## Issues Encountered
- Duplicate route id error on first build attempt — diagnosed from error message, fixed by adding unique `id` options to the three service routes that share `service-page.tsx`. Build succeeded immediately after fix.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All routes pre-rendered to HTML: /, /services, /projects, /testimonials, /about, /contact, /service-areas, /ava, /financing, /resources, /roofing, /siding, /storm-damage, all city pages, all blog posts, all portfolio pages
- vercel.json configured for build/client output — deploy by running `npm run build` and deploying the build/client/ directory
- sitemap.xml and robots.txt generated in build/client/ for SEO
- Ready for Plan 04: final verification and any remaining cleanup

---
*Phase: 13-rr7-framework-mode-migration*
*Completed: 2026-03-03*

## Self-Check: PASSED

All files verified present on disk. Both task commits (8f60830, 223426b) verified in git log.
