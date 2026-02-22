---
phase: 02-visual-polish-performance
plan: 01
subsystem: ui
tags: [framer-motion, LazyMotion, domAnimation, m-component, MotionConfig, reduced-motion, section-heading, react, tailwind]

# Dependency graph
requires:
  - phase: 01-foundation-config-refactor
    provides: "Modular config system, component structure, framer-motion setup"
provides:
  - "LazyMotion + domAnimation + strict mode at app root"
  - "MotionConfig reducedMotion=user for OS preference respect"
  - "All 18 components migrated to m.* pattern"
  - "SectionHeading reusable component with light/dark themes"
  - "Hero instant render (no animation delay on LCP content)"
  - "Projects page working without layout prop (domAnimation compatible)"
affects: [02-visual-polish-performance, 03-lead-generation, 04-blog-system, 05-seo-content, 06-integration-polish]

# Tech tracking
tech-stack:
  added: []
  patterns: [LazyMotion-m-component, SectionHeading-reuse, whileInView-animation, accent-line-gradient]

key-files:
  created:
    - src/components/ui/SectionHeading.tsx
  modified:
    - src/main.tsx
    - src/components/sections/Hero.tsx
    - src/components/sections/BentoGrid.tsx
    - src/components/sections/CTA.tsx
    - src/components/sections/Certifications.tsx
    - src/components/sections/FAQ.tsx
    - src/components/sections/ProcessTimeline.tsx
    - src/components/sections/Stats.tsx
    - src/components/sections/Testimonials.tsx
    - src/components/ui/AvaWidget.tsx
    - src/components/ui/Card.tsx
    - src/pages/About.tsx
    - src/pages/Ava.tsx
    - src/pages/Contact.tsx
    - src/pages/Projects.tsx
    - src/pages/ServiceAreas.tsx
    - src/pages/ServicePage.tsx
    - src/pages/Services.tsx
    - src/pages/TestimonialsPage.tsx

key-decisions:
  - "Used domAnimation (not domMax) to save ~10KB gzipped -- refactored Projects page to not need layout prop"
  - "SectionHeading uses whileInView instead of external isInView ref for self-contained animation"
  - "Hero content is fully static (no motion wrapper) for instant LCP"
  - "Accent line gradient on SectionHeading: brand-blue for light theme, safety-orange for dark theme"

patterns-established:
  - "LazyMotion m.* pattern: All future components must use m.div/m.span/etc, never motion.div (strict mode enforced)"
  - "SectionHeading component: All section headings use SectionHeading with title/subtitle/theme props"
  - "Subtle fade-up: All scroll animations use ~20px y offset with 0.6s duration"
  - "Above-fold content: No animation on hero text/CTAs -- render instantly for CWV"

requirements-completed: [VIS-01, VIS-04]

# Metrics
duration: 11min
completed: 2026-02-22
---

# Phase 2 Plan 1: LazyMotion + SectionHeading Summary

**LazyMotion migration (motion.* to m.*) across 18 files with domAnimation/strict, hero instant render, MotionConfig reduced-motion, and reusable SectionHeading component integrated into 11 section/page components**

## Performance

- **Duration:** 11 min
- **Started:** 2026-02-22T21:28:00Z
- **Completed:** 2026-02-22T21:38:48Z
- **Tasks:** 2
- **Files modified:** 20 (19 modified + 1 created)

## Accomplishments
- Migrated all 18 component files from `motion.*` to `m.*` imports with LazyMotion strict mode at app root
- Eliminated hero content animation entirely for instant LCP -- text and CTA buttons render at first paint
- Added `MotionConfig reducedMotion="user"` to respect OS prefers-reduced-motion setting site-wide
- Removed `layout` prop from Projects page, using `AnimatePresence mode="popLayout"` instead (saves ~10KB by avoiding domMax)
- Normalized all scroll animations to subtle ~20px fade-up per CONTEXT.md decision
- Created premium SectionHeading component with gradient accent line, light/dark themes, and self-contained whileInView animation
- Replaced 15+ inline animated heading blocks across 11 components with consistent SectionHeading usage
- Build size reduced: main JS bundle at 375.98KB (122.47KB gzip) vs pre-migration levels

## Task Commits

Each task was committed atomically:

1. **Task 1: LazyMotion migration + hero fix + Projects layout refactor** - `8f97b13` (feat)
2. **Task 2: Build SectionHeading component + integrate across all sections** - `a615508` (feat)

## Files Created/Modified

### Created
- `src/components/ui/SectionHeading.tsx` - Reusable section heading with title, subtitle, align, as, theme, animated props and gradient accent line

### Modified (Task 1 - LazyMotion migration)
- `src/main.tsx` - Added LazyMotion(domAnimation, strict) + MotionConfig(reducedMotion=user) wrapper
- `src/components/sections/Hero.tsx` - Removed motion import and animation wrapper; hero content renders instantly
- `src/components/sections/BentoGrid.tsx` - motion to m migration, y:30 to y:20
- `src/components/sections/CTA.tsx` - motion to m migration
- `src/components/sections/Certifications.tsx` - motion to m migration
- `src/components/sections/FAQ.tsx` - motion to m, kept AnimatePresence for accordion
- `src/components/sections/ProcessTimeline.tsx` - motion to m, kept useScroll/useTransform/useInView
- `src/components/sections/Stats.tsx` - motion to m migration
- `src/components/sections/Testimonials.tsx` - motion to m, y:30 to y:20
- `src/components/ui/AvaWidget.tsx` - motion to m, kept AnimatePresence for chat modal
- `src/components/ui/Card.tsx` - motion to m migration
- `src/pages/About.tsx` - motion to m migration
- `src/pages/Ava.tsx` - motion to m migration
- `src/pages/Contact.tsx` - motion to m, y:30 to y:20
- `src/pages/Projects.tsx` - motion to m, removed layout props, y:30 to y:20
- `src/pages/ServiceAreas.tsx` - motion to m migration
- `src/pages/ServicePage.tsx` - motion to m, y:30 to y:20 in all section renderers
- `src/pages/Services.tsx` - motion to m, y:30 to y:20
- `src/pages/TestimonialsPage.tsx` - motion to m, y:30 to y:20

### Modified (Task 2 - SectionHeading integration)
- `src/components/sections/BentoGrid.tsx` - Replaced inline heading with SectionHeading
- `src/components/sections/Stats.tsx` - Replaced heading with SectionHeading theme="dark"
- `src/components/sections/ProcessTimeline.tsx` - Replaced heading with SectionHeading
- `src/components/sections/Testimonials.tsx` - Replaced heading with SectionHeading theme="dark"
- `src/components/sections/Certifications.tsx` - Replaced heading with SectionHeading
- `src/components/sections/CTA.tsx` - Replaced heading with SectionHeading theme="dark"
- `src/components/sections/FAQ.tsx` - Replaced heading with SectionHeading
- `src/pages/Projects.tsx` - Replaced Before & After heading with SectionHeading
- `src/pages/About.tsx` - Replaced 3 heading blocks with SectionHeading
- `src/pages/ServiceAreas.tsx` - Replaced States heading with SectionHeading
- `src/pages/ServicePage.tsx` - Replaced 4 section renderer headings (CardGrid, IconGrid, MaterialGrid, StyleGallery) with SectionHeading

## Decisions Made
- Used `domAnimation` instead of `domMax` to optimize bundle size (~10KB savings), which required removing `layout` prop from Projects page -- filter transitions now use AnimatePresence with CSS transitions instead
- SectionHeading uses `whileInView` with `viewport={{ once: true, amount: 0.5 }}` for self-contained scroll animation rather than requiring an external `isInView` ref from parent
- Hero component has zero framer-motion dependency now (no import needed) for maximum LCP performance
- Accent line design: short gradient bar above heading (brand-blue for light sections, safety-orange for dark sections) for premium feel without being flashy

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None - all migrations, builds, and integrations succeeded on first pass.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All components now use `m.*` pattern -- future Phase 2 components (AnimatedTestimonials, BeforeAfterSlider, StickyMobileCTA, Skeletons) must use `m` not `motion`
- SectionHeading is available for any new sections that need consistent heading treatment
- `MotionConfig reducedMotion="user"` is active -- all future animations will automatically respect OS preference
- Ready for Plan 02 (visual components) and Plan 03 (image optimization)

## Self-Check: PASSED

- FOUND: src/components/ui/SectionHeading.tsx
- FOUND: commit 8f97b13 (Task 1)
- FOUND: commit a615508 (Task 2)
- FOUND: .planning/phases/02-visual-polish-performance/02-01-SUMMARY.md

---
*Phase: 02-visual-polish-performance*
*Completed: 2026-02-22*
