# Roadmap: Premium Home Services Template

## Milestones

- ✅ **v1.0 Premium Template Launch** — Phases 1-12 (shipped 2026-03-01)
- 🔄 **v1.1 Performance & Cleanup** — Phases 13+ (in progress)

## Phases

<details>
<summary>✅ v1.0 Premium Template Launch (Phases 1-12) — SHIPPED 2026-03-01</summary>

- [x] Phase 1: Foundation & Config Refactor (pre-GSD, verified Phase 7) — completed 2026-02-21
- [x] Phase 2: Visual Polish & Performance (3/3 plans) — completed 2026-02-22
- [x] Phase 3: Lead Generation (3/3 plans) — completed 2026-02-23
- [x] Phase 4: Blog System (2/2 plans) — completed 2026-02-24
- [x] Phase 5: SEO & Content (4/4 plans) — completed 2026-02-24
- [x] Phase 6: Integration & Polish — superseded by Phases 8-12
- [x] Phase 7: Foundation Verification & Cleanup (2/2 plans) — completed 2026-02-25
- [x] Phase 8: Feature Flag & Integration Polish (1/1 plan) — completed 2026-02-26
- [x] Phase 9: Ava Chat Enhancement (2/2 plans) — completed 2026-02-26
- [x] Phase 10: Performance Monitoring (1/1 plan) — completed 2026-02-26
- [x] Phase 11: Final Gap Closure & Cleanup (1/1 plan) — completed 2026-02-28
- [x] Phase 12: StickyMobileCTA Feature Flag Fix (1/1 plan) — completed 2026-03-01

</details>

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Foundation & Config Refactor | v1.0 | pre-GSD | Complete | 2026-02-21 |
| 2. Visual Polish & Performance | v1.0 | 3/3 | Complete | 2026-02-22 |
| 3. Lead Generation | v1.0 | 3/3 | Complete | 2026-02-23 |
| 4. Blog System | v1.0 | 2/2 | Complete | 2026-02-24 |
| 5. SEO & Content | v1.0 | 4/4 | Complete | 2026-02-24 |
| 6. Integration & Polish | v1.0 | — | Superseded | — |
| 7. Foundation Verification | v1.0 | 2/2 | Complete | 2026-02-25 |
| 8. Feature Flag Polish | v1.0 | 1/1 | Complete | 2026-02-26 |
| 9. Ava Chat Enhancement | v1.0 | 2/2 | Complete | 2026-02-26 |
| 10. Performance Monitoring | v1.0 | 1/1 | Complete | 2026-02-26 |
| 11. Final Gap Closure | v1.0 | 1/1 | Complete | 2026-02-28 |
| 12. StickyMobileCTA Fix | v1.0 | 1/1 | Complete | 2026-03-01 |
| 13. RR7 Framework Mode Migration | 3/3 | Complete    | 2026-03-03 | — |
| 14. Performance Validation | 8/8 | Complete    | 2026-03-04 | — |
| 15. Tech Debt Cleanup | 1/1 | Complete   | 2026-03-04 | — |

### v1.1 Performance & Cleanup

- [x] Phase 13: RR7 Framework Mode Migration (completed 2026-03-03)
- [x] Phase 14: Performance Validation & Optimization (gap closure -- mobile 90+ target) (completed 2026-03-04)
- [x] Phase 15: Tech Debt Cleanup (completed 2026-03-04)

### Phase 13: RR7 Framework Mode Migration

**Goal:** Convert from SPA to React Router 7 framework mode with static pre-rendering. Server entry, client entry, route modules with loaders, pre-rendering config for all routes (static + dynamic).

**Requirements:** [PERF-03, PERF-04]

**Plans:** 3/3 plans complete

Plans:
- [ ] 13-01-PLAN.md — Framework mode infrastructure (packages, entry files, routes config, layout route)
- [ ] 13-02-PLAN.md — Route module conversion (16 pages to route modules with loaders)
- [ ] 13-03-PLAN.md — Pre-rendering config, production build, Vercel deployment update

### Phase 14: Performance Validation & Optimization

**Goal:** Measure Lighthouse Performance scores after migration, optimize until 90+ on both desktop and mobile. Address LCP, CLS, and render-blocking resources.

**Requirements:** [PERF-05]

**Plans:** 8/8 plans complete

Plans:
- [x] 14-01-PLAN.md — Baseline Lighthouse measurement + responsive hero image srcset optimization
- [x] 14-02-PLAN.md — Async Google Fonts loading, hero preload fix, final Lighthouse validation
- [x] 14-03-PLAN.md — Self-host Google Fonts (eliminate external DNS/TCP round-trips)
- [x] 14-04-PLAN.md — Replace framer-motion with CSS animations in shared components
- [x] 14-05-PLAN.md — Replace framer-motion in page components + uninstall package
- [x] 14-06-PLAN.md — Final mobile Lighthouse re-validation (confirm 90+ mobile)
- [x] 14-07-PLAN.md — Font preloads + AVIF hero images (gap closure: LCP reduction)
- [x] 14-08-PLAN.md — Route-level code splitting + final Lighthouse re-measurement (gap closure: TBT reduction)

### Phase 15: Tech Debt Cleanup

**Goal:** Remove orphan API files (api/contact.js, api/banner.js), remove unused exports (getTestimonialsByService), fix or remove vitals.ts no-op handler. Zero dead code.

**Requirements:** [CLEAN-01, CLEAN-02]

**Plans:** 1/1 plans complete

Plans:
- [ ] 15-01-PLAN.md — Remove dead code: orphan API file verification, unused export removal, vitals.ts deletion + web-vitals uninstall

---

*Roadmap created: 2026-02-21*
*Updated: 2026-03-04 — Phase 14 gap closure round 2: plans 14-07 + 14-08 (font preloads, AVIF, code splitting)*
