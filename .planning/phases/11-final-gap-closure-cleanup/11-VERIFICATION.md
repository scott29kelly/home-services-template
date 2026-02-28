---
phase: 11-final-gap-closure-cleanup
verified: 2026-02-27T00:00:00Z
status: passed
score: 5/5 must-haves verified
re_verification: false
gaps: []
human_verification:
  - test: "Visit /nonexistent-page in browser and verify phone CTA is visible"
    expected: "A blue rounded button labeled 'Call 555-123-4567' (or actual config phone) appears between the 'Page Not Found' paragraph and the Go Home/Go Back buttons"
    why_human: "Visual placement and button styling cannot be verified without browser rendering"
  - test: "Set features.assistant = false in src/config/features.ts, start dev server, visit any page"
    expected: "The AvaWidget floating chat button is completely absent from the page DOM — not hidden with CSS, fully absent from the rendered markup"
    why_human: "DOM removal vs CSS hiding requires browser DevTools inspection to distinguish"
  - test: "Run a production build (npx vite build) and inspect dist/sitemap.xml"
    expected: "Sitemap contains /roofing, /siding, /storm-damage entries (or current services.ts slugs) and uses https://example.com (or actual company.url) as hostname — NOT 'https://example.com' if company.url differs"
    why_human: "Build output requires running the build step; sitemap content is only verifiable post-build"
---

# Phase 11: Final Gap Closure & Cleanup Verification Report

**Phase Goal:** Close the 3 remaining partial requirement gaps (CFG-05, CFG-06, SEO-04), fix 2 broken E2E flows, and remove dead code exports identified by the v1.0 milestone audit.
**Verified:** 2026-02-27
**Status:** passed
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | 404 page shows a clickable phone number from config that lets visitors call the business | VERIFIED | `NotFound.tsx` line 24: `href={`tel:${company.phone}`}`, line 28: `Call {company.phone}` — live value from config |
| 2 | Setting `features.assistant = false` completely removes AvaWidget from all pages (DOM removal, not CSS hiding) | VERIFIED | `Layout.tsx` line 13: `const showAvaWidget = pathname !== '/ava' && features.assistant` — short-circuit means `<AvaWidget />` is never rendered when false |
| 3 | Adding a new service to services.ts automatically includes its route in the generated sitemap | VERIFIED | `vite.config.ts` lines 168–179: dynamic `readFileSync` + regex slug extraction from `services.ts` with fallback; feeds into `getRouteList()` return |
| 4 | Sitemap hostname matches the `company.url` value in `company.ts` without manual `vite.config.ts` edits | VERIFIED | `vite.config.ts` lines 250–258: reads `company.ts`, strips block comments, extracts `url: 'https?://...'` using anchored regex `/(https?:\/\/[^']+)/`; confirmed regex correctly handles `https://` without corruption |
| 5 | No dead exports exist in `seo.ts` or `route-generator.ts` | VERIFIED | `grep -n "buildAggregateRatingSchema\|getCityRoutes\|CityRoute"` on both files returns zero matches; `grep -rn` across all of `src/` returns zero matches |

**Score:** 5/5 truths verified

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/pages/NotFound.tsx` | Phone CTA with tel: link from company config | VERIFIED | 52 lines; imports `{ Phone }` from lucide-react and `{ company }` from `'../config/company'`; renders `<a href={`tel:${company.phone}`}>Call {company.phone}</a>` between description and nav buttons |
| `src/components/layout/Layout.tsx` | AvaWidget gated by `features.assistant` flag | VERIFIED | 35 lines; imports `{ features }` from `'../../config'` (barrel); `showAvaWidget = pathname !== '/ava' && features.assistant`; `{showAvaWidget && <AvaWidget />}` on line 32 |
| `vite.config.ts` | Dynamic service routes and hostname from config source files | VERIFIED | `getRouteList()` at lines 167–179 derives `serviceRoutes` via `readFileSync('src/config/services.ts')` + slug regex; `generateSitemap()` at lines 250–258 derives `hostname` via `readFileSync('src/config/company.ts')` + url regex |
| `src/lib/seo.ts` | SEO schema builders without dead `buildAggregateRatingSchema` export | VERIFIED | 218 lines; `buildAggregateRatingSchema` function absent; `testimonials` import (line 11) still used by `buildLocalBusinessSchema` (line 50); no orphaned imports |
| `src/lib/route-generator.ts` | Service route generator without dead `getCityRoutes` export | VERIFIED | 20 lines total; contains only: `services` import, `ServiceRoute` interface, `getServiceRoutes()` function; `cityPages` and `features` imports fully removed; JSDoc updated to reflect services-only scope |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `src/pages/NotFound.tsx` | `src/config/company.ts` | `import { company } from '../config/company'` + `company.phone` | WIRED | Line 4 imports; lines 24 and 28 use `company.phone` in both `href` and display text |
| `src/components/layout/Layout.tsx` | `src/config/features.ts` | `import { features } from '../../config'` + `features.assistant` | WIRED | Line 8 imports via barrel; line 13 consumes `features.assistant` in `showAvaWidget` boolean; line 32 conditionally renders `<AvaWidget />` |
| `vite.config.ts` | `src/config/services.ts` | `readFileSync + regex slug extraction` | WIRED | Lines 170–175: reads file, strips comments, applies `/slug:\s*'([^']+)'/g` matchAll, maps to `/${m[1]}`; result included in `getRouteList()` return on line 228 |
| `vite.config.ts` | `src/config/company.ts` | `readFileSync + regex url extraction` | WIRED | Lines 252–255: reads file, strips block comments only, applies `/url:\s*'(https?:\/\/[^']+)'/` match; result used as `hostname` in sitemap URL construction on line 267 and robots.txt on line 278 |

**Note on hostname regex deviation from plan:** The PLAN specified using both block and line comment stripping before a `url:\s*'([^']+)'` match. The SUMMARY documents that line-comment stripping (`/\/.*/g`) corrupts `https://` strings because `//` in `https://example.com` is treated as a comment marker. The ACTUAL implementation uses block-comment-only stripping with an anchored regex `/(https?:\/\/[^']+)/` that specifically matches absolute URLs. This is a correctness fix, not a deviation from intent. The extracted hostname matches the actual `company.ts` value correctly.

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| CFG-05 | 11-01-PLAN.md | 404 page includes phone CTA — tel: link button showing company.phone from config | SATISFIED | `NotFound.tsx` renders button-style `<a href="tel:...">` using `company.phone`; positioned between description and nav buttons; Phone icon from lucide-react; reassuring copy present |
| CFG-06 | 11-01-PLAN.md | Disabling `features.assistant` removes AvaWidget from DOM (not CSS hide) | SATISFIED | `Layout.tsx` `showAvaWidget` evaluates `features.assistant` via `&&` — when false, `{showAvaWidget && <AvaWidget />}` causes React to skip rendering entirely; confirmed by `features.assistant = true` default in `features.ts` |
| SEO-04 | 11-01-PLAN.md | Service routes derived from services.ts config; hostname derived from company.ts url | SATISFIED | Both dynamic extractions implemented in `vite.config.ts` with `readFileSync` + regex + fallback pattern; follows established city-route extraction pattern |

**REQUIREMENTS.md cross-reference:** No additional requirement IDs are mapped to Phase 11 in REQUIREMENTS.md beyond CFG-05, CFG-06, and SEO-04. All three are marked `[COMPLETE]` with completion date `11-01 (2026-02-28)`. No orphaned requirements.

**E2E Flow re-audit:** The phase goal cited "fix 2 broken E2E flows" — these were Flow 1 (new service → sitemap, broken because service routes were hardcoded) and Flow 4 (feature flag off → consistent removal, broken because AvaWidget ignored `features.assistant`). Both underlying wiring defects are corrected by this phase's implementations.

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `src/lib/seo.ts` | 63 | Comment text contains word "placeholder" (`// Filter out placeholder '#' social links`) | Info | This is a code comment describing data values, not a TODO or unimplemented feature — not a stub anti-pattern |

No other anti-patterns found across all 5 modified files. No `TODO`, `FIXME`, `XXX`, `HACK` comments. No empty `return null`, `return {}`, `return []` stubs. No console-log-only handlers.

---

### TypeScript Compilation

`npx tsc --noEmit` completed with no output (exit code 0) — zero type errors across all modified files.

---

### Commit Verification

All 3 task commits cited in SUMMARY are present in git history:

| Commit | Message | Status |
|--------|---------|--------|
| `3fa773c` | feat(11-01): add phone CTA to 404 page and gate AvaWidget on feature flag | VERIFIED in `git log` |
| `237e287` | feat(11-01): derive sitemap service routes and hostname from config | VERIFIED in `git log` |
| `f199955` | refactor(11-01): remove dead exports from seo.ts and route-generator.ts | VERIFIED in `git log` |

---

### Human Verification Required

#### 1. Phone CTA Visual Placement

**Test:** Start the dev server and navigate to `/nonexistent-page`
**Expected:** A blue rounded button labeled "Call [phone number]" appears between the description paragraph ("The page you're looking for doesn't exist...") and the Go Home / Go Back buttons, with "Need help? We're one call away." text above it
**Why human:** Visual layout and button styling requires browser rendering to confirm correct placement and appearance

#### 2. AvaWidget DOM Removal Confirmation

**Test:** Set `features.assistant = false` in `src/config/features.ts`, run the dev server, visit the homepage and a service page. Open browser DevTools and inspect the DOM.
**Expected:** No `AvaWidget` element or its containing markup exists in the DOM — the chat button is fully absent, not hidden with `display:none` or `visibility:hidden`
**Why human:** Distinguishing DOM removal from CSS hiding requires DevTools inspection of the rendered HTML structure

#### 3. Sitemap Content Validation

**Test:** Run `npx vite build` and inspect `dist/sitemap.xml`
**Expected:** File contains `<loc>` entries for `/roofing`, `/siding`, `/storm-damage` (matching services.ts slugs), and all URLs use the hostname from `company.ts` (`url` field value, not literally `'https://example.com'` unless that IS the configured value)
**Why human:** Build output requires executing the build step; sitemap is only generated at build time

---

### Gaps Summary

No gaps. All 5 must-have truths verified. All 5 artifacts exist, are substantive (non-stub), and are correctly wired. All 3 requirement IDs (CFG-05, CFG-06, SEO-04) have satisfying implementations confirmed in the codebase. TypeScript compilation passes. Dead exports are confirmed absent from both files and from all import sites across `src/`.

The only open items are the 3 human verification tests above, which confirm visual rendering and build output behavior that cannot be checked by static analysis. The automated evidence is conclusive that the implementations are correct.

---

_Verified: 2026-02-27_
_Verifier: Claude (gsd-verifier)_
