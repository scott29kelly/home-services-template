# Phase 5: SEO & Content - Research

**Researched:** 2026-02-24
**Domain:** SEO (JSON-LD, sitemap, meta tags), city pages, portfolio enhancement, reviews
**Confidence:** HIGH (architecture), MEDIUM (vite-plugin-sitemap risk), HIGH (JSON-LD patterns)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**City page content**
- Each city gets a unique, hand-crafted description in config — mentions local context, not just city name swaps
- City page layout: hero section (city name + description), services available in that area, testimonials from that city, and call-to-action
- Ship with 20-25 demo cities with unique descriptions
- Each city config includes a `nearby` list of related service areas — renders as "Also serving: [nearby cities]" with internal links between city pages

**Portfolio & reviews**
- Before/after slider uses draggable overlay pattern — before and after images stacked with a draggable divider the user slides left/right
- Project detail pages are routable with their own URLs (e.g., `/portfolio/kitchen-remodel`) — click from grid navigates to detail page
- Google Reviews section is a visual placeholder with styled sample review cards and a clear callout: "Replace with your Google Reviews widget — see docs for setup"
- Testimonials in config are taggable with optional `citySlug` and `serviceSlug` arrays — city pages show relevant testimonials, service pages show relevant testimonials

**Social sharing & meta**
- OG image strategy: one default brand image (company logo/hero) used site-wide, with per-page override capability (blog posts, projects can specify their own image)
- Twitter card type: `summary_large_image` as default — large image preview for maximum visual impact
- Meta descriptions: config-driven with smart defaults per page type (home, service, city, blog) — individual pages can override, falls back to site-wide default
- Canonical URLs: auto-generated from site base URL + current route path — automatic for all pages with override available in page config

**Structured data scope**
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

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| SEO-02 | City/Service Area Pages — auto-generated landing pages for each city in service area config | Config-driven CityPage template pattern mirrors ServicePage.tsx; route-generator extension; service-areas.ts schema redesign |
| SEO-03 | JSON-LD Structured Data — schema.org markup generated from config, rendered per page | React 19 native `<script>` with `dangerouslySetInnerHTML`; schema generators in `src/lib/seo.ts`; LocalBusiness, Service, FAQ, AggregateRating, BreadcrumbList, BlogPosting schemas |
| SEO-04 | Sitemap & robots.txt — auto-generated at build time | vite-plugin-sitemap 0.8.2 with `dynamicRoutes`; known bug risk documented; custom Vite plugin fallback pattern ready |
| SEO-05 | Complete Meta Tag System — OG image, Twitter cards, canonical URLs | React 19 native meta/link hoisting; `property` attribute for OG; `name` for Twitter; absolute URLs required; `<link rel="canonical">` hoists automatically |
| SEO-06 | Reviews Config System — testimonial/review data in config with Google Reviews placeholder | Testimonials schema update with `citySlug[]`, `serviceSlug[]`, `rating`, `featured` fields; styled placeholder section |
| SEO-07 | Portfolio Enhancement — project detail pages with routable URLs, category filter, featured on homepage | New `slug` field on Project; `src/pages/ProjectDetail.tsx` template; App.tsx route `/portfolio/:slug`; `featured` flag for homepage |
</phase_requirements>

---

## Summary

Phase 5 is the SEO maturity phase: it makes the template machine-readable for Google and shareable on social platforms. The existing codebase has strong foundations to build on — `PageMeta.tsx` already handles basic `<title>`, `<meta name="description">`, and basic OG tags using React 19's native head hoisting. The work here extends that to the full OpenGraph/Twitter card spec and adds `<link rel="canonical">`. JSON-LD is a clean implementation: a thin `JsonLd.tsx` component renders a `<script type="application/ld+json">` with `dangerouslySetInnerHTML`, and a `seo.ts` library provides typed schema builder functions.

The city pages follow the exact same pattern as `ServicePage.tsx` — a single `CityPage.tsx` template driven by slug matching against a redesigned `service-areas.ts` config. The config needs to change shape from the current flat `areas[]` string arrays to an array of full city objects with slug, description, meta fields, nearby array, and FAQ. The `Testimonials` interface needs `citySlug` and `serviceSlug` optional arrays added so city and service pages can filter. Portfolio needs a `slug` field on each project and a new detail page routed at `/portfolio/:slug`.

The biggest technical risk is `vite-plugin-sitemap` (v0.8.2). There is an open unresolved GitHub issue (#88) where `sitemap.xml` silently fails to generate while `robots.txt` is created. The project already has a proven custom Vite plugin pattern (`copyAndOptimizeImages` in `vite.config.ts`) — the fallback is to write a custom `generateSitemap` Vite plugin using Node's `fs` module to write the XML directly in `closeBundle()`. This is the safer choice given the codebase pattern.

**Primary recommendation:** Implement `vite-plugin-sitemap` first; if it generates silently-empty output, fall back to a custom Vite plugin in `vite.config.ts` following the existing `copyAndOptimizeImages` pattern.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React 19 (already installed) | 19.2.4 | Native head meta hoisting | No additional library needed for `<title>`, `<meta>`, `<link>` tags |
| vite-plugin-sitemap | 0.8.2 | Build-time sitemap + robots.txt generation | Standard Vite ecosystem plugin; `dynamicRoutes` API fits the route-config pattern |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| (No new deps needed for JSON-LD) | — | JSON-LD rendered via `dangerouslySetInnerHTML` in a native `<script>` | Always — no library needed, hand-rolled is correct approach |
| (No new deps for before/after) | — | `BeforeAfterSlider.tsx` already exists and is feature-complete | Already built in Phase 2 |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| vite-plugin-sitemap | Custom Vite plugin | Custom plugin has no external deps and no bug risk; vite-plugin-sitemap is simpler if it works |
| React 19 native meta | react-helmet-async | react-helmet-async is unnecessary since React 19 natively hoists meta/title/link to head |
| Custom JsonLd.tsx | react-schemaorg / schema-dts | Typing library is optional complexity; a simple `dangerouslySetInnerHTML` component is sufficient |

**Installation (only if vite-plugin-sitemap chosen):**
```bash
npm install -D vite-plugin-sitemap
```

---

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   └── seo/
│       └── JsonLd.tsx          # Generic JSON-LD script injector
├── lib/
│   └── seo.ts                  # Schema builder functions (LocalBusiness, Service, FAQ, etc.)
├── pages/
│   ├── CityPage.tsx            # City page template (mirrors ServicePage.tsx)
│   └── ProjectDetail.tsx       # Project detail page template
├── config/
│   ├── service-areas.ts        # REDESIGNED: array of CityConfig objects
│   ├── testimonials.ts         # UPDATED: add citySlug[], serviceSlug[], rating
│   ├── projects.ts             # UPDATED: add slug, featured to Project interface
│   └── seo.ts                  # ALREADY EXISTS: extend with ogImage, twitterCard fields
```

### Pattern 1: JsonLd Component
**What:** A thin React component that injects a `<script type="application/ld+json">` into the document head using React 19's native hoisting.
**When to use:** On every page where structured data applies.

```typescript
// src/components/seo/JsonLd.tsx
interface JsonLdProps {
  data: Record<string, unknown> | Record<string, unknown>[]
}

export default function JsonLd({ data }: JsonLdProps) {
  // Sanitize to prevent XSS: replace < with \u003c
  const json = JSON.stringify(data).replace(/</g, '\\u003c')
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  )
}
```

### Pattern 2: Schema Builder Functions in seo.ts
**What:** Pure functions that take config data and return schema.org-valid JSON objects.
**When to use:** Called from each page component to build the data prop passed to `<JsonLd>`.

```typescript
// src/lib/seo.ts (illustrative — complete implementation in task)

export function buildLocalBusinessSchema(options: {
  company: typeof company
  citySlug?: string
  description?: string
}): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: options.company.name,
    telephone: options.company.phone,
    url: options.company.url,
    address: {
      '@type': 'PostalAddress',
      streetAddress: options.company.address.street,
      addressLocality: options.company.address.city,
      addressRegion: options.company.address.state,
      postalCode: options.company.address.zip,
    },
    areaServed: options.citySlug
      ? { '@type': 'City', name: options.citySlug }
      : undefined,
  }
}

export function buildServiceSchema(service: ServiceConfig): Record<string, unknown> { ... }
export function buildFAQSchema(items: { question: string; answer: string }[]): Record<string, unknown> { ... }
export function buildAggregateRatingSchema(testimonials: Testimonial[]): Record<string, unknown> | null { ... }
export function buildBreadcrumbSchema(crumbs: { name: string; url: string }[]): Record<string, unknown> { ... }
export function buildBlogPostingSchema(post: BlogPost): Record<string, unknown> { ... }
```

### Pattern 3: Enhanced PageMeta with OG + Twitter + Canonical
**What:** Extend existing `PageMeta.tsx` to add og:image (with absolute URL), Twitter card tags, and canonical link.
**When to use:** All pages. The component already exists — add the missing tags.

Key insights:
- OG tags use `property` attribute: `<meta property="og:image" content="..." />`
- Twitter tags use `name` attribute: `<meta name="twitter:card" content="summary_large_image" />`
- Canonical uses `<link rel="canonical" href="..." />` — React 19 hoists this to `<head>` automatically
- OG and Twitter image URLs MUST be absolute (e.g., `https://example.com/images/og-default.webp`)

```typescript
// src/components/ui/PageMeta.tsx — extended interface
interface PageMetaProps {
  title: string
  description: string
  path?: string          // existing
  ogImage?: string       // per-page override (absolute URL or path — component makes absolute)
  noindex?: boolean      // for thank-you, 404, etc.
}
```

### Pattern 4: City Config Redesign
**What:** `service-areas.ts` must change from flat string arrays to typed `CityConfig` objects.
**When to use:** Required to support SEO-02 — city pages need slug, description, meta, nearby, FAQ.

```typescript
// src/config/service-areas.ts — new shape
export interface CityConfig {
  slug: string              // 'anytown' → /service-areas/anytown
  name: string              // 'Anytown'
  state: string             // 'TX'
  description: string       // Unique 2-3 sentence description with local context
  metaTitle?: string        // Override: defaults to '{name} Roofing & Siding | {company}'
  metaDescription?: string  // Override: falls back to description[:160]
  nearby: string[]          // slugs of nearby cities for internal linking
  faqs?: { question: string; answer: string }[]  // city-specific FAQs
  isHQ?: boolean            // Marks headquarters city
}

export const cityPages: CityConfig[] = [
  {
    slug: 'anytown',
    name: 'Anytown',
    state: 'TX',
    isHQ: true,
    description: 'Anytown is our home base...',
    nearby: ['springfield', 'riverside', 'fairview'],
    faqs: [...]
  },
  // ... 20-25 more cities
]

// Keep serviceAreas for the ServiceAreas index page (backward compat)
export const serviceAreas = { summary: '...', states: [...] }
```

### Pattern 5: Testimonials Schema Update
**What:** Add `citySlug`, `serviceSlug`, and `rating` to the Testimonial interface.
**When to use:** SEO-06 requires city pages and service pages to show relevant testimonials.

```typescript
export interface Testimonial {
  name: string
  location: string
  quote: string
  image: string
  service?: string
  rating?: number          // 1-5, for AggregateRating schema; defaults to 5
  featured?: boolean       // true = show on homepage
  citySlug?: string        // filter: show on /service-areas/{slug}
  serviceSlug?: string     // filter: show on /{service-slug}
}
```

### Pattern 6: Project Detail Pages
**What:** Add `slug` field to Project; add `ProjectDetail.tsx` page; add `/portfolio/:slug` route.
**When to use:** SEO-07 requires routable project URLs.

```typescript
// Updated Project interface in projects.ts
export interface Project {
  id: number
  slug: string              // NEW: 'kitchen-remodel' → /portfolio/kitchen-remodel
  title: string
  location: string
  category: ProjectCategory
  detail: string
  image: string
  description?: string      // NEW: longer description for detail page
  featured?: boolean        // NEW: show on homepage portfolio section
  beforeImage?: string      // NEW: link BeforeAfter to project
  afterImage?: string       // NEW
}
```

### Pattern 7: Sitemap Generation
**What:** Generate `sitemap.xml` listing all routes (static, services, cities, blog posts, portfolio).
**When to use:** SEO-04. Routes are sourced from config at build time.

**Preferred: vite-plugin-sitemap** (simpler, test first):
```typescript
// vite.config.ts addition
import Sitemap from 'vite-plugin-sitemap'
import { services } from './src/config/services'
import { cityPages } from './src/config/service-areas'
import { getAllPosts } from './src/lib/blog'

const dynamicRoutes = [
  ...services.map(s => `/${s.slug}`),
  ...cityPages.map(c => `/service-areas/${c.slug}`),
  ...getAllPosts().map(p => `/resources/${p.slug}`),
  ...projects.items.map(p => `/portfolio/${p.slug}`),
]

// In plugins array:
Sitemap({
  hostname: company.url,
  dynamicRoutes,
  generateRobotsTxt: true,
  exclude: ['/thank-you', '/404'],
})
```

**Fallback: Custom Vite plugin** (if vite-plugin-sitemap generates empty output):
```typescript
// Custom generateSitemap plugin in vite.config.ts using the existing closeBundle() pattern
function generateSitemapAndRobots(): Plugin {
  return {
    name: 'generate-sitemap',
    enforce: 'post',
    apply: 'build',
    async closeBundle() {
      const fs = await import('fs/promises')
      const { company } = await import('./src/config/company.js')
      // ... build XML string from routes list
      // ... write dist/sitemap.xml and dist/robots.txt
    }
  }
}
```

### Anti-Patterns to Avoid
- **Relative URLs in OG/Twitter meta tags:** `og:image` and `twitter:image` MUST be absolute URLs. Crawlers and social bots don't resolve relative paths. Always prepend `company.url`.
- **`itemProp` on meta tags:** React 19 does NOT hoist meta tags with `itemProp` — they stay in the component tree. Don't use `itemProp` for SEO metadata.
- **Relying on FAQ JSON-LD for rich results:** Google restricted FAQ rich results to government/health sites in August 2023. Still implement the schema (it feeds structured data parsers and AI), but don't promise rich snippet appearances in success criteria.
- **Unescaped `<` in JSON-LD:** JSON.stringify doesn't escape `<`, which creates XSS risk. Always replace `<` with `\u003c` in the serialized JSON string before inserting.
- **Hardcoded route arrays for sitemap:** Route arrays must be derived from the same config that drives App.tsx — otherwise they drift out of sync when routes change.
- **Blog content import in vite.config.ts:** `import.meta.glob` only works in Vite's module context, not in `vite.config.ts`. Blog posts for sitemap must be loaded differently (e.g., read the content directory directly with `fs.readdirSync`).

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| OG/Twitter meta tags in React | Custom head manager | React 19 native `<meta>` and `<link>` | Already in React 19, no library needed |
| Before/after slider | New slider component | Existing `BeforeAfterSlider.tsx` | Already built in Phase 2 with Pointer Events API — zero new deps |
| JSON-LD deduplication | Complex schema merging | One schema type per `<JsonLd>` call | Google accepts multiple JSON-LD blocks on the same page |

**Key insight:** The "don't hand-roll" items here are things that ARE already hand-rolled correctly in this project. Phase 5 extends existing patterns rather than introducing new dependencies.

---

## Common Pitfalls

### Pitfall 1: vite-plugin-sitemap Silent Failure
**What goes wrong:** Plugin generates `robots.txt` and modifies `index.html` to reference `sitemap.xml`, but `sitemap.xml` itself is never written.
**Why it happens:** Open GitHub issue #88 (unresolved as of May 2025). Appears related to output directory configuration in some project setups.
**How to avoid:** After installing and configuring, run `npm run build` and verify `dist/sitemap.xml` exists. If only `dist/robots.txt` appears, switch to the custom Vite plugin fallback immediately.
**Warning signs:** `robots.txt` present but no `sitemap.xml` in `dist/`. No error output during build.

### Pitfall 2: Blog Post Import in vite.config.ts
**What goes wrong:** `import.meta.glob` cannot be used in `vite.config.ts` — it's Vite's transform-time feature only available in app code.
**Why it happens:** `vite.config.ts` runs in Node context before Vite's module transform. Blog post discovery for sitemap must use `fs.readdirSync` on `src/content/blog/` and parse frontmatter with gray-matter directly in the plugin.
**How to avoid:** In the sitemap plugin, use `fs.readdirSync('src/content/blog')` and `matter(fs.readFileSync(...))` to discover slugs. Don't import from `src/lib/blog.ts`.
**Warning signs:** TypeScript error about `import.meta` in vite.config.ts, or blank routes array.

### Pitfall 3: service-areas.ts Backward Compatibility
**What goes wrong:** `ServiceAreas.tsx` page and other components currently read `SITE.serviceArea.states[]` (the old flat string format). Redesigning `service-areas.ts` to city objects will break these.
**Why it happens:** The old shape (`{ summary, states: [{ name, areas: string[] }] }`) is incompatible with the new city-page shape (`CityConfig[]`).
**How to avoid:** Export BOTH from `service-areas.ts`: the new `cityPages: CityConfig[]` for city page routing, and preserve or rename the old `serviceAreas` shape for the index page. `ServiceAreas.tsx` uses the index page shape; `CityPage.tsx` uses `cityPages`.
**Warning signs:** TypeScript errors in `ServiceAreas.tsx` or `site.ts` after modifying `service-areas.ts`.

### Pitfall 4: OG Image Relative URL
**What goes wrong:** Social preview images fail to display on Twitter/Facebook/LinkedIn.
**Why it happens:** `og:image` value is `/images/og-default.webp` (relative). Social crawlers don't resolve relative paths against the page URL.
**How to avoid:** In `PageMeta.tsx`, always construct absolute URLs: `const ogImageUrl = (ogImage || seo.ogImage).startsWith('http') ? ogImage : \`${company.url}${ogImage}\``
**Warning signs:** Twitter Card Validator shows missing image. Facebook Debugger shows URL fetch error.

### Pitfall 5: Testimonial Interface Breaking Change
**What goes wrong:** Adding `citySlug` and `serviceSlug` optional arrays to `Testimonial` is safe, but changing `featured` from absent to a boolean flag requires updating the `satisfies Testimonial[]` assertions in all testimonial arrays.
**Why it happens:** The `satisfies` keyword type-checks but does not add properties — existing objects without `featured` just need the field to be optional.
**How to avoid:** Add `featured?: boolean` and `citySlug?: string` and `serviceSlug?: string` as optional fields. The existing data continues to satisfy the updated interface without modification.
**Warning signs:** TypeScript errors on `satisfies Testimonial[]` in `testimonials.ts`.

### Pitfall 6: City Route Registration
**What goes wrong:** `CityPage.tsx` template is built but city URLs return 404.
**Why it happens:** `App.tsx` routes must be updated to include `/service-areas/:slug` using the same pattern as service routes.
**How to avoid:** Follow the `getServiceRoutes()` pattern — add `getCityRoutes()` to `route-generator.ts`, update `App.tsx` to map them.
**Warning signs:** `/service-areas/anytown` renders the 404 page instead of CityPage.

### Pitfall 7: Project Detail URL Clash with "All" Category
**What goes wrong:** `projects.items` currently has no `slug` field. If slugs are auto-generated from title, there could be collisions.
**Why it happens:** Projects with titles like "Complete Roof Replacement" generate slug `complete-roof-replacement` — unique enough, but must be explicitly defined in config to avoid surprises.
**How to avoid:** Add explicit `slug` field to each project in `projects.ts`. Don't auto-generate from title.
**Warning signs:** Two projects resolving to the same route in App.tsx.

---

## Code Examples

### JsonLd Component (complete)
```typescript
// src/components/seo/JsonLd.tsx
// Source: React 19 dangerouslySetInnerHTML pattern; XSS protection pattern from community best practice
interface JsonLdProps {
  data: Record<string, unknown> | Record<string, unknown>[]
}

export default function JsonLd({ data }: JsonLdProps) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c')
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  )
}
```

### Full LocalBusiness Schema for Homepage
```typescript
// Illustrative — all fields from company config
const localBusiness = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: company.name,
  description: seo.defaultDescription,
  url: company.url,
  telephone: company.phone,
  email: company.email,
  logo: `${company.url}${seo.ogImage}`,
  image: `${company.url}${seo.ogImage}`,
  address: {
    '@type': 'PostalAddress',
    streetAddress: company.address.street,
    addressLocality: company.address.city,
    addressRegion: company.address.state,
    postalCode: company.address.zip,
    addressCountry: 'US',
  },
  openingHoursSpecification: [
    { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday'], opens: '08:00', closes: '18:00' },
    { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Saturday'], opens: '09:00', closes: '14:00' },
  ],
  sameAs: [company.social.facebook, company.social.instagram, company.social.linkedin].filter(Boolean),
  aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.9', reviewCount: '150' },
}
```

### FAQPage Schema
```typescript
// Source: https://developers.google.com/search/docs/appearance/structured-data/faqpage
const faq = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: items.map(({ question, answer }) => ({
    '@type': 'Question',
    name: question,
    acceptedAnswer: { '@type': 'Answer', text: answer },
  })),
}
```

### BreadcrumbList Schema
```typescript
const breadcrumb = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: crumbs.map((crumb, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: crumb.name,
    item: `${company.url}${crumb.url}`,
  })),
}
```

### Enhanced PageMeta (OG + Twitter + Canonical)
```typescript
// Extended PageMeta.tsx
import { company } from '../../config/company'
import { seo } from '../../config/seo'

interface PageMetaProps {
  title: string
  description: string
  path?: string
  ogImage?: string      // relative path like '/images/og-custom.webp'
  noindex?: boolean
}

export default function PageMeta({ title, description, path = '', ogImage, noindex }: PageMetaProps) {
  const fullTitle = title === company.name ? title : `${title} | ${company.name}`
  const pageUrl = `${company.url}${path}`
  const imageUrl = (() => {
    const src = ogImage || seo.ogImage
    return src.startsWith('http') ? src : `${company.url}${src}`
  })()

  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {/* Canonical */}
      <link rel="canonical" href={pageUrl} />
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
    </>
  )
}
```

### vite-plugin-sitemap Configuration
```typescript
// vite.config.ts — import at top (careful: cannot use import.meta.glob here)
import Sitemap from 'vite-plugin-sitemap'
import { services } from './src/config/services'
import { cityPages } from './src/config/service-areas'
import { company } from './src/config/company'
import { projects } from './src/config/projects'
import matter from 'gray-matter'
import { readdirSync, readFileSync } from 'fs'
import { resolve } from 'path'

// Discover blog slugs at build time (can't use import.meta.glob in config)
function getBlogSlugs(): string[] {
  const dir = resolve('src/content/blog')
  try {
    return readdirSync(dir)
      .filter(f => f.endsWith('.md'))
      .map(f => {
        const { data } = matter(readFileSync(resolve(dir, f), 'utf-8'))
        return data.published !== false ? data.slug : null
      })
      .filter(Boolean) as string[]
  } catch { return [] }
}

const dynamicRoutes = [
  ...services.map(s => `/${s.slug}`),
  ...cityPages.map(c => `/service-areas/${c.slug}`),
  ...projects.items.filter(p => p.slug).map(p => `/portfolio/${p.slug}`),
  ...getBlogSlugs().map(slug => `/resources/${slug}`),
]

// In defineConfig plugins array:
Sitemap({
  hostname: company.url,
  dynamicRoutes,
  generateRobotsTxt: true,
  exclude: ['/thank-you', '/404', '/ava'],
  changefreq: 'weekly',
  priority: 0.8,
})
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| react-helmet / react-helmet-async for meta tags | React 19 native `<title>`, `<meta>`, `<link>` hoisting | React 19 GA (Dec 2024) | No helmet library needed; this project already uses React 19 |
| FAQ JSON-LD generating rich snippets for all sites | FAQ rich results restricted to health/government sites | August 2023 | FAQ schema still valuable for AI search parsing (GEO/AEO) but won't show rich snippets in SERP |
| Single sitewide meta description | Page-type defaults with per-page overrides | Ongoing best practice | Better relevance signals per page |
| Flat string array for service areas | Full CityConfig objects with slug, description, nearby | This phase | Enables SEO-02 city pages |

**Deprecated/outdated:**
- `react-helmet`: No longer needed for this project — React 19 native hoisting covers the use case without adding a dependency.
- FAQ Schema as a guaranteed rich snippet source: Still valid structured data, but no longer produces FAQ accordion in search results for non-health/government sites. Worth implementing for AI/GEO value.

---

## Open Questions

1. **vite-plugin-sitemap Vite 7 compatibility**
   - What we know: Plugin last published May 2025 (v0.8.2); dev dependency pinned to Vite ~5.2; open issue #88 for sitemap not generating
   - What's unclear: Whether Vite 7 (in use here) triggers the issue #88 failure mode
   - Recommendation: Test with `npm run build && ls dist/` immediately after adding plugin. If `sitemap.xml` is absent, implement custom plugin. Build the custom plugin fallback in the same plan wave so it's ready.

2. **Blog slugs in vite.config.ts**
   - What we know: `import.meta.glob` doesn't work in `vite.config.ts`; gray-matter is already a dependency; direct `fs.readFileSync` works
   - What's unclear: Whether dynamic imports in Vite config hook can access ESM-only modules cleanly
   - Recommendation: Use synchronous `fs.readFileSync` + `matter()` in the config — same pattern will work in both the plugin and custom fallback.

3. **og:image asset for default**
   - What we know: `seo.ogImage` references `/images/og-default.webp` which may not exist in the images directory yet
   - What's unclear: Whether the image exists and meets social sharing size requirements (1200x630 recommended)
   - Recommendation: Add creating/verifying `og-default.webp` as an explicit task. If no specific brand image, reuse `hero-roofing.webp` as the default (it already meets size requirements).

---

## Sources

### Primary (HIGH confidence)
- React 19 official docs (react.dev/reference/react-dom/components/meta, link) — meta/link hoisting behavior confirmed; `itemProp` exception documented
- React 19 blog post (react.dev/blog/2024/12/05/react-19) — native document metadata feature confirmed
- schema.org LocalBusiness, Service, FAQPage official types — field requirements verified
- Google Search Central — LocalBusiness structured data guidelines; BreadcrumbList; FAQ change August 2023
- vite-plugin-sitemap GitHub (github.com/jbaubree/vite-plugin-sitemap) — API confirmed; issue #88 confirmed open and unresolved
- Existing project code (PageMeta.tsx, ServicePage.tsx, vite.config.ts) — architectural patterns confirmed directly

### Secondary (MEDIUM confidence)
- React 19 hoisting of `property`-based meta tags (og:image) — not explicitly documented for `property` attr but confirmed by multiple community sources; React hoists all `<meta>` elements
- vite-plugin-sitemap v0.8.2, last published May 2025 — version data from npm registry (403 on direct fetch; confirmed via web search)
- `dangerouslySetInnerHTML` XSS pattern for JSON-LD — multiple community sources agree on `\u003c` replacement

### Tertiary (LOW confidence)
- vite-plugin-sitemap Vite 7 compatibility — no specific test found; LOW risk given the plugin is a pure Node/fs plugin that doesn't depend on Vite internals

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — React 19 is installed; JSON-LD pattern is well-documented; vite-plugin-sitemap is LOW-MEDIUM due to open bug
- Architecture: HIGH — Mirrors existing ServicePage.tsx/route-generator patterns exactly; no novel patterns needed
- Pitfalls: HIGH — Critical bugs identified from direct GitHub issue inspection; backward-compat risks identified from direct code inspection

**Research date:** 2026-02-24
**Valid until:** 2026-03-24 (stable domain; vite-plugin-sitemap bug status may change sooner)
