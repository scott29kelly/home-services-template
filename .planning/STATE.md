# STATE -- Premium Home Services Template

**Last Updated:** 2026-03-03T17:19Z

---

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-01)

**Core value:** Config-driven customizability — rebrand by editing config files only
**Current focus:** Phase 13 — RR7 Framework Mode Migration

---

## Current Position

**Phase:** 13-rr7-framework-mode-migration
**Current Plan:** 02 of 04
**Progress:** Plan 01 complete

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

---

## Performance Metrics

| Phase | Plan | Duration (s) | Tasks | Files |
|-------|------|-------------|-------|-------|
| 13-rr7-framework-mode-migration | 01 | 298 | 2 | 10 |

---

## Session Continuity

Last session: 2026-03-03
Stopped at: Completed 13-01-PLAN.md (RR7 framework mode infrastructure)
Resume file: N/A

---

*State initialized: 2026-02-21*
