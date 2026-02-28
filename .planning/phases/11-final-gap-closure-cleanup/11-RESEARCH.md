# Phase 11: Final Gap Closure & Cleanup — Research

**Researched:** 2026-02-27
**Domain:** React component wiring, Vite build plugin configuration, dead code removal
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### 404 Page Phone CTA (CFG-05)
- Add a prominent, tappable `tel:` link using `company.phone` from config
- Follow 2026 home services best practice: 404 pages should retain the visitor as a potential lead, not just redirect them away
- Phone CTA should be visually prominent — a button-style link, not just inline text
- Place phone CTA between the "page not found" message and the navigation buttons (Go Home / Go Back)
- Include brief reassuring copy like "Need help? Call us" to frame the CTA as helpful, not salesy

#### Feature Flag Gating (CFG-06)
- Gate AvaWidget behind `features.assistant` flag — complete DOM removal when disabled, not just CSS hiding
- Follow the existing pattern: `Layout.tsx` already conditionally renders based on pathname; add feature flag as an additional condition
- No fallback or placeholder when assistant is disabled — clean removal
- Keep the existing pathname check (`pathname !== '/ava'`) alongside the feature flag check

#### Sitemap Route Derivation (SEO-04)
- Replace hardcoded `['/roofing', '/siding', '/storm-damage']` with dynamic derivation from `services.ts` config
- Map `services` array slugs to routes: `services.map(s => '/' + s.slug)`
- Sync sitemap hostname from `company.url` in config instead of hardcoded `'https://example.com'`
- Follow the existing pattern established by city routes (parsed from config source) — but cleaner since `services.ts` exports are directly importable at build time

#### Dead Code Removal
- Remove `buildAggregateRatingSchema()` export from `seo.ts` — confirmed unused
- Remove `getCityRoutes()` export from `route-generator.ts` — confirmed unused
- Clean removal only: delete the functions and their imports, do not sweep for additional unused code beyond what the audit identified

### Claude's Discretion
- Exact copy/wording for the 404 phone CTA (guided by home services conversion best practices)
- Any minor styling adjustments needed to integrate the phone CTA with existing 404 page design
- Import strategy for reading services config in the Vite sitemap plugin (build-time file read vs direct import)
- Whether to also clean up any orphaned type imports left behind by dead code removal

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| CFG-05 | 404 page includes phone CTA (tel: link from config) | NotFound.tsx anatomy confirmed; `company.phone` available from `../../config/company`; Phone icon from lucide-react; button-style pattern from existing nav buttons in the same file |
| CFG-06 | Disabling features.assistant removes AvaWidget from DOM | Layout.tsx confirmed; `features` import from `../config` barrel; single-line change to `showAvaWidget` logic |
| SEO-04 | Sitemap service routes derived from services.ts; hostname from company.ts | vite.config.ts Node context confirmed; existing regex slug pattern for cities maps directly; company.ts `url` field regex extractable with same approach |
</phase_requirements>

---

## Summary

Phase 11 is a pure cleanup phase with zero new features. All five changes are surgical, self-contained, and affect existing files only. The codebase is well-understood from 10 prior phases; this research is primarily about confirming exact file locations, import paths, and the safest implementation approach for each fix.

The three requirement gaps (CFG-05, CFG-06, SEO-04) were audit-identified as "5-minute", "2-minute", and "15-minute" fixes respectively. The dead code removals (two functions) are straightforward deletions with confirmed zero call sites. The entire phase should fit in a single plan wave with five discrete tasks.

**Primary recommendation:** Implement all five changes as atomic tasks in wave order — CFG-05 first (purely additive), CFG-06 second (single boolean gate), SEO-04 third (vite.config.ts surgery), then both dead code removals last (pure deletions). No new dependencies required.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| lucide-react | Already installed | Phone icon for 404 CTA | Already used in NotFound.tsx (`Home`, `ArrowLeft`) and throughout project |
| react-router-dom | Already installed | `Link` component already in NotFound.tsx | No change needed |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Node.js `fs.readFileSync` | Built-in (vite.config.ts context) | Read services.ts and company.ts source at build time | Same approach already used for features.ts and service-areas.ts |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Regex extraction of `slug` from services.ts source text | Direct ESM import of `services` array | ESM import impossible in Vite Node plugin context — the codebase's existing comment (line 224) and `readFeatureFlags()` confirm this constraint. Regex is the established pattern. |
| Regex extraction of `url` from company.ts | Same as above | Same Node context constraint applies |

**Installation:**
```bash
# No new packages required — all changes use existing dependencies
```

---

## Architecture Patterns

### Recommended Project Structure
No structural changes. All edits are to existing files:
```
src/
├── pages/NotFound.tsx          # Add phone CTA (CFG-05)
├── components/layout/Layout.tsx # Gate AvaWidget on features.assistant (CFG-06)
└── lib/
    ├── seo.ts                  # Remove buildAggregateRatingSchema()
    └── route-generator.ts      # Remove getCityRoutes()
vite.config.ts                  # Derive service routes + hostname from config (SEO-04)
```

### Pattern 1: CFG-05 — Phone CTA Insertion

**What:** Add a button-style `<a href="tel:...">` element inside NotFound.tsx, between the description paragraph and the nav button row.

**Current structure of NotFound.tsx:**
```tsx
// Line 16: description text ("The page you're looking for...")
// Line 19: flex row with Go Home + Go Back buttons
```

**After change — add between description and button row:**
```tsx
// Source: direct inspection of NotFound.tsx + company.ts config
import { company } from '../config/company'
import { Phone } from 'lucide-react'

// Insert between <p className="text-text-secondary mb-8"> and <div className="flex flex-col ...">
<div className="mb-6">
  <p className="text-sm text-text-secondary mb-3">Need help? We're one call away.</p>
  <a
    href={`tel:${company.phone}`}
    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-blue text-white font-semibold rounded-full shadow-lg shadow-brand-blue/25 hover:shadow-brand-blue/40 hover:scale-105 transition-all duration-300"
  >
    <Phone className="w-4 h-4" />
    Call {company.phone}
  </a>
</div>
```

**Why button-style:** Matches the existing Go Home button design language. Uses `brand-blue` (not `safety-orange`) to visually distinguish from the primary "Go Home" CTA while still being prominent.

**Note on `mb-8` reduction:** The description paragraph currently has `mb-8`. With the phone CTA block added below it, the `mb-8` should reduce to `mb-4` to avoid excessive spacing before the phone block.

### Pattern 2: CFG-06 — AvaWidget Feature Flag Gate

**What:** Add `features.assistant` check to the `showAvaWidget` boolean in Layout.tsx.

**Current code (Layout.tsx line 12):**
```tsx
// Source: direct inspection of Layout.tsx
import { Outlet, useLocation } from 'react-router-dom'
// ... existing imports
const showAvaWidget = pathname !== '/ava'
// Line 31: {showAvaWidget && <AvaWidget />}
```

**After change:**
```tsx
import { features } from '../../config'
// ...
const showAvaWidget = pathname !== '/ava' && features.assistant
```

**Why this approach:** The `features` barrel export is already available at `../../config` (same path pattern as `../config/company` used in StickyMobileCTA.tsx). The `&&` short-circuit ensures DOM removal when either condition is false — matching the locked decision for "complete DOM removal, not CSS hiding."

**Verification:** Setting `features.assistant = false` in `src/config/features.ts` should cause AvaWidget to disappear from all pages including pages where `pathname !== '/ava'` is true.

### Pattern 3: SEO-04 — Service Routes and Hostname Derivation

**What:** Replace the hardcoded `serviceRoutes` array and `hostname` string in `vite.config.ts` with values read from config source files using the existing regex pattern.

**Current code (vite.config.ts lines 167–168):**
```typescript
// Service routes — hardcoded list matching src/config/services.ts slugs
const serviceRoutes = ['/roofing', '/siding', '/storm-damage']
```

**Current hostname (vite.config.ts line 237):**
```typescript
const hostname = 'https://example.com'
```

**After change for service routes** — inside `getRouteList()`:
```typescript
// Source: consistent with city routes extraction pattern (lines 175-180)
let serviceRoutes: string[] = []
try {
  const svcFile = readFileSync(resolve('src/config/services.ts'), 'utf-8')
  const stripped = svcFile
    .replace(/\/\*[\s\S]*?\*\//g, '')   // remove block comments
    .replace(/\/\/.*/g, '')              // remove line comments
  const slugMatches = stripped.matchAll(/slug:\s*'([^']+)'/g)
  serviceRoutes = [...slugMatches].map((m) => `/${m[1]}`)
} catch {
  // Fallback to known slugs if file read fails
  serviceRoutes = ['/roofing', '/siding', '/storm-damage']
}
```

**After change for hostname** — inside `generateSitemap()`:
```typescript
// Read hostname from company.ts
let hostname = 'https://example.com'
try {
  const companyFile = readFileSync(resolve('src/config/company.ts'), 'utf-8')
  const stripped = companyFile
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*/g, '')
  const urlMatch = stripped.match(/url:\s*'([^']+)'/)
  if (urlMatch) hostname = urlMatch[1]
} catch {
  // Fallback: use hardcoded value
}
```

**Why regex approach:** The Vite plugin runs in a Node.js context before the app bundle is built — ESM `import` of app config files is not possible here. This is explicitly documented in vite.config.ts line 224: "Cannot ESM-import app config in Vite Node context." The existing `readFeatureFlags()` and city slug extraction functions use this exact pattern.

**Why the slug regex works for services.ts:** The `services.ts` file defines slugs as `slug: 'roofing'`, `slug: 'siding'`, `slug: 'storm-damage'`. The regex `/slug:\s*'([^']+)'/g` matches these cleanly. Block/line comment stripping prevents false positives from JSDoc examples (same precaution used for service-areas.ts).

**Caution — slug collision:** The same regex pattern is used for both `services.ts` and `projects.ts` portfolio routes. In `services.ts`, every `slug:` field is a service slug. In `projects.ts`, every `slug:` field is a project slug. These are in separate files, so there is no collision risk.

### Pattern 4: Dead Code Removal

**What:** Delete `buildAggregateRatingSchema()` from `src/lib/seo.ts` and `getCityRoutes()` from `src/lib/route-generator.ts`.

**Confirmed zero import sites (grep result):**
- `buildAggregateRatingSchema` — only defined in `src/lib/seo.ts` (line 164). Not imported anywhere.
- `getCityRoutes` — only defined in `src/lib/route-generator.ts` (line 31). Not imported anywhere. App.tsx imports only `getServiceRoutes` from this file.

**For `seo.ts`:** Delete the JSDoc block (lines 158–163) and function body (lines 164–176). Check for orphaned imports — `buildAggregateRatingSchema` uses `testimonials` from `../config/testimonials`, which is also used by `buildLocalBusinessSchema`. **Conclusion: no import becomes orphaned after this deletion.**

**For `route-generator.ts`:** Delete the `CityRoute` interface (lines 15–19), the JSDoc comment above `getCityRoutes`, and the function body (lines 31–38). Check remaining exports — `getServiceRoutes` uses `services` from `../config/services`; `getCityRoutes` used `cityPages` from `../config/service-areas` and `features` from `../config/features`. After deletion, verify whether `cityPages` and `features` imports become orphaned.

**Import cleanup in route-generator.ts:** After removing `getCityRoutes()`:
- `import { cityPages } from '../config/service-areas'` — only used by `getCityRoutes`. **Orphaned — must remove.**
- `import { features } from '../config/features'` — only used by `getCityRoutes`. **Orphaned — must remove.**
- `import { services } from '../config/services'` — used by `getServiceRoutes`. **Keep.**

**TypeScript will warn (or error) on unused imports** if the project has `noUnusedLocals` enabled. Even without that flag, removing them is correct per the locked decision: "delete the functions and their imports."

### Anti-Patterns to Avoid

- **CSS hiding instead of DOM removal for CFG-06:** Using `visibility: hidden` or `display: none` still loads AvaWidget JS and registers event listeners. The locked decision requires `features.assistant &&` which causes React to skip rendering entirely.
- **Modifying the TypeScript app config files (services.ts, company.ts) to add Node-compatible exports:** Unnecessary complexity. The regex approach is already established and consistent with the codebase.
- **Removing more dead code than the audit identified:** The locked decision explicitly says "do not sweep for additional unused code beyond what the audit identified."

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Reading config values in Vite build context | Custom ESM loader or Vite manifest tricks | `readFileSync` + regex | Already the established pattern for 3 other config reads in vite.config.ts |
| Phone formatting in tel: URI | Custom phone string normalizer | Pass `company.phone` as-is | The value is already in the config as a string; display and tel: URI use the same value |

---

## Common Pitfalls

### Pitfall 1: Slug Regex Capturing Interface Field Definitions

**What goes wrong:** The `/slug:\s*'([^']+)'/g` regex could match `slug: string` in a TypeScript interface definition if it were written as `slug: 'some-string'` in a JSDoc example. In `services.ts`, there are no JSDoc examples with slug values in the interface block — the interface defines `slug: string` (no quotes around `string`), so the regex will not match it.

**Why it happens:** Type annotations use bare identifiers (`string`), not string literals. The regex only captures single-quoted string literals.

**How to avoid:** Comment stripping before applying the regex (already done for city routes, blog routes, and portfolio routes). Apply the same `.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*/g, '')` strip before the matchAll.

**Warning signs:** Unexpected routes appearing in the sitemap that don't correspond to real pages.

### Pitfall 2: Import Path Mismatch for `features` in Layout.tsx

**What goes wrong:** Importing from the wrong path causes either a runtime module not found error or silently imports an un-validated copy of the features object.

**Why it happens:** The codebase has two valid paths: `'../../config'` (barrel with Zod validation) and `'../../config/features'` (direct file, no Zod validation). Both currently export `features`.

**How to avoid:** Follow the existing pattern in `App.tsx` which imports `features` from `'./config'` (the barrel). In Layout.tsx, the equivalent is `'../../config'`. This keeps all feature flag reads going through the validated barrel export.

**Note:** `StickyMobileCTA.tsx` imports `company` from `'../../config/company'` (direct) rather than the barrel. Either path works for features since features.ts has no Zod validation either way. For consistency with how features is imported elsewhere in the app (`App.tsx` uses the barrel), use the barrel.

### Pitfall 3: Regex Over-Capture in company.ts for url Field

**What goes wrong:** `url:\s*'([^']+)'` could theoretically match a non-URL field if company.ts had another field named something ending in `url:`. In the current company.ts, the only `url:` key is the company URL field.

**Why it happens:** Regex key matching is positional, not semantic.

**How to avoid:** The regex `url:\s*'([^']+)'` is unambiguous given the current company.ts structure. Use `.match()` (returns first match) rather than `.matchAll()` so only the first hit is taken. If company.ts is restructured in future, this regex would need updating — which is acceptable since SEO-04's purpose is to sync from config, not eliminate all manual maintenance.

### Pitfall 4: Removing Wrong Lines in seo.ts

**What goes wrong:** Deleting too many lines and accidentally removing the `aggregateRating` logic inside `buildLocalBusinessSchema()`, which uses the same testimonials computation pattern.

**Why it happens:** `buildAggregateRatingSchema()` (lines 158–176) and the inline `aggregateRating` constant inside `buildLocalBusinessSchema()` (lines 54–61) look similar but are separate.

**How to avoid:** Delete only the export function `buildAggregateRatingSchema` and its JSDoc comment — do not touch lines inside `buildLocalBusinessSchema`.

---

## Code Examples

### 404 Phone CTA — Complete NotFound.tsx After Change

```tsx
// Source: NotFound.tsx + company.ts (direct inspection)
import { Link } from 'react-router-dom'
import { Home, ArrowLeft, Phone } from 'lucide-react'
import PageMeta from '../components/ui/PageMeta'
import { company } from '../config/company'

export default function NotFound() {
  return (
    <>
      <PageMeta title="Page Not Found" description="The page you're looking for doesn't exist." path="/404" noindex />
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-surface rounded-2xl flex items-center justify-center">
            <Home className="w-10 h-10 text-navy/40" />
          </div>
          <h1 className="text-6xl font-extrabold text-navy mb-2">404</h1>
          <p className="text-xl font-semibold text-navy mb-2">Page Not Found</p>
          <p className="text-text-secondary mb-4">
            The page you're looking for doesn't exist or has been moved.
          </p>
          {/* Phone CTA — CFG-05 */}
          <div className="mb-6">
            <p className="text-sm text-text-secondary mb-3">Need help? We're one call away.</p>
            <a
              href={`tel:${company.phone}`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-blue text-white font-semibold rounded-full shadow-lg shadow-brand-blue/25 hover:shadow-brand-blue/40 hover:scale-105 transition-all duration-300"
            >
              <Phone className="w-4 h-4" />
              Call {company.phone}
            </a>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-safety-orange to-orange-500 text-white font-semibold rounded-full shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-105 transition-all duration-300"
            >
              <Home className="w-4 h-4" />
              Go Home
            </Link>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-surface text-navy font-semibold rounded-full hover:bg-slate-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
```

### CFG-06 — Layout.tsx showAvaWidget Change

```tsx
// Source: Layout.tsx (direct inspection) + App.tsx features import pattern
import { Outlet, useLocation } from 'react-router-dom'
import { features } from '../../config'
// ... other existing imports

export default function Layout() {
  const { pathname } = useLocation()
  // Don't show floating widget on the dedicated Ava page, or if assistant feature is disabled
  const showAvaWidget = pathname !== '/ava' && features.assistant
  // ... rest of component unchanged
```

### SEO-04 — vite.config.ts Service Route Extraction

```typescript
// Source: vite.config.ts (direct inspection) — mirrors existing city route extraction pattern

// Inside getRouteList(), replacing lines 167-168:
let serviceRoutes: string[] = []
try {
  const svcFile = readFileSync(resolve('src/config/services.ts'), 'utf-8')
  const stripped = svcFile
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*/g, '')
  const slugMatches = stripped.matchAll(/slug:\s*'([^']+)'/g)
  serviceRoutes = [...slugMatches].map((m) => `/${m[1]}`)
} catch {
  serviceRoutes = ['/roofing', '/siding', '/storm-damage']
}
```

### SEO-04 — vite.config.ts Hostname Extraction

```typescript
// Source: vite.config.ts (direct inspection) — inside generateSitemap() closeBundle()

// Replacing line 237:
let hostname = 'https://example.com'
try {
  const companyFile = readFileSync(resolve('src/config/company.ts'), 'utf-8')
  const stripped = companyFile
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*/g, '')
  const urlMatch = stripped.match(/url:\s*'([^']+)'/)
  if (urlMatch) hostname = urlMatch[1]
} catch {
  // Fallback: keep 'https://example.com'
}
```

### Dead Code Removal — route-generator.ts After

```typescript
// Source: route-generator.ts (direct inspection)
// After removing getCityRoutes() and CityRoute interface:

import { services } from '../config/services'

export interface ServiceRoute {
  path: string
  slug: string
  name: string
}

/** Generate routes for all configured services */
export function getServiceRoutes(): ServiceRoute[] {
  return services.map((s) => ({
    path: s.slug,
    slug: s.slug,
    name: s.name,
  }))
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Hardcoded service routes in vite.config.ts | Regex extraction from services.ts | Phase 11 (this phase) | New services auto-appear in sitemap |
| Hardcoded hostname `'https://example.com'` | Read from company.ts source | Phase 11 (this phase) | Template users only edit company.ts, no vite.config.ts changes needed |
| Unconditional AvaWidget render in Layout.tsx | Gated on `features.assistant` | Phase 11 (this phase) | Setting `features.assistant = false` completely removes chat widget |

---

## Open Questions

1. **Should `mb-8` on the description paragraph change to `mb-4` when adding the phone CTA block?**
   - What we know: Current description has `mb-8` (32px) before the button row. The phone CTA block will have its own `mb-6` (24px) below it.
   - What's unclear: Whether the total visual spacing (32px + CTA block + 24px + buttons) looks correct without seeing it rendered.
   - Recommendation: Claude's discretion. Change `mb-8` to `mb-4` on the description paragraph so the phone CTA visually groups with the description rather than floating between two large gaps.

2. **`readFileSync` is already imported in vite.config.ts — will the new calls conflict?**
   - What we know: `readFileSync` and `resolve` are both imported at the top of vite.config.ts (line 5). `readFeatureFlags()` and the city/portfolio slug extractors already call `readFileSync(resolve(...))`.
   - Conclusion: No conflict. The new service route and hostname extractors follow the identical pattern. No new imports needed.

---

## Sources

### Primary (HIGH confidence)
- Direct file inspection: `src/pages/NotFound.tsx` — confirmed current structure, existing imports, button class patterns
- Direct file inspection: `src/components/layout/Layout.tsx` — confirmed `showAvaWidget` variable, import paths
- Direct file inspection: `vite.config.ts` — confirmed Node context constraint, `readFileSync` usage, regex extraction pattern for city slugs (lines 175-180), hardcoded service routes (line 168), hardcoded hostname (line 237)
- Direct file inspection: `src/lib/seo.ts` — confirmed `buildAggregateRatingSchema` exists and its testimonials dependency
- Direct file inspection: `src/lib/route-generator.ts` — confirmed `getCityRoutes` exists and its dependencies (`cityPages`, `features` imports)
- Direct file inspection: `src/config/company.ts` — confirmed `url` field structure (`url: 'https://example.com'`)
- Direct file inspection: `src/config/features.ts` — confirmed `assistant: true` flag exists
- Grep: zero import sites for `getCityRoutes` and `buildAggregateRatingSchema` across all TS/TSX/JS files in `src/`
- Direct file inspection: `.planning/v1.0-MILESTONE-AUDIT.md` — confirmed audit evidence, fix effort estimates

### Secondary (MEDIUM confidence)
- `.planning/REQUIREMENTS.md` — acceptance criteria for CFG-05, CFG-06, SEO-04
- `.planning/STATE.md` — confirmed prior decisions, phase history

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new dependencies; everything uses existing libraries and patterns
- Architecture: HIGH — all changes are surgical edits to files confirmed via direct inspection
- Pitfalls: HIGH — derived from direct code inspection, confirmed zero import sites, documented regex constraints

**Research date:** 2026-02-27
**Valid until:** 2026-03-27 (stable — changes are file-local, no external dependencies)
