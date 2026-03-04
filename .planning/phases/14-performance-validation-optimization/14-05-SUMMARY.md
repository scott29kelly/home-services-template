---
phase: 14-performance-validation-optimization
plan: 05
subsystem: ui
tags: [framer-motion, css-animations, scroll-reveal, performance, bundle-size, react]

# Dependency graph
requires:
  - phase: 14-performance-validation-optimization
    plan: 04
    provides: "CSS scroll-reveal pattern in shared components and hooks — useScrollReveal hook, scroll-reveal/in-view CSS classes in index.css"

provides:
  - "Zero framer-motion imports in all 14 page and route files"
  - "framer-motion removed from package.json dependencies"
  - "~67KB JS bundle reduction (framer-motion core + motion bootstrap chunks eliminated)"
  - "All page animations now use CSS scroll-reveal with transitionDelay for stagger"

affects:
  - "14-performance-validation-optimization (phase completion, Lighthouse mobile score)"
  - "lighthouse-targets (mobile Performance 90+ target — JS reduction reduces TBT)"

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "scroll-reveal CSS pattern: className={`scroll-reveal ${isInView ? 'in-view' : ''} ...existing-classes`}"
    - "Stagger delay: style={{ transitionDelay: `${0.1 + i * 0.05}s` }}"
    - "Filter animation: replace AnimatePresence with in-view static assignment — cards already on screen use in-view immediately"
    - "FaqItem sub-component: use in-view static since items are rendered in-place (not scroll-triggered)"

key-files:
  created: []
  modified:
    - src/pages/About.tsx
    - src/pages/Ava.tsx
    - src/pages/CityPage.tsx
    - src/pages/Contact.tsx
    - src/pages/Financing.tsx
    - src/pages/ProjectDetail.tsx
    - src/pages/Projects.tsx
    - src/pages/ServiceAreas.tsx
    - src/pages/ServicePage.tsx
    - src/pages/Services.tsx
    - src/pages/TestimonialsPage.tsx
    - src/routes/service-page.tsx
    - src/routes/service-areas.$slug.tsx
    - src/routes/portfolio.$slug.tsx
    - package.json
    - package-lock.json

key-decisions:
  - "AnimatePresence filter animation replaced with in-view immediate class — filtered cards are already rendered on screen, so instant in-view is correct; exit animation omitted (instant removal acceptable for filter UI)"
  - "FaqItem sub-components (CityPage, service-areas route) use in-view static since they are rendered inside an already-visible section wrapper"
  - "framer-motion uninstalled after zero-import verification — npm removed 3 packages total"

patterns-established:
  - "CSS scroll-reveal migration complete pattern: useScrollReveal provides isInView boolean; apply as className and optional style transitionDelay"

requirements-completed: [PERF-05]

# Metrics
duration: 10min
completed: 2026-03-04
---

# Phase 14 Plan 05: Framer-Motion Removal (Pages + Routes) Summary

**Eliminated framer-motion from all 14 page/route files and uninstalled the package, removing ~67KB of JS animation runtime from the production bundle**

## Performance

- **Duration:** 10 min
- **Started:** 2026-03-04T15:12:41Z
- **Completed:** 2026-03-04T15:22:08Z
- **Tasks:** 2 of 2
- **Files modified:** 16

## Accomplishments

- Replaced framer-motion `m.div` usage in all 11 page components (About, Ava, CityPage, Contact, Financing, ProjectDetail, Projects, ServiceAreas, ServicePage, Services, TestimonialsPage) with CSS scroll-reveal divs
- Replaced framer-motion in all 3 route modules (service-page.tsx, service-areas.$slug.tsx, portfolio.$slug.tsx)
- AnimatePresence filter animation in Projects.tsx replaced with in-view immediate CSS pattern
- `npm uninstall framer-motion` removed 3 packages; zero framer-motion chunks in production build
- Build verified successful: 2217 modules transformed, no TypeScript errors, no missing module errors

## Task Commits

1. **Task 1: Replace framer-motion in all page components** - `e18c451` (feat)
2. **Task 2: Replace framer-motion in route modules and uninstall package** - `9dbd42f` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified

- `src/pages/About.tsx` - 3 scroll-reveal sections (values, team, certs) with i*0.05 stagger
- `src/pages/Ava.tsx` - Header div with in-view static (page-load animation)
- `src/pages/CityPage.tsx` - Services, testimonials, FAQ, nearby sections + FaqItem sub-component
- `src/pages/Contact.tsx` - Form column and sidebar with 0.2s delay
- `src/pages/Financing.tsx` - CTA button wrapper
- `src/pages/ProjectDetail.tsx` - Project details, main image, before/after, related projects
- `src/pages/Projects.tsx` - AnimatePresence replaced; filter grid uses in-view; before/after converted
- `src/pages/ServiceAreas.tsx` - Office, states grid, Texas/Oklahoma city groups with stagger
- `src/pages/ServicePage.tsx` - All 5 section renderers (CardGrid, IconGrid, MaterialGrid, StyleGallery, TrustSection)
- `src/pages/Services.tsx` - Services grid, why-choose-us two columns
- `src/pages/TestimonialsPage.tsx` - Badges, testimonials grid, google review cards
- `src/routes/service-page.tsx` - Identical section renderers as ServicePage.tsx, all converted
- `src/routes/service-areas.$slug.tsx` - FaqItem + 4 scroll-reveal sections
- `src/routes/portfolio.$slug.tsx` - Project details, main image, before/after, related projects
- `package.json` - framer-motion removed from dependencies
- `package-lock.json` - 3 packages removed

## Decisions Made

- **AnimatePresence replacement:** Filter cards that are already rendered on-screen receive `in-view` class immediately (not scroll-triggered). Exit animation omitted — instant card removal is acceptable for filter UX.
- **FaqItem in-view static:** FAQ accordion items are rendered inside a section that is already in view, so they use `scroll-reveal in-view` statically rather than the isInView boolean to avoid complexity.
- **npm uninstall approach:** Ran `npm uninstall framer-motion` after confirming zero imports, removing all 3 related packages (framer-motion core + 2 dependencies).

## Deviations from Plan

None - plan executed exactly as written. All 14 files converted, package uninstalled, build verified.

## Bundle Size Reduction

Pre-removal (from 14-02 baseline):
- `is-svg-component-*.js` ~32KB framer-motion core: **gone**
- `root-*.js` ~35KB framer-motion bootstrap: **gone**

Post-removal build (confirmed):
- No framer-motion chunks present
- `entry.client` 190KB (React + ReactDOM — unchanged)
- `chunk-LFPYN7LY` 126KB (React Router — unchanged)
- Total framer-motion elimination: ~67KB uncompressed (~25KB gzipped)

## Issues Encountered

None — TypeScript compiled cleanly on first check. Build succeeded on first run.

## Next Phase Readiness

- framer-motion fully eliminated from codebase — PERF-05 requirement satisfied
- Remaining phase 14 plans: 14-06 (final Lighthouse validation after all optimizations)
- Expected mobile Lighthouse improvement: 100-300ms less TBT from eliminated JS animation runtime hydration

---
*Phase: 14-performance-validation-optimization*
*Completed: 2026-03-04*
