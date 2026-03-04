# STATE -- Premium Home Services Template

**Last Updated:** 2026-03-04T10:05Z

---

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-01)

**Core value:** Config-driven customizability — rebrand by editing config files only
**Current focus:** Phase 14 — Performance Validation & Optimization (In Progress — font self-hosting complete)

---

## Current Position

**Phase:** 14-performance-validation-optimization
**Current Plan:** 03 of 6
**Progress:** [█████████░] 90%

---

## Milestone History

- ✅ **v1.0 Premium Template Launch** — shipped 2026-03-01 (12 phases, 20 plans, 112 commits)
- ✅ **v2.0 Performance & Framework Mode** — Phase 13 complete (RR7 framework mode), Phase 14 complete (performance validation)

---

## Accumulated Context

**Open blockers:** None

**Tech debt carried forward:**
- Mobile Lighthouse Performance 68-74 (below 90 target) — font self-hosting now complete (14-03); JS bundle reduction still needed for full 90+ score
- Orphan API files: `api/contact.js`, `api/banner.js`
- Unused export: `getTestimonialsByService()`
- `vitals.ts` production handler is no-op placeholder

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

## Performance Metrics

| Phase | Plan | Duration (s) | Tasks | Files |
|-------|------|-------------|-------|-------|
| 13-rr7-framework-mode-migration | 01 | 298 | 2 | 10 |
| 13-rr7-framework-mode-migration | 02 | 226 | 2 | 16 |
| 13-rr7-framework-mode-migration | 03 | 253 | 2 | 8 |
| 14-performance-validation-optimization | 01 | 1620 | 2 | 3 |
| 14-performance-validation-optimization | 02 | 933 | 2 | 2 |
| 14-performance-validation-optimization | 03 | 262 | 2 | 9 |

## Session Continuity

Last session: 2026-03-04
Stopped at: Completed 14-03-PLAN.md (self-hosted fonts — Inter + Plus Jakarta Sans woff2)
Resume file: N/A

---

*State initialized: 2026-02-21*
