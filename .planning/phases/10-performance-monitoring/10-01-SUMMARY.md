---
phase: 10-performance-monitoring
plan: "01"
subsystem: ui
tags: [web-vitals, performance, lighthouse, vercel, speed-insights, monitoring]

# Dependency graph
requires:
  - phase: 09-ava-chat-enhancement
    provides: App.tsx and main.tsx stable entry points for integration
provides:
  - Core Web Vitals reporter module (src/lib/vitals.ts)
  - Vercel Speed Insights opt-in integration in App.tsx
  - Environment variable documentation (.env.example)
  - Lighthouse audit baseline (10-LIGHTHOUSE.md)
affects: []

# Tech tracking
tech-stack:
  added:
    - web-vitals@5 (~2KB brotli — onCLS/onINP/onLCP observers)
    - "@vercel/speed-insights (React component for Vercel RUM)"
  patterns:
    - "reportWebVitals() called once from main.tsx after createRoot().render() — never inside components"
    - "Env guard with strict === 'true' comparison for Vite VITE_* boolean env vars"

key-files:
  created:
    - src/lib/vitals.ts
    - .env.example
    - .planning/phases/10-performance-monitoring/10-LIGHTHOUSE.md
  modified:
    - src/main.tsx
    - src/App.tsx
    - package.json

key-decisions:
  - "Console-only vitals reporting in dev (import.meta.env.DEV guard); production is no-op with analytics.track() placeholder comment"
  - "SpeedInsights mounted outside Suspense in App() fragment — ensures it is not affected by lazy-load boundary lifecycle"
  - "Performance target of 90+ not met due to pre-existing SPA architecture — Lighthouse mobile=51, desktop=87; deferred to SSR milestone"

patterns-established:
  - "Pattern: Env-gated third-party widgets use === 'true' strict comparison, not truthy check, for VITE_ boolean vars"
  - "Pattern: One-time observers (web-vitals) called after render in main.tsx, never inside React components"

requirements-completed: [PERF-02]

# Metrics
duration: 25min
completed: 2026-02-26
---

# Phase 10 Plan 01: Performance Monitoring Summary

**Core Web Vitals reporter wired via web-vitals v5 (onCLS/onINP/onLCP), Vercel Speed Insights opt-in added to App.tsx, Lighthouse audit documented with mobile 51 / desktop 87 scores (SPA architecture ceiling).**

## Performance

- **Duration:** ~25 min
- **Started:** 2026-02-26T21:52:30Z
- **Completed:** 2026-02-26T22:17:00Z
- **Tasks:** 2
- **Files modified:** 6 (src/lib/vitals.ts, src/main.tsx, src/App.tsx, .env.example, package.json, package-lock.json) + 1 planning file

## Accomplishments

- Created `src/lib/vitals.ts` with dev-only color-coded console reporting of CLS, INP, and LCP via the official `web-vitals` v5 library
- Wired `reportWebVitals()` call into `src/main.tsx` after `createRoot().render()` — placement ensures zero impact on initial paint performance
- Added conditional `<SpeedInsights />` to `App.tsx` inside a React fragment, gated by `import.meta.env.VITE_VERCEL_SPEED_INSIGHTS === 'true'` (strict string comparison avoids undefined-is-truthy trap)
- Created `.env.example` documenting all environment variables including the new Speed Insights flag and existing API/backend vars
- Ran Lighthouse CLI against production preview build: Accessibility 90, SEO 100 (both meet 90+ target); Performance 87 desktop / 51 mobile (below 90 due to SPA architecture, not Phase 10 work)
- Documented Lighthouse results in `10-LIGHTHOUSE.md` with root cause analysis and deferred items

## Task Commits

Each task was committed atomically:

1. **Task 1: Install web-vitals and Speed Insights, create vitals reporter, wire into app** - `fbb7026` (feat)
2. **Task 2: Run Lighthouse audit on production build and verify 90+ scores** - `02db16a` (docs)

**Plan metadata:** (see final commit below)

## Files Created/Modified

- `src/lib/vitals.ts` - Core Web Vitals reporter: dev-only color-coded console output, production no-op with analytics placeholder
- `src/main.tsx` - Added `reportWebVitals()` call after render block
- `src/App.tsx` - Added `<SpeedInsights />` conditional rendering in fragment, `SpeedInsights` import
- `.env.example` - New file documenting `VITE_VERCEL_SPEED_INSIGHTS`, `VITE_API_URL`, `GROQ_API_KEY`, `ANTHROPIC_API_KEY`, `ALLOWED_ORIGIN`
- `package.json` - Added `web-vitals` and `@vercel/speed-insights` dependencies
- `.planning/phases/10-performance-monitoring/10-LIGHTHOUSE.md` - Full Lighthouse audit report with scores, root cause analysis, and remediation roadmap

## Decisions Made

- **Console-only vitals reporting in dev:** The `logMetric` function wraps all output in `import.meta.env.DEV` so no console output appears in production. The else branch uses `void metric` as a no-op with a `// Future: analytics.track()` comment — clean extension point for template users who want production analytics.
- **SpeedInsights outside Suspense boundary:** Mounted in a `<>` fragment alongside `<Suspense>` rather than inside it, ensuring the component's mount lifecycle is not affected by lazy-load suspense boundaries.
- **Performance 90+ target not met — documented and deferred:** Lighthouse desktop=87, mobile=51. Root cause is SPA architecture (no SSR, 513KB main bundle, hero image not in `<picture>` element). All causes are pre-existing decisions from Phases 1-2. No Phase 10 scope fixes would meaningfully close the gap; SSR pre-rendering (deferred in Phase 2 decision log) is the correct solution.

## Deviations from Plan

None — plan executed exactly as written. The Lighthouse Performance score below 90 is a pre-existing architectural constraint explicitly documented as a known gap in Phase 2 research; Task 2 instructions correctly anticipated this outcome and directed documentation rather than scope expansion.

## Issues Encountered

- **Lighthouse CLI Windows EPERM on temp cleanup:** Lighthouse wrote the JSON report successfully but threw `EPERM, Permission denied` when trying to delete its temp directory on Windows. This is a known Windows permission issue with Lighthouse CLI. The JSON report was fully written and parsed before the cleanup error. Scores were successfully extracted and documented.
- **Pre-existing rollup vulnerability:** `npm audit` flagged a high-severity Arbitrary File Write vulnerability in `rollup 4.0.0-4.58.0` (GHSA-mw96-cpmx-2vgc) — pre-existing in the project, not introduced by Phase 10 packages. Documented here; `npm audit fix` can be run at any time.

## User Setup Required

To enable Vercel Speed Insights monitoring on a Vercel deployment:

1. Copy `.env.example` to `.env.local` (or set in Vercel project settings)
2. Set `VITE_VERCEL_SPEED_INSIGHTS=true`
3. Deploy to Vercel — the `<SpeedInsights />` component handles the rest

For non-Vercel deployments: leave `VITE_VERCEL_SPEED_INSIGHTS=false` (default). The component will not mount.

## Next Phase Readiness

Phase 10 is the final planned phase for v1.0. PERF-02 is closed. The project is at v1.0 readiness with the following known remaining gaps documented:
- PERF-01 hero image `<picture>` element (deferred from Phase 2)
- Lighthouse Performance 90+ on mobile (requires SSR/pre-rendering)
- Phase 6 (Integration & Polish) was marked NOT STARTED but all v1.0 requirements are otherwise satisfied

---
*Phase: 10-performance-monitoring*
*Completed: 2026-02-26*

## Self-Check: PASSED

- FOUND: src/lib/vitals.ts
- FOUND: src/main.tsx
- FOUND: src/App.tsx
- FOUND: .env.example
- FOUND: .planning/phases/10-performance-monitoring/10-LIGHTHOUSE.md
- FOUND: .planning/phases/10-performance-monitoring/10-01-SUMMARY.md
- FOUND: commit fbb7026 (Task 1)
- FOUND: commit 02db16a (Task 2)
