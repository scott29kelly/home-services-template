# Phase 11: Final Gap Closure & Cleanup - Context

**Gathered:** 2026-02-27
**Status:** Ready for planning

<domain>
## Phase Boundary

Close 3 remaining partial requirement gaps (CFG-05, CFG-06, SEO-04), fix 2 broken E2E flows, and remove dead code exports from the v1.0 milestone audit. No new features — purely closing gaps in existing implementations.

</domain>

<decisions>
## Implementation Decisions

### 404 Page Phone CTA (CFG-05)
- Add a prominent, tappable `tel:` link using `company.phone` from config
- Follow 2026 home services best practice: 404 pages should retain the visitor as a potential lead, not just redirect them away
- Phone CTA should be visually prominent — a button-style link, not just inline text
- Place phone CTA between the "page not found" message and the navigation buttons (Go Home / Go Back)
- Include brief reassuring copy like "Need help? Call us" to frame the CTA as helpful, not salesy

### Feature Flag Gating (CFG-06)
- Gate AvaWidget behind `features.assistant` flag — complete DOM removal when disabled, not just CSS hiding
- Follow the existing pattern: `Layout.tsx` already conditionally renders based on pathname; add feature flag as an additional condition
- No fallback or placeholder when assistant is disabled — clean removal
- Keep the existing pathname check (`pathname !== '/ava'`) alongside the feature flag check

### Sitemap Route Derivation (SEO-04)
- Replace hardcoded `['/roofing', '/siding', '/storm-damage']` with dynamic derivation from `services.ts` config
- Map `services` array slugs to routes: `services.map(s => '/' + s.slug)`
- Sync sitemap hostname from `company.url` in config instead of hardcoded `'https://example.com'`
- Follow the existing pattern established by city routes (parsed from config source) — but cleaner since `services.ts` exports are directly importable at build time

### Dead Code Removal
- Remove `buildAggregateRatingSchema()` export from `seo.ts` — confirmed unused
- Remove `getCityRoutes()` export from `route-generator.ts` — confirmed unused
- Clean removal only: delete the functions and their imports, do not sweep for additional unused code beyond what the audit identified

### Claude's Discretion
- Exact copy/wording for the 404 phone CTA (guided by home services conversion best practices)
- Any minor styling adjustments needed to integrate the phone CTA with existing 404 page design
- Import strategy for reading services config in the Vite sitemap plugin (build-time file read vs direct import)
- Whether to also clean up any orphaned type imports left behind by dead code removal

</decisions>

<specifics>
## Specific Ideas

- User directive: "Employ best practices for the home services industry in 2026 and web design professional quality for 2026" — this applies to all implementation choices
- 404 page should feel like a professional home services company, not a generic template
- Feature flag gating should match the existing feature flag patterns already in the codebase (vite.config.ts sitemap already reads feature flags)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 11-final-gap-closure-cleanup*
*Context gathered: 2026-02-27*
