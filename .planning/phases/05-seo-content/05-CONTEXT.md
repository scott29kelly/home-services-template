# Phase 5: SEO & Content - Context

**Gathered:** 2026-02-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Implement city/service-area pages with unique content, JSON-LD structured data across all page types, sitemap with auto-generated routes, enhanced meta tags (OG, Twitter, canonical), reviews config system with Google Reviews placeholder, and portfolio enhancement with before/after slider detail pages. Template buyers get a fully SEO-optimized site out of the box.

</domain>

<decisions>
## Implementation Decisions

### City page content
- Each city gets a unique, hand-crafted description in config — mentions local context, not just city name swaps
- City page layout: hero section (city name + description), services available in that area, testimonials from that city, and call-to-action
- Ship with 20-25 demo cities with unique descriptions
- Each city config includes a `nearby` list of related service areas — renders as "Also serving: [nearby cities]" with internal links between city pages

### Portfolio & reviews
- Before/after slider uses draggable overlay pattern — before and after images stacked with a draggable divider the user slides left/right
- Project detail pages are routable with their own URLs (e.g., `/portfolio/kitchen-remodel`) — click from grid navigates to detail page
- Google Reviews section is a visual placeholder with styled sample review cards and a clear callout: "Replace with your Google Reviews widget — see docs for setup"
- Testimonials in config are taggable with optional `citySlug` and `serviceSlug` arrays — city pages show relevant testimonials, service pages show relevant testimonials

### Social sharing & meta
- OG image strategy: one default brand image (company logo/hero) used site-wide, with per-page override capability (blog posts, projects can specify their own image)
- Twitter card type: `summary_large_image` as default — large image preview for maximum visual impact
- Meta descriptions: config-driven with smart defaults per page type (home, service, city, blog) — individual pages can override, falls back to site-wide default
- Canonical URLs: auto-generated from site base URL + current route path — automatic for all pages with override available in page config

### Structured data scope
- LocalBusiness JSON-LD on homepage (main business) and each city page (with `areaServed`)
- Full schema set: Service schema on service pages, FAQ on pages with FAQ sections, Review/AggregateRating with testimonials, BreadcrumbList on all pages
- FAQ items defined in config per service/city — auto-generates both the visible FAQ section AND the JSON-LD from the same source of truth
- Sitemap auto-generates from route config: static pages, service pages, city pages, blog posts — new content appears automatically

### Claude's Discretion
- Before/after slider library choice and implementation details
- Exact JSON-LD schema field mapping and validation approach
- Sitemap plugin selection and build integration
- SEO config file structure and defaults organization
- robots.txt content and configuration

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 05-seo-content*
*Context gathered: 2026-02-24*
