# Phase 7: Foundation Verification & Tech Debt Cleanup - Research

**Researched:** 2026-02-25
**Domain:** Code inspection, verification documentation, dead code removal
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Verification evidence**
- Verify each CFG requirement by inspecting the codebase against its acceptance criteria checkboxes
- Evidence per criterion: reference the specific file(s) and code that satisfy each checkbox
- Mark checkboxes in REQUIREMENTS.md as verified (checked) as part of this phase
- No automated test suite required — manual code inspection with documented findings is sufficient for pre-GSD work

**Failure handling**
- If a CFG criterion is not satisfied, document the gap in VERIFICATION.md with severity (critical/minor)
- Minor gaps (cosmetic, non-functional): document and defer — do not fix in this phase
- Critical gaps (broken functionality, missing core behavior): flag for immediate attention but do not expand phase scope — create a follow-up item instead
- Pass/fail is per-checkbox, not per-requirement — partial passes are expected and fine to document

**Cleanup discovery scope**
- Stick strictly to the listed tech debt items: remove `getPostsByTag()` dead code, fix noindex meta tag placement
- If related issues are discovered during verification, document them in VERIFICATION.md under a "Discovered Issues" section but do not fix them
- This keeps the phase predictable and LOW complexity as estimated

**VERIFICATION.md structure**
- One section per requirement (CFG-01 through CFG-06)
- Each section: requirement name, acceptance criteria checkboxes with pass/fail, evidence (file paths and brief explanation)
- Summary section at top with overall pass rate
- Discovered issues section at bottom if any

### Claude's Discretion
- Exact wording of verification evidence
- Order of verification (can verify in any logical sequence)
- Level of detail in evidence descriptions — enough to be convincing, not exhaustive
- How to structure the SEO-01 checkbox updates

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

---

## Summary

Phase 7 is a verification and cleanup phase with no new feature development. The work divides into three parts: (1) formal verification of the six CFG requirements against their acceptance criteria, producing a VERIFICATION.md for Phase 01; (2) updating REQUIREMENTS.md traceability for SEO-01; and (3) closing two specific tech debt items from the milestone audit.

Codebase inspection reveals CFG-01 through CFG-05 are substantially implemented and will likely pass most or all acceptance criteria. CFG-06 has a known partial gap: the `features.beforeAfter` flag referenced in the acceptance criteria does not exist in `src/config/features.ts`. Additionally, the `features.assistant` flag exists but does not gate the Ava nav link in `navigation.ts` — this is a secondary gap worth documenting.

Of the two tech debt items: `getPostsByTag()` is confirmed dead code (exported in `src/lib/blog.ts` but imported nowhere) and can be removed safely. The noindex placement fix is already complete — it was applied during Phase 5 (decision log entry 2026-02-24: "noindex prop on PageMeta replaces standalone meta tag in ThankYou"). The planner should verify this before treating it as remaining work, and if already done, mark it as resolved in VERIFICATION.md rather than re-doing it.

**Primary recommendation:** Execute verification by requirement in order (CFG-01 through CFG-06), document all evidence in VERIFICATION.md with honest pass/fail per checkbox, update REQUIREMENTS.md checkboxes, remove dead code, and verify the noindex fix is already applied before doing any work on it.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| CFG-01 | Modular Config System — split `site.ts` into 10+ domain files with Zod validation | Config directory has 13+ domain files confirmed; Zod schemas in `schema.ts` validate 8 configs; `SITE` barrel export exists |
| CFG-02 | Config-Driven Navigation — Header/Footer links from config; feature-flagged pages appear/disappear | `navigation.ts` functions confirmed; Header/Footer confirmed to use them; blog/financing flags tested in nav; Ava link may not be gated |
| CFG-03 | Config-Driven Routing — Routes from services array; single `ServicePage.tsx`; no per-service files | `route-generator.ts` and `App.tsx` confirmed; city pages via parameterized route; 404 catch-all confirmed |
| CFG-04 | Content Migration to Config — testimonials, projects, FAQ, team data in config files | `testimonials.ts`, `projects.ts`, `team.ts` confirmed; FAQ in service configs confirmed; About.tsx imports from `team.ts` |
| CFG-05 | 404 Page — styled 404 inside Layout; nav links; phone CTA; noindex | `NotFound.tsx` exists with styling and nav links; noindex via PageMeta; phone CTA may be missing (Go Back + Go Home buttons only) |
| CFG-06 | Feature Flags System — flags for blog, assistant, cityPages, beforeAfter; disabling removes route/nav | `features.ts` confirmed for blog/assistant/financingCalculator/onlineBooking/cityPages; `beforeAfter` flag is MISSING |
</phase_requirements>

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| TypeScript (built-in) | project-native | Type-checked file inspection | Already in project; grep + Read tools are sufficient |
| Zod | project-native | Config validation — already in use | Existing validation infrastructure to verify against |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| None needed | — | — | This phase is code inspection + doc writing, no new libraries |

**Installation:** No new packages required.

---

## Architecture Patterns

### Phase 01 Directory Structure (to be created)

```
.planning/phases/01-foundation-config-refactor/
└── 01-VERIFICATION.md    # Must create — no other files exist for Phase 01
```

Phase 01 has no existing planning directory. It was pre-GSD work. The planner must create the directory and VERIFICATION.md from scratch.

### VERIFICATION.md Structure (follow Phase 02 pattern)

The existing Phase 02, 03, 04, and 05 VERIFICATION.md files establish the project pattern. For a retrospective verification (Phase 01 pre-GSD), adapt the structure as follows:

```markdown
---
phase: 01-foundation-config-refactor
verified: [ISO timestamp]
status: passed | partial | failed
score: N/M checkboxes verified
---

# Phase 1: Foundation & Config Refactor Verification Report

## Summary

| Requirement | Checkboxes | Pass Rate | Status |
|-------------|------------|-----------|--------|
| CFG-01 | N/M | N% | PASSED / PARTIAL |
...

## CFG-01: Modular Config System

### Acceptance Criteria

| Criterion | Status | Evidence |
|-----------|--------|----------|
| Config split into 10+ domain-specific files | PASS | `src/config/` has 13 files... |
...

## Discovered Issues
(if any)
```

### REQUIREMENTS.md Checkbox Update Pattern

Boxes are updated in place. Each `- [ ]` becomes `- [x]` only for criteria that are confirmed satisfied. Partial passes leave some unchecked. The existing Phase 02 pattern in REQUIREMENTS.md (marking `[COMPLETE]` in the heading and checking all boxes) is the reference.

### Dead Code Removal Pattern

`getPostsByTag()` in `src/lib/blog.ts` lines 92-94:

```typescript
// REMOVE these lines entirely:
export function getPostsByTag(tag: string): BlogPost[] {
  return getAllPosts().filter((p) => p.tags.includes(tag))
}
```

Confirmed dead: exported but not imported in any file under `src/`. The function's use case is covered by `getAllTags()` + tag-based URL filtering in `ResourcesIndex.tsx` (which uses `useSearchParams` and filters inline, not via this function).

---

## Pre-Verification Findings (Critical Research)

These findings from codebase inspection directly determine what the verifier will encounter. Treat as HIGH confidence.

### CFG-01: Modular Config System — Expected PASS (5/5)

**Evidence found:**
- Config split: 13 domain files exist in `src/config/`: `company.ts`, `services.ts`, `service-areas.ts`, `testimonials.ts`, `projects.ts`, `team.ts`, `assistant.ts`, `seo.ts`, `features.ts`, `theme.ts`, `forms.ts`, `financing.ts`, `banner.ts` + `navigation.ts` + `schema.ts` + `index.ts`
- Zod schemas: `schema.ts` defines schemas for company, services, testimonials, projects, team, serviceAreas, assistant, cityPages — validated at import via `index.ts`
- Invalid config error messages: `validate()` function in `index.ts` catches Zod errors with `console.error` and rethrows — React does not crash silently
- SITE backward compat: `src/config/site.ts` re-assembles the legacy `SITE` shape from modular configs, exported as `export const SITE`
- All components render: standard build verification

**Confidence:** HIGH — all 5 criteria have direct code evidence.

### CFG-02: Config-Driven Navigation — Expected PARTIAL (4/5 or 5/5)

**Evidence found:**
- Header nav: `Header.tsx` calls `getNavLinks()` from `navigation.ts` (line 8). Zero hardcoded link arrays in Header.tsx.
- Footer links: `Footer.tsx` calls `getFooterServiceLinks()` and `getFooterCompanyLinks()` from `navigation.ts`. Zero hardcoded link arrays.
- Services dropdown: `navigation.ts` line 21 — `services.map((s) => ({ href: '/${s.slug}', label: s.navLabel }))` — generated from services config.
- Adding a service auto-appears: adding to `services.ts` triggers `getNavLinks()`/`getFooterServiceLinks()` to include it automatically.
- Feature-flagged pages: `blog` and `financingCalculator` flags gate nav entries in `navigation.ts`. However, the `features.assistant` flag is NOT used to gate the "Ask Ava" nav link — it appears unconditionally.

**Gap:** The `features.assistant` criterion check ("Feature-flagged pages appear/disappear based on features.ts") is ambiguous. The "Ask Ava" page exists, the assistant flag exists, but the nav link is hardcoded in `navigation.ts`. This is a minor gap — the flag works for blog/financing but not for the Ava nav link.

**Confidence:** HIGH for the evidence; the assistant nav flag gap is documented, not speculative.

### CFG-03: Config-Driven Routing — Expected PASS (5/5)

**Evidence found:**
- Routes from config: `App.tsx` calls `getServiceRoutes()` which maps `services.map()` to route objects. Rendered as `{serviceRoutes.map(route => <Route path={route.path} element={<ServicePage />} />)}`
- Single ServicePage.tsx: `ServicePage.tsx` uses `useLocation()` to extract slug, calls `getServiceBySlug(slug)` — one component serves all services
- Zero code per new service: config entry only needed; component handles all slugs
- Existing URLs: `/roofing`, `/siding`, `/storm-damage` are in `services.ts` config, so routes are generated
- 404 catch-all: `App.tsx` line 66: `<Route path="*" element={<NotFound />} />`

**Confidence:** HIGH — all criteria have direct code evidence.

### CFG-04: Content Migration to Config — Expected PASS (5/5)

**Evidence found:**
- Testimonials: `src/config/testimonials.ts` holds all testimonial data; `featured` flag controls homepage vs. full-page
- No duplication: `featured` array in `testimonials.ts` is the source; components filter from this
- Projects: `src/config/projects.ts` holds project items; `Projects.tsx` imports from config
- FAQ data: each service object in `services.ts` has a `faqs` object with `title` and `items` array
- Team: `src/config/team.ts` holds `members`, `values`, `certifications`; `About.tsx` imports from `team.ts`

**Confidence:** HIGH — all criteria have direct code evidence.

### CFG-05: 404 Page — Expected PARTIAL (3/4)

**Evidence found:**
- Unknown URLs render 404: `App.tsx` catch-all route routes to `<NotFound>` which renders inside `<Layout />`
- Navigation links: `NotFound.tsx` includes "Go Home" (`Link to="/"`) and "Go Back" (`window.history.back()`)
- Phone CTA: **MISSING** — `NotFound.tsx` has no phone number or `tel:` link. The page has "Go Home" and "Go Back" CTAs only.
- noindex: `PageMeta` with `noindex` prop is present on line 8 of `NotFound.tsx`

**Gap:** The "404 page includes phone CTA" criterion is NOT satisfied. The page has navigation links but no phone call-to-action. Per failure handling decisions: document as a gap with severity minor (the 404 page is functional and the missing phone CTA is cosmetic/non-critical). Do not fix in this phase.

**Confidence:** HIGH — absence of phone CTA is confirmed by direct file read.

### CFG-06: Feature Flags System — Expected PARTIAL (2/3)

**Evidence found:**
- Flags exist: `features.blog`, `features.assistant`, `features.financingCalculator`, `features.onlineBooking`, `features.cityPages` confirmed in `src/config/features.ts`
- `features.beforeAfter` flag: **MISSING** — not in `features.ts`. The CFG-06 acceptance criterion requires this flag.
- Disabling removes route/nav: `features.blog` removes Resources route and nav link (verified in App.tsx + navigation.ts). `features.cityPages` removes city page routes. `features.financingCalculator` removes Financing route and nav link. `features.assistant` does NOT remove the Ava nav link (hardcoded in navigation.ts).
- All features enabled by default: all 5 existing flags are set to `true`

**Gap 1 (critical):** `features.beforeAfter` flag does not exist. The acceptance criterion specifically lists it. This is a structural omission — the before/after section in Projects.tsx is always rendered and cannot be toggled via config. Per failure handling: document as minor gap (Projects page still works; the missing flag is a configurability gap not a broken feature).

**Gap 2 (minor):** `features.assistant` exists but does not gate the Ava nav link. Ava page route is not feature-gated either (`App.tsx` line 54 has no conditional). The assistant flag is documented in features.ts but does not control its stated purpose.

**Confidence:** HIGH — gaps confirmed by direct file inspection.

---

## Tech Debt Item Status

### Item 1: Remove `getPostsByTag()` dead code from `src/lib/blog.ts`

**Status: CONFIRMED DEAD CODE — NEEDS REMOVAL**

- `getPostsByTag()` is defined at lines 92-94 of `src/lib/blog.ts`
- Grep for `getPostsByTag` across all of `src/` returns exactly one hit: the definition itself
- No file imports or calls this function
- `ResourcesIndex.tsx` does its own inline tag filtering via `useSearchParams` — it does not use this function
- Safe to delete: remove lines 92-94 (the entire function including its JSDoc comment at line 89-91)

### Item 2: Fix noindex meta tag placement in `src/pages/ThankYou.tsx`

**Status: ALREADY RESOLVED — VERIFY BEFORE DOING ANY WORK**

- `ThankYou.tsx` currently has `noindex` correctly placed as a prop on `PageMeta` (line 17)
- `PageMeta.tsx` handles the `noindex` prop at line 32: `{noindex && <meta name="robots" content="noindex, nofollow" />}`
- The STATE.md decision log (2026-02-24) explicitly records: "noindex prop on PageMeta replaces standalone meta tag in ThankYou — Cleaner API, single source of truth for robots meta"
- This fix was applied during Phase 5 plan execution

**Action for planner:** Create a task that verifies the noindex placement is already correct, documents it as resolved in VERIFICATION.md's tech debt section, and marks the checkbox in STATE.md. Do NOT create a task to "fix" something that is already fixed.

---

## SEO-01 Checkbox Status

**Status: ALREADY FULLY CHECKED — VERIFY BEFORE UPDATING**

All 7 SEO-01 acceptance criteria checkboxes in REQUIREMENTS.md are already `[x]` (checked). The phase description says "Update SEO-01 checkboxes in REQUIREMENTS.md (verified satisfied, checkboxes not updated)" — but inspection shows they are already updated.

**Action for planner:** Create a verification task that confirms SEO-01 checkboxes are already `[x]`, and document this as a pre-existing resolution. If any are discovered to be `[ ]` during plan execution, update them. Otherwise, record as "already satisfied."

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Verification documentation | Custom verification framework | Follow Phase 02 VERIFICATION.md format exactly | Consistent with project conventions; planner/verifier agents expect this format |
| Config traceability | New tracking system | Direct REQUIREMENTS.md checkbox editing | GSD project convention; other phases all use this |

**Key insight:** This phase is documentation and one file edit. No tooling, no automation, no framework.

---

## Common Pitfalls

### Pitfall 1: Treating "noindex fix" as Remaining Work
**What goes wrong:** Planner creates a task to move noindex into PageMeta — but it's already there.
**Why it happens:** The phase description lists it as a tech debt item without noting it was already resolved during Phase 5.
**How to avoid:** Verify ThankYou.tsx noindex placement before creating a fix task. Create a "verify and document resolution" task instead of a "fix" task.
**Warning signs:** If a task says "move noindex prop into PageMeta in ThankYou.tsx," that task would make no change — the code is already correct.

### Pitfall 2: Missing the CFG-06 `beforeAfter` Flag Gap
**What goes wrong:** Verifier marks CFG-06 as fully passed because 4 of 5 listed flags exist.
**Why it happens:** The `features.ts` file has 5 flags but `beforeAfter` is not one of them. The criterion specifically lists it.
**How to avoid:** Count and match the exact flags listed in CFG-06 criteria against what's in features.ts.
**Warning signs:** CFG-06 criterion: "features.blog, features.assistant, features.cityPages, features.beforeAfter flags exist."

### Pitfall 3: Creating Phase 01 Directory in the Wrong Location
**What goes wrong:** VERIFICATION.md created at `.planning/phases/01-VERIFICATION.md` instead of inside a subdirectory.
**Why it happens:** Phase 01 has no existing directory — easy to create the file at the wrong level.
**How to avoid:** Create `.planning/phases/01-foundation-config-refactor/01-VERIFICATION.md` — matching the naming convention of all other phases.
**Warning signs:** Check that the path matches `{N}-{phase-slug}/` subdirectory pattern.

### Pitfall 4: Over-documenting Evidence
**What goes wrong:** Evidence for each criterion becomes an exhaustive code review taking multiple hours.
**Why it happens:** Thoroughness instinct; trying to prove every edge case.
**How to avoid:** Evidence should be "enough to be convincing, not exhaustive" (per CONTEXT.md decisions). File path + line reference + one sentence is sufficient.

### Pitfall 5: Marking CFG-05 Phone CTA as Minor When It Could Be Considered Core
**What goes wrong:** Unclear whether a missing phone CTA on 404 is minor or critical.
**Why it happens:** "Includes phone CTA" sounds functional but a 404 page works without it.
**How to avoid:** Per failure handling decisions: "Minor gaps (cosmetic, non-functional): document and defer." A missing phone number on a 404 page does not break functionality. Mark as minor gap. Per page behavior is unchanged — users can still navigate home or back.

---

## Code Examples

### CFG-06 Gap Evidence

```typescript
// src/config/features.ts — ACTUAL STATE
export const features = {
  assistant: true,        // exists
  blog: true,             // exists
  financingCalculator: true, // exists (name differs from acceptance criteria wording)
  onlineBooking: true,    // exists (not listed in CFG-06 criteria)
  cityPages: true,        // exists
  // beforeAfter: true    // MISSING — not defined anywhere
}

// CFG-06 acceptance criteria requires: features.beforeAfter
// The flag does not exist — partial pass on criterion 1
```

### Dead Code to Remove

```typescript
// src/lib/blog.ts — REMOVE LINES 89-94 ENTIRELY:

/**
 * Returns all published posts that include the given tag.
 */
export function getPostsByTag(tag: string): BlogPost[] {
  return getAllPosts().filter((p) => p.tags.includes(tag))
}
```

### Already-Resolved noindex (for documentation only)

```typescript
// src/pages/ThankYou.tsx — ALREADY CORRECT:
<PageMeta
  title="Thank You"
  description="Your request has been received. We'll be in touch within 24 hours."
  path="/thank-you"
  noindex              // ← already in PageMeta, not a standalone <meta> tag
/>
```

### Phase 01 Directory Creation

```
.planning/phases/01-foundation-config-refactor/
```

No files exist here. The planner must create this directory and `01-VERIFICATION.md`.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Monolithic `site.ts` | 13+ modular config files + barrel export | Phase 01 | This is what CFG-01 through CFG-06 verify |
| Standalone `<meta name="robots">` in ThankYou | `noindex` prop on PageMeta | Phase 05 (2026-02-24) | Tech debt item already resolved |

---

## Open Questions

1. **SEO-01 checkboxes in REQUIREMENTS.md**
   - What we know: All 7 SEO-01 acceptance criteria appear to be already `[x]` checked
   - What's unclear: The phase description says "checkboxes not updated" — possible the researcher read an older version
   - Recommendation: Planner should create a verification task: inspect SEO-01 section in REQUIREMENTS.md, confirm all checkboxes are `[x]`, and document resolution. No checkbox updates may be needed.

2. **CFG-02 assistant flag gap severity**
   - What we know: `features.assistant` exists but the Ava nav link is unconditional in `navigation.ts`; the assistant page route is also not gated
   - What's unclear: Was this intentional (Ava is always available) or an oversight?
   - Recommendation: Document as discovered issue in VERIFICATION.md. The criterion says "Feature-flagged pages (blog, AI assistant) appear/disappear based on features.ts" — technically the assistant does not disappear when the flag is toggled. Mark this acceptance criterion as PARTIAL. Do not fix.

3. **CFG-05 phone CTA — "navigation links" interpretation**
   - What we know: NotFound.tsx has "Go Home" and "Go Back" buttons but no phone number
   - What's unclear: Does "navigation links to key pages" satisfy the full intent even without a phone CTA?
   - Recommendation: The acceptance criteria has TWO separate bullets: "includes navigation links to key pages" (PASS) and "includes phone CTA" (FAIL). Score them separately.

---

## Sources

### Primary (HIGH confidence)
- Direct file inspection: `src/config/features.ts` — confirmed flags present/absent
- Direct file inspection: `src/config/navigation.ts` — confirmed nav generation pattern
- Direct file inspection: `src/pages/NotFound.tsx` — confirmed phone CTA absence
- Direct file inspection: `src/pages/ThankYou.tsx` — confirmed noindex already in PageMeta
- Direct file inspection: `src/lib/blog.ts` lines 92-94 — confirmed getPostsByTag definition
- Grep search: `getPostsByTag` across all `src/` — confirmed zero call sites
- Direct file inspection: `.planning/REQUIREMENTS.md` SEO-01 section — confirmed all checkboxes `[x]`
- Direct file inspection: `.planning/STATE.md` decision log — confirms noindex fix applied 2026-02-24
- Reference: `.planning/phases/02-visual-polish-performance/02-VERIFICATION.md` — established format pattern

### Secondary (MEDIUM confidence)
- Pattern inference from Phase 02/03/04/05 VERIFICATION.md files for structural conventions

### Tertiary (LOW confidence)
- None

---

## Metadata

**Confidence breakdown:**
- CFG-01 through CFG-05 pre-verification findings: HIGH — direct codebase inspection
- CFG-06 gap findings: HIGH — features.ts has been read directly, `beforeAfter` flag confirmed absent
- Tech debt item 1 (dead code): HIGH — grep confirms zero usage
- Tech debt item 2 (noindex): HIGH — ThankYou.tsx read directly; STATE.md confirms resolution
- SEO-01 checkbox status: HIGH — REQUIREMENTS.md read directly, all checkboxes observed as `[x]`

**Research date:** 2026-02-25
**Valid until:** Indefinite — based on static codebase inspection, not external APIs
