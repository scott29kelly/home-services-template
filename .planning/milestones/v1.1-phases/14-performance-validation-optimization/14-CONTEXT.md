# Phase 14: Performance Validation & Optimization - Context

**Gathered:** 2026-03-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Measure Lighthouse Performance scores after migration, optimize until 90+ on both desktop and mobile. Address LCP, CLS, and render-blocking resources. This phase covers measurement, optimization, and validation — not new features or architectural redesigns.

</domain>

<decisions>
## Implementation Decisions

### Measurement approach
- Run Lighthouse CLI against local build/preview output for fast iteration
- Establish baseline measurements for all target pages before any optimization work
- Take median of 3 runs per page to smooth score variance
- Record scores and key metrics in planning/verification docs (no raw JSON reports in repo)

### Optimization priorities
- Use modern image formats (WebP/AVIF with fallbacks) for maximum compression
- Inline critical above-the-fold CSS, defer non-critical stylesheets
- Use font-display: swap with preloaded critical fonts (minor FOUT acceptable, no FOIT)
- Code-split JS, defer non-critical scripts, lazy-load below-fold components

### Target thresholds
- Floor: 90+ Performance score on all measured pages
- Aim for 95+ where achievable without diminishing returns (margin for regressions)
- Same targets for desktop and mobile — no lower mobile threshold
- LCP: under 2.5s desktop, under 4s mobile (matches Core Web Vitals "good")
- CLS: under 0.1
- If a page can't reach 90+ without significant architectural changes, document the blocker and defer to a follow-up task

### Page coverage
- Measure all pre-rendered routes (homepage, all service pages, contact, about, etc.)
- Group pages by template — optimize the template once, verify a sample per group
- Equal weight for mobile and desktop optimization
- Include 404/error pages in optimization scope

### Claude's Discretion
- Specific Lighthouse CLI flags and configuration
- Order of optimization passes (which issues to fix first)
- Whether to use a build-time critical CSS extraction tool or manual approach
- Image format selection per image (WebP vs AVIF based on content type)

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches for Lighthouse optimization workflow.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 14-performance-validation-optimization*
*Context gathered: 2026-03-03*
