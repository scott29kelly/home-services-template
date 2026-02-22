---
phase: 02-visual-polish-performance
plan: 03
subsystem: ui
tags: [sticky-cta, mobile, image-optimization, sharp, vite-plugin, lazy-loading, fetchPriority, CLS, LCP, CWV]

# Dependency graph
requires:
  - phase: 02-visual-polish-performance
    provides: "LazyMotion m.* pattern, SectionHeading, AnimatedTestimonials, BeforeAfterSlider"
  - phase: 01-foundation-config-refactor
    provides: "Modular config with company.phone, SITE object"
provides:
  - "StickyMobileCTA component with phone, quote, and Ava chat actions"
  - "CustomEvent coordination between StickyMobileCTA and AvaWidget"
  - "Build-time image optimization pipeline via sharp (99 images, 65% reduction)"
  - "All img tags have width/height attributes for CLS prevention"
  - "Hero image fetchPriority=high, below-fold images loading=lazy + decoding=async"
affects: [03-lead-generation, 06-integration-polish]

# Tech tracking
tech-stack:
  added: [vite-plugin-image-optimizer, sharp]
  patterns: [custom-vite-plugin-for-images, CustomEvent-widget-coordination, img-dimensions-CLS, lazy-loading-below-fold]

key-files:
  created:
    - src/components/ui/StickyMobileCTA.tsx
  modified:
    - src/components/layout/Layout.tsx
    - src/components/ui/AvaWidget.tsx
    - vite.config.ts
    - package.json
    - src/components/sections/Hero.tsx
    - src/components/sections/BentoGrid.tsx
    - src/components/ui/AnimatedTestimonials.tsx
    - src/pages/About.tsx
    - src/pages/Ava.tsx
    - src/pages/Projects.tsx
    - src/pages/ServicePage.tsx
    - src/pages/Services.tsx
    - src/pages/TestimonialsPage.tsx

key-decisions:
  - "Custom copyAndOptimizeImages Vite plugin to work around lstatSync junction bug in vite-plugin-image-optimizer on Windows"
  - "publicDir set to false -- Vite serves /images from project root in dev, custom plugin handles production copy+optimize"
  - "CustomEvent 'open-ava-chat' pattern for StickyMobileCTA-to-AvaWidget coordination (avoids prop drilling)"
  - "AvaWidget floating button repositioned to bottom-20 on mobile to clear sticky CTA bar"

patterns-established:
  - "Image optimization: All new images automatically optimized at build via sharp (jpeg/png quality 80, webp quality 80 lossy)"
  - "CLS prevention: Every img tag must have explicit width + height attributes"
  - "Loading strategy: Hero/above-fold images use fetchPriority=high (no lazy), all below-fold use loading=lazy + decoding=async"
  - "Widget coordination: Use CustomEvent dispatch/listen pattern for cross-component communication without prop drilling"

requirements-completed: [VIS-03, PERF-01]

# Metrics
duration: 10min
completed: 2026-02-22
---

# Phase 2 Plan 3: StickyMobileCTA + Image Optimization Summary

**Sticky mobile CTA bar with phone/quote/chat actions, plus sharp-based image optimization pipeline reducing 99 images by 65% (32MB saved) with proper width/height attributes and lazy loading across all 19 img tags**

## Performance

- **Duration:** 10 min
- **Started:** 2026-02-22T21:49:44Z
- **Completed:** 2026-02-22T22:00:00Z
- **Tasks:** 2
- **Files modified:** 14 (1 created + 13 modified)

## Accomplishments
- Built StickyMobileCTA component: frosted glass bottom bar on mobile with phone call, Free Quote link, and Ava chat trigger -- appears on scroll past 300px, hidden on desktop and /ava page
- Coordinated StickyMobileCTA with AvaWidget via CustomEvent pattern -- Ava chat button in sticky bar opens the chat widget, floating button repositioned on mobile to avoid overlap
- Installed vite-plugin-image-optimizer + sharp for build-time image compression
- Created custom copyAndOptimizeImages Vite plugin to handle /images directory (working around lstatSync junction bug in the upstream plugin)
- 99 images processed at build time: JPGs see 75-95% reduction, WebPs see 1-21% additional compression, 32MB total savings
- All 19 img tags across 11 components now have explicit width and height attributes for CLS prevention
- Hero image uses fetchPriority="high" with no lazy loading for fast LCP
- All below-fold images use loading="lazy" and decoding="async"

## Task Commits

Each task was committed atomically:

1. **Task 1: Build StickyMobileCTA + integrate into Layout + coordinate with AvaWidget** - `64641fc` (feat)
2. **Task 2: Image optimization pipeline + width/height attributes + lazy loading** - `2f06242` (feat)

## Files Created/Modified

### Created
- `src/components/ui/StickyMobileCTA.tsx` - Fixed bottom bar on mobile with phone, quote CTA, and Ava chat trigger; scroll-based visibility; frosted glass styling

### Modified
- `src/components/layout/Layout.tsx` - Added StickyMobileCTA import and render
- `src/components/ui/AvaWidget.tsx` - Added open-ava-chat event listener, repositioned floating button on mobile (bottom-20), added width/height to avatar images
- `vite.config.ts` - Added ViteImageOptimizer plugin, custom copyAndOptimizeImages plugin, set publicDir: false
- `package.json` - Removed manual `cp -r images dist/images` from build script, added sharp + vite-plugin-image-optimizer devDependencies
- `src/components/sections/Hero.tsx` - Added width=1920 height=1080 to hero background image
- `src/components/sections/BentoGrid.tsx` - Added width/height/decoding=async to 3 service card images
- `src/components/ui/AnimatedTestimonials.tsx` - Added loading=lazy/decoding=async to testimonial images
- `src/pages/About.tsx` - Added width=400 height=400 + decoding=async to team member photos
- `src/pages/Ava.tsx` - Added width/height + lazy/async to 3 avatar images
- `src/pages/Projects.tsx` - Added width=800 height=600 + decoding=async to project gallery images
- `src/pages/ServicePage.tsx` - Added width/height + decoding=async to CardGrid and StyleGallery images
- `src/pages/Services.tsx` - Added width=800 height=448 + decoding=async to service overview images
- `src/pages/TestimonialsPage.tsx` - Added width=48 height=48 + decoding=async to testimonial thumbnails

## Decisions Made
- Used CustomEvent 'open-ava-chat' for StickyMobileCTA-to-AvaWidget coordination instead of lifting state to Layout (cleaner, avoids prop drilling)
- Created custom Vite plugin for image optimization instead of relying solely on vite-plugin-image-optimizer, which has a bug with Windows junctions (uses lstatSync which treats junctions as files, not directories)
- Set publicDir: false rather than creating a proper public/ directory -- simpler for this project where images/ lives at project root
- AvaWidget floating button uses bottom-20 on mobile (md:bottom-6 on desktop) to sit above the sticky CTA bar
- Image dimensions use representative aspect ratios (16:9 for hero, 4:3 for projects, 1:1 for team) even though CSS controls rendered size -- the browser uses these for aspect ratio calculation to prevent CLS

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Installed sharp as peer dependency for vite-plugin-image-optimizer**
- **Found during:** Task 2 (image optimization pipeline setup)
- **Issue:** vite-plugin-image-optimizer lists sharp as a peer dependency but it was not installed; the optimizer silently did nothing without it
- **Fix:** Ran `npm install -D sharp`
- **Files modified:** package.json, package-lock.json
- **Verification:** Build now shows optimization stats
- **Committed in:** 2f06242 (Task 2 commit)

**2. [Rule 3 - Blocking] Created custom Vite plugin for image directory handling**
- **Found during:** Task 2 (image optimization pipeline setup)
- **Issue:** vite-plugin-image-optimizer's readAllFiles function uses fs.lstatSync which returns isDirectory=false for Windows junctions/symlinks, causing the plugin to skip the entire images directory
- **Fix:** Wrote custom copyAndOptimizeImages Vite plugin that reads images/ directly with fs.readdir and processes them with sharp at closeBundle
- **Files modified:** vite.config.ts
- **Verification:** Build output shows 99 images processed with 65% total reduction
- **Committed in:** 2f06242 (Task 2 commit)

**3. [Rule 1 - Bug] Fixed React hooks ordering in StickyMobileCTA**
- **Found during:** Task 1 (StickyMobileCTA build)
- **Issue:** Initial implementation had early return (`if (pathname === '/ava') return null`) before useEffect hook, violating React's rules of hooks
- **Fix:** Moved conditional to after all hooks, used isAvaPage boolean to conditionally register scroll listener
- **Files modified:** src/components/ui/StickyMobileCTA.tsx
- **Verification:** No React hooks warning, component correctly hidden on /ava page
- **Committed in:** 64641fc (Task 1 commit)

---

**Total deviations:** 3 auto-fixed (1 bug fix, 2 blocking issues)
**Impact on plan:** All auto-fixes necessary for correct functionality. The custom Vite plugin was essential because the upstream plugin has a genuine bug with Windows junctions. No scope creep.

## Issues Encountered
- vite-plugin-image-optimizer silently produces no output when sharp is not installed (no error, no warning) -- required investigation to discover the missing peer dependency
- The plugin's readAllFiles uses lstatSync which doesn't follow Windows junctions -- required writing a custom replacement plugin

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 2 is now complete (all 3 plans executed)
- StickyMobileCTA is integrated and ready for the contact form on /contact (Phase 3: Lead Generation)
- Image optimization pipeline is production-ready -- any new images added to /images will be automatically compressed at build time
- All CWV improvements (CLS from dimensions, LCP from eager hero, lazy loading) are in place
- Ready for Phase 3: Lead Generation (contact forms, booking calendar, service area pages)

## Self-Check: PASSED

- FOUND: src/components/ui/StickyMobileCTA.tsx
- FOUND: vite.config.ts (ViteImageOptimizer configured)
- FOUND: StickyMobileCTA import in Layout.tsx
- FOUND: open-ava-chat listener in AvaWidget.tsx
- FOUND: fetchPriority=high in Hero.tsx
- FOUND: commit 64641fc (Task 1)
- FOUND: commit 2f06242 (Task 2)
- FOUND: .planning/phases/02-visual-polish-performance/02-03-SUMMARY.md

---
*Phase: 02-visual-polish-performance*
*Completed: 2026-02-22*
