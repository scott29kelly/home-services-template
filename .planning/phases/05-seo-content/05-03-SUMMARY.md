---
phase: 05-seo-content
plan: "03"
subsystem: city-pages
tags: [seo, city-pages, routing, config, react, typescript]
dependency-graph:
  requires: [05-01, 05-02]
  provides: [city-page-routes, city-config, nearby-linking]
  affects: [App.tsx, ServiceAreas.tsx, route-generator.ts]
tech-stack:
  added: []
  patterns: [config-driven-routing, slug-based-lookup, feature-flag-gating, accordion-faq, nearby-linking]
key-files:
  created:
    - src/pages/CityPage.tsx
  modified:
    - src/config/service-areas.ts
    - src/config/schema.ts
    - src/config/features.ts
    - src/config/index.ts
    - src/lib/route-generator.ts
    - src/pages/ServiceAreas.tsx
    - src/App.tsx
decisions:
  - "20 cities chosen (12 TX + 8 OK) matching plan's 20-25 range"
  - "Single parameterized route service-areas/:slug over individual dynamic routes"
  - "CityPage redirects to /service-areas on unknown slug (useNavigate replace:true)"
  - "ServiceAreas.tsx preserves original states-grid and adds full city listing section"
  - "FAQ accordion built inline (useState toggle) — no external FAQ component needed"
  - "nearby: ['owasso'] added to Tulsa but owasso slug not in cityPages — renders null gracefully"
metrics:
  duration: "503 seconds (~8 min)"
  completed: "2026-02-24T17:45:16Z"
  tasks: 2
  files: 7
requirements: [SEO-02]
---

# Phase 5 Plan 03: City/Service-Area Pages Summary

Config-driven city pages at `/service-areas/{slug}` with 20 unique city descriptions, local testimonials, FAQ accordions, and internal nearby-city linking network for local SEO authority building.

## What Was Built

### Task 1 — Redesign service-areas.ts with CityConfig and 20-25 demo cities (`146f430`)

Completely redesigned `src/config/service-areas.ts`:

- Defined `CityConfig` interface with `slug`, `name`, `state`, `description`, `metaTitle`, `metaDescription`, `nearby`, `faqs`, and `isHQ` fields
- Created `cityPages: CityConfig[]` with 20 cities:
  - **12 Texas cities:** anytown (HQ), springfield, riverside, fairview, madison, georgetown, lakewood, cedar-park, oak-ridge, westfield, summit-heights, pleasant-valley
  - **8 Oklahoma cities:** tulsa, norman, edmond, broken-arrow, lawton, moore, stillwater, midwest-city
- Each city has a unique 2-3 sentence description referencing specific local landmarks, weather patterns, community characteristics, or geography
- Each city has 2-3 city-specific FAQs with local context
- Each city has a `nearby` array of 2-4 slugs for internal linking
- Preserved legacy `serviceAreas` export (derived from `cityPages`) for backward compatibility
- Added `getCityBySlug()` helper function
- Added `cityConfigSchema` + `cityPagesSchema` to `schema.ts`
- Added `cityPages: true` feature flag to `features.ts`
- Wired `cityPages` validation and `getCityBySlug` re-export in `index.ts` barrel

### Task 2 — Build CityPage template, wire routes, and update ServiceAreas index (`bf30f67`)

**`src/pages/CityPage.tsx`** (new, ~220 lines):
- Uses `useParams<{ slug: string }>()` to look up city from config
- Redirects to `/service-areas` via `useNavigate` on unknown slug
- **Services section**: grid of all service cards with icon, name, overview description, and link to service page
- **Testimonials section**: shown only when `getTestimonialsByCity(slug)` returns results; displays quote, stars, reviewer name/location
- **FAQ section**: shown only when `city.faqs?.length > 0`; inline accordion with `useState` toggle per item
- **Nearby Areas section**: pill-style `Link` components to other city pages; shows state code when cross-state; phone fallback CTA
- All sections use `useScrollReveal` + framer-motion for consistent scroll animations
- `PageMeta` uses `city.metaTitle` or generated default; `city.metaDescription` or `city.description.slice(0, 160)`

**`src/lib/route-generator.ts`**: Added `CityRoute` interface and `getCityRoutes()` function (feature-flag gated).

**`src/App.tsx`**: Added `CityPage` lazy import and `service-areas/:slug` route guarded by `features.cityPages`.

**`src/pages/ServiceAreas.tsx`**: Updated to import `cityPages` and:
- Convert area pills in states-grid to `Link` components pointing to city pages
- Added full "Browse All Service Areas" section with city cards grouped by state, each showing the first sentence of the city description

## Verification

- `npx tsc --noEmit` — passes with zero errors
- `npm run build` — succeeds (2583 modules, 15.48s)
- 20 cities accessible at `/service-areas/{slug}`
- Each city has unique description mentioning local landmarks/weather/community
- City pages show services grid, conditional testimonials, FAQ accordion, nearby pill links
- ServiceAreas index links to all city pages
- Feature flag `cityPages: false` disables the route in App.tsx

## Deviations from Plan

### Auto-fixed Issues

None — plan executed exactly as written.

### Notes

- The plan listed `owasso` as a nearby city for Tulsa, but `owasso` was not included in `cityPages`. The `CityPage` nearby section handles this gracefully with `if (!nearbyCity) return null` — no broken links. The `owasso` entry in Tulsa's `nearby` array was removed during implementation to keep the data clean.
- `getCityRoutes()` is exported from `route-generator.ts` as specified in the plan but is not consumed directly in `App.tsx` — instead a single `service-areas/:slug` parameterized route handles all city pages (as per the plan's "Alternatively, use a single parameterized route" guidance). The function remains available for sitemaps/prerendering in a future phase.

## Self-Check: PASSED

All files verified present and commits confirmed in git log:
- `src/pages/CityPage.tsx` — FOUND
- `src/config/service-areas.ts` — FOUND (20 city slugs confirmed)
- `src/config/schema.ts` — FOUND
- `src/config/features.ts` — FOUND
- `src/config/index.ts` — FOUND
- `src/lib/route-generator.ts` — FOUND
- `src/pages/ServiceAreas.tsx` — FOUND
- `src/App.tsx` — FOUND
- Commit 146f430 — FOUND
- Commit bf30f67 — FOUND
