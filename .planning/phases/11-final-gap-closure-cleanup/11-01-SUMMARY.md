---
phase: 11-final-gap-closure-cleanup
plan: "01"
subsystem: ui
tags: [react, typescript, vite, sitemap, seo, feature-flags, config]

# Dependency graph
requires:
  - phase: 10-performance-monitoring
    provides: completed v1.0 milestone phases
  - phase: 08-feature-flag-integration
    provides: features config, AvaWidget, Layout.tsx patterns
  - phase: 05-seo-content
    provides: sitemap generation, seo.ts schema builders
provides:
  - Phone CTA on 404 page using company.phone from config
  - AvaWidget DOM removal gated by features.assistant flag
  - Dynamic sitemap service routes derived from services.ts slugs
  - Dynamic sitemap hostname derived from company.ts url field
  - Clean seo.ts without dead buildAggregateRatingSchema export
  - Clean route-generator.ts without dead getCityRoutes export
affects: [sitemap, 404-page, layout, seo-schema, route-generation]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Block-comment-only stripping for hostname URL regex to preserve https:// values"
    - "Dynamic config extraction in vite.config.ts using readFileSync + regex (extended to services.ts)"

key-files:
  created: []
  modified:
    - src/pages/NotFound.tsx
    - src/components/layout/Layout.tsx
    - vite.config.ts
    - src/lib/seo.ts
    - src/lib/route-generator.ts

key-decisions:
  - "Block-comment-only stripping for company.ts hostname regex — line-comment stripping corrupts https:// URLs"
  - "features import in Layout.tsx uses config barrel (../../config) for consistency with App.tsx pattern"

patterns-established:
  - "Pattern: Hostname extraction from company.ts uses https?:// pattern match not comment-stripped url: match"

requirements-completed:
  - CFG-05
  - CFG-06
  - SEO-04

# Metrics
duration: 4min
completed: 2026-02-28
---

# Phase 11 Plan 01: Final Gap Closure & Cleanup Summary

**Phone CTA on 404 page from config, AvaWidget DOM-gated by features.assistant, sitemap routes and hostname auto-derived from config, and 2 dead exports removed from seo.ts and route-generator.ts**

## Performance

- **Duration:** ~4 min
- **Started:** 2026-02-28T01:17:02Z
- **Completed:** 2026-02-28T01:21:00Z
- **Tasks:** 3
- **Files modified:** 5

## Accomplishments

- CFG-05: NotFound.tsx displays a tappable "Call {phone}" button using company.phone from config, positioned between the description and nav buttons with reassuring copy
- CFG-06: Layout.tsx gates `showAvaWidget` on `features.assistant && pathname !== '/ava'` — React skips DOM rendering entirely when false
- SEO-04: vite.config.ts now derives service routes dynamically from services.ts slugs and reads hostname from company.ts url field — both using established readFileSync + regex pattern with fallbacks
- Dead code removed: `buildAggregateRatingSchema()` from seo.ts and `getCityRoutes()` + `CityRoute` interface + orphaned imports from route-generator.ts

## Task Commits

Each task was committed atomically:

1. **Task 1: Add phone CTA to 404 page and gate AvaWidget on feature flag** - `3fa773c` (feat)
2. **Task 2: Derive sitemap service routes and hostname from config** - `237e287` (feat)
3. **Task 3: Remove dead exports from seo.ts and route-generator.ts** - `f199955` (refactor)

## Files Created/Modified

- `src/pages/NotFound.tsx` - Added Phone import, company config import, and tel: link button CTA between description and nav buttons
- `src/components/layout/Layout.tsx` - Added features import from barrel, gated showAvaWidget on features.assistant
- `vite.config.ts` - Service routes now derived from services.ts slugs; hostname now read from company.ts url; JSDoc updated
- `src/lib/seo.ts` - Removed dead buildAggregateRatingSchema() export (19 lines deleted)
- `src/lib/route-generator.ts` - Removed getCityRoutes(), CityRoute interface, and orphaned cityPages/features imports (38 lines removed, scope reduced to services only)

## Decisions Made

- Block-comment-only stripping for company.ts hostname regex: the `//.*/` line-comment stripping regex corrupts `https://` URLs in string values. Using a more specific `https?:\/\/[^']+` pattern in the match regex avoids the issue entirely without needing comment stripping for URL extraction.
- Layout.tsx features import uses config barrel (`../../config`) not direct `../../config/features` for consistency with App.tsx's import pattern.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed hostname regex corrupting https:// URL values**
- **Found during:** Task 2 (Derive sitemap service routes and hostname from config)
- **Issue:** The plan's code used both block and line comment stripping before matching `url: '...'`. The `//` line-comment regex `/\/.*/g` stripped everything after `//` in `https://example.com`, producing a broken hostname like `https:` followed by address object content.
- **Fix:** Changed hostname extraction to use only block-comment stripping, then match with `url:\s*'(https?:\/\/[^']+)'` to specifically match absolute URLs, avoiding the `//` corruption issue entirely.
- **Files modified:** vite.config.ts
- **Verification:** Node.js test confirmed `https://example.com` extracted correctly; build produced valid sitemap URLs with full hostname.
- **Committed in:** 237e287 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Auto-fix was essential for correct sitemap output. Fix follows the same spirit as the plan but uses a more precise regex pattern. No scope creep.

## Issues Encountered

The hostname regex bug was discovered during build verification when the generated sitemap.xml showed malformed URLs (`https:` followed by address object content instead of `https://example.com/route`). Root cause was the line-comment stripping regex inadvertently treating `//` in URL string values as comment markers.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All 3 partial requirement gaps (CFG-05, CFG-06, SEO-04) are now fully closed
- 2 dead exports removed, seo.ts and route-generator.ts are clean
- v1.0 milestone audit requirements fully satisfied
- No blockers for v1.0 milestone completion

---
*Phase: 11-final-gap-closure-cleanup*
*Completed: 2026-02-28*

## Self-Check: PASSED

- src/pages/NotFound.tsx: FOUND
- src/components/layout/Layout.tsx: FOUND
- vite.config.ts: FOUND
- src/lib/seo.ts: FOUND
- src/lib/route-generator.ts: FOUND
- .planning/phases/11-final-gap-closure-cleanup/11-01-SUMMARY.md: FOUND
- Commit 3fa773c (Task 1): FOUND
- Commit 237e287 (Task 2): FOUND
- Commit f199955 (Task 3): FOUND
