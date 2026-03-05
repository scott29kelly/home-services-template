---
phase: 14-performance-validation-optimization
plan: 03
subsystem: ui
tags: [fonts, performance, web-vitals, lcp, woff2, self-hosting, css]

# Dependency graph
requires:
  - phase: 14-performance-validation-optimization
    provides: Gap closure plan identifying Google Fonts external origins as LCP bottleneck on mobile
provides:
  - Self-hosted woff2 font files for Inter (400/500/600/700) and Plus Jakarta Sans (600/700/800)
  - "@font-face declarations in index.css eliminating Google Fonts external round-trips"
  - Zero external DNS/TCP requests to fonts.googleapis.com or fonts.gstatic.com
affects: [performance, lcp, mobile-lighthouse, css]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Self-hosted woff2 fonts via @font-face in index.css — Vite bundles them into assets/ with content hashes"
    - "font-display: swap on all @font-face for acceptable FOUT over FOIT"
    - "latin-only unicode-range subset — no cyrillic/greek/vietnamese for English-only content"

key-files:
  created:
    - src/fonts/inter-v18-latin-regular.woff2
    - src/fonts/inter-v18-latin-500.woff2
    - src/fonts/inter-v18-latin-600.woff2
    - src/fonts/inter-v18-latin-700.woff2
    - src/fonts/plus-jakarta-sans-v8-latin-600.woff2
    - src/fonts/plus-jakarta-sans-v8-latin-700.woff2
    - src/fonts/plus-jakarta-sans-v8-latin-800.woff2
  modified:
    - src/index.css
    - src/root.tsx

key-decisions:
  - "Vite deduplicates identical woff2 binaries — Inter weights 400/500/600/700 share same latin subset file, same for Plus Jakarta Sans 600/700/800. This is correct behavior — all weights still declared separately in @font-face."
  - "latin-only unicode-range (U+0000-00FF + common extras) — project serves English content only; excluding cyrillic/greek/vietnamese reduces font payload"
  - "font-display: swap retained — consistent with prior 14-02 decision (minor FOUT acceptable vs FOIT)"
  - "Fonts downloaded from fonts.gstatic.com at build time, served from same origin at runtime — eliminates 2 external DNS/TCP round-trips on every page load"

patterns-established:
  - "Self-hosted font pattern: download woff2 to src/fonts/, declare in index.css with @font-face, Vite handles bundling"

requirements-completed: [PERF-05]

# Metrics
duration: 5min
completed: 2026-03-04
---

# Phase 14 Plan 03: Self-Hosted Fonts Summary

**Self-hosted Inter and Plus Jakarta Sans woff2 files via @font-face in index.css, eliminating Google Fonts external DNS/TCP round-trips that cause 600-1200ms LCP penalty on simulated mobile**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-04T10:01Z
- **Completed:** 2026-03-04T10:05Z
- **Tasks:** 2
- **Files modified:** 9 (7 woff2 + index.css + root.tsx)

## Accomplishments

- Downloaded all 7 latin-subset woff2 files: Inter (400/500/600/700) at 48KB each, Plus Jakarta Sans (600/700/800) at 27KB each
- Added 7 @font-face declarations in index.css with font-display: swap and proper latin unicode-range
- Removed all Google Fonts links from root.tsx: preconnect, async preload, and noscript fallback
- Build verified: 7 @font-face blocks in minified CSS, woff2 files in build/client/assets/, zero googleapis.com in index.html

## Task Commits

Each task was committed atomically:

1. **Task 1: Download self-hosted font files** - `15851e0` (feat)
2. **Task 2: Add @font-face declarations and remove Google Fonts links** - `8f811bb` (feat)

## Files Created/Modified

- `src/fonts/inter-v18-latin-regular.woff2` - Inter 400 latin subset (48KB)
- `src/fonts/inter-v18-latin-500.woff2` - Inter 500 latin subset (48KB)
- `src/fonts/inter-v18-latin-600.woff2` - Inter 600 latin subset (48KB)
- `src/fonts/inter-v18-latin-700.woff2` - Inter 700 latin subset (48KB)
- `src/fonts/plus-jakarta-sans-v8-latin-600.woff2` - Plus Jakarta Sans 600 latin subset (27KB)
- `src/fonts/plus-jakarta-sans-v8-latin-700.woff2` - Plus Jakarta Sans 700 latin subset (27KB)
- `src/fonts/plus-jakarta-sans-v8-latin-800.woff2` - Plus Jakarta Sans 800 latin subset (27KB)
- `src/index.css` - Added 7 @font-face declarations before @theme block
- `src/root.tsx` - Removed Google Fonts preconnect, async preload, noscript fallback; added comment noting fonts served from same origin

## Decisions Made

- **Vite binary deduplication is expected:** Vite's content-hash bundler deduplicates identical binaries — Inter 400/500/600/700 all share the same `inter-v18-latin-500-Dx4kXJAl.woff2` in build output, and Plus Jakarta Sans weights share `plus-jakarta-sans-v8-latin-600-eXO_dkmS.woff2`. All 7 @font-face declarations still exist in CSS correctly — the browser will use them to select the right weight. This is not a bug.
- **latin-only subset:** Only U+0000-00FF range (standard Latin) downloaded — no cyrillic, greek, or vietnamese, reducing payload for this English-only site.
- **font-display: swap:** Carried forward from 14-02 decision — minor FOUT (Flash of Unstyled Text) is acceptable; FOIT (invisible text) is not.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- Bash `!` character in `-e` node commands caused escape issues (shell history expansion). Fixed by writing the download script to a `.mjs` file and running it directly.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Self-hosted fonts are in place — expected 600-1200ms LCP improvement on simulated mobile by eliminating 2 external origin DNS/TCP/TLS handshakes
- Lighthouse mobile re-test needed to verify whether Performance score reaches 90+ target
- Remaining tech debt: JS bundle reduction still needed for full 90+ score if fonts alone are insufficient

## Self-Check: PASSED

All key files verified present on disk:
- src/fonts/ contains all 7 woff2 files (inter-v18-latin-regular, 500, 600, 700; plus-jakarta-sans-v8-latin-600, 700, 800)
- src/index.css has @font-face declarations
- src/root.tsx has no Google Fonts links
- .planning/phases/14-performance-validation-optimization/14-03-SUMMARY.md created

All commits verified in git log:
- 15851e0 (Task 1: font files)
- 8f811bb (Task 2: @font-face + root.tsx cleanup)

---
*Phase: 14-performance-validation-optimization*
*Completed: 2026-03-04*
