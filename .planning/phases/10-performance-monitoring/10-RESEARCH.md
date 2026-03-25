# Phase 10: Performance Monitoring - Research

**Researched:** 2026-02-26
**Domain:** Core Web Vitals, web-vitals library, Vercel Speed Insights, Lighthouse
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

All implementation decisions were delegated to Claude's discretion. No user-locked choices.

### Claude's Discretion

**Reporting destination:**
- Console logging in development for developer visibility
- Vercel Speed Insights in production for real-user monitoring
- No custom analytics endpoint needed — this is a template, not a SaaS product

**Lighthouse enforcement:**
- One-time verification during this phase to confirm 90+ targets are met
- No CI integration — over-engineering for a template project
- Document the scores achieved; fix any regressions found during verification

**Vitals visibility:**
- Console logging only — no debug overlay or dashboard
- Home services sites are marketing/lead-gen, not developer tools
- Keep it lightweight and non-intrusive

**Speed Insights scope:**
- Opt-in via environment variable (e.g., `VITE_VERCEL_SPEED_INSIGHTS`)
- Template users may or may not deploy to Vercel, so integration should be available but not required
- Document how to enable/disable in project README or config

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| PERF-02 | `web-vitals` library reports CLS, INP, LCP; Vercel Speed Insights integration (optional); Lighthouse score targets: Performance 90+, Accessibility 90+, SEO 90+ | Standard `web-vitals` v5 API confirmed; `@vercel/speed-insights` React component pattern confirmed; Lighthouse thresholds documented |
</phase_requirements>

---

## Summary

Phase 10 is a low-complexity, two-part phase: (1) wire up Core Web Vitals reporting via the `web-vitals` library, and (2) manually verify Lighthouse scores meet 90+ targets. The `web-vitals` library is ~2KB brotli-compressed and requires only three function calls to instrument CLS, INP, and LCP. The API has been stable in its current form through v5. No new React components are needed for the vitals reporting itself — `src/lib/vitals.ts` calls the three `on*()` functions and exports a single `reportWebVitals()` entry point that is called once from `src/main.tsx`.

The Vercel Speed Insights integration uses the `@vercel/speed-insights` package. For this React/Vite project the correct import is `@vercel/speed-insights/react` which exports a `<SpeedInsights />` component. The correct integration point is `App.tsx` (not `main.tsx`), dropped inside the layout so it is mounted once. The opt-in pattern uses `import.meta.env.VITE_VERCEL_SPEED_INSIGHTS === 'true'` — consistent with Vite's `VITE_` prefix convention already established in the project.

Lighthouse verification is manual for this template: run Chrome DevTools / Lighthouse CLI against `localhost:4173` (the Vite preview server) after a production build. No CI enforcement. Previous phases have already optimized the primary LCP-impacting factors (Hero without Framer Motion, `LazyMotion/domAnimation`, explicit image dimensions, lazy loading). The site's architecture (SPA with config-driven content) is well-suited for 90+ scores on Performance, Accessibility, and SEO as long as the known PERF-01 gap (Hero images not in `<picture>` with WebP) is acknowledged — it does not block the 90+ target given other optimizations are in place.

**Primary recommendation:** Install `web-vitals@5`, create `src/lib/vitals.ts` with `onCLS`/`onINP`/`onLCP` console reporters, wire into `src/main.tsx` with `reportWebVitals()`, add `<SpeedInsights />` to `App.tsx` behind a `VITE_VERCEL_SPEED_INSIGHTS` env guard, then run Lighthouse against the production preview build.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `web-vitals` | v5 (latest) | Measures CLS, INP, LCP, FCP, TTFB from real browsers | Official Google library; ~2KB brotli; matches exactly what Chrome and Google Search Console report |
| `@vercel/speed-insights` | latest (1.x) | Reports Core Web Vitals to Vercel dashboard | Official Vercel package; zero-config for Vercel deployments; React-specific component available |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `web-vitals/attribution` | (same package, alt import) | Adds diagnostic data (`largestShiftTarget`, `interactionTarget`) to metric callbacks | Development debugging only — adds ~1.5KB brotli; swap to standard build for production |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `web-vitals` | Custom `PerformanceObserver` | `web-vitals` handles browser quirks, buffering, and spec-correct measurement; hand-rolling is error-prone |
| `@vercel/speed-insights` | Custom analytics webhook | Out of scope per CONTEXT.md — template has no custom analytics backend |

**Installation:**
```bash
npm install web-vitals
npm install @vercel/speed-insights
```

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── lib/
│   └── vitals.ts          # New — Core Web Vitals reporter
├── main.tsx               # Modified — call reportWebVitals() once
└── App.tsx                # Modified — add <SpeedInsights /> component
```

### Pattern 1: vitals.ts — Single-call reporter module

**What:** A module that calls `onCLS`, `onINP`, `onLCP` exactly once per page load, routing to `console.log` in dev and optionally to an analytics handler.

**When to use:** Called once from `main.tsx` after `createRoot().render()`. The web-vitals library uses `PerformanceObserver` with the `buffered: true` flag, so it does not miss metrics even when initialized after other code.

**Example:**
```typescript
// Source: https://github.com/GoogleChrome/web-vitals (v5 README)
// src/lib/vitals.ts
import { onCLS, onINP, onLCP, type Metric } from 'web-vitals'

function sendToConsole(metric: Metric) {
  // Group by name for readable DevTools output
  console.groupCollapsed(`[Web Vitals] ${metric.name}: ${metric.value.toFixed(2)} (${metric.rating})`)
  console.log(metric)
  console.groupEnd()
}

export function reportWebVitals(): void {
  onCLS(sendToConsole)
  onINP(sendToConsole)
  onLCP(sendToConsole)
}
```

### Pattern 2: main.tsx — Wire reportWebVitals()

**What:** Call `reportWebVitals()` after `render()` — placement after render ensures it does not delay initial paint.

**When to use:** One call in main.tsx; never call inside components (would re-subscribe on every re-render).

**Example:**
```typescript
// Source: https://create-react-app.dev/docs/measuring-performance/ (verified pattern)
// src/main.tsx — add these two lines after existing render call
import { reportWebVitals } from './lib/vitals'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* ... existing providers ... */}
  </StrictMode>,
)

reportWebVitals()
```

### Pattern 3: App.tsx — Conditional Speed Insights component

**What:** Drop `<SpeedInsights />` inside the component tree, gated by `VITE_VERCEL_SPEED_INSIGHTS` env var. React component handles mounting lifecycle correctly.

**When to use:** Vercel Speed Insights only fires on Vercel infrastructure; the env guard lets template users opt in.

**Example:**
```typescript
// Source: https://vercel.com/docs/speed-insights/quickstart (create-react-app React pattern)
// src/App.tsx — add import and use inside Routes
import { SpeedInsights } from '@vercel/speed-insights/react'

// Inside App component return, alongside <Routes>:
{import.meta.env.VITE_VERCEL_SPEED_INSIGHTS === 'true' && <SpeedInsights />}
```

### Pattern 4: .env.example — Document opt-in

**What:** No `.env.example` currently exists. Create a minimal one documenting the Speed Insights flag and the existing `VITE_API_URL` / `ALLOWED_ORIGIN` pattern.

**When to use:** Template user reference. Add one line documenting the flag.

**Example (.env.example fragment):**
```
# Vercel Speed Insights (set to 'true' to enable on Vercel deployments)
VITE_VERCEL_SPEED_INSIGHTS=false
```

### Anti-Patterns to Avoid

- **Calling `onCLS`/`onINP`/`onLCP` inside a React component:** Every re-render adds a new `PerformanceObserver` subscription, causing duplicate reports and potential memory leaks. Must be called once at module scope or in `main.tsx`.
- **Using `reportAllChanges: true` in production:** This fires the callback on every CLS/layout shift event rather than just the final value. Useful in dev debugging only — generates noise in production analytics.
- **Importing from `web-vitals/attribution` in production:** Adds ~1.5KB without benefit unless you have a diagnostic dashboard consuming attribution data.
- **Placing `<SpeedInsights />` inside a layout component that re-mounts:** Keep it at the `App` level to ensure it mounts once per app lifecycle.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| CLS measurement | Custom `PerformanceObserver` for `layout-shift` | `web-vitals` `onCLS()` | CLS accumulation logic (ignoring shifts after user input, handling page visibility changes) is spec-complex; `web-vitals` matches Chrome's exact implementation |
| INP measurement | Custom `PerformanceObserver` for `event` + `first-input` | `web-vitals` `onINP()` | INP replaced FID in March 2024; the aggregation algorithm (98th-percentile interaction) is non-trivial |
| LCP measurement | Custom `PerformanceObserver` for `largest-contentful-paint` | `web-vitals` `onLCP()` | LCP must handle user-initiated tab visibility changes and shadow DOM elements correctly |

**Key insight:** The `web-vitals` library exists precisely because browser implementations of these APIs have edge cases that a ~2KB library abstracts away. The custom observer approach used before `web-vitals` existed was routinely wrong.

---

## Common Pitfalls

### Pitfall 1: LCP measured in Vite dev server — scores look wrong

**What goes wrong:** Running Lighthouse against `npm run dev` (port 5173) produces artificially low performance scores because Vite dev mode serves unminified, un-bundled modules. Scores can be 40-60 instead of 90+.
**Why it happens:** Vite dev server serves source modules; no tree-shaking, no minification, no code splitting.
**How to avoid:** Always run Lighthouse against `npm run preview` (port 4173) which serves the production `dist/` build.
**Warning signs:** Lighthouse shows "Eliminate render-blocking resources" with a long list of `.ts` files — that means you hit the dev server.

### Pitfall 2: Lighthouse Accessibility score drops from missing aria attributes

**What goes wrong:** Score falls below 90 on Accessibility due to interactive elements lacking labels or ARIA attributes.
**Why it happens:** Lucide icons used as standalone buttons without `aria-label`; form inputs without visible labels.
**How to avoid:** Use Lighthouse's Accessibility audit details to find specific elements. The project already uses `aria-live` on form errors and `aria-label` on icon buttons — this is a verification step, not new work.
**Warning signs:** Lighthouse Accessibility score < 90 with "Links do not have discernible names" or "Buttons do not have accessible names".

### Pitfall 3: Lighthouse SEO score penalized by noindex pages

**What goes wrong:** Pages with `<meta name="robots" content="noindex">` are expected to be blocked, but Lighthouse SEO score counts them as failures if crawled directly.
**Why it happens:** Lighthouse SEO audits the page it is pointed at. If you run it against `/thank-you` (which has `noindex`), the SEO score drops.
**How to avoid:** Run Lighthouse against the homepage (`/`) for the representative score. The `noindex` on `/thank-you` is correct — don't change it.
**Warning signs:** SEO score < 90 when tested on ThankYou page — this is expected and not a regression.

### Pitfall 4: CLS caused by late-loading banner or sticky CTA

**What goes wrong:** The `AnnouncementBanner` uses `sessionStorage` to determine visibility and renders after hydration, potentially causing CLS.
**Why it happens:** If the banner inserts height into the layout after initial paint, it shifts all below-banner content.
**How to avoid:** The banner already uses conditional rendering in Layout — if this causes a score regression, reserve space with `min-height` or render with `visibility: hidden` initially. In practice, since the banner is config-driven (not async fetched), this risk is LOW.
**Warning signs:** CLS > 0.1 in Lighthouse. The "Layout Shift" diagnostic will point to the banner element.

### Pitfall 5: Speed Insights component breaks when `VITE_VERCEL_SPEED_INSIGHTS` is undefined

**What goes wrong:** `import.meta.env.VITE_VERCEL_SPEED_INSIGHTS` returns `undefined` when the env var is not set; strict equality check `=== 'true'` handles this correctly (undefined !== 'true'), but `== true` or a truthy check would fail.
**Why it happens:** Vite exposes unset env vars as `undefined`, not `''`.
**How to avoid:** Use `=== 'true'` (strict string comparison), not truthy check.

---

## Code Examples

Verified patterns from official sources:

### Complete vitals.ts module

```typescript
// Source: https://github.com/GoogleChrome/web-vitals README (v5)
// src/lib/vitals.ts
import { onCLS, onINP, onLCP, type Metric } from 'web-vitals'

function logMetric(metric: Metric): void {
  // Console-only reporting per CONTEXT.md decisions
  // Replace sendToConsole with an analytics function to forward to a backend
  if (import.meta.env.DEV) {
    console.groupCollapsed(
      `%c[Web Vitals] ${metric.name}: ${metric.value.toFixed(3)} — ${metric.rating}`,
      `color: ${metric.rating === 'good' ? 'green' : metric.rating === 'needs-improvement' ? 'orange' : 'red'}`
    )
    console.log(metric)
    console.groupEnd()
  } else {
    // In production: silent unless an analytics handler is wired up
    // Future: replace this no-op with an analytics.track() call
    void metric
  }
}

/**
 * Register Core Web Vitals observers.
 * Call once from main.tsx after render — never inside components.
 */
export function reportWebVitals(): void {
  onCLS(logMetric)
  onINP(logMetric)
  onLCP(logMetric)
}
```

### main.tsx modification

```typescript
// Existing main.tsx — add two lines
import { reportWebVitals } from './lib/vitals'  // add at top

// After createRoot().render():
reportWebVitals()  // add after render block
```

### App.tsx Speed Insights integration

```typescript
// Source: https://vercel.com/docs/speed-insights/quickstart (React pattern)
// Add to App.tsx imports:
import { SpeedInsights } from '@vercel/speed-insights/react'

// Add inside App() return, alongside <Routes>:
{import.meta.env.VITE_VERCEL_SPEED_INSIGHTS === 'true' && <SpeedInsights />}
```

### Lighthouse CLI — run against production build

```bash
# Build production bundle
npm run build

# Start Vite preview server
npm run preview
# Default URL: http://localhost:4173

# In another terminal — run Lighthouse (requires Chrome)
npx lighthouse http://localhost:4173 --output=html --output-path=./lighthouse-report.html

# Or use Chrome DevTools:
# DevTools > Lighthouse > Categories: Performance, Accessibility, SEO > Analyze
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `reportWebVitals()` scaffold in Create React App (FID-based) | `onCLS`, `onINP`, `onLCP` from `web-vitals` v5 | INP replaced FID in March 2024 (Chrome 115+) | FID no longer reported; INP is the correct interaction metric |
| FID (First Input Delay) | INP (Interaction to Next Paint) | March 2024 — Core Web Vitals change | INP measures all interactions (not just first), providing a better picture of interactivity throughout the session |
| `web-vitals` v2/v3 default import `getCLS` / `getFID` | `onCLS` / `onFID` (v3) → `onCLS` / `onINP` (v4+) | v3 → v4 API rename; FID deprecated v4 | Import style changed from `get*` to `on*` (callback-based); old CRA examples are outdated |

**Deprecated/outdated:**
- `getFID` / FID: Removed from Core Web Vitals in March 2024. `web-vitals` v5 does not export `onFID` — do not use older CRA-style `reportWebVitals` boilerplate that references FID.
- `getCLS`, `getLCP` (get-style API): Renamed to `onCLS`, `onLCP` in `web-vitals` v3. Any docs showing `getCLS(console.log)` are outdated.

---

## Open Questions

1. **Current Lighthouse scores before Phase 10 work**
   - What we know: Prior phases optimized LCP-impacting factors (no Hero animations, `LazyMotion/domAnimation`, explicit image dimensions, lazy loading for below-fold).
   - What's unclear: Actual current scores are unknown — they have not been formally measured since Phase 2's VIS-01 work.
   - Recommendation: Run Lighthouse in Wave 1 (Task 1) to capture baseline before adding vitals reporting. This determines whether any fixup work is needed or if 90+ is already met.

2. **PERF-01 gap: Hero images not in `<picture>` with WebP**
   - What we know: REQUIREMENTS.md shows this acceptance criterion unchecked: "Hero images use `<picture>` with WebP + fallback". Lighthouse flags images served as non-WebP as a Performance opportunity.
   - What's unclear: Whether fixing this is in scope for Phase 10 or separate. It is a PERF-01 gap, not PERF-02. Phase 10's stated scope is PERF-02.
   - Recommendation: If Lighthouse score is below 90 and the image format is the root cause, include a task to add WebP hero image. If score is 90+ without it, document the remaining gap in REQUIREMENTS.md and leave it for a future phase. Do NOT expand Phase 10 scope proactively.

3. **Does `@vercel/speed-insights` work without the Vercel dashboard enabled?**
   - What we know: The package will load `/_vercel/speed-insights/script.js` which only exists on Vercel-hosted deployments. On non-Vercel hosts, the script 404s silently (non-blocking).
   - What's unclear: Whether a 404 for the script.js causes any console errors that degrade DX.
   - Recommendation: The env guard (`VITE_VERCEL_SPEED_INSIGHTS === 'true'`) prevents the component from even mounting in non-Vercel deployments, which is sufficient.

---

## Validation Architecture

> Skipping: `workflow.nyquist_validation` is not present in `.planning/config.json` (key absent, defaults to disabled).

---

## Sources

### Primary (HIGH confidence)
- https://github.com/GoogleChrome/web-vitals — README, v5 API, TypeScript types, `onCLS`/`onINP`/`onLCP` usage patterns, `reportAllChanges` option, attribution build import path
- https://vercel.com/docs/speed-insights/quickstart — `@vercel/speed-insights` React quickstart, `<SpeedInsights />` component import
- https://vercel.com/docs/speed-insights/package — `@vercel/speed-insights` configuration options: `sampleRate`, `beforeSend`, `debug`, `endpoint`
- https://vite.dev/guide/env-and-mode — `import.meta.env.VITE_*` access pattern, `import.meta.env.PROD`/`DEV` built-ins

### Secondary (MEDIUM confidence)
- https://developer.chrome.com/docs/lighthouse/performance/performance-scoring — Lighthouse scoring weights (TBT 30%, LCP 25%, CLS 25%), confirmed via WebSearch
- https://create-react-app.dev/docs/measuring-performance/ — CRA `reportWebVitals` pattern (structurally similar; confirmed INP replaces FID)

### Tertiary (LOW confidence)
- WebSearch result confirming web-vitals is at "version 5" — could not verify exact semver via npm registry (403 on npmjs.com); treat as "v5.x" without pinning patch version

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — web-vitals API and Vercel Speed Insights docs fetched directly from official sources
- Architecture: HIGH — patterns derived from official docs; matches project's existing module structure in `src/lib/`
- Pitfalls: MEDIUM — Lighthouse/Vite dev-vs-preview pitfall verified from known Vite behavior; CLS/banner pitfall is analytical reasoning from existing code

**Research date:** 2026-02-26
**Valid until:** 2026-05-26 (stable APIs — `web-vitals` and Speed Insights are production-stable; Lighthouse scoring weights change infrequently)
