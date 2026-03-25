# Phase 4: Blog System - Research

**Researched:** 2026-02-23
**Domain:** Markdown blog system — Vite glob imports, frontmatter parsing, markdown rendering, SEO/GEO structured data
**Confidence:** HIGH (verified against npm registry, official docs, and Tailwind v4 source)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- Section named "Resources" (not "Blog" or "Guides")
- Page title: "Homeowner Resources"; Nav link: "Resources"
- URL path: `/resources` (listing) and `/resources/{slug}` (individual posts)
- Card grid layout on listing page; each card shows cover image, title, date, 1-2 line excerpt
- 10-12+ demo posts (enough for pagination to be functional)
- Cover images sourced from Unsplash/Pexels, placed in `/images/blog/` following existing `.jpg` + `.webp` pattern
- Clean & focused layout — centered content column, large hero image, minimal distractions (Medium-style)
- No estimated read time — just date and author byline
- Post footer: CTA (schedule inspection / get a quote) + 2-3 related post cards
- BlogPosting JSON-LD schema per post
- Meta tags: title, description, OG per post
- Frontmatter validated with Zod
- Posts sorted by date; tags present on posts
- Content optimized for SEO long-tail queries and GEO (AI citation) structure
- Feature-flagged (`features.blog`); blog already has placeholder slot in `features.ts`

### Claude's Discretion

- Grid column count (2 or 3) based on existing site design
- Pagination style and posts-per-page count
- Table of contents inclusion based on post length
- Inline images per post (cover + optional body images)
- Tag implementation approach (pills + tag pages recommended for SEO)
- FAQ schema per post (recommended for featured snippets)
- Exact typography and spacing

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| SEO-01 | Markdown Blog System — file-based blog with frontmatter metadata, listing page, post page, proper meta tags, Zod validation, sorting and tag filtering | Covered by: Vite glob + `?raw` pattern, gray-matter for frontmatter, react-markdown v10 for rendering, Zod schema for validation, react-router-dom for slug routing, `@tailwindcss/typography` for prose styling, JSON-LD via script tag |
</phase_requirements>

---

## Summary

Phase 4 implements a markdown-based "Resources" section using **Vite's native `import.meta.glob` with `{ query: '?raw' }`** to import `.md` files as raw strings, **gray-matter** to parse YAML frontmatter, and **react-markdown v10** to render markdown HTML. This eliminates the need for `vite-plugin-markdown`, which was flagged as an open question in STATE.md — the plugin's last release was January 2024 (v2.2.0), its peer dependency only goes up to `vite >= 2.0.0` (not Vite 7-tested explicitly), and it adds a build-time transform that can break on major Vite version changes. The native glob + gray-matter approach is more resilient, requires no plugin, and is the pattern used by VitePress itself.

The listing page is a standard React component with client-side pagination and tag filtering using `useState`. The post page reads the slug from the URL via `useParams`, finds the matching post from the glob manifest, and renders it with react-markdown inside a `prose` container from `@tailwindcss/typography`. The typography plugin supports Tailwind v4 via the `@plugin` CSS directive — confirmed against the official repository. JSON-LD `BlogPosting` schema is injected per post via a `<script dangerouslySetInnerHTML>` in the post component, consistent with how structured data is typically added in SPA React apps without server rendering.

**Primary recommendation:** Use Vite native glob (`{ query: '?raw', eager: true }`) + gray-matter + react-markdown v10 + @tailwindcss/typography. Skip vite-plugin-markdown entirely — it solves a problem that doesn't exist with this stack.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Vite `import.meta.glob` | Built-in (Vite 7) | Import all `.md` files as raw strings at build time | No plugin needed; native Vite API; fully supported in v7 |
| gray-matter | 4.0.3 (latest) | Parse YAML frontmatter from raw markdown strings | Battle-tested; used by VitePress, Gatsby, Astro; zero deps |
| react-markdown | 10.1.0 (latest) | Render markdown string as React elements | Official remarkjs library; v10 released Feb 2025 |
| @tailwindcss/typography | 0.5.19 (latest) | Apply typographic defaults to rendered markdown HTML | Officially supports Tailwind v4 via `@plugin` directive |
| zod | 4.3.6 (already installed) | Validate frontmatter shape at load time | Already in project; consistent with existing config validation |
| react-router-dom | 7.13.0 (already installed) | Slug-based routing for `/resources/:slug` | Already in project |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| remark-gfm | Latest | GitHub-flavored markdown (tables, task lists) | Include — GFM is table-stakes for modern markdown |
| rehype-slug | Latest | Add `id` attributes to headings | Include if implementing table of contents |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Vite glob + gray-matter | vite-plugin-markdown | Plugin last updated Jan 2024, no explicit Vite 7 test; adds build complexity with no benefit for this use case |
| react-markdown | marked + dangerouslySetInnerHTML | marked is faster but loses component-level control and requires XSS sanitization manually |
| @tailwindcss/typography | Custom prose CSS | Custom CSS is fully viable but typography plugin provides well-tested vertical rhythm, heading scales, code block styling |

**Installation:**
```bash
npm install gray-matter react-markdown remark-gfm @tailwindcss/typography
```

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── content/
│   └── blog/              # Markdown post files (10-12 demo posts)
│       ├── storm-damage-insurance-guide.md
│       ├── roof-replacement-signs.md
│       └── ...
├── lib/
│   └── blog.ts            # Glob import, frontmatter parse, Zod validate, sort/filter
├── pages/
│   ├── ResourcesIndex.tsx  # Listing page with pagination and tag filter
│   └── ResourcesPost.tsx   # Individual post renderer
└── types/
    └── markdown.d.ts       # Type declaration for *.md raw imports (if needed)
```

Image files: `/images/blog/` directory, following existing `.jpg` + `.webp` pattern.

### Pattern 1: Glob Import + Frontmatter Parse (the core engine)

**What:** Import all markdown files as raw strings at module load time, parse frontmatter with gray-matter, validate with Zod, return typed post array sorted by date.

**When to use:** Always — this is the `blog.ts` library module that all page components consume.

```typescript
// src/lib/blog.ts
import matter from 'gray-matter'
import { z } from 'zod'

// Vite glob: imports all .md files as raw strings, eagerly (synchronous)
// { query: '?raw' } is the Vite v5+ API; { as: 'raw' } is older API but still works
const modules = import.meta.glob('../content/blog/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>

const postFrontmatterSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  excerpt: z.string().min(1),
  tags: z.array(z.string()).min(1),
  coverImage: z.string().min(1),
  author: z.string().default('Acme Home Services'),
  published: z.boolean().default(true),
})

export type PostFrontmatter = z.infer<typeof postFrontmatterSchema>

export interface BlogPost extends PostFrontmatter {
  content: string  // raw markdown body (after frontmatter stripped)
}

export function getAllPosts(): BlogPost[] {
  const posts: BlogPost[] = []

  for (const [, raw] of Object.entries(modules)) {
    const { data, content } = matter(raw)
    const parsed = postFrontmatterSchema.safeParse(data)
    if (!parsed.success) {
      console.warn('[blog] Invalid frontmatter:', parsed.error.format())
      continue  // Skip invalid posts rather than crashing
    }
    if (!parsed.data.published) continue
    posts.push({ ...parsed.data, content })
  }

  // Sort by date descending (newest first)
  return posts.sort((a, b) => b.date.localeCompare(a.date))
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return getAllPosts().find((p) => p.slug === slug)
}

export function getAllTags(): string[] {
  const all = getAllPosts().flatMap((p) => p.tags)
  return [...new Set(all)].sort()
}
```

### Pattern 2: Listing Page with Pagination + Tag Filter

**What:** Client-side state for current page and active tag. Posts-per-page of 6 keeps grid balanced (2 or 3 columns). URL-based tag filter (`?tag=roofing`) for SEO value — tag pages become indexable.

```typescript
// src/pages/ResourcesIndex.tsx (simplified skeleton)
import { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { getAllPosts, getAllTags } from '../lib/blog'

const POSTS_PER_PAGE = 6

export default function ResourcesIndex() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTag = searchParams.get('tag') ?? ''
  const [page, setPage] = useState(1)

  const allPosts = getAllPosts()
  const filtered = activeTag ? allPosts.filter(p => p.tags.includes(activeTag)) : allPosts
  const totalPages = Math.ceil(filtered.length / POSTS_PER_PAGE)
  const paginated = filtered.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE)

  // Reset page when tag changes
  const handleTagChange = (tag: string) => {
    setPage(1)
    setSearchParams(tag ? { tag } : {})
  }

  // ... render card grid + pagination controls
}
```

### Pattern 3: Post Renderer with Typography

**What:** Look up post by slug from URL params, render markdown body with react-markdown inside a `prose` container.

```typescript
// src/pages/ResourcesPost.tsx (simplified skeleton)
import { useParams, Navigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { getPostBySlug } from '../lib/blog'
import PageMeta from '../components/ui/PageMeta'

export default function ResourcesPost() {
  const { slug } = useParams<{ slug: string }>()
  const post = slug ? getPostBySlug(slug) : undefined

  if (!post) return <Navigate to="/resources" replace />

  return (
    <>
      <PageMeta title={post.title} description={post.excerpt} path={`/resources/${post.slug}`} />
      {/* JSON-LD BlogPosting schema — see Pattern 4 */}
      <BlogPostingSchema post={post} />

      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        {/* Hero image, title, byline */}
        <div className="prose prose-lg prose-headings:font-heading prose-headings:text-navy prose-a:text-brand-blue max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {post.content}
          </ReactMarkdown>
        </div>
        {/* Post footer: CTA + related posts */}
      </article>
    </>
  )
}
```

### Pattern 4: BlogPosting JSON-LD (no library needed)

**What:** Inject structured data via `<script dangerouslySetInnerHTML>`. React 19 hoists `<title>` and `<meta>` automatically but does NOT hoist `<script>` tags — place this inside the article element or at component root.

```typescript
function BlogPostingSchema({ post }: { post: BlogPost }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      '@type': 'Organization',
      name: post.author,
    },
    image: `${SITE.url}${post.coverImage}`,
    url: `${SITE.url}/resources/${post.slug}`,
    keywords: post.tags.join(', '),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }}
    />
  )
}
```

### Pattern 5: Tailwind v4 Typography Plugin Setup

**What:** Add `@plugin "@tailwindcss/typography"` to `src/index.css` (the v4 way). No `tailwind.config.js` needed.

```css
/* src/index.css — add after @import "tailwindcss" */
@import "tailwindcss";
@plugin "@tailwindcss/typography";
```

Then use `prose` classes in the post renderer. Customize with `prose-headings:font-heading` to match the site's Plus Jakarta Sans heading font.

### Pattern 6: Markdown File Frontmatter Shape

```markdown
---
title: "Does Homeowners Insurance Cover Storm Damage to Your Roof?"
slug: "does-insurance-cover-storm-damage"
date: "2026-01-15"
excerpt: "Most homeowners don't know what their policy actually covers until it's too late. Here's what to look for before filing a claim."
tags: ["storm-damage", "insurance", "roofing"]
coverImage: "/images/blog/storm-damage-claim.webp"
author: "Acme Home Services"
published: true
---

## The Short Answer

Your homeowners insurance **likely covers** sudden storm damage...
```

### Pattern 7: Route Integration (following existing feature-flag pattern)

```typescript
// App.tsx additions
const ResourcesIndex = lazy(() => import('./pages/ResourcesIndex'))
const ResourcesPost = lazy(() => import('./pages/ResourcesPost'))

// Inside Routes:
{features.blog && (
  <>
    <Route path="resources" element={<ResourcesIndex />} />
    <Route path="resources/:slug" element={<ResourcesPost />} />
  </>
)}
```

```typescript
// navigation.ts: add to getNavLinks() following existing financingCalculator pattern
...(features.blog ? [{ href: '/resources', label: 'Resources' }] : []),
```

### Anti-Patterns to Avoid

- **Importing `.md` files without `{ query: '?raw' }`**: Vite will try to parse them as JavaScript modules and fail with a parse error.
- **Using `as: 'raw'` (old API)**: Works but `{ query: '?raw', import: 'default' }` is the current Vite v5+ documented API; prefer it.
- **Calling `getAllPosts()` inside component render without memoization**: `import.meta.glob` with `eager: true` runs at module init time, so the cost is paid once — but calling `getAllPosts()` on every render still re-runs the sort. Memoize with `useMemo` or export a pre-sorted constant from `blog.ts`.
- **Using `dangerouslySetInnerHTML` for markdown body**: react-markdown is the correct approach; `dangerouslySetInnerHTML` is for the JSON-LD script tag only.
- **Applying `prose` to the whole page**: Apply only to the article content container. Wrap non-prose elements (cards, CTAs) with `not-prose` class.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Frontmatter parsing | Custom YAML regex | gray-matter | Handles YAML edge cases (multiline, quotes, arrays), well-tested across 50M+ downloads/week |
| Markdown → React elements | HTML string + dangerouslySetInnerHTML | react-markdown | Sanitized output, component override support, remark/rehype plugin ecosystem |
| Typography defaults for prose | Custom `prose-` CSS from scratch | @tailwindcss/typography | Correct vertical rhythm, heading hierarchy, code blocks, blockquotes — months of tuning |
| Slug routing | Manual URL parsing in component | `useParams` from react-router-dom | Already installed; correct and type-safe |

**Key insight:** The entire markdown pipeline (raw string → frontmatter → HTML rendering → styled prose) can be composed from three npm installs and Vite's built-in glob. There is no complex infrastructure to build.

---

## Common Pitfalls

### Pitfall 1: Vite Glob `eager` vs Lazy Mode

**What goes wrong:** Using `import.meta.glob` without `eager: true` returns async loaders. All posts would need to be loaded individually with `await`. For a blog with 10-12 posts, async loading adds complexity with no benefit.

**Why it happens:** Vite's default is lazy to support code splitting. For a static content collection, this is counterproductive.

**How to avoid:** Always use `eager: true` for the blog manifest. This bundles all markdown content into the main chunk — acceptable for 10-12 posts at ~1000 words each (< 50KB raw text).

**Warning signs:** TypeScript errors about `Promise<string>` instead of `string` in the glob result.

### Pitfall 2: Prose Typography Conflicts with Custom Tailwind Styles

**What goes wrong:** `prose` resets all heading, link, and code styles. Custom `text-navy`, `text-brand-blue` classes get overridden inside a `prose` container.

**Why it happens:** Typography plugin injects CSS specificity via element selectors within `.prose`, which overrides utility classes.

**How to avoid:** Use `prose-headings:text-navy prose-headings:font-heading prose-a:text-brand-blue prose-strong:text-navy` to customize prose defaults without fighting the cascade. For sections that must break out of prose styling (post footer CTA, related posts), wrap them in a `not-prose` div outside the prose container.

### Pitfall 3: Date Parsing Timezone Issues

**What goes wrong:** `new Date('2026-01-15')` returns midnight UTC, which displays as the day before in negative-UTC-offset timezones.

**Why it happens:** ISO date strings without a time component are interpreted as UTC midnight.

**How to avoid:** Parse dates as local: `new Date(date + 'T00:00:00')` or use `date.split('-')` to construct a `Date` manually. Alternatively, display the date as a plain string (split on `-` and format) without converting to a Date object at all — this is simpler and avoids the issue entirely. Precedent: the project already chose local dates for the booking calendar (documented in STATE.md).

### Pitfall 4: `features.blog` Flag Not Wired

**What goes wrong:** Blog routes appear even when `features.blog: false`, or nav item appears without routes, or vice versa.

**Why it happens:** The flag must be applied in three places independently: App.tsx routes, navigation.ts `getNavLinks()`, and navigation.ts `getFooterCompanyLinks()`.

**How to avoid:** Update all three in the same task. The existing `financingCalculator` flag is already wired correctly in all three places — follow that exact pattern. Current `features.ts` has `blog: false`; flip to `true` as part of the phase.

### Pitfall 5: `@tailwindcss/typography` `@plugin` Directive Not Recognized

**What goes wrong:** After adding `@plugin "@tailwindcss/typography"` to index.css, TypeScript or the dev server throws an error about unknown `@plugin` directive.

**Why it happens:** `@plugin` is a Tailwind v4 CSS-in-CSS feature; it requires `@tailwindcss/vite` plugin (already installed) and Tailwind v4 to process it. It does NOT work as standard CSS.

**How to avoid:** Confirm the existing `@import "tailwindcss"` is processed by the `@tailwindcss/vite` plugin (it is — `vite.config.ts` already has `tailwindcss()` as a plugin). The `@plugin` directive immediately after `@import "tailwindcss"` will be processed correctly. No `tailwind.config.js` file is needed.

### Pitfall 6: Slug Collisions

**What goes wrong:** Two markdown files produce the same slug (either from filename or frontmatter), causing one post to be silently unreachable.

**Why it happens:** No uniqueness enforcement at authoring time.

**How to avoid:** Use the frontmatter `slug` field as the canonical slug (not filename). Add a duplicate detection check in `getAllPosts()`:

```typescript
const slugs = new Set<string>()
for (const post of posts) {
  if (slugs.has(post.slug)) {
    console.warn(`[blog] Duplicate slug detected: "${post.slug}" — post will be skipped`)
    continue
  }
  slugs.add(post.slug)
}
```

---

## Code Examples

Verified patterns from official sources:

### Vite Glob with Raw Query (verified: Vite docs)

```typescript
// Both syntaxes work in Vite 7; prefer the second (current documented API)
// Old:
const modules = import.meta.glob('./content/blog/*.md', { as: 'raw', eager: true })

// Current (Vite v5+):
const modules = import.meta.glob('./content/blog/*.md', { query: '?raw', import: 'default', eager: true })
// Type: Record<string, string>
```

### gray-matter Parse (verified: gray-matter npm)

```typescript
import matter from 'gray-matter'

const raw = `---
title: "My Post"
date: "2026-01-01"
---
Post content here.`

const { data, content } = matter(raw)
// data: { title: 'My Post', date: '2026-01-01' }
// content: '\nPost content here.'
```

### react-markdown with GFM and custom component (verified: react-markdown README)

```tsx
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

<div className="prose prose-lg max-w-none prose-headings:font-heading prose-headings:text-navy prose-a:text-brand-blue">
  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    components={{
      // Override image rendering to add lazy loading
      img: ({ src, alt }) => (
        <img src={src} alt={alt ?? ''} loading="lazy" decoding="async" className="rounded-xl w-full" />
      ),
    }}
  >
    {post.content}
  </ReactMarkdown>
</div>
```

### Tailwind v4 Typography Plugin (verified: tailwindcss-typography GitHub)

```css
/* src/index.css */
@import "tailwindcss";
@plugin "@tailwindcss/typography";
```

### FAQ Section in Markdown for GEO (GEO-optimized content pattern)

Structure posts with a final `## Frequently Asked Questions` section using `### Q:` subheadings. AI models preferentially extract and cite FAQ-formatted content. This also enables `FAQPage` schema if added to the post JSON-LD.

```markdown
## Frequently Asked Questions

### Does homeowners insurance cover all storm damage?

Most policies cover sudden, accidental damage from wind, hail, and lightning. Damage from flooding typically requires separate flood insurance.

### How long do I have to file a storm damage claim?

Most insurers require filing within 1-2 years of the damage event, but acting within 30-60 days is strongly recommended.
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| vite-plugin-markdown for .md imports | Native `import.meta.glob({ query: '?raw' })` + gray-matter | Vite v4+ | No plugin dependency; Vite version agnostic |
| `tailwind.config.js` with `plugins: [require('@tailwindcss/typography')]` | `@plugin "@tailwindcss/typography"` in CSS | Tailwind v4 | No config file needed; works with this project's existing setup |
| `{ as: 'raw' }` in glob | `{ query: '?raw', import: 'default' }` | Vite v5 | `as` still works but is not the documented current API |
| react-markdown v8 (JSX transform issues) | react-markdown v10.1.0 | Feb 2025 | Async plugin support added; fully compatible with React 19 |

**Deprecated/outdated:**
- `vite-plugin-markdown`: Last released Jan 2024; peer dep `vite: >= 2.0.0` means untested on Vite 7. Not recommended for this project.
- `as: 'raw'` syntax: Still functional in Vite 7 but `query: '?raw'` is the official current API per Vite docs.

---

## GEO Content Strategy

Based on research, AI models (Google AI Overviews, Perplexity, Claude) preferentially cite content that is:

1. **Directly answering a question in the first 40-60 words** — start each post with a clear, concise answer
2. **Fact-dense** — include statistics, numbers, timeframes (e.g., "85% of insurance claims require a contractor estimate")
3. **Structured with headers** — AI can extract individual sections as standalone answers
4. **FAQ-formatted** — FAQ sections at the end of posts are frequently cited verbatim
5. **Schema-marked** — `BlogPosting` and optionally `FAQPage` JSON-LD signals content purpose to crawlers

**Recommended post topics for maximum SEO/GEO coverage:**

Storm/Insurance (high-intent queries):
- "Does homeowners insurance cover storm damage to your roof?"
- "What to do immediately after storm damage to your home"
- "How to document roof damage for an insurance claim"

Roofing (informational + commercial intent):
- "Signs your roof needs replacement vs repair"
- "How long does a roof replacement take?"
- "Best roofing materials for harsh winters"

Siding (seasonal hooks):
- "Best siding for winter weather and energy efficiency"
- "How to identify siding damage before it becomes costly"

General (trust-building, recurring seasons):
- "Spring home inspection checklist for homeowners"
- "How to prepare your home for storm season"
- "What to expect during a professional roof inspection"

12 posts total — covers all services with seasonal variation and mix of informational/high-intent queries.

---

## Open Questions

1. **`{ query: '?raw', import: 'default' }` vs `{ as: 'raw' }`**
   - What we know: Both work in Vite 7; `query: '?raw'` is the documented current API
   - What's unclear: Whether `import: 'default'` is strictly required with `query: '?raw'` or just recommended
   - Recommendation: Use `{ query: '?raw', import: 'default', eager: true }` and test at the start of implementation; fall back to `{ as: 'raw', eager: true }` if TypeScript types don't resolve

2. **TypeScript declaration for `*.md` imports**
   - What we know: With `query: '?raw'`, Vite resolves the type as `string` (the `default` export), so a custom `.d.ts` may not be needed
   - What's unclear: Whether `tsc` in strict mode throws without a declaration
   - Recommendation: Start without `markdown.d.ts`; add it only if TypeScript compilation errors occur

3. **Tag page routes for SEO value**
   - What we know: CONTEXT.md recommends "tag pills with filtered URLs for SEO value"; URL-based filtering (`/resources?tag=roofing`) is the simplest implementation
   - What's unclear: Whether separate `/resources/tag/roofing` routes (true tag pages) are needed for meaningful SEO lift in a client-side SPA
   - Recommendation: Implement `?tag=` search params for now (simpler, still creates crawlable URLs); true static tag pages are a Phase 5/SSG concern

---

## Sources

### Primary (HIGH confidence)
- Vite 7 official docs (vite.dev/guide/features) — glob import API with `query` option verified
- gray-matter npm registry — v4.0.3 confirmed current, zero peer dependencies
- react-markdown npm registry — v10.1.0 confirmed, released Feb 2025
- @tailwindcss/typography GitHub (tailwindlabs/tailwindcss-typography) — v4 `@plugin` directive confirmed
- Project's `package.json` — existing dependencies (react-router-dom 7.13.0, zod 4.3.6) confirmed installed
- Project's `src/index.css` — `@import "tailwindcss"` with `@theme` confirms Tailwind v4 setup
- Project's `src/config/features.ts` — `blog: false` flag confirmed as placeholder slot

### Secondary (MEDIUM confidence)
- npm info vite-plugin-markdown — v2.2.0, peerDep `vite >= 2.0.0`, last released Jan 2024
- dev.to article on Vite glob raw imports — `{ as: 'raw' }` pattern confirmed working in Vite

### Tertiary (LOW confidence)
- GEO content structure recommendations (tryprofound.com, frase.io) — community-aggregated best practices; treat as guidelines not guarantees

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — verified against npm registry for all packages; Vite API confirmed against official docs
- Architecture: HIGH — pattern follows existing project conventions; all APIs verified
- Pitfalls: HIGH for technical pitfalls (verified against Vite/Tailwind docs); MEDIUM for GEO content strategy (community consensus, not a spec)

**Research date:** 2026-02-23
**Valid until:** 2026-05-23 (90 days — packages are stable; gray-matter/react-markdown rarely have breaking changes)
