---
phase: 08-feature-flag-integration-polish
plan: "01"
subsystem: feature-flags
tags: [feature-flags, routing, sitemap, seo, navigation]
dependency_graph:
  requires: []
  provides: [CFG-02, CFG-06, SEO-04]
  affects: [src/config/features.ts, src/config/navigation.ts, src/App.tsx, src/pages/Projects.tsx, src/pages/ServicePage.tsx, vite.config.ts]
tech_stack:
  added: []
  patterns:
    - Conditional spread pattern for nav arrays (existing, applied to Ava)
    - Conditional JSX route registration with explicit redirect fallback
    - Regex source-text parsing for Node-context feature flag reading
key_files:
  created: []
  modified:
    - src/config/features.ts
    - src/config/navigation.ts
    - src/App.tsx
    - src/pages/Projects.tsx
    - src/pages/ServicePage.tsx
    - vite.config.ts
decisions:
  - Explicit redirect route for disabled /ava (Option C): {features.assistant ? <Route path="ava" element={<Ava />} /> : <Route path="ava" element={<Navigate to="/" replace />} />} honors locked decision of redirect-to-home without breaking the catch-all NotFound
  - Regex text-parsing for feature flags in vite.config.ts Node context (consistent with existing slug extraction pattern — no new files needed)
  - ServicePage redirects to /services on invalid slug (matches CityPage -> /service-areas, ResourcesPost -> /resources parent-redirect pattern)
metrics:
  duration: "2 minutes"
  completed: "2026-02-26"
  tasks_completed: 2
  files_changed: 6
---

# Phase 8 Plan 01: Feature Flag Integration & Polish Summary

**One-liner:** Complete feature flag gating — Ava nav/route behind features.assistant, beforeAfter section behind features.beforeAfter, and sitemap generation that reads flags at build time via regex text parsing.

## What Was Built

Six targeted changes closing three requirement gaps (CFG-02, CFG-06, SEO-04) and fixing one redirect inconsistency:

1. **`src/config/features.ts`** — Added `beforeAfter: true` flag (6th property in the features object)

2. **`src/config/navigation.ts`** — Replaced hardcoded `{ href: '/ava', label: 'Ask Ava' }` in both `getNavLinks()` and `getFooterCompanyLinks()` with the established conditional spread pattern: `...(features.assistant ? [{ href: '/ava', label: 'Ask Ava' }] : [])`

3. **`src/App.tsx`** — Added `Navigate` to react-router-dom import; replaced the unconditional `/ava` route with an explicit ternary: renders `<Ava />` when `features.assistant = true`, redirects to `/` when false. Explicit redirect route (Option C) ensures direct URL navigation to `/ava` goes home rather than showing NotFound.

4. **`src/pages/Projects.tsx`** — Added `import { features } from '../config/features'`; wrapped the entire Before & After `<section>` block in `{features.beforeAfter && ...}`. The `useScrollReveal()` hook calls for `baRef`/`baInView` remain unconditional at component top (React rules of hooks).

5. **`src/pages/ServicePage.tsx`** — Changed invalid-slug redirect from `<Navigate to="/404" replace />` to `<Navigate to="/services" replace />`. Matches the parent-redirect pattern used by CityPage (`/service-areas`) and ResourcesPost (`/resources`).

6. **`vite.config.ts`** — Added `readFeatureFlags()` function above `getRouteList()` that reads `src/config/features.ts` as raw text, strips comments, and extracts boolean values with regex (consistent with existing slug extraction pattern). Updated `getRouteList()` to use flags for `/ava`, `/financing`, `/resources` in static routes and wrapped `cityRoutes` and `blogRoutes` blocks in `if (flags.cityPages)` / `if (flags.blog)` guards. Removed `/ava` from the hardcoded `excludeSet` (flag now controls inclusion).

## Tasks

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Gate Ava and Before/After behind feature flags | b44fdd4 | features.ts, navigation.ts, App.tsx, Projects.tsx |
| 2 | Feature-flag-aware sitemap and ServicePage redirect fix | d1f898b | vite.config.ts, ServicePage.tsx |

## Verification

- `npx tsc --noEmit` — passes with zero errors
- `npm run build` — completes successfully; sitemap generated with `/ava`, `/financing`, `/resources` included (all flags = true)
- All 6 must_have artifact conditions satisfied (verified via grep)

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| Explicit ternary redirect for /ava (Option C) | Honors locked decision "routes redirect to home with 302" without changing the catch-all NotFound behavior. Simpler than a guard HOC for a single route. |
| Regex text-parsing for vite.config.ts flags | Consistent with existing codebase pattern (slug extraction already uses regex on comment-stripped source). No new files, no architectural change. |
| ServicePage redirect to /services not /404 | Matches parent-redirect convention: CityPage -> /service-areas, ResourcesPost -> /resources, ProjectDetail -> /projects. /services is the correct parent for flat service routes. |

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check

| Artifact | Status |
|----------|--------|
| src/config/features.ts — beforeAfter: true | FOUND |
| src/config/navigation.ts — features.assistant (x2) | FOUND |
| src/App.tsx — features.assistant conditional route | FOUND |
| src/pages/Projects.tsx — features.beforeAfter conditional section | FOUND |
| src/pages/ServicePage.tsx — Navigate to="/services" | FOUND |
| vite.config.ts — readFeatureFlags() | FOUND |
| Commit b44fdd4 | FOUND |
| Commit d1f898b | FOUND |

## Self-Check: PASSED
