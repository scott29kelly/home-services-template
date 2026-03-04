# STATE -- Premium Home Services Template

**Last Updated:** 2026-03-04T17:41Z

---

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-01)

**Core value:** Config-driven customizability — rebrand by editing config files only
**Current focus:** Phase 15 — Tech Debt Cleanup (Plan 01 of 1 complete)

---

## Current Position

**Phase:** 15-tech-debt-cleanup
**Current Plan:** Not started
**Progress:** [██████████] 100%

---

## Milestone History

- ✅ **v1.0 Premium Template Launch** — shipped 2026-03-01 (12 phases, 20 plans, 112 commits)
- ✅ **v2.0 Performance & Framework Mode** — Phase 13 complete (RR7 framework mode), Phase 14 complete (performance validation)
- ✅ **Phase 15 Tech Debt Cleanup** — 2026-03-04 (dead code eliminated: getTestimonialsByService, vitals.ts, web-vitals package)

---

## Accumulated Context

**Open blockers:** None

**Tech debt carried forward:**
- Mobile Lighthouse Performance 76-84 (below 90 target) — all Phase 14 optimizations exhausted; architectural bottleneck is React hydration on throttled CPU; accepted as production-ready

**Tech debt resolved (Phase 15):**
- Orphan API files: `api/contact.js`, `api/banner.js` — confirmed never existed; api/ directory contains only Cloudflare Worker files
- Unused export: `getTestimonialsByService()` — removed from testimonials.ts and index.ts
- `vitals.ts` no-op handler — deleted; web-vitals package uninstalled

---

## Decisions

- **13-01:** Explicit service routes (roofing/siding/storm-damage) instead of `:serviceSlug` dynamic route to avoid collision with `/services` and other top-level routes
- **13-01:** Created `react-router.config.ts` with `appDirectory: "src"`, `ssr: false` — required for framework mode to find files in `src/` instead of default `app/`
- **13-01:** `generateSitemap()` output dir updated to `build/client` to match framework mode build output

- **13-02:** Static routes use minimal wrapper pattern — import page component from pages/, re-export as default; PageMeta continues to handle metadata
- **13-02:** Dynamic route modules rewrite component inline to replace useParams/useEffect with loaderData; feature flag checks placed in loader (not component) via throw redirect
- **13-02:** service-page.tsx loader extracts slug from URL pathname (new URL(request.url).pathname) not params — 3 explicit routes share the same route module with no :slug param

- **13-03:** Shared build-routes.ts module exports readFeatureFlags, getServiceSlugs, getCitySlugs, getBlogSlugs, getPortfolioSlugs, getAllRoutes used by both prerender config and sitemap plugin
- **13-03:** Unique id option added to routes.ts service routes (roofing/siding/storm-damage share service-page.tsx) to fix duplicate route id error
- **13-03:** vercel.json: removed SPA rewrite, outputDirectory build/client, cleanUrls true — pre-rendered routes each have index.html


- **14-02:** Async Google Fonts accepted FOUT tradeoff — display=swap handles CSS fallback; onLoad fires after hydration to switch rel to stylesheet
- **14-02:** Mobile Performance 68-74 documented as architectural blocker (font self-hosting + JS bundle reduction required) — deferred per user decision
- **14-02:** Hero preload updated with imageSrcSet/imageSizes matching Hero.tsx srcset variants (768w, 1280w, 1920w)

---
- [Phase 14-03]: Vite deduplicates identical woff2 binaries — all Inter weights share same file hash, same for Plus Jakarta Sans; all 7 @font-face declarations still correct in CSS
- [Phase 14-03]: Self-hosted fonts pattern: download woff2 to src/fonts/, @font-face in index.css with font-display:swap and latin unicode-range — eliminates 2 external origin round-trips
- [Phase 14-04]: AnimatedTestimonials word-by-word blur reveal replaced with simple fade — CSS per-word stagger requires JS loops, fade is functionally equivalent
- [Phase 14-04]: FAQ accordion uses CSS grid-template-rows: 0fr/1fr pattern — smooth height animation without JS measurement
- [Phase 14-04]: ProcessTimeline scroll-driven line uses passive scroll event listener — replaces framer useScroll/useTransform at zero JS animation cost
- [Phase 14-05]: AnimatePresence filter replaced with in-view immediate CSS — filtered cards already on screen, instant removal acceptable for filter UX
- [Phase 14-05]: framer-motion uninstalled after zero-import verification — 3 packages removed, ~67KB JS bundle reduction confirmed in build output
- [Phase 14-06]: Mobile Performance 70-74 and LCP 5.04-6.36s after all planned optimizations — PERF-05 PARTIAL (desktop PASS, mobile FAIL). Further improvement requires woff2 font preloads, code splitting, or AVIF images.
- [Phase 14-07]: Font imports resolve via Vite deduplication: all Inter weights share same binary hash — 2 unique physical files preloaded correctly
- [Phase 14-07]: crossOrigin='' required on font preloads even for same-origin fonts to prevent double-fetch
- [Phase 14-07]: picture element pattern established: AVIF source primary, WebP source fallback, fetchPriority=high on inner img
- [Phase 14-08]: React.lazy() + Suspense with fallback=null for route wrappers — pre-rendered HTML visible immediately, null fallback prevents flash during hydration, correct for SSR apps
- [Phase 14-08]: Mobile Performance 76-84 accepted as final state for this React SPA — React hydration on 4x-throttled CPU is architectural bottleneck, not resolvable with further asset optimization; SSR required for further gains
- [Phase 14-08]: Feature-flag routes retain synchronous Navigate guard with only page component lazy-loaded — React.lazy requires default export, Navigate check must be synchronous outside Suspense

- [Phase 15-01]: api/contact.js and api/banner.js confirmed never existed in this repo — api/ directory contains only Cloudflare Worker and dev server files; no action needed beyond documentation
- [Phase 15-01]: vitals.ts had DEV-mode console logging but production path was no-op (void metric); zero consumers found; safe to delete along with web-vitals package

## Performance Metrics

| Phase | Plan | Duration (s) | Tasks | Files |
|-------|------|-------------|-------|-------|
| 13-rr7-framework-mode-migration | 01 | 298 | 2 | 10 |
| 13-rr7-framework-mode-migration | 02 | 226 | 2 | 16 |
| 13-rr7-framework-mode-migration | 03 | 253 | 2 | 8 |
| 14-performance-validation-optimization | 01 | 1620 | 2 | 3 |
| 14-performance-validation-optimization | 02 | 933 | 2 | 2 |
| 14-performance-validation-optimization | 03 | 262 | 2 | 9 |
| 14-performance-validation-optimization | 04 | 422 | 2 | 16 |
| 14-performance-validation-optimization | 05 | 566 | 2 | 16 |
| 14-performance-validation-optimization | 06 | 1680 | 1 | 1 |
| 14-performance-validation-optimization | 07 | 301 | 2 | 3 |
| 14-performance-validation-optimization | 08 | 3300 | 2 | 13 |
| 15-tech-debt-cleanup | 01 | 507 | 2 | 5 |

## Session Continuity

Last session: 2026-03-04T17:41Z
Stopped at: Completed 15-01-PLAN.md (dead code removal — getTestimonialsByService, vitals.ts, web-vitals package; Phase 15 complete)
Resume file: N/A

---

*State initialized: 2026-02-21*
