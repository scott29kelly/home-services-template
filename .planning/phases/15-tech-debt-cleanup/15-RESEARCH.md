# Phase 15: Tech Debt Cleanup - Research

**Researched:** 2026-03-04
**Domain:** Dead code removal — orphan files, unused exports, no-op handlers
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Deletion scope
- Focus on the 4 explicit targets named in the roadmap
- If trivial additional dead code is discovered during removal (e.g., an import only used by a deleted file), include it in the cleanup
- Do NOT expand into a broad dead-code sweep — keep changes predictable

#### Vitals handler
- Remove vitals.ts entirely rather than fixing it
- It's a no-op — the project already has Lighthouse measurements and real monitoring
- Clean up any imports/references to the vitals handler

#### API file handling
- Delete api/contact.js and api/banner.js after confirming no routes or imports reference them
- Grep codebase for any imports/references before deletion to ensure safety

#### Verification approach
- Build must pass after all removals
- Grep for removed export names and file paths to confirm zero remaining references
- Run existing test suite to catch regressions

### Claude's Discretion
- Order of operations for removals
- Whether to remove files one-by-one or batch
- How to handle any cascading unused imports discovered during cleanup

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| CLEAN-01 | Remove orphan API files (api/contact.js, api/banner.js) and unused export (getTestimonialsByService). No new unused exports introduced. Build succeeds. | Codebase audit confirms api/contact.js and api/banner.js are already absent from the filesystem — they were never created or were already removed. getTestimonialsByService is defined but never called outside its own definition and re-export. |
| CLEAN-02 | Fix or remove vitals.ts no-op handler. If removed: all imports/references cleaned up. | vitals.ts exists at src/lib/vitals.ts. It is NOT imported anywhere in the codebase — only the file itself references web-vitals. The web-vitals package is listed in package.json dependencies and should be uninstalled after removal. |
</phase_requirements>

---

## Summary

Phase 15 is a targeted dead-code removal with no new functionality. The codebase audit reveals four targets in varying states: two are already missing from the filesystem, one is a defined-but-never-called export function, and one is an unreferenced file.

**api/contact.js and api/banner.js** — These files do not exist anywhere in the working tree outside node_modules, build, or dist. A full recursive search found no `api/contact.js` or `api/banner.js` in the project. The api/ directory contains only `chat.js`, `serve.js`, `server.js`, `worker-groq.js`, `worker.js`, and `wrangler.toml`. The REQUIREMENTS and MILESTONES documents describe these as "orphan Vercel serverless files — not in the client call path". Either they were deleted in a prior cleanup pass or they never existed in this git checkout. The CLEAN-01 acceptance criteria `api/contact.js removed or properly integrated` and `api/banner.js removed or properly integrated` are already satisfied. The task here is to verify this fact and document it.

**getTestimonialsByService()** — Defined in `src/config/testimonials.ts` at line 197 and re-exported through `src/config/index.ts` at line 60. A search across all routes, pages, and components confirms it is never called anywhere. The companion function `getTestimonialsByCity()` IS actively used in `src/routes/service-areas.$slug.tsx` and `src/pages/CityPage.tsx`. Removing `getTestimonialsByService` only requires: (1) deleting the function body in `testimonials.ts`, and (2) removing it from the re-export line in `index.ts`.

**vitals.ts** — Located at `src/lib/vitals.ts`. It imports from `web-vitals` and exports `reportWebVitals()`. A full grep of the src directory confirms it is NEVER imported anywhere — not in `entry.client.tsx`, not in any route or page, not in any hook or component. The file is completely isolated dead code. Removing it means: (1) delete `src/lib/vitals.ts`, and (2) uninstall the `web-vitals` package from dependencies (it is currently listed in `package.json` dependencies at `^5.1.0` and has no other consumers in the codebase).

**Primary recommendation:** Execute removals in this order: (1) verify/document that api files are gone, (2) remove getTestimonialsByService from testimonials.ts and index.ts, (3) delete vitals.ts and uninstall web-vitals from package.json. Run build after each to catch regressions early.

---

## Standard Stack

### Core

No new libraries are needed. This phase removes code, it does not add it.

| Tool | Version | Purpose | Why Used |
|------|---------|---------|----------|
| npm uninstall | built-in | Remove web-vitals package | web-vitals is the only remaining consumer dependency to drop |

### Supporting

No supporting libraries needed.

### Alternatives Considered

Not applicable — this is deletion work only.

**Installation:**
```bash
npm uninstall web-vitals
```

---

## Architecture Patterns

### Recommended Operation Order

```
Phase 15 removals:
1. api/contact.js + api/banner.js  →  verify absent, document, close CLEAN-01 partial
2. getTestimonialsByService()       →  remove from testimonials.ts + index.ts
3. vitals.ts                        →  delete file + npm uninstall web-vitals
4. Build verification               →  npm run build must pass clean
5. Grep verification                →  confirm zero remaining references
```

### Pattern 1: Safe Export Removal

**What:** Remove a function from its source file AND from the barrel re-export simultaneously.
**When to use:** When the function is defined in one file and re-exported through a barrel (index.ts).
**Example:**
```typescript
// src/config/testimonials.ts — BEFORE
/** Filter testimonials by service slug */
export function getTestimonialsByService(slug: string): Testimonial[] {
  return testimonials.all.filter(t => t.serviceSlug === slug)
}

// src/config/testimonials.ts — AFTER (entire function deleted)
// [end of file — getTestimonialsByService removed]

// src/config/index.ts — BEFORE
export { getTestimonialsByCity, getTestimonialsByService } from './testimonials'

// src/config/index.ts — AFTER
export { getTestimonialsByCity } from './testimonials'
```

### Pattern 2: Isolated File Deletion

**What:** Delete a file that is defined but never imported.
**When to use:** When grep confirms zero import references to the file.
**Example:**
```bash
# Verify no imports before deleting
grep -rn "vitals\|reportWebVitals" src/ --include="*.ts" --include="*.tsx"
# Expected: only vitals.ts itself appears
# Then delete:
rm src/lib/vitals.ts
```

### Pattern 3: Package Removal After File Deletion

**What:** Uninstall a package that was only used by the deleted file.
**When to use:** After deleting a file, scan package.json for packages it alone consumed.
**Example:**
```bash
# web-vitals is only imported in src/lib/vitals.ts
# After deleting vitals.ts:
npm uninstall web-vitals
# Then verify build still passes
npm run build
```

### Anti-Patterns to Avoid

- **Over-deletion:** Do not expand into a broad dead-code sweep. Only remove the 4 named targets plus trivially cascading imports they leave behind.
- **Removing getTestimonialsByCity:** This function is actively used by service-areas.$slug.tsx and CityPage.tsx. It sits on the same re-export line as getTestimonialsByService — be surgical when editing index.ts line 60.
- **Uninstalling without confirming sole usage:** Before uninstalling web-vitals, verify no other file imports it. Current audit confirms it's only used in vitals.ts.

---

## Don't Hand-Roll

Not applicable — this phase removes code. No custom solutions needed.

---

## Common Pitfalls

### Pitfall 1: Removing getTestimonialsByCity Along With getTestimonialsByService

**What goes wrong:** Both functions appear on the same export line in index.ts. A careless edit removes both.
**Why it happens:** The line reads `export { getTestimonialsByCity, getTestimonialsByService }` — they're visually coupled.
**How to avoid:** Edit only to remove `getTestimonialsByService` from the named export, keep `getTestimonialsByCity`.
**Warning signs:** Build error referencing getTestimonialsByCity missing in service-areas.$slug.tsx or CityPage.tsx.

### Pitfall 2: Leaving web-vitals in package.json

**What goes wrong:** vitals.ts is deleted but web-vitals remains in package.json. It's an unused dependency that bloats node_modules.
**Why it happens:** File deletion doesn't automatically trigger package removal.
**How to avoid:** After deleting vitals.ts, run `npm uninstall web-vitals` and confirm it disappears from package.json.
**Warning signs:** `grep -r "web-vitals" src/` returns nothing but it's still in package.json.

### Pitfall 3: Assuming api/contact.js and api/banner.js Need Deletion

**What goes wrong:** Planner writes a task to `rm api/contact.js api/banner.js` — but these files don't exist. The task would fail or produce a confusing error.
**Why it happens:** The ROADMAP and STATE describe them as targets but the audit shows they're already absent.
**How to avoid:** The task for these should be: (1) grep to confirm absence, (2) grep to confirm no references remain in source, (3) mark CLEAN-01 as satisfied for the api-file items.
**Warning signs:** `ls api/` shows `chat.js serve.js server.js worker-groq.js worker.js wrangler.toml` — no contact.js or banner.js.

### Pitfall 4: Not Running Build After Each Removal

**What goes wrong:** Removals cascade in unexpected ways (e.g., TypeScript type resolution), and the error is attributed to the wrong change.
**Why it happens:** Multiple changes stacked without intermediate build verification.
**How to avoid:** Run `npm run build` after the getTestimonialsByService removal and again after vitals.ts deletion + package uninstall.

---

## Code Examples

### Remove getTestimonialsByService from testimonials.ts

```typescript
// Source: direct codebase analysis — src/config/testimonials.ts lines 191-199

// BEFORE (lines 191-199):
/** Filter testimonials by city slug */
export function getTestimonialsByCity(slug: string): Testimonial[] {
  return testimonials.all.filter(t => t.citySlug === slug)
}

/** Filter testimonials by service slug */
export function getTestimonialsByService(slug: string): Testimonial[] {
  return testimonials.all.filter(t => t.serviceSlug === slug)
}

// AFTER (lines 191-195 only, last 4 lines removed):
/** Filter testimonials by city slug */
export function getTestimonialsByCity(slug: string): Testimonial[] {
  return testimonials.all.filter(t => t.citySlug === slug)
}
```

### Remove getTestimonialsByService from index.ts re-export

```typescript
// Source: direct codebase analysis — src/config/index.ts line 60

// BEFORE:
export { getTestimonialsByCity, getTestimonialsByService } from './testimonials'

// AFTER:
export { getTestimonialsByCity } from './testimonials'
```

### Verify api files absent and no references

```bash
# Confirm files don't exist
ls api/
# Expected: chat.js serve.js server.js worker-groq.js worker.js wrangler.toml

# Confirm no source references to contact.js or banner.js
grep -rn "api/contact\|api/banner\|contact\.js\|banner\.js" src/ --include="*.ts" --include="*.tsx"
# Expected: no output
```

### Delete vitals.ts and uninstall package

```bash
# Confirm vitals.ts has no consumers
grep -rn "vitals\|reportWebVitals" src/ --include="*.ts" --include="*.tsx"
# Expected: only src/lib/vitals.ts itself

# Delete the file
rm src/lib/vitals.ts

# Uninstall web-vitals
npm uninstall web-vitals

# Verify build
npm run build
```

### Post-cleanup grep verification

```bash
# Zero references to removed items
grep -rn "getTestimonialsByService" src/
grep -rn "vitals\|reportWebVitals" src/
grep -rn "web-vitals" src/
grep "web-vitals" package.json
# All should return no output
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| api/contact.js (Vercel serverless) | form-handler.ts (Formspree/webhook) | v1.0 migration | api files became orphans |
| api/banner.js (Vercel serverless) | banner-client.ts (client-side config) | v1.0 migration | api files became orphans |
| web-vitals reportWebVitals() placeholder | Lighthouse CI / @vercel/speed-insights | Phase 10+ | vitals.ts became dead code |

**Deprecated/outdated:**
- `api/contact.js`: Was a Vercel serverless function for contact form submissions. Superseded by `src/lib/form-handler.ts` using Formspree/webhook. Already absent from filesystem.
- `api/banner.js`: Was a Vercel serverless function for banner state. Superseded by `src/lib/banner-client.ts` (client-side). Already absent from filesystem.
- `src/lib/vitals.ts`: Was a placeholder for production web vitals reporting. The production branch is a no-op (`void metric`). Real performance monitoring handled by `@vercel/speed-insights` and Lighthouse CI measurements. Never imported anywhere in the project.

---

## Open Questions

1. **Were api/contact.js and api/banner.js ever committed to this repo?**
   - What we know: They are not present in the working tree. `git log -- api/contact.js api/banner.js` returns no history.
   - What's unclear: They may have been planned as targets but never created, or created only in a different branch.
   - Recommendation: The CLEAN-01 acceptance criteria for these two files is already satisfied. Document this fact in the plan and verify with a grep sweep to ensure no dangling references exist in source code.

2. **Should the serviceSlug field on the Testimonial interface be removed?**
   - What we know: `serviceSlug` is defined on the `Testimonial` interface and is populated in testimonial data. It is only filtered by `getTestimonialsByService`, which is unused.
   - What's unclear: The field may be kept for future use, or it may be dead weight on every testimonial object.
   - Recommendation: Per CONTEXT.md, do NOT expand beyond the 4 named targets. Keep `serviceSlug` on the interface and data — removing it would be scope creep. Only remove the filter function.

---

## Sources

### Primary (HIGH confidence)
- Direct codebase audit — all findings are from live file reads and grep searches on the actual working tree
- `src/lib/vitals.ts` — read directly; confirmed no external imports
- `src/config/testimonials.ts` — read directly; confirmed getTestimonialsByService defined but unused
- `src/config/index.ts` — read directly; confirmed re-export of getTestimonialsByService
- `package.json` — read directly; confirmed web-vitals at ^5.1.0, no other consumers
- `api/` directory listing — confirmed contact.js and banner.js are absent
- grep across entire src tree for all target symbols

### Secondary (MEDIUM confidence)
- `.planning/milestones/v1.0-MILESTONE-AUDIT.md` — historical context on why api files are orphans

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new libraries; npm uninstall is a known operation
- Architecture: HIGH — direct codebase inspection, not inference
- Pitfalls: HIGH — identified from reading actual file structure and shared export lines

**Research date:** 2026-03-04
**Valid until:** Stable — dead code doesn't move; valid until implementation
