# Phase 4: Blog System - Context

**Gathered:** 2026-02-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Implement a markdown-based "Resources" section (not "Blog") with frontmatter, listing page, individual post pages, SEO markup, and demo content. The primary purpose is SEO and GEO optimization — posts are structured for search engines and AI scrapers first, human readers second. The section must still look premium as part of the template demo.

</domain>

<decisions>
## Implementation Decisions

### Section Branding
- Section named "Resources" (not "Blog" or "Guides")
- Page title: "Homeowner Resources"
- Nav link: "Resources"
- URL path: `/resources` (listing) and `/resources/{slug}` (individual posts)
- Framed as expert knowledge, not corporate marketing

### Listing Page Layout
- Card grid layout (Claude decides column count based on existing site patterns)
- Each card shows: cover image, title, date, and 1-2 line excerpt
- Paginated — enough demo posts to fill 1.5+ pages (10-12 posts minimum)
- Pagination style at Claude's discretion

### Post Reading Experience
- Clean & focused layout — centered content column, large hero image, minimal distractions (Medium-style)
- No estimated read time — just date and author byline
- Table of contents: Claude's discretion based on post length
- Post footer: CTA (schedule inspection / get a quote) + 2-3 related post cards

### Demo Post Content
- 10-12+ demo posts (enough for pagination to be functional)
- Tone: educational / helpful — practical advice that builds trust
- Length: medium (600-1000 words) per post
- Topics: balanced across all services (roofing, siding, storm damage, insurance) WITH seasonal hooks (spring inspections, winter prep, etc.)
- Inline images: Claude's discretion per post topic
- Content optimized for SEO — target long-tail search queries homeowners actually search
- GEO optimized — structured so AI models can extract and cite content

### Images
- Existing site images stay untouched
- Blog cover images sourced from Unsplash/Pexels (free, realistic, industry-relevant)
- Added to `/images/blog/` or similar, following existing `.jpg` + `.webp` pattern
- Can be swapped later via frontmatter path

### Tag & Filtering
- Claude's discretion on implementation (tag pills with filtered URLs for SEO value recommended)
- Tags should create additional indexable pages where beneficial

### SEO Optimization
- Primary purpose of the entire section is SEO/GEO
- Posts structured for maximum crawlability and AI citation
- BlogPosting JSON-LD schema per post (per roadmap)
- FAQ sections per post: Claude's discretion (recommended for featured snippet targeting)
- Meta tags: title, description, OG per post

### Claude's Discretion
- Grid column count (2 or 3) based on existing site design
- Pagination style and posts-per-page count
- Table of contents inclusion based on post length
- Inline images per post (cover + optional body images)
- Tag implementation approach (pills + tag pages recommended for SEO)
- FAQ schema per post (recommended for featured snippets)
- Exact typography and spacing
- Loading states and error handling

</decisions>

<specifics>
## Specific Ideas

- Posts should feel like expert advice a homeowner would trust, not generic AI filler
- The SEO angle: target queries like "does insurance cover storm damage", "signs my roof needs replacement", "best siding for winter"
- GEO angle: structure content so AI models (Google AI Overview, Bing Chat, etc.) can extract and cite it
- The section must look premium enough to not bring down the rest of the site's polish
- Enough posts to demonstrate pagination working (minimum 10-12)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-blog-system*
*Context gathered: 2026-02-23*
