---
phase: 14-performance-validation-optimization
verified: 2026-03-04T17:00:00Z
status: gaps_found
score: 8/10 must-haves verified
re_verification:
  previous_status: gaps_remain
  previous_score: 8/10
  gaps_closed:
    - "All gap-closure artifacts fully implemented: self-hosted fonts (14-03), framer-motion removal from shared components (14-04), framer-motion removal from pages/routes + package uninstall (14-05), final Lighthouse re-measurement (14-06)"
    - "Google Fonts links completely absent from src/root.tsx — zero external font origin requests"
    - "7 woff2 font files present in src/fonts/ (Inter 400/500/600/700 + Plus Jakarta Sans 600/700/800), each 27-48KB"
    - "7 @font-face declarations with font-display:swap in src/index.css"
    - "Zero framer-motion imports anywhere in src/ — confirmed by grep returning 0 matches"
    - "framer-motion absent from package.json — confirmed by grep returning no match"
    - "CSS animation infrastructure in src/index.css: .scroll-reveal, .accordion-content, .slide-up-enter, .fade-enter, .hover-lift"
    - "useScrollReveal hook uses native IntersectionObserver (no framer-motion dependency)"
    - "All 11 page components and 3 route modules use scroll-reveal CSS pattern"
    - "Final Lighthouse measurement (Plan 14-06) documents post-optimization scores"
  gaps_remaining:
    - "Mobile Lighthouse Performance 90+ not achieved — measured 70-74 after all optimizations (gap closed from implementation side; target itself unmet)"
    - "Mobile LCP under 4.0s not achieved — measured 5.04-6.36s after all optimizations"
  regressions: []
gaps:
  - truth: "All measured pages achieve Lighthouse Performance 90+ on mobile"
    status: failed
    reason: "Post-optimization mobile scores are 70-74 across all 5 page templates. All Phase 14 planned optimizations have been applied (responsive hero images, self-hosted fonts, framer-motion removal). Remaining bottleneck is React + React Router hydration cost (~316KB JS on 4x-throttled CPU) combined with 84KB WebP hero image download on simulated 3G. No further Phase 14 plans exist."
    artifacts:
      - path: ".planning/phases/14-performance-validation-optimization/14-VERIFICATION.md"
        issue: "Post-optimization Lighthouse results record mobile scores of 70-74, all below 90 target"
    missing:
      - "Critical font preload links: <link rel=preload as=font crossorigin> for 2-3 critical woff2 weights in root.tsx head — estimated 200ms LCP improvement"
      - "Route-level JS code splitting to lazy-load non-critical page chunks — reduces React hydration TBT on throttled mobile"
      - "AVIF hero image format (30-50% smaller than 84KB WebP) — optional but meaningful LCP gain"
      - "Or: explicit product-level decision to accept PERF-05 mobile criterion as permanently waived"
  - truth: "LCP is under 4s on mobile"
    status: failed
    reason: "Post-optimization mobile LCP ranges from 5.04s (homepage) to 6.36s (about) — all exceed the 4.0s target. The hero image download (84KB WebP at simulated ~200KB/s on 3G) takes ~400ms and combined with React hydration latency pushes LCP past 4.0s. Font self-hosting did not reduce LCP meaningfully — hero image, not fonts, is the dominant LCP bottleneck."
    artifacts:
      - path: ".planning/phases/14-performance-validation-optimization/14-VERIFICATION.md"
        issue: "Mobile LCP recorded as 5.04-6.36s vs 4.0s target, all marked FAIL"
    missing:
      - "woff2 preload links for critical Inter and Plus Jakarta Sans weights in root.tsx <head>"
      - "AVIF hero conversion (50KB vs 84KB WebP — ~40ms faster download at 200KB/s)"
      - "Route-level code splitting to reduce initial JS parse blocking LCP paint"
human_verification:
  - test: "Verify self-hosted fonts load correctly in real browser with no external font origin requests"
    expected: "No requests to fonts.googleapis.com or fonts.gstatic.com in Network tab. Fonts render correctly with brief FOUT (swap). woff2 files served from same origin as HTML."
    why_human: "Automated grep confirms zero googleapis.com references in HTML source and src/ files. Visual font rendering and FOUT acceptability require live browser observation."
---

# Phase 14: Performance Validation & Optimization — Verification Report

**Phase Goal:** Measure Lighthouse Performance scores after Phase 13 pre-rendering migration, optimize until 90+ on both desktop and mobile. Address LCP, CLS, and render-blocking resources.
**Verified:** 2026-03-04
**Status:** gaps_found — desktop targets fully met; mobile 90+ not achieved after all planned optimizations exhausted
**Re-verification:** Yes — all 6 plans (14-01 through 14-06) now executed; gap-closure artifacts verified in codebase

---

## Re-Verification Summary

Previous VERIFICATION.md (status: gaps_remain, score 8/10) documented two failing truths. Plans 14-03 through 14-06 were executed as gap-closure plans. All implementation artifacts have been delivered and verified in the codebase. However, the **performance targets themselves remain unmet** — the gap is in Lighthouse scores, not in the implementation of the optimizations.

**What closed:** All planned optimization work is fully implemented and wired.

**What remains open:** Mobile Lighthouse Performance 70-74 (target 90+) and mobile LCP 5.04-6.36s (target < 4.0s). These require architectural changes beyond Phase 14 scope.

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Lighthouse baseline scores recorded for all page template groups (desktop + mobile, 3-run median) | VERIFIED | `14-BASELINE.md` exists with all 5 templates x 2 viewports; each has 3-run median for Perf/LCP/TBT/CLS |
| 2 | Hero images serve appropriately sized variants to mobile (768w) and mid-size (1280w) viewports | VERIFIED | `src/components/sections/Hero.tsx` lines 14-18: `heroSrcSet()` produces `{base}-768w{ext} 768w, {base}-1280w{ext} 1280w, {src} 1920w`; `srcSet` + `sizes="100vw"` on `<img>` at line 37 |
| 3 | Build pipeline generates 768w and 1280w WebP variants for all hero images automatically | VERIFIED | `vite.config.ts` `copyAndOptimizeImages()` plugin generates variants via `sharp().resize(w)` for all hero images; 8 responsive variants confirmed in `build/client/images/` (both -768w and -1280w) |
| 4 | Google Fonts stylesheet is no longer render-blocking | VERIFIED | Fonts are self-hosted: `src/index.css` has 7 `@font-face` declarations; `src/root.tsx` has zero googleapis.com or gstatic.com references; comment on line 26 confirms: "Fonts served from same origin via @font-face in index.css — no Google Fonts external requests" |
| 5 | Hero image preload uses imageSrcSet and imageSizes matching Hero component srcset | VERIFIED | `src/root.tsx` lines 29-36: explicit preload with `imageSrcSet="/images/hero-roofing-768w.webp 768w, /images/hero-roofing-1280w.webp 1280w, /images/hero-roofing.webp 1920w"` and `imageSizes="100vw"` — matches `heroSrcSet()` output |
| 6 | No duplicate hero image preload links causing "preloaded image not used" warnings | PARTIAL | Built `index.html` has 2 image preload links: one auto-generated by React Router SSR from `fetchPriority="high"` img (imageSrcSet only, no href), one from explicit root.tsx preload (href + imageSrcSet). Both share identical imageSrcSet values. Modern browsers deduplicate matching preloads. Documented as known/acceptable in 14-02-SUMMARY.md. |
| 7 | All measured pages achieve Lighthouse Performance 90+ on desktop | VERIFIED | Post-optimization desktop scores: Homepage 95, Roofing 94, About 91, City 94, Blog 93 — all above 90 floor |
| 8 | All measured pages achieve Lighthouse Performance 90+ on mobile | FAILED | Post-optimization mobile scores: Homepage 74, Roofing 73, About 70, City 74, Blog 70 — all below 90 target after all Phase 14 optimizations applied |
| 9 | LCP is under 2.5s on desktop | VERIFIED | Post-optimization desktop LCP: 1.49-1.89s across all pages — all under 2.5s target |
| 10 | LCP is under 4s on mobile | FAILED | Post-optimization mobile LCP: 5.04-6.36s across all pages — all exceed 4.0s target. Hero image download + React hydration latency dominate |

**Score: 8/10 truths verified** (7 VERIFIED, 1 PARTIAL, 2 FAILED)

---

## Required Artifacts

### Plan 01 Artifacts

| Artifact | Exists | Substantive | Wired | Status | Details |
|----------|--------|-------------|-------|--------|---------|
| `.planning/phases/14-performance-validation-optimization/14-BASELINE.md` | YES | YES — 10 median rows (5 pages x 2 viewports) | N/A (documentation) | VERIFIED | Contains Perf/LCP/TBT/CLS medians for all templates |
| `src/components/sections/Hero.tsx` | YES | YES — `heroSrcSet()` fn lines 14-18, `srcSet` + `sizes="100vw"` on img | YES — attributes on LCP image element | VERIFIED | `srcSet={heroSrcSet(backgroundImage)}` at line 37 |
| `vite.config.ts` | YES | YES — `copyAndOptimizeImages()` plugin lines 60-130 for hero variants, `heroWidths = [768, 1280]` | YES — plugin registered in `defineConfig.plugins` | VERIFIED | 8 files each at -768w and -1280w confirmed in `build/client/images/` |

### Plan 02 Artifacts

| Artifact | Exists | Substantive | Wired | Status | Details |
|----------|--------|-------------|-------|--------|---------|
| `src/root.tsx` | YES | YES — imageSrcSet preload (lines 29-36); no Google Fonts links | YES — rendered into all pre-rendered HTML pages | VERIFIED | No render-blocking font link in built HTML; hero preload with imageSrcSet confirmed |

### Plan 03 Artifacts (Gap Closure — Self-hosted Fonts)

| Artifact | Exists | Substantive | Wired | Status | Details |
|----------|--------|-------------|-------|--------|---------|
| `src/fonts/` (7 woff2 files) | YES | YES — Inter 400/500/600/700 (48KB each) + Plus Jakarta Sans 600/700/800 (27KB each); latin-only subset | YES — imported via @font-face url() in index.css; Vite bundles into `build/client/assets/` | VERIFIED | 7 files totalling 275KB; all non-empty; 2 confirmed in `build/client/assets/*.woff2` |
| `src/index.css` | YES | YES — 7 @font-face blocks (lines 4-60), all with `font-display: swap` | YES — Vite bundles woff2 into assets/ with content hashes | VERIFIED | Zero googleapis.com or gstatic.com references remain |
| `src/root.tsx` | YES | YES — zero Google Fonts preconnect/preload/noscript links | YES — comment on line 26 confirms intent | VERIFIED | grep for googleapis returns no matches |

### Plan 04 Artifacts (Gap Closure — CSS Animation Infrastructure)

| Artifact | Exists | Substantive | Wired | Status | Details |
|----------|--------|-------------|-------|--------|---------|
| `src/hooks/useScrollReveal.ts` | YES | YES — uses native `IntersectionObserver` (line 17); `prefers-reduced-motion` check (line 12); returns `{ ref, isInView }` | YES — imported in pages, routes, and shared components | VERIFIED | Zero framer-motion imports; `observer.disconnect()` after first intersection (once: true equivalent) |
| `src/index.css` (CSS utilities) | YES | YES — `.scroll-reveal`, `.accordion-content`, `.slide-up-enter`, `.fade-enter`, `.hover-lift` utility classes (lines 151-239); 21 occurrences of animation class names | YES — applied by components via className | VERIFIED | `prefers-reduced-motion` media query also present (lines 220-239) |

### Plan 05 Artifacts (Gap Closure — Pages + Routes + Package Removal)

| Artifact | Exists | Substantive | Wired | Status | Details |
|----------|--------|-------------|-------|--------|---------|
| `src/pages/*.tsx` (11 pages) | YES | YES — all framer-motion removed; CSS scroll-reveal applied with `useScrollReveal` hook | YES — scroll-reveal class + useScrollReveal hook; confirmed in About.tsx (3 usages), CityPage.tsx (6 usages) | VERIFIED | About, Ava, CityPage, Contact, Financing, ProjectDetail, Projects, ServiceAreas, ServicePage, Services, TestimonialsPage |
| `src/routes/*.tsx` (3 routes) | YES | YES — framer-motion removed; CSS scroll-reveal applied | YES — confirmed in portfolio.$slug.tsx (4 usages), service-areas.$slug.tsx (multiple), service-page.tsx | VERIFIED | service-page.tsx, service-areas.$slug.tsx, portfolio.$slug.tsx |
| `package.json` | YES | YES — framer-motion absent from dependencies | N/A | VERIFIED | grep for "framer-motion" in package.json returns no match; `npm uninstall framer-motion` removed 3 packages |

---

## Key Link Verification

| From | To | Via | Status | Evidence |
|------|----|-----|--------|----------|
| `vite.config.ts` | `build/client/images/*-768w.webp` | `sharp().resize(w)` in `copyAndOptimizeImages`, `heroWidths = [768, 1280]` | WIRED | 8 files each at -768w and -1280w confirmed in `build/client/images/` (about-hero, contact-hero, hero-roofing, projects-hero, service-areas-hero, etc.) |
| `src/components/sections/Hero.tsx` | `build/client/images/*-768w.webp` | `srcSet={heroSrcSet(backgroundImage)}` producing variant URLs | WIRED | Line 37: `srcSet={heroSrcSet(backgroundImage)}` generates `...-768w.webp 768w, ...-1280w.webp 1280w, ...` variants that exist in build output |
| `src/index.css` | `src/fonts/*.woff2` | `@font-face src: url('./fonts/...')` — 7 declarations | WIRED | 7 @font-face blocks in index.css; 2 woff2 files confirmed in `build/client/assets/` with content hashes (Vite-bundled) |
| `src/root.tsx` | `build/client/images/*-768w.webp` | `<link rel="preload" imageSrcSet="...">` | WIRED | Built `index.html` head: `imageSrcSet="/images/hero-roofing-768w.webp 768w, /images/hero-roofing-1280w.webp 1280w, /images/hero-roofing.webp 1920w"` and `imageSizes="100vw"` confirmed |
| `src/hooks/useScrollReveal.ts` | `IntersectionObserver` (browser API) | `new IntersectionObserver([...], { rootMargin })` | WIRED | Line 17 of useScrollReveal.ts: `const observer = new IntersectionObserver(...)` — no framer-motion dependency |
| `src/pages/*.tsx` + `src/routes/*.tsx` | `src/index.css` (.scroll-reveal) | `className={\`scroll-reveal ${isInView ? 'in-view' : ''}\`}` | WIRED | Confirmed: About.tsx 3 usages, CityPage.tsx 6 usages, portfolio.$slug.tsx 4 usages, service-areas.$slug.tsx multiple usages — all connected to CSS class |

---

## Requirements Coverage

| Requirement | Plans | Description | Status | Evidence |
|-------------|-------|-------------|--------|----------|
| PERF-05 | 14-01 through 14-06 | Lighthouse Performance 90+ on both desktop AND mobile; LCP < 2.5s desktop / < 4s mobile; CLS < 0.1; no render-blocking resources; above-fold content in initial HTML | PARTIAL | Desktop PASS (91-95, LCP 1.49-1.89s, CLS 0.000, no blocking resources, pre-rendered HTML). Mobile FAIL (70-74 vs 90+ target, LCP 5.04-6.36s vs 4.0s target). All Phase 14 planned optimizations applied — gap not closeable without architectural changes outside Phase 14 scope. |

**Orphaned requirements from v1.1-REQUIREMENTS.md mapped to phase 14:** None — only PERF-05 is claimed by phase 14 plans.

**ROADMAP inconsistency (documentation only):** Plans 14-03 through 14-06 are marked `[ ]` (incomplete) in `.planning/ROADMAP.md` but are fully implemented in the codebase. Commits `8f811bb`, `15851e0`, `d0790bf`, `6c4e08e`, `e18c451`, `9dbd42f`, `1a7b395` confirm implementation. ROADMAP checkbox status does not reflect execution reality — this is a documentation-only gap with no functional impact.

---

## Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `build/client/index.html` | head | Two `rel="preload" as="image"` links for the hero: one auto-generated by React Router SSR from `fetchPriority="high"` img (imageSrcSet only, no href), one from explicit root.tsx preload (href + imageSrcSet). Both share identical imageSrcSet values. | INFO — not a blocker | Browsers deduplicate matching preloads. Documented in 14-02-SUMMARY.md as known behavior. No "preloaded image not used" warning expected. |
| `.planning/ROADMAP.md` | lines 78-81 | Plans 14-03 through 14-06 show as `[ ]` incomplete despite being fully executed and committed | WARNING — documentation inconsistency | No functional impact on code. ROADMAP does not reflect actual plan execution state. Should be updated to `[x]` for completeness, but does not block phase closure. |

No TODO/FIXME/PLACEHOLDER comments found in any modified source files.

---

## Human Verification Required

### 1. Self-Hosted Fonts in Live Browser

**Test:** Open the homepage in Chrome with DevTools Network tab open (disable cache). Load the page and inspect all network requests, filtering by font type.
**Expected:** No requests to fonts.googleapis.com or fonts.gstatic.com. Fonts load from the same origin (e.g., `/_assets/inter-v18-latin-500-Dx4kXJAl.woff2`). Brief FOUT from display=swap is acceptable.
**Why human:** Automated checks confirm zero googleapis.com references in HTML source and src/ files. Whether woff2 files serve correctly at runtime and FOUT is visually acceptable requires live browser observation.

---

## Lighthouse Results Reference

### Post-optimization measurements (3-run median, self-hosted fonts + no framer-motion)

| Page | Desktop Perf | Desktop LCP | Mobile Perf | Mobile LCP | CLS | Desktop Status | Mobile Status |
|------|-------------|-------------|------------|------------|-----|----------------|---------------|
| Homepage | 95 | 1.49s | 74 | 5.04s | 0.000 | PASS | FAIL |
| Service (Roofing) | 94 | 1.58s | 73 | 5.27s | 0.000 | PASS | FAIL |
| About | 91 | 1.89s | 70 | 6.36s | 0.000 | PASS | FAIL |
| City Page | 94 | 1.53s | 74 | 5.15s | 0.000 | PASS | FAIL |
| Blog Post | 93 | 1.60s | 70 | 5.88s | 0.000 | PASS | FAIL |

### Raw 3-run data (for traceability)

**Desktop runs:**

| Page | Run 1 | Run 2 | Run 3 | Median Perf | Median LCP |
|------|-------|-------|-------|-------------|------------|
| Homepage | 94 / 1.54s | 95 / 1.49s | 95 / 1.49s | 95 | 1.49s |
| Roofing | 93 / 1.62s | 94 / 1.58s | 94 / 1.57s | 94 | 1.58s |
| About | 90 / 1.93s | 91 / 1.89s | 91 / 1.89s | 91 | 1.89s |
| City | 94 / 1.53s | 94 / 1.53s | 94 / 1.57s | 94 | 1.53s |
| Blog | 93 / 1.60s | 91 / 1.72s | 93 / 1.59s | 93 | 1.60s |

**Mobile runs:**

| Page | Run 1 | Run 2 | Run 3 | Median Perf | Median LCP |
|------|-------|-------|-------|-------------|------------|
| Homepage | 74 / 5.04s | 74 / 5.06s | 74 / 5.00s | 74 | 5.04s |
| Roofing | 73 / 5.27s | 80 / 3.88s | 73 / 5.29s | 73 | 5.27s |
| About | 70 / 6.36s | 69 / 6.33s | 70 / 6.38s | 70 | 6.36s |
| City | 81 / 3.72s | 74 / 5.17s | 74 / 5.15s | 74 | 5.15s |
| Blog | 70 / 5.88s | 70 / 5.90s | 70 / 5.86s | 70 | 5.88s |

### Improvement comparison (Plans 01/02 baseline vs post-optimization)

| Page | Desktop (before vs after) | Mobile (before vs after) | Mobile LCP (before vs after) |
|------|--------------------------|--------------------------|------------------------------|
| Homepage | 93 vs 95 (+2) | 70 vs 74 (+4) | 4.97s vs 5.04s (+0.07s) |
| Service (Roofing) | 94 vs 94 (0) | 74 vs 73 (-1) | 5.13s vs 5.27s (+0.14s) |
| About | 91 vs 91 (0) | 68 vs 70 (+2) | 6.72s vs 6.36s (-0.36s) |
| City Page | 95 vs 94 (-1) | 74 vs 74 (0) | 5.01s vs 5.15s (+0.14s) |
| Blog Post | 94 vs 93 (-1) | 71 vs 70 (-1) | 5.70s vs 5.88s (+0.18s) |

**Analysis:** Desktop scores are stable (all 90+). Mobile Performance improved by 0-4 points with font self-hosting and framer-motion removal, but LCP did not improve meaningfully (some pages regressed slightly within measurement variability). The font self-hosting eliminated the external DNS/TCP overhead for font CSS/files, but the hero image still dominates LCP on throttled 3G. The framer-motion removal reduced TBT but not enough to move Performance scores past 90.

---

## PERF-05 Requirement Checklist

- [x] Lighthouse Performance 90+ desktop: **PASS** (91-95 across all pages)
- [ ] Lighthouse Performance 90+ mobile: **FAIL** (70-74 across all pages, target 90+)
- [x] LCP < 2.5s desktop: **PASS** (1.49-1.89s)
- [ ] LCP < 4.0s mobile: **FAIL** (5.04-6.36s, target < 4.0s)
- [x] CLS < 0.1: **PASS** (0.000 on all pages)
- [x] No render-blocking resources: **PASS** (fonts self-hosted via @font-face; zero external font links in HTML)
- [x] Above-the-fold content in initial HTML: **PASS** (pre-rendered in Phase 13)

**PERF-05 overall: PARTIAL** — 5/7 criteria met. Desktop fully satisfied. Mobile Performance and LCP remain below target after all planned optimizations exhausted.

---

## Gaps Summary

Two truths remain failed after all 6 Phase 14 plans are fully executed. Both stem from the same architectural root cause.

**All Phase 14 optimizations applied:**
1. Responsive hero images (768w WebP, 84KB vs 390KB original, 78% reduction) — Plan 14-01
2. Hero preload with responsive imageSrcSet — Plan 14-02
3. Self-hosted woff2 fonts eliminating 2 external DNS/TCP/TLS round-trips — Plan 14-03
4. framer-motion removal in shared components (CSS IntersectionObserver replaces JS animation) — Plan 14-04
5. framer-motion removal in all 11 page + 3 route files; package uninstalled (~67KB JS reduction) — Plan 14-05
6. Final Lighthouse re-measurement confirming post-optimization state — Plan 14-06

**Combined mobile impact:** +0 to +4 points Performance. LCP essentially unchanged (within measurement variability). Desktop remains fully satisfied at 91-95.

**Remaining structural bottlenecks:**
1. Hero image download — 84KB WebP at simulated ~200KB/s = ~420ms download; AVIF could reduce to ~50KB
2. React + React Router hydration — ~316KB JS (entry.client 190KB + React Router 126KB) parsed on 4x-throttled CPU; dominates TBT and blocks LCP paint
3. woff2 fonts not preloaded — self-hosted fonts declared via CSS @font-face only; browser discovers them after CSS parses (no `<link rel=preload as=font>` in head)

**To reach mobile 90+ would require (outside Phase 14 scope):**
- `<link rel=preload as=font crossorigin>` for 2-3 critical woff2 weights in root.tsx (easy win, ~200ms LCP estimated)
- Route-level JS code splitting to lazy-load non-critical page chunks (significant TBT reduction)
- AVIF hero image conversion (optional but meaningful LCP reduction)
- Or: explicit product decision to accept PERF-05 mobile criterion as permanently waived

**Assessment:** PERF-05 as written in v1.1-REQUIREMENTS.md requires both desktop AND mobile >= 90. Desktop is fully satisfied. Mobile fails across all pages with all planned optimizations applied. This is a documented, measured, acknowledged gap. Further closure requires architectural changes not in Phase 14 scope, or a product-level decision to waive the mobile criterion.

---

_Verified: 2026-03-04_
_Verifier: Claude (gsd-verifier)_
_Measurement method: Lighthouse CLI, 3-run median, headless Chrome, local vite preview server_
_Re-verification: Yes — initial verification at 15:25:28Z; gap-closure plans 14-03 through 14-06 executed and verified_
