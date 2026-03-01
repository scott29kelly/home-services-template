---
phase: 10-performance-monitoring
verified: 2026-02-26T22:45:00Z
status: gaps_found
score: 4/5 must-haves verified
gaps:
  - truth: "Lighthouse Performance score is 90+ on production build"
    status: failed
    reason: "Desktop score is 87, mobile score is 51. Both are below the 90+ target. Root cause is pre-existing SPA architecture (no SSR, 513KB bundle, hero image not in <picture> element) — none attributable to Phase 10 work."
    artifacts:
      - path: ".planning/phases/10-performance-monitoring/10-LIGHTHOUSE.md"
        issue: "Documents the shortfall with full root cause analysis. The gap is known, accepted, and deferred — not an implementation error."
    missing:
      - "Lighthouse Performance 90+ target requires SSR/pre-rendering (deferred to future milestone) or PERF-01 hero <picture> element fix — both are out of Phase 10 scope"
human_verification:
  - test: "Verify Core Web Vitals appear in browser console during development"
    expected: "After navigating between pages and interacting for ~5 seconds, CLS, INP, and LCP entries appear in Chrome DevTools console as color-coded collapsed groups with name, value, and rating"
    why_human: "Cannot simulate browser paint events or observe console output programmatically"
  - test: "Run Lighthouse on real hardware (not CPU-throttled CI environment)"
    expected: "Desktop Performance score 90-95, Accessibility 90, SEO 100 on a modern machine (benchmark index 1000+)"
    why_human: "Lighthouse scores are environment-dependent; CI benchmark index 565-608 depresses scores significantly vs. real devices"
---

# Phase 10: Performance Monitoring Verification Report

**Phase Goal:** Add Core Web Vitals monitoring and performance reporting to meet PERF-02 requirements.
**Verified:** 2026-02-26T22:45:00Z
**Status:** gaps_found (1 truth failed — Lighthouse Performance 90+ not met; gap is pre-existing SPA architecture, not Phase 10 implementation failure)
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Core Web Vitals (CLS, INP, LCP) are measured and logged to console in development | VERIFIED | `src/lib/vitals.ts`: `onCLS(logMetric)`, `onINP(logMetric)`, `onLCP(logMetric)` all called; `logMetric` guarded by `import.meta.env.DEV` with color-coded console output |
| 2 | Vercel Speed Insights can be enabled via `VITE_VERCEL_SPEED_INSIGHTS=true` environment variable | VERIFIED | `App.tsx` line 76: `import.meta.env.VITE_VERCEL_SPEED_INSIGHTS === 'true' && <SpeedInsights />`; `.env.example` documents the variable |
| 3 | Lighthouse Performance score is 90+ on production build | FAILED | Desktop: 87/100, Mobile: 51/100 — both below 90+ target. Root cause: pre-existing SPA architecture (no SSR, 513KB bundle, hero without `<picture>`). Not introduced by Phase 10. |
| 4 | Lighthouse Accessibility score is 90+ on production build | VERIFIED | Score: 90 (exactly meets target). Documented in `10-LIGHTHOUSE.md`. |
| 5 | Lighthouse SEO score is 90+ on production build | VERIFIED | Score: 100. Documented in `10-LIGHTHOUSE.md`. |

**Score:** 4/5 truths verified

---

## Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/lib/vitals.ts` | Core Web Vitals reporting module, exports `reportWebVitals` | VERIFIED | 28 lines; imports `onCLS`, `onINP`, `onLCP`, `type Metric` from `web-vitals`; exports `reportWebVitals()`; dev-only color-coded console output; production no-op with analytics placeholder comment |
| `.env.example` | Env variable documentation containing `VITE_VERCEL_SPEED_INSIGHTS` | VERIFIED | 14 lines; documents all env vars: `VITE_VERCEL_SPEED_INSIGHTS`, `VITE_API_URL`, `GROQ_API_KEY`, `ANTHROPIC_API_KEY`, `ALLOWED_ORIGIN` |
| `src/main.tsx` | Imports and calls `reportWebVitals()` after render | VERIFIED (wired) | Line 7: `import { reportWebVitals } from './lib/vitals'`; Line 21: `reportWebVitals()` called after `createRoot(...).render(...)` block |
| `src/App.tsx` | Conditional `<SpeedInsights />` behind env guard | VERIFIED (wired) | Line 3: `import { SpeedInsights } from '@vercel/speed-insights/react'`; Line 76: strict `=== 'true'` env guard used correctly |
| `.planning/phases/10-performance-monitoring/10-LIGHTHOUSE.md` | Lighthouse audit documenting scores and root cause | VERIFIED | Full audit report: mobile 51/desktop 87 Performance, Accessibility 90, SEO 100; detailed root cause analysis; deferred items table |

---

## Key Link Verification

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| `src/main.tsx` | `src/lib/vitals.ts` | `import { reportWebVitals }` + call after render | WIRED | Import on line 7, call on line 21 — after the `createRoot().render()` block, not inside JSX |
| `src/App.tsx` | `@vercel/speed-insights/react` | `import { SpeedInsights }` + conditional render behind `VITE_VERCEL_SPEED_INSIGHTS === 'true'` | WIRED | Import on line 3, env-gated render on line 76 with strict string comparison |
| `package.json` | `web-vitals` | npm dependency | WIRED | `"web-vitals": "^5.1.0"` in dependencies at line 25 |
| `package.json` | `@vercel/speed-insights` | npm dependency | WIRED | `"@vercel/speed-insights": "^1.3.1"` in dependencies at line 15 |

---

## Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|---------|
| PERF-02 | 10-01-PLAN.md | Built-in Core Web Vitals monitoring: `web-vitals` reports CLS/INP/LCP, Vercel Speed Insights integration (optional), Lighthouse 90+ targets | PARTIALLY SATISFIED | `web-vitals` reporting: DONE. Speed Insights opt-in: DONE. Accessibility 90+: DONE (score 90). SEO 90+: DONE (score 100). Performance 90+: NOT MET (desktop 87, mobile 51). REQUIREMENTS.md already annotates this gap with the note: "Performance=87 desktop / 51 mobile — below target due to pre-existing SPA architecture (SSR deferred to future milestone)". The requirement priority is COULD (not MUST). |

**Orphaned requirements:** None. Only PERF-02 is mapped to Phase 10 in REQUIREMENTS.md, and it is claimed by `10-01-PLAN.md`.

---

## Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `src/lib/vitals.ts` | 15 | `// Future: replace this no-op with an analytics.track() call` | INFO | Intentional extension point documented by comment — not a stub; production behavior is correct (no-op is the desired default) |

No blockers. No TODO/FIXME/HACK/PLACEHOLDER patterns found in `src/lib/vitals.ts`, `src/main.tsx`, or `src/App.tsx`. TypeScript compilation passes without errors (`npx tsc --noEmit` exits clean).

---

## Human Verification Required

### 1. Core Web Vitals Console Output

**Test:** Run `npm run dev`, open Chrome DevTools console, navigate between pages and interact with the page for 5-10 seconds.
**Expected:** CLS, INP, and LCP entries appear as collapsed console groups labeled `[Web Vitals] LCP: X.XXX — good/needs-improvement/poor` with color-coded labels (green/orange/red). Expanding the group shows the full metric object.
**Why human:** Cannot simulate browser paint events, layout shift detection, or INP interaction programmatically. Requires actual browser rendering lifecycle.

### 2. Lighthouse Performance on Real Hardware

**Test:** Run `npm run build && npm run preview`, then open Chrome DevTools > Lighthouse tab on `http://localhost:4173`. Select Performance, Accessibility, SEO; Mode: Navigation; Device: Desktop. Analyze page load.
**Expected:** Performance 90-95, Accessibility 90, SEO 100. The Lighthouse CLI scores (desktop 87) were measured on a CPU-constrained environment (benchmark index 565-608). Real user hardware with benchmark index 1000+ should cross the 90 threshold.
**Why human:** Lighthouse scores are highly sensitive to the host machine's CPU benchmark index. The CLI run in a constrained environment is a worst-case measurement, not representative of user hardware.

---

## Gaps Summary

**One truth fails:** "Lighthouse Performance score is 90+" — desktop 87, mobile 51.

This failure is entirely attributable to pre-existing architectural constraints, not Phase 10 implementation:

1. **SPA hydration overhead (primary):** The site is a React SPA without SSR. Lighthouse's mobile simulation applies 4x CPU throttling, which severely penalizes JavaScript bundle evaluation time (TBT: 720ms mobile) and delays LCP until React hydrates and renders the hero image (LCP: 7.9s mobile). This was a deliberate Phase 2 decision: *"Pre-rendering deferred to future milestone"*.

2. **PERF-01 gap (contributing):** The hero image is not in a `<picture>` element with WebP source — a gap documented in PERF-01, which is separate from Phase 10's PERF-02 scope.

3. **Bundle size (contributing):** 513KB minified / 163KB gzipped main bundle with ~59KB unused JS. Code-splitting optimization is dependent on SSR strategy.

**The core PERF-02 deliverable is fully implemented:** `web-vitals` observes and reports CLS, INP, and LCP in development; Vercel Speed Insights is opt-in via env var; the infrastructure is correctly wired with zero TypeScript errors. REQUIREMENTS.md already reflects this known gap with an annotation. The requirement priority is COULD (not a v1.0 launch blocker).

**To close the Lighthouse Performance gap:** Add SSR or pre-rendering (React Router v7 framework mode or `vite-plugin-prerender`). This is the correct fix per Phase 2 decision log and `10-LIGHTHOUSE.md` recommendation. It is out of Phase 10 scope.

---

_Verified: 2026-02-26T22:45:00Z_
_Verifier: Claude (gsd-verifier)_
