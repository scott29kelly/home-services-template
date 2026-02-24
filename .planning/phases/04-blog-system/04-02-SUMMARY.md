---
phase: 04-blog-system
plan: 02
subsystem: ui
tags: [react, markdown, gray-matter, react-markdown, remark-gfm, seo, json-ld, blog]

# Dependency graph
requires:
  - phase: 04-01
    provides: Blog engine (blog.ts with getAllPosts/getPostBySlug), ResourcesIndex listing page, App.tsx routing at /resources/:slug

provides:
  - Individual post renderer at /resources/:slug with markdown typography (ResourcesPost.tsx)
  - BlogPosting JSON-LD structured data per post
  - Post footer with CTA and related posts
  - 12 demo blog posts covering roofing, siding, storm damage, insurance, seasonal maintenance, energy efficiency
  - 24 cover images (jpg + webp pairs) in images/blog/
  - Complete Resources section (listing + post pages, pagination, tag filtering) fully functional

affects: [05-seo-content, 06-integration-polish]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "ReactMarkdown with remarkGfm for markdown rendering with prose typography classes"
    - "BlogPosting JSON-LD schema injected via dangerouslySetInnerHTML with XSS sanitization"
    - "Related posts via tag-intersection logic (match tags, fill with latest if < 3)"
    - "GEO-optimized blog post structure: direct answer in first 40-60 words, FAQ section at end"
    - "Placeholder cover images from project assets, swappable via frontmatter coverImage path"

key-files:
  created:
    - src/pages/ResourcesPost.tsx
    - src/content/blog/does-insurance-cover-storm-damage.md
    - src/content/blog/what-to-do-after-storm-damage.md
    - src/content/blog/document-roof-damage-insurance-claim.md
    - src/content/blog/signs-roof-needs-replacement.md
    - src/content/blog/how-long-does-roof-replacement-take.md
    - src/content/blog/best-roofing-materials-harsh-winters.md
    - src/content/blog/best-siding-winter-weather.md
    - src/content/blog/identify-siding-damage-early.md
    - src/content/blog/spring-home-inspection-checklist.md
    - src/content/blog/prepare-home-for-storm-season.md
    - src/content/blog/what-to-expect-roof-inspection.md
    - src/content/blog/energy-efficient-home-upgrades.md
    - images/blog/ (24 files: 12 jpg + 12 webp cover images)
  modified:
    - vite.config.ts

key-decisions:
  - "Blog post cover images sourced from existing project assets (storm-damage-hero, hero-roofing, siding-hero, etc.) — user can swap via frontmatter coverImage path"
  - "vite.config.ts copyAndOptimizeImages plugin updated to recurse subdirectories — required for images/blog/ to appear in dist/"

patterns-established:
  - "GEO post structure: direct answer in opening paragraph, ## headers for extractable answers, ## FAQ at end"
  - "Blog images stored in images/blog/ subdirectory, referenced as /images/blog/name.webp in frontmatter"

requirements-completed: [SEO-01]

# Metrics
duration: 45min
completed: 2026-02-24
---

# Phase 4 Plan 02: Blog Post Renderer and Demo Content Summary

**ReactMarkdown post renderer with BlogPosting JSON-LD, CTA footer, related posts, and 12 GEO-optimized demo blog posts across roofing, siding, storm damage, and seasonal maintenance topics**

## Performance

- **Duration:** ~45 min (continuation agent; Task 1 committed by prior agent)
- **Started:** 2026-02-24T09:30:00Z
- **Completed:** 2026-02-24T10:15:00Z
- **Tasks:** 2 (Task 1 by prior agent, Task 2 by this agent)
- **Files modified:** 38

## Accomplishments

- Individual post renderer (ResourcesPost.tsx) with markdown typography, hero image, byline, tag pills, BlogPosting JSON-LD schema, CTA section, and related posts footer
- 12 demo blog posts created, each 600-1000 words with FAQ sections optimized for featured snippets and AI model extraction (GEO)
- 24 cover images (jpg + webp) placed in images/blog/ using relevant existing project assets
- Production build succeeds with all markdown content and blog images bundled correctly
- Fixed a latent bug in vite.config.ts where images in subdirectories (images/blog/) were not copied to dist/

## Task Commits

Each task was committed atomically:

1. **Task 1: Build ResourcesPost page** - `1de9bb3` (feat) — Prior agent
2. **Task 2: Create 12 demo blog posts and cover images** - `a91477d` (feat)

## Files Created/Modified

- `src/pages/ResourcesPost.tsx` — Individual post renderer with markdown, JSON-LD, CTA, related posts
- `src/content/blog/does-insurance-cover-storm-damage.md` — Insurance coverage for storm damage
- `src/content/blog/what-to-do-after-storm-damage.md` — Post-storm action checklist
- `src/content/blog/document-roof-damage-insurance-claim.md` — Insurance claim documentation
- `src/content/blog/signs-roof-needs-replacement.md` — 7 roof replacement warning signs
- `src/content/blog/how-long-does-roof-replacement-take.md` — Roof replacement timeline
- `src/content/blog/best-roofing-materials-harsh-winters.md` — Cold-climate roofing material comparison
- `src/content/blog/best-siding-winter-weather.md` — Winter siding material guide
- `src/content/blog/identify-siding-damage-early.md` — Siding damage early detection
- `src/content/blog/spring-home-inspection-checklist.md` — Spring exterior inspection checklist
- `src/content/blog/prepare-home-for-storm-season.md` — Pre-storm preparation guide
- `src/content/blog/what-to-expect-roof-inspection.md` — Roof inspection process guide
- `src/content/blog/energy-efficient-home-upgrades.md` — Energy efficiency exterior upgrades
- `images/blog/` — 24 cover images (12 jpg + 12 webp) copied from existing project assets
- `vite.config.ts` — Fixed copyAndOptimizeImages plugin to recurse subdirectories

## Decisions Made

- Cover images sourced from existing project assets rather than downloading from external APIs. Each image is semantically matched to its post topic (storm-damage-hero for storm posts, siding-hero for siding posts, etc.). User can swap images by updating the coverImage frontmatter path.
- vite.config.ts plugin updated to use recursive directory traversal so images/blog/ subdirectory is processed and copied to dist/images/blog/ during production builds.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed copyAndOptimizeImages Vite plugin to handle image subdirectories**
- **Found during:** Task 2 (cover image verification after production build)
- **Issue:** The custom `copyAndOptimizeImages` plugin in vite.config.ts used `fs.readdir(srcDir)` (non-recursive), so images placed in `images/blog/` were not copied to `dist/images/blog/` during production builds. Blog cover images would 404 in production.
- **Fix:** Replaced `readdir` + flat filter with a recursive `collectImageFiles()` helper that traverses subdirectories. Each image's relative path is preserved in the destination (e.g., `blog/storm-damage-roof.webp` → `dist/images/blog/storm-damage-roof.webp`). Added `fs.mkdir(path.dirname(destPath), { recursive: true })` before writing each file.
- **Files modified:** vite.config.ts
- **Verification:** Re-ran `npm run build`; `dist/images/blog/` contains all 24 expected images.
- **Committed in:** a91477d (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - bug in build plugin)
**Impact on plan:** Fix was required for blog images to appear in production. Without it, all 12 posts would have broken cover images in the deployed site. No scope creep.

## Issues Encountered

None beyond the Vite plugin subdirectory bug documented above.

## User Setup Required

None — no external service configuration required. Cover images are sourced from existing project assets. To replace placeholder images, update the `coverImage` path in each post's frontmatter to point to the desired image URL.

## Next Phase Readiness

- Complete Resources section is functional: listing page with pagination and tag filtering, individual post pages with full typography and SEO markup
- All 12 demo posts provide realistic content for Phase 5 (SEO & Content) to build upon
- BlogPosting JSON-LD schema in place for search engine structured data
- Blog images are subdirectory-aware in the build pipeline for any future asset additions
- Phase 5 can add sitemap generation, meta robot tags, and additional SEO enhancements without touching the blog rendering layer

## Self-Check: PASSED

- FOUND: src/pages/ResourcesPost.tsx
- FOUND: src/content/blog/ (12 markdown files)
- FOUND: images/blog/ (24 image files: 12 jpg + 12 webp)
- FOUND: dist/images/blog/ (24 optimized images after build)
- FOUND: .planning/phases/04-blog-system/04-02-SUMMARY.md
- COMMIT FOUND: 1de9bb3 (Task 1 - ResourcesPost.tsx)
- COMMIT FOUND: a91477d (Task 2 - 12 posts + images)
- COMMIT FOUND: 4a530ac (docs - SUMMARY.md + STATE.md + ROADMAP.md)
- BUILD: npm run build succeeds with 0 TypeScript errors

---
*Phase: 04-blog-system*
*Completed: 2026-02-24*
