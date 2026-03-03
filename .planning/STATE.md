# STATE -- Premium Home Services Template

**Last Updated:** 2026-03-03T17:32Z

---

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-01)

**Core value:** Config-driven customizability — rebrand by editing config files only
**Current focus:** Phase 13 — RR7 Framework Mode Migration

---

## Current Position

**Phase:** 13-rr7-framework-mode-migration
**Current Plan:** Not started
**Progress:** [██████████] 100%

---

## Milestone History

- ✅ **v1.0 Premium Template Launch** — shipped 2026-03-01 (12 phases, 20 plans, 112 commits)
- 🔄 **v2.0 Performance & Framework Mode** — in progress (Phase 13)

---

## Accumulated Context

**Open blockers:** None

**Tech debt carried forward:**
- Lighthouse Performance below 90+ target (requires SSR/pre-rendering — being addressed in Phase 13)
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

---

## Performance Metrics

| Phase | Plan | Duration (s) | Tasks | Files |
|-------|------|-------------|-------|-------|
| 13-rr7-framework-mode-migration | 01 | 298 | 2 | 10 |
| 13-rr7-framework-mode-migration | 02 | 226 | 2 | 16 |
| 13-rr7-framework-mode-migration | 03 | 253 | 2 | 8 |

## Session Continuity

Last session: 2026-03-03
Stopped at: Completed 13-03-PLAN.md (prerender configuration)
Resume file: N/A

---

*State initialized: 2026-02-21*
