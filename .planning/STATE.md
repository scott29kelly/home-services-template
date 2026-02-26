# STATE -- Premium Home Services Template v1.0

**Last Updated:** 2026-02-26T13:40Z

---

## Current Phase

**Phase:** 8 -- Feature Flag Integration & Polish (IN PROGRESS)
**Current Plan:** 08-01 COMPLETE
**Plans Completed:** 03-01, 03-02, 03-03, 04-01, 04-02, 05-01, 05-02, 05-03, 05-04, 07-01, 07-02, 08-01

**Next Action:** Phase 8 complete (single plan phase)

---

## Phase Status

| Phase | Name | Status | Started | Completed |
|-------|------|--------|---------|-----------|
| 1 | Foundation & Config Refactor | COMPLETE | 2026-02-21 | 2026-02-21 |
| 2 | Visual Polish & Performance | COMPLETE | 2026-02-22 | 2026-02-22 |
| 3 | Lead Generation | COMPLETE | 2026-02-23 | 2026-02-23 |
| 4 | Blog System | COMPLETE | 2026-02-24 | 2026-02-24 |
| 5 | SEO & Content | COMPLETE | 2026-02-24 | 2026-02-24 |
| 6 | Integration & Polish | NOT STARTED | -- | -- |
| 7 | Foundation Verification & Cleanup | COMPLETE | 2026-02-25 | 2026-02-25 |
| 8 | Feature Flag Integration & Polish | COMPLETE | 2026-02-26 | 2026-02-26 |

---

## Milestone Progress

- **Requirements defined:** 28 (17 MUST, 10 SHOULD, 1 COULD)
- **Requirements completed:** 26 (CFG-01 through CFG-06, VIS-01, VIS-02, VIS-03, VIS-04, VIS-05, PERF-01, LEAD-01, LEAD-02, LEAD-03, LEAD-04, LEAD-05, SEO-01, BLOG-01, BLOG-02, SEO-07, SEO-02, SEO-03, SEO-04, CFG-02 (fixed), CFG-06 (added), SEO-04 (enhanced))
- **Phases completed:** 7 / 8 (Phase 6 not started; Phases 7 and 8 complete)
- **Overall progress:** ~95%

---

## Decision Log

| Date | Decision | Context |
|------|----------|---------|
| 2026-02-21 | Light theme only, no dark mode | Reduces complexity for v1 |
| 2026-02-21 | Formspree default for form backend | Zero-backend default, configurable webhook for CRM |
| 2026-02-21 | Local markdown for blog, no CMS | No external dependency; CMS-pluggable later |
| 2026-02-21 | Config-driven reviews (no API) | Business owner controls displayed reviews |
| 2026-02-21 | Custom booking calendar, no 3rd party | Consistent design, no external dependency |
| 2026-02-21 | Config-driven city pages, ~20-30 demo cities | Auto-generated routes from config |
| 2026-02-21 | Portfolio data in config | Moves from hardcoded components to config |
| 2026-02-21 | Pre-rendering deferred to future milestone | Significant refactor; SPA works for v1 launch |
| 2026-02-21 | Opus 4.6 for all GSD agents | User preference for maximum quality |
| 2026-02-21 | Autonomous mode | GSD executes without per-plan approval |
| 2026-02-22 | domAnimation over domMax | Saves ~10KB gzipped; Projects page refactored to avoid layout prop |
| 2026-02-22 | SectionHeading uses whileInView | Self-contained animation, no external isInView ref needed |
| 2026-02-22 | Hero has zero framer-motion dependency | No animation on above-fold content for instant LCP |
| 2026-02-22 | Accent line gradient on headings | brand-blue for light, safety-orange for dark theme |
| 2026-02-22 | Featured testimonials expanded to 5 with service field | Richer carousel rotation; 3 felt too short for autoplay |
| 2026-02-22 | Pointer Events API for BeforeAfterSlider | Unified mouse/touch with setPointerCapture for smooth drag |
| 2026-02-22 | TestimonialsPage keeps grid layout | Grid better for scanning 8 reviews; carousel for homepage only |
| 2026-02-22 | Skeletons for images only per user decision | Text renders instantly from bundled config; no text skeletons |
| 2026-02-22 | Custom Vite plugin for image optimization | Works around lstatSync junction bug in vite-plugin-image-optimizer on Windows |
| 2026-02-22 | publicDir: false with custom image copy | Vite serves /images from project root in dev; custom plugin handles prod |
| 2026-02-22 | CustomEvent for StickyMobileCTA-AvaWidget coordination | Avoids prop drilling through Layout; decoupled communication |
| 2026-02-22 | AvaWidget repositioned on mobile (bottom-20) | Clears sticky CTA bar; md:bottom-6 unchanged on desktop |
| 2026-02-23 | Provider type as union not const | Allows TypeScript strict comparisons in form-handler.ts |
| 2026-02-23 | zodResolver@5.2.2 works directly with Zod v4 | No standardSchemaResolver fallback needed |
| 2026-02-23 | onTouched validation mode for RHF | Validates on first blur, then on change -- best UX for lead gen |
| 2026-02-23 | Roving tabIndex for calendar keyboard nav | ARIA APG grid pattern; Tab exits grid, arrows navigate days |
| 2026-02-23 | Conditional rendering on tab switch | Remounts forms for clean state; no cross-tab leakage |
| 2026-02-23 | Local dates for calendar (no ISO parsing) | Avoids timezone offset issues with new Date('yyyy-mm-dd') |
| 2026-02-23 | Radio cards for time range selection | Better touch targets on mobile than standard radios |
| 2026-02-23 | projects-hero.webp reused for financing hero | Good quality project image; no new assets needed |
| 2026-02-23 | Banner manages own visibility in Layout | Renders unconditionally; internal fetch + sessionStorage state |
| 2026-02-23 | Feature-flagged nav links with spread syntax | Clean conditional insertion into nav arrays |
| 2026-02-24 | Native Vite glob + gray-matter instead of vite-plugin-markdown | Plugin last updated Jan 2024, no Vite 7 test; native approach more resilient |
| 2026-02-24 | Module-level cache in blog.ts (cachedPosts) | Avoids re-sorting getAllPosts() on every React render call |
| 2026-02-24 | useSearchParams for tag filter state | Creates shareable/indexable URLs (?tag=roofing) for SEO value |
| 2026-02-24 | Placeholder ResourcesPost.tsx created in Plan 01 | Prevents TypeScript lazy-import errors before Plan 02 implementation |
| 2026-02-24 | Blog cover images sourced from existing project assets | Avoids external API dependency; user swaps via frontmatter coverImage path |
| 2026-02-24 | vite.config.ts copyAndOptimizeImages recurses subdirectories | Fixed bug: images/blog/ was not copied to dist/ without recursive readdir |
| 2026-02-24 | Project detail pages redirect to /projects on unknown slug | useNavigate replace:true prevents back-button loop to 404 |
| 2026-02-24 | Hero highlightText empty string for project detail hero | Project title used as headline; no orange highlight word split needed |
| 2026-02-24 | OG image URL builder uses company.url prefix for relative paths | Social crawlers require absolute URLs; IIFE checks startsWith('http') |
| 2026-02-24 | noindex prop on PageMeta replaces standalone meta tag in ThankYou | Cleaner API, single source of truth for robots meta |
| 2026-02-24 | rating ?? 5 fallback for star rendering in TestimonialsPage | Preserves backward compat with testimonials lacking explicit rating |
| 2026-02-24 | Single parameterized route service-areas/:slug for all city pages | Simpler than dynamic route generation; handles any slug; plan explicitly recommended this approach |
| 2026-02-24 | FAQ accordion built inline in CityPage (useState) | No external FAQ component needed; city FAQs are structurally different from service FAQs |
| 2026-02-24 | ServiceAreas.tsx adds full city listing section below states grid | Provides richer SEO value with city descriptions and direct links without breaking existing layout |
| 2026-02-24 | Custom Vite plugin for sitemap over vite-plugin-sitemap | Avoids known Vite 7 empty-sitemap bug; consistent with existing copyAndOptimizeImages pattern |
| 2026-02-24 | Strip JS comments before slug regex extraction in vite.config.ts | JSDoc examples in service-areas.ts interface produced duplicate city routes |
| 2026-02-24 | Multiple separate JsonLd blocks per page | Google accepts multiple JSON-LD blocks; easier to conditionally compose FAQ and areaServed schemas |
| 2026-02-24 | hostname hardcoded in vite.config.ts generateSitemap | Cannot ESM-import app config in Vite Node context; comment instructs user to sync with company.url |
| 2026-02-25 | CFG-02/05/06 gaps rated minor severity and deferred | features.assistant not gating Ava nav, 404 missing phone CTA, features.beforeAfter missing — all cosmetic/configurability gaps, not broken functionality |
| 2026-02-25 | REQUIREMENTS.md checkboxes already updated in Plan 01 final commit | State update process in 07-01 already checked the CFG boxes; Task 1 of 07-02 verified correct state, no changes needed |
| 2026-02-25 | getPostsByTag() removed as confirmed dead code | Exported but zero import sites; ResourcesIndex.tsx uses inline useSearchParams tag filtering instead |
| 2026-02-26 | Explicit ternary redirect for /ava (Option C) | {features.assistant ? <Route path="ava" element={<Ava />} /> : <Route path="ava" element={<Navigate to="/" replace />} />} honors locked decision redirect-to-home without breaking catch-all NotFound |
| 2026-02-26 | Regex text-parsing for feature flags in vite.config.ts | Consistent with existing slug extraction pattern; no new files or structural changes required |
| 2026-02-26 | ServicePage redirects to /services on invalid slug | Matches parent-redirect convention: CityPage -> /service-areas, ResourcesPost -> /resources, ServicePage -> /services |

---

## Open Questions

| Question | Context | Status |
|----------|---------|--------|
| vite-plugin-markdown Vite 7 compat | Research flagged as MEDIUM confidence | RESOLVED: Skipped; using native Vite glob instead |
| vite-plugin-prerender Vite 7 compat | Needed for future SSG phase | Defer to future milestone |
| Theme config to Tailwind v4 integration | How CSS custom properties map to @theme | Research during Phase 1 |

---

## Session Continuity

Last session: 2026-02-26
Stopped at: Completed 08-01-PLAN.md (Feature flag integration & polish — CFG-02, CFG-06, SEO-04 gap closure)
Resume file: .planning/phases/08-feature-flag-integration-polish/

---

*State initialized: 2026-02-21*
