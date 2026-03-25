# Phase 10: Performance Monitoring - Context

**Gathered:** 2026-02-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Add Core Web Vitals monitoring (CLS, INP, LCP) and verify Lighthouse score targets (90+ Performance, Accessibility, SEO). This is the final gap-closure phase — measures and reports on the performance of the completed site. No new user-facing features.

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion
User deferred all decisions to best practices for the project context: a home services industry template website targeting small business owners and their customers. Apply standard approaches for each area:

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

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches. Apply industry best practices for a small business home services website template.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 10-performance-monitoring*
*Context gathered: 2026-02-26*
