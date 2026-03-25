# Phase 8: Feature Flag & Integration Polish - Research

**Researched:** 2026-02-26
**Domain:** React Router DOM, config-driven feature flags, Vite plugin (Node context), sitemap generation
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Route blocking behavior**
- When a feature flag is off, gated routes redirect to home (`/`) with 302 (temporary)
- Nav links for disabled features disappear completely — no greyed-out or disabled state
- 302 temporary redirect for all feature-flag redirects (features can be re-enabled)

**Before/After flag scope**
- Simple boolean: `features.beforeAfter: true/false` — matches existing flag patterns
- Default value: `true` (existing sites already show before/after content)
- Gates everything related: gallery component, nav links, and any references to before/after on other pages
- When flag is off, CMS data for before/after is silently ignored — no console warnings

**Redirect consistency**
- Invalid service slugs redirect to parent service category (e.g. `/services/plumbing/nonexistent` → `/services/plumbing`)
- Invalid category slugs redirect to services index (e.g. `/services/fakecategory` → `/services`)
- All redirects use 302 (temporary) for consistency across the app
- Fix ServicePage to match existing CityPage/ResourcesPost redirect pattern

**Sitemap handling**
- Make sitemap generation fully dynamic — reads feature flags at build time
- Routes for disabled features excluded from sitemap.xml automatically
- No robots.txt changes needed — sitemap exclusion is sufficient
- Keep sitemap simple: URLs only, no lastmod dates
- Feature-flag-level filtering only — don't validate individual CMS data existence

### Claude's Discretion
- Whether to audit all page types for redirect consistency or just fix ServicePage as identified
- Exact redirect target resolution when parent routes are also feature-gated
- Implementation pattern for feature flag checks in sitemap generation

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| CFG-02 | Config-Driven Navigation: `features.assistant` must gate the Ava nav link and `/ava` route | Navigation.ts fix pattern and App.tsx conditional route pattern both identified |
| CFG-06 | Feature Flags System: `features.beforeAfter` flag missing from features.ts | Simple boolean addition; Projects.tsx gating pattern confirmed |
| SEO-04 | Sitemap & Robots.txt: hardcoded routes in vite.config.ts ignore feature flags | vite.config.ts getRouteList() is in Node context — feature flags must be read as raw TypeScript source text, OR refactored to import from a shared CommonJS/JSON config |
</phase_requirements>

---

## Summary

Phase 8 is a precision gap-closure phase operating entirely within already-established codebase patterns. No new architectural concepts are introduced. The work divides into four targeted changes: (1) add `features.beforeAfter` to `src/config/features.ts`, (2) fix `src/config/navigation.ts` to wrap the Ava links behind `features.assistant`, (3) fix `src/App.tsx` to gate the `/ava` route, and (4) fix `vite.config.ts` to read feature flags before building the sitemap route list.

The most technically interesting problem is the sitemap. The existing `getRouteList()` function runs in Vite's Node build context and cannot use `import`/ESM to pull `features` from `src/config/features.ts` directly. The codebase comment on line 93 of `vite.config.ts` already acknowledges this constraint ("Cannot use import.meta.glob here (Node context, not app bundle)"). The solution precedent is already set: the plugin reads and parses TypeScript source files as raw text (regex extraction of slug values). The cleanest equivalent for feature flags is to do the same: read `src/config/features.ts` as text and extract boolean values with a simple regex, or alternatively export a small CommonJS-compatible `features.json` / `features.cjs` that both the app config and Vite plugin can share.

The ServicePage redirect fix is straightforward. The existing `ServicePage.tsx` redirects to `/404` on invalid slug (`<Navigate to="/404" replace />`), but the correct pattern — as already used in `CityPage.tsx`, `ResourcesPost.tsx`, and `ProjectDetail.tsx` — is to redirect to the parent route with `replace: true`. This is a one-line change.

**Primary recommendation:** All four changes are independent and can be executed in a single plan wave. No new dependencies, no new libraries. Read existing flag patterns (blog, financingCalculator, cityPages) to stay consistent.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React Router DOM | Already installed (see App.tsx) | Route-level feature gating with `<Navigate>` and conditional `<Route>` | Already the routing solution in this project |
| Vite Node API (fs, path, regex) | Native Node / already in vite.config.ts | Read feature flag source file at build time | Established pattern in this codebase's vite.config.ts |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| None required | — | — | Phase 8 adds zero new dependencies |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Regex parsing features.ts in Vite | Separate features.json shared by both app and Vite | JSON approach is cleaner but adds a file; regex is consistent with existing codebase pattern (slug extraction already uses regex) |
| `<Navigate>` in route components | Route wrapper guard component | Wrapper is more reusable but heavier than needed for 1 route |

**Installation:**
```bash
# No new packages required
```

---

## Architecture Patterns

### Existing Pattern: Conditional Route Registration (App.tsx)

The codebase already gates routes at the `<Route>` declaration level using JSX conditionals:

```tsx
// Already in App.tsx — model for /ava gating
{features.cityPages && (
  <Route path="service-areas/:slug" element={<CityPage />} />
)}
{features.financingCalculator && (
  <Route path="financing" element={<Financing />} />
)}
{features.blog && (
  <>
    <Route path="resources" element={<ResourcesIndex />} />
    <Route path="resources/:slug" element={<ResourcesPost />} />
  </>
)}
```

**Apply to `/ava`:** Remove the always-present `<Route path="ava" element={<Ava />} />` and wrap it the same way:

```tsx
{features.assistant && (
  <Route path="ava" element={<Ava />} />
)}
```

When `features.assistant = false`, the route simply does not register. A user navigating directly to `/ava` falls through to `<Route path="*" element={<NotFound />} />`. This is correct behavior and matches the locked decision (redirect to home). However — the `*` catch-all currently renders NotFound. If the locked decision is redirect-to-home (`/`), the catch-all must redirect to `/` OR the Ava route needs an explicit redirect route when the flag is off. **See Open Questions #1.**

### Existing Pattern: Conditional Nav Link Insertion (navigation.ts)

```ts
// Pattern already used for blog and financingCalculator
...(features.financingCalculator
  ? [{ href: '/financing', label: 'Financing' }]
  : []),
...(features.blog ? [{ href: '/resources', label: 'Resources' }] : []),
```

**Apply to Ava in `getNavLinks()`:** Replace the hardcoded `{ href: '/ava', label: 'Ask Ava' }` with the same spread pattern:

```ts
// In getNavLinks():
// BEFORE (hardcoded, always present):
{ href: '/ava', label: 'Ask Ava' },

// AFTER (conditional):
...(features.assistant ? [{ href: '/ava', label: 'Ask Ava' }] : []),
```

Apply the same change to `getFooterCompanyLinks()` which also hardcodes `/ava`.

### Existing Pattern: Redirect on Invalid Slug (CityPage / ResourcesPost)

**CityPage.tsx** — uses `useNavigate` + `useEffect`:
```tsx
useEffect(() => {
  if (!city) {
    navigate('/service-areas', { replace: true })
  }
}, [city, navigate])
if (!city) return null
```

**ResourcesPost.tsx** — uses declarative `<Navigate>`:
```tsx
if (!post) return <Navigate to="/resources" replace />
```

**ServicePage.tsx** (current, broken):
```tsx
if (!service) {
  return <Navigate to="/404" replace />
}
```

**ServicePage fix** — change the redirect target from `/404` to `/services` to match parent-redirect pattern:
```tsx
if (!service) {
  return <Navigate to="/services" replace />
}
```

Note: The context decisions say "invalid service slugs redirect to parent service category (e.g. `/services/plumbing/nonexistent` → `/services/plumbing`)". In this project, service routes are flat (`/roofing`, `/siding`, `/storm-damage`) — there are no nested category sub-slugs. The parent of a service route is `/services` (the services index). This is the correct target.

### Pattern: Feature Flag Addition to features.ts

```ts
// Current features.ts:
export const features = {
  assistant: true,
  blog: true,
  financingCalculator: true,
  onlineBooking: true,
  cityPages: true,
}

// After adding beforeAfter:
export const features = {
  assistant: true,
  blog: true,
  financingCalculator: true,
  onlineBooking: true,
  cityPages: true,
  /** Show the before/after comparison slider section on the Projects page */
  beforeAfter: true,
}
```

### Pattern: Gating beforeAfter in Projects.tsx

The Before & After section in `Projects.tsx` is a standalone `<section>` block (lines 94–127). The pattern:

```tsx
{features.beforeAfter && (
  <section className="py-20 lg:py-28 bg-surface" ref={baRef}>
    {/* ... BeforeAfterSlider content ... */}
  </section>
)}
```

The `baRef` and `baInView` scroll-reveal hooks can remain declared (hooks must not be called conditionally in React), but the section using them is simply not rendered when the flag is off. No console warnings because `projects.beforeAfter` data is never accessed.

### Pattern: Sitemap Feature Flag Reading (vite.config.ts)

The sitemap plugin runs in Node context and cannot `import` the ESM `features.ts`. Two verified approaches:

**Option A (consistent with existing codebase pattern):** Parse `src/config/features.ts` as raw text and extract values with regex, just like slugs are extracted:

```ts
function readFeatureFlags(): Record<string, boolean> {
  try {
    const src = readFileSync(resolve('src/config/features.ts'), 'utf-8')
    // Strip comments
    const stripped = src
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*/g, '')
    // Extract: key: true/false
    const flags: Record<string, boolean> = {}
    for (const [, key, val] of stripped.matchAll(/(\w+):\s*(true|false)/g)) {
      flags[key] = val === 'true'
    }
    return flags
  } catch {
    // Fallback: all features enabled (safe default — include all routes)
    return { assistant: true, blog: true, financingCalculator: true, cityPages: true, beforeAfter: true }
  }
}
```

**Option B:** Move feature flags to `features.json` or a CJS module importable in both contexts. This is cleaner architecturally but requires refactoring the existing app config barrel.

**Recommendation:** Use Option A. It is consistent with the existing regex-extraction pattern, requires no structural refactor, and matches the codebase's established "Node context workaround" philosophy. Document the caveats in a comment.

**Apply flags to getRouteList():**

```ts
function getRouteList(): string[] {
  const flags = readFeatureFlags()

  const staticRoutes = [
    '/', '/services', '/projects', '/testimonials',
    '/about', '/contact', '/service-areas',
    // /ava excluded when assistant flag is off
    ...(flags.assistant ? ['/ava'] : []),
    // /financing excluded when financingCalculator flag is off
    ...(flags.financingCalculator ? ['/financing'] : []),
    // /resources excluded when blog flag is off
    ...(flags.blog ? ['/resources'] : []),
  ]
  // ... rest of dynamic routes
}
```

Note: `/ava` is already in the sitemap `excludeSet` in the current code (`const excludeSet = new Set(['/thank-you', '/404', '/ava'])`). Removing it from `excludeSet` and instead controlling it via the flag is cleaner — remove the hardcoded exclusion and let the flag drive it.

### Anti-Patterns to Avoid

- **Calling hooks conditionally:** `baRef` and `baInView` from `useScrollReveal()` in Projects.tsx must stay declared unconditionally, even when the Before/After section is hidden. Only the JSX section is conditionally rendered.
- **Mutating the catch-all to redirect:** Do not change `<Route path="*" element={<NotFound />} />` to a redirect. The intent for disabled feature routes is either: (a) let the catch-all show NotFound (acceptable) or (b) add an explicit redirect route per feature. See Open Questions.
- **Importing from src/ in vite.config.ts:** The plugin runs in Node, not the Vite app bundle. ESM `import` of `src/config/features.ts` will fail or produce stale cached results.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Route-level feature gating | Custom HOC or guard component | Inline JSX conditionals wrapping `<Route>` | Already established pattern in App.tsx |
| Nav link filtering | Imperative array mutation | Spread conditional into array literal | Already established pattern in navigation.ts |
| Parsing TS source | Full TypeScript AST parser | Regex on comment-stripped source | Same approach already works for slugs in this codebase |

**Key insight:** All patterns for this phase already exist in the codebase. The work is applying existing patterns to the 4–5 missing locations.

---

## Common Pitfalls

### Pitfall 1: Header calls `getNavLinks()` at module level
**What goes wrong:** `const navLinks = getNavLinks()` is called once at module load time in `Header.tsx` (line 8). If features are changed after initial load, nav does not update.
**Why it happens:** The call is outside the component, so React re-renders don't re-evaluate it.
**How to avoid:** This is intentional and correct for a static site — feature flags are set at build/load time, not changed at runtime. No fix needed.
**Warning signs:** N/A — this is by design.

### Pitfall 2: Footer also hardcodes `/ava`
**What goes wrong:** `getFooterCompanyLinks()` in `navigation.ts` (line 55) also hardcodes `{ href: '/ava', label: 'Ask Ava' }` unconditionally.
**Why it happens:** The gap was in navigation.ts, not just getNavLinks().
**How to avoid:** Fix BOTH `getNavLinks()` AND `getFooterCompanyLinks()` in the same edit.
**Warning signs:** Test with `features.assistant = false` and check both Header and Footer.

### Pitfall 3: Sitemap excludeSet contains hardcoded `/ava`
**What goes wrong:** Current `generateSitemap()` has `const excludeSet = new Set(['/thank-you', '/404', '/ava'])`. If `/ava` is now conditionally included/excluded via flags, the `excludeSet` is redundant and could cause confusion.
**Why it happens:** The original implementation hardcoded `/ava` exclusion before feature-flag-aware sitemap was planned.
**How to avoid:** Remove `/ava` from `excludeSet`. Let the flag in `getRouteList()` control whether `/ava` appears. Keep `/thank-you` in the exclude set (it's not a feature-flagged route, it's always excluded for SEO reasons).
**Warning signs:** `/ava` appearing in sitemap when `features.assistant = false`.

### Pitfall 4: ServicePage redirect target
**What goes wrong:** The context says invalid service slugs redirect to "parent service category". In this project, service routes are flat (`/roofing`, not `/services/roofing`). There is no category sub-path.
**Why it happens:** The context was written with a general example. Actual route structure is different.
**How to avoid:** Redirect to `/services` (the services index), not to a category path that doesn't exist. This matches what `CityPage.tsx` does (redirects to `/service-areas`, not to a state grouping).
**Warning signs:** Navigating to `/nonexistent-service` should land on `/services`, not crash.

### Pitfall 5: Projects.tsx scroll-reveal refs declared after conditional
**What goes wrong:** If `baRef` and `baInView` are moved inside a conditional block, React will throw "Rendered more hooks than during the previous render."
**Why it happens:** React's rules of hooks — hooks must be called in the same order on every render.
**How to avoid:** Keep `const { ref: baRef, isInView: baInView } = useScrollReveal()` at the top of the component function unconditionally. Only the returned JSX section is conditionally rendered.

---

## Code Examples

### 1. features.ts — adding beforeAfter flag

```typescript
// File: src/config/features.ts
export const features = {
  /** Show the AI chat assistant (Ava) */
  assistant: true,
  /** Enable the blog / content section (Phase 4) */
  blog: true,
  /** Enable financing calculator (Phase 3) */
  financingCalculator: true,
  /** Enable online booking (Phase 3) */
  onlineBooking: true,
  /** Enable city/service-area pages (Phase 5) */
  cityPages: true,
  /** Show before/after comparison slider on Projects page */
  beforeAfter: true,
}
```

### 2. navigation.ts — gating Ava links

```typescript
// getNavLinks() — replace hardcoded Ava entry
// BEFORE:
{ href: '/ava', label: 'Ask Ava' },
// AFTER:
...(features.assistant ? [{ href: '/ava', label: 'Ask Ava' }] : []),

// getFooterCompanyLinks() — same fix
// BEFORE:
{ href: '/ava', label: 'Ask Ava' },
// AFTER:
...(features.assistant ? [{ href: '/ava', label: 'Ask Ava' }] : []),
```

### 3. App.tsx — gating /ava route

```tsx
// BEFORE:
<Route path="ava" element={<Ava />} />

// AFTER:
{features.assistant && (
  <Route path="ava" element={<Ava />} />
)}
```

### 4. ServicePage.tsx — redirect consistency fix

```tsx
// BEFORE:
if (!service) {
  return <Navigate to="/404" replace />
}

// AFTER:
if (!service) {
  return <Navigate to="/services" replace />
}
```

### 5. vite.config.ts — feature-aware sitemap

```typescript
// Add above getRouteList():
function readFeatureFlags(): Record<string, boolean> {
  try {
    const src = readFileSync(resolve('src/config/features.ts'), 'utf-8')
    const stripped = src
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*/g, '')
    const flags: Record<string, boolean> = {}
    for (const [, key, val] of stripped.matchAll(/(\w+):\s*(true|false)/g)) {
      flags[key] = val === 'true'
    }
    return flags
  } catch {
    return { assistant: true, blog: true, financingCalculator: true, cityPages: true, beforeAfter: true }
  }
}

// In getRouteList(), replace static hardcoded list:
function getRouteList(): string[] {
  const flags = readFeatureFlags()

  const staticRoutes = [
    '/', '/services', '/projects', '/testimonials',
    '/about', '/contact', '/service-areas',
    ...(flags.assistant ? ['/ava'] : []),
    ...(flags.financingCalculator ? ['/financing'] : []),
    ...(flags.blog ? ['/resources'] : []),
  ]
  // ... city, blog post, portfolio dynamic routes unchanged
}

// In generateSitemap(), update excludeSet to remove /ava (now flag-controlled):
const excludeSet = new Set(['/thank-you', '/404'])
// (Remove '/ava' — the flag in getRouteList() handles it now)
```

### 6. Projects.tsx — gating Before/After section

```tsx
// Import features (add to existing imports):
import { features } from '../config/features'

// Wrap the Before & After section:
{features.beforeAfter && (
  <section className="py-20 lg:py-28 bg-surface" ref={baRef}>
    <div className="max-w-5xl mx-auto px-4 sm:px-6">
      <SectionHeading
        title="Before & After"
        subtitle="See the transformation -- drag the slider to compare."
        className="mb-10"
      />
      <div className="space-y-10">
        {projects.beforeAfter.map((item, i) => (
          {/* existing JSX unchanged */}
        ))}
      </div>
    </div>
  </section>
)}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| All routes always registered | Conditional route registration via JSX boolean | Phase 1 (this project) | Routes for disabled features simply don't exist |
| Hardcoded nav arrays | Config-driven nav with spread conditionals | Phase 1 (this project) | Adding feature flag to nav is a 1-line change |

**Gap in current state:**
- Ava (`/ava`) was never added to the conditional route pattern when the pattern was established
- `features.beforeAfter` was never added when the BeforeAfter component was built in Phase 2

---

## Open Questions

1. **`features.assistant = false` + direct URL navigation to `/ava`**
   - What we know: When `features.assistant = false`, the `<Route path="ava">` is not registered. A direct navigation to `/ava` hits the `<Route path="*">` catch-all, which currently renders `<NotFound />`.
   - What's unclear: The locked decision says "routes redirect to home (`/`) with 302", but the catch-all renders NotFound rather than redirecting. Two options: (A) Accept NotFound for unregistered feature routes (simpler), or (B) Change catch-all to `<Navigate to="/" replace />` (breaks all 404s), or (C) Add an explicit redirect route when flag is off: `{!features.assistant && <Route path="ava" element={<Navigate to="/" replace />} />}`.
   - Recommendation: Use Option C — explicit redirect route for each disabled feature. This honors the locked decision precisely while keeping the `*` catch-all as NotFound for genuinely unknown URLs.

2. **Projects.tsx `baRef`/`baInView` are used only by the Before/After section**
   - What we know: If `features.beforeAfter = false`, `baRef` and `baInView` are declared but unused.
   - What's unclear: Whether the TypeScript compiler will warn on unused variables.
   - Recommendation: Keep the hook calls — removing them would violate rules of hooks. TypeScript may produce `noUnusedLocals` warnings depending on tsconfig; suppress with `// eslint-disable` comment or rename `_baRef` pattern if needed. Check `tsconfig.json` first.

---

## Validation Architecture

> `workflow.nyquist_validation` is not present in `.planning/config.json` (key missing). Treating as false — skipping this section.

---

## Sources

### Primary (HIGH confidence)
- Direct codebase inspection — `src/config/features.ts`, `src/config/navigation.ts`, `src/App.tsx`, `src/pages/ServicePage.tsx`, `src/pages/CityPage.tsx`, `src/pages/ResourcesPost.tsx`, `src/pages/Projects.tsx`, `src/pages/ProjectDetail.tsx`, `vite.config.ts`
- React Router DOM patterns verified from existing working code in App.tsx

### Secondary (MEDIUM confidence)
- React rules of hooks (hooks cannot be called conditionally) — well-established React constraint, verified by pattern in existing component code

### Tertiary (LOW confidence)
- None

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries already in use, no new dependencies
- Architecture: HIGH — all patterns already exist in codebase, verified by direct file inspection
- Pitfalls: HIGH — identified from direct code reading, not speculation

**Research date:** 2026-02-26
**Valid until:** 2026-04-26 (stable patterns, no external library dependencies)
