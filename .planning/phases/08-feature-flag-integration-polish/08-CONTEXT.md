# Phase 8: Feature Flag & Integration Polish - Context

**Gathered:** 2026-02-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Fix partial MUST requirement gaps in feature flag gating and resolve integration inconsistencies identified by the v1.0 milestone audit. This phase adds the missing `features.beforeAfter` flag, gates Ava nav/route behind `features.assistant`, makes the sitemap respect feature flags, and fixes ServicePage redirect inconsistency. No new features — purely closing gaps.

</domain>

<decisions>
## Implementation Decisions

### Route blocking behavior
- When a feature flag is off, gated routes redirect to home (`/`) with 302 (temporary)
- Nav links for disabled features disappear completely — no greyed-out or disabled state
- 302 temporary redirect for all feature-flag redirects (features can be re-enabled)

### Before/After flag scope
- Simple boolean: `features.beforeAfter: true/false` — matches existing flag patterns
- Default value: `true` (existing sites already show before/after content)
- Gates everything related: gallery component, nav links, and any references to before/after on other pages
- When flag is off, CMS data for before/after is silently ignored — no console warnings

### Redirect consistency
- Invalid service slugs redirect to parent service category (e.g. `/services/plumbing/nonexistent` → `/services/plumbing`)
- Invalid category slugs redirect to services index (e.g. `/services/fakecategory` → `/services`)
- All redirects use 302 (temporary) for consistency across the app
- Fix ServicePage to match existing CityPage/ResourcesPost redirect pattern

### Sitemap handling
- Make sitemap generation fully dynamic — reads feature flags at build time
- Routes for disabled features excluded from sitemap.xml automatically
- No robots.txt changes needed — sitemap exclusion is sufficient
- Keep sitemap simple: URLs only, no lastmod dates
- Feature-flag-level filtering only — don't validate individual CMS data existence

### Claude's Discretion
- Whether to audit all page types for redirect consistency or just fix ServicePage as identified
- Exact redirect target resolution when parent routes are also feature-gated
- Implementation pattern for feature flag checks in sitemap generation

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches. The audit clearly defines what needs fixing. Follow existing codebase patterns for feature flag checks and route handling.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 08-feature-flag-integration-polish*
*Context gathered: 2026-02-26*
