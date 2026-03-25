---
phase: 04-blog-system
plan: 01
subsystem: ui
tags: [react, markdown, gray-matter, react-markdown, tailwindcss-typography, zod, vite-glob]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: Tailwind v4 CSS setup, feature flags, config barrel, navigation config
  - phase: 03-lead-generation
    provides: Feature flag pattern (financingCalculator), navigation spread pattern
provides:
  - Blog engine (src/lib/blog.ts) — glob import, frontmatter parse, Zod validation, sort/filter/cache
  - Resources listing page at /resources with card grid, tag filtering, pagination
  - @tailwindcss/typography loaded via @plugin for Plan 02 prose rendering
  - Feature flag wired in all three locations (routes, header nav, footer nav)
affects: 04-02 (post page uses blog.ts exports), 05-seo (blog posts need structured data)

# Tech tracking
tech-stack:
  added:
    - gray-matter 4.0.3 — YAML frontmatter parsing
    - react-markdown 10.1.0 — markdown-to-React rendering (used in Plan 02)
    - remark-gfm 4.0.1 — GitHub-flavored markdown support
    - "@tailwindcss/typography 0.5.19 — prose typography styles via @plugin directive"
  patterns:
    - Vite native import.meta.glob with { query: '?raw', import: 'default', eager: true } for markdown
    - Module-level cache in blog.ts to avoid re-sorting on every getAllPosts() call
    - Slug deduplication with Set<string> and console.warn on collision
    - Timezone-safe date formatting by splitting YYYY-MM-DD string (avoids new Date() UTC offset issue)
    - useSearchParams for tag filter state (shareable/indexable URLs ?tag=roofing)

key-files:
  created:
    - src/lib/blog.ts — Blog engine with Zod validation, caching, all exports
    - src/pages/ResourcesIndex.tsx — Resources listing page
    - src/pages/ResourcesPost.tsx — Placeholder for Plan 02 post page
    - src/content/blog/ — Empty directory for Plan 02 markdown posts
  modified:
    - package.json — Added gray-matter, react-markdown, remark-gfm, @tailwindcss/typography
    - src/index.css — Added @plugin "@tailwindcss/typography" after @import "tailwindcss"
    - src/config/features.ts — Flipped blog: false → true (Phase 4)
    - src/config/navigation.ts — Added Resources link to header and footer nav
    - src/App.tsx — Added lazy ResourcesIndex/ResourcesPost imports + routes behind features.blog guard

key-decisions:
  - "vite-plugin-markdown skipped; native import.meta.glob({ query: '?raw', eager: true }) + gray-matter is more resilient with no plugin dependency"
  - "Module-level cache in blog.ts (cachedPosts) avoids re-sorting on each getAllPosts() call from components"
  - "useSearchParams for tag filter state creates shareable/indexable URLs (?tag=roofing) instead of useState"
  - "ResourcesPost.tsx created as placeholder to prevent TypeScript lazy-import errors before Plan 02"
  - "Timezone-safe date display by splitting YYYY-MM-DD string — consistent with existing calendar approach"

patterns-established:
  - "Blog engine pattern: glob import → gray-matter parse → Zod safeParse → warn+skip invalid → cache sorted result"
  - "Feature-flagged pages: lazy import + conditional Route in App.tsx + spread in both nav functions"
  - "Tag filtering: useSearchParams(?tag=) for URL state, reset page to 1 on tag change"

requirements-completed: [SEO-01]

# Metrics
duration: 4min
completed: 2026-02-24
---

# Phase 4 Plan 01: Blog System — Engine + Listing Page Summary

**Markdown blog engine using Vite glob + gray-matter + Zod validation, with Resources listing page featuring card grid, URL-based tag filtering, and client-side pagination**

## Performance

- **Duration:** ~4 min
- **Started:** 2026-02-24T03:11:19Z
- **Completed:** 2026-02-24T03:15:18Z
- **Tasks:** 2
- **Files modified:** 9 (5 modified, 4 created)

## Accomplishments

- Blog engine (`src/lib/blog.ts`) with Vite native glob, gray-matter frontmatter parsing, Zod schema validation, module-level caching, and slug deduplication
- Resources listing page at `/resources` with responsive 1/2/3 card grid, cover images, tag pills, date formatting, and excerpt display
- Tag filtering via `useSearchParams` for URL-based state (`?tag=roofing`) — shareable and indexable
- Client-side pagination (6 posts/page) with numbered page controls; hides when <= POSTS_PER_PAGE
- Feature flag wired in all required locations: App.tsx routes, `getNavLinks()`, `getFooterCompanyLinks()`
- `@tailwindcss/typography` loaded via `@plugin` directive — ready for Plan 02 prose rendering
- Production build passes, TypeScript compiles without errors

## Task Commits

Each task was committed atomically:

1. **Task 1: Install dependencies, create blog engine, wire feature flag + routes + nav** - `0708c6f` (feat)
2. **Task 2: Build ResourcesIndex listing page with card grid, tag filtering, and pagination** - `41c92d5` (feat)

## Files Created/Modified

- `src/lib/blog.ts` — Blog engine: glob import, gray-matter parsing, Zod validation, caching, exports
- `src/pages/ResourcesIndex.tsx` — Resources listing page with card grid, tag filters, pagination (242 lines)
- `src/pages/ResourcesPost.tsx` — Placeholder post page (full implementation in Plan 02)
- `src/content/blog/` — Empty directory for markdown posts (Plan 02 creates demo content)
- `package.json` — Added gray-matter, react-markdown, remark-gfm, @tailwindcss/typography
- `src/index.css` — Added `@plugin "@tailwindcss/typography"` after `@import "tailwindcss"`
- `src/config/features.ts` — `blog: false` → `blog: true`
- `src/config/navigation.ts` — Resources link added to both nav functions
- `src/App.tsx` — Lazy imports + conditional routes for ResourcesIndex and ResourcesPost

## Decisions Made

- **Skip vite-plugin-markdown:** Used native `import.meta.glob({ query: '?raw', eager: true })` + gray-matter instead. The plugin's last release was Jan 2024 with no explicit Vite 7 testing; the native approach is what VitePress itself uses.
- **Module-level cache in blog.ts:** `cachedPosts` variable prevents re-sorting on every `getAllPosts()` call from React components.
- **useSearchParams for tag state:** Creates shareable/indexable tag URLs (`?tag=roofing`) vs. local `useState`. Consistent with GEO/SEO goals.
- **Placeholder ResourcesPost.tsx:** Created minimal placeholder to prevent TypeScript errors from the lazy import in App.tsx. Full implementation in Plan 02.
- **Timezone-safe dates:** Splits `YYYY-MM-DD` string to build month name strings — avoids `new Date()` UTC midnight offset issue documented in RESEARCH.md and consistent with existing calendar implementation.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - all steps proceeded as specified. TypeScript compiled without errors on first attempt.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Blog engine is production-ready and tested (TypeScript clean, build passes)
- `/resources` page renders with correct heading, tag pills area, and empty state
- Plan 02 can immediately begin creating markdown posts in `src/content/blog/`
- Post page (`ResourcesPost.tsx`) needs full implementation in Plan 02
- `@tailwindcss/typography` plugin is loaded and ready for prose container styling

---
*Phase: 04-blog-system*
*Completed: 2026-02-24*
