# Phase 12: StickyMobileCTA Feature Flag Fix - Research

**Researched:** 2026-03-01
**Domain:** React conditional rendering / feature flag gating
**Confidence:** HIGH

---

## Summary

Phase 12 is a single-file, single-concern change: import `features` in `StickyMobileCTA.tsx` and conditionally render the Chat button only when `features.assistant` is true. The rest of the component — the Phone call link, the Free Quote CTA, scroll visibility logic, and Ava page detection — remains completely unchanged.

The gap (INT-01) was identified because Phase 11 gated the AvaWidget floating button behind `features.assistant` in `Layout.tsx`, but the Chat button inside the `StickyMobileCTA` bar was left unconditional. When a user sets `features.assistant = false`, the floating chat widget disappears but the Chat button in the mobile sticky bar survives, creating an inconsistency that breaks E2E Flow 4.

The fix pattern is already established in two other files in this codebase: `Contact.tsx` gates the booking tab with `features.onlineBooking`, and `Projects.tsx` gates the BeforeAfter slider with `features.beforeAfter`. Both import directly from `'../config/features'`. The `Layout.tsx` precedent uses the barrel (`'../../config'`). Either pattern is acceptable; the direct import is slightly simpler for a component that needs only `features`.

**Primary recommendation:** Import `features` from `'../../config/features'` in `StickyMobileCTA.tsx` and wrap the Chat button JSX in `{features.assistant && (...)}`. No other changes required.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| CFG-06 | Feature Flags System — Boolean config flags gate routes, navigation items, and component rendering. The integration gap is that StickyMobileCTA's Chat button bypasses `features.assistant`. | `features.ts` exports `features.assistant: boolean`. Import the object and use `{features.assistant && <button>}` inline conditional. Pattern already used in Contact.tsx (features.onlineBooking) and Projects.tsx (features.beforeAfter). |
</phase_requirements>

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React (JSX) | 18.x (project-locked) | Conditional rendering via `&&` short-circuit or ternary | Built-in; no dependency needed |
| `src/config/features.ts` | project file | Boolean feature flags object | Already established; `features.assistant` is the flag |

### Supporting

No additional libraries are needed. This phase installs nothing.

**Installation:**

```bash
# No installation required
```

---

## Architecture Patterns

### Existing StickyMobileCTA.tsx Structure

```
StickyMobileCTA.tsx
├── Imports: useState, useEffect, useLocation, Link, m, AnimatePresence, company
├── State: isVisible (scroll threshold gate)
├── Routing: isAvaPage (hides component entirely on /ava)
├── Scroll listener: shows/hides entire bar
└── JSX: AnimatePresence > m.div > flex row
    ├── Phone button (always shown)
    ├── Free Quote link (always shown)
    └── Chat button (currently always shown — THIS is the gap)
```

### Pattern 1: Direct Config Import (recommended for this file)

**What:** Import `features` directly from the features config module.
**When to use:** When the component only needs the feature flags object and not other config (seo, company, etc.).

```typescript
// Source: Contact.tsx line 11 and Projects.tsx line 11 — established project pattern
import { features } from '../../config/features'
```

### Pattern 2: Barrel Import (alternative — matches Layout.tsx)

**What:** Import `features` via the config barrel.
**When to use:** When the component already imports other things from the barrel (company, seo, etc.).

```typescript
// Source: Layout.tsx line 8 — established project pattern
import { features } from '../../config'
```

`StickyMobileCTA.tsx` currently imports `company` directly from `'../../config/company'`, not from the barrel. The direct-features import (`../../config/features`) is consistent with `Contact.tsx` and `Projects.tsx`, which also import `features` directly rather than via the barrel.

### Pattern 3: Inline Conditional Rendering (the gating technique)

**What:** Wrap the Chat button JSX in a short-circuit `&&` expression.
**When to use:** When the button should simply not appear when the flag is off (no placeholder, no empty space).

```typescript
// Source: Projects.tsx line 96 — established project pattern
{features.assistant && (
  <button
    onClick={handleOpenAvaChat}
    className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-navy hover:bg-slate-100 active:bg-slate-200 transition-colors min-w-[72px]"
  >
    <MessageSquare className="w-5 h-5 text-brand-blue" />
    <span className="text-[11px] font-semibold text-navy/70">Chat</span>
  </button>
)}
```

### Anti-Patterns to Avoid

- **CSS hiding instead of conditional rendering:** Do NOT add `hidden` or `display:none` to the Chat button. The project pattern (verified in Phase 11) is DOM removal via conditional rendering, not CSS hiding. Using `{features.assistant && ...}` causes React to skip the button entirely.
- **Importing from the wrong depth:** `StickyMobileCTA.tsx` is at `src/components/ui/` — the relative path to config is `../../config/features` (two levels up). Do not use `../config/features` (one level, incorrect).
- **Gating the entire StickyMobileCTA bar:** Only the Chat button is gated. Phone and Free Quote buttons are always visible regardless of assistant feature state. Wrapping the whole `<m.div>` in `{features.assistant && ...}` would incorrectly remove the call and quote CTAs.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Feature gating | Custom hook, context, HOC | Direct `features.assistant` import + `&&` | The `features` object is a plain static constant — no reactivity, no context needed; direct import is zero overhead |
| Import path resolution | Barrel re-export abstraction | Existing `../../config/features` path | Already established in Contact.tsx and Projects.tsx |

**Key insight:** Feature flags in this project are static config objects (plain TypeScript), not runtime-reactive state. No useContext, useFeature hook, or provider pattern is needed. A direct import + boolean check is the correct and established pattern.

---

## Common Pitfalls

### Pitfall 1: Wrong Import Path Depth

**What goes wrong:** TypeScript import error or wrong module resolved.
**Why it happens:** `StickyMobileCTA.tsx` is nested at `src/components/ui/`, requiring `../../` to reach `src/`. Using `../config/features` would attempt to resolve from `src/components/config/` which does not exist.
**How to avoid:** Use `../../config/features` — confirmed by the existing `import { company } from '../../config/company'` already in the file at line 5.
**Warning signs:** TypeScript error "cannot find module '../config/features'".

### Pitfall 2: Gating More Than the Chat Button

**What goes wrong:** Phone and Free Quote CTAs disappear when `features.assistant = false`, harming lead generation.
**Why it happens:** Misreading the scope — the goal is to hide only the Chat button, not the entire CTA bar.
**How to avoid:** The `{features.assistant && (...)}` conditional must wrap only the `<button onClick={handleOpenAvaChat}>` element (lines 76–83 in the current file), not the outer `<m.div>` or the `<div className="flex items-center justify-around">`.
**Warning signs:** After setting `features.assistant = false`, the sticky bar disappears completely instead of showing just the Phone and Free Quote options.

### Pitfall 3: Leaving the handleOpenAvaChat Function

**What goes wrong:** A lint/dead code warning if `handleOpenAvaChat` is defined but never referenced.
**Why it happens:** If the Chat button is gated, `handleOpenAvaChat` is only called conditionally — but since the `&&` expression still references it when `features.assistant = true`, it is NOT dead code. No change needed to the function itself.
**How to avoid:** Leave `handleOpenAvaChat` in place. It will still be called when the button renders. Only remove it if the button is fully deleted (which is not the goal here).

### Pitfall 4: Importing features from both sources

**What goes wrong:** Redundant imports or merge confusion if someone combines a barrel import that already includes features with a direct features import.
**Why it happens:** Not applicable here — the file currently only imports `company` directly. Adding one `features` import is clean.
**How to avoid:** Add a single import statement; do not combine with the existing `company` import line unless refactoring is explicitly desired.

---

## Code Examples

Verified patterns from the project codebase:

### Full Completed StickyMobileCTA.tsx (after fix)

```typescript
// Source: src/components/ui/StickyMobileCTA.tsx — final state after Phase 12
import { useState, useEffect } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { m, AnimatePresence } from 'framer-motion'
import { Phone, MessageSquare, FileText } from 'lucide-react'
import { company } from '../../config/company'
import { features } from '../../config/features'   // ADD THIS LINE

const SCROLL_THRESHOLD = 300

export default function StickyMobileCTA() {
  const [isVisible, setIsVisible] = useState(false)
  const { pathname } = useLocation()
  const isAvaPage = pathname === '/ava'

  useEffect(() => {
    if (isAvaPage) return
    const handleScroll = () => { setIsVisible(window.scrollY > SCROLL_THRESHOLD) }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isAvaPage])

  const handleOpenAvaChat = () => {
    window.dispatchEvent(new CustomEvent('open-ava-chat'))
  }

  if (isAvaPage) return null

  return (
    <AnimatePresence>
      {isVisible && (
        <m.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 400, damping: 35 }}
          className="fixed bottom-0 left-0 right-0 z-40 md:hidden"
        >
          <div className="bg-white/95 backdrop-blur-md border-t border-border/60 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] rounded-t-2xl pb-[env(safe-area-inset-bottom)]">
            <div className="flex items-center justify-around px-3 py-2.5 max-w-lg mx-auto">
              {/* Phone — always visible */}
              <a href={`tel:${company.phone}`} className="...">
                <Phone className="w-5 h-5 text-brand-blue" />
                <span className="text-[11px] font-semibold text-navy/70">Call</span>
              </a>

              {/* Free Quote — always visible */}
              <Link to="/contact" className="...">
                <FileText className="w-4 h-4" />
                <span className="text-sm font-bold whitespace-nowrap">Free Quote</span>
              </Link>

              {/* Chat — gated by features.assistant */}
              {features.assistant && (
                <button onClick={handleOpenAvaChat} className="...">
                  <MessageSquare className="w-5 h-5 text-brand-blue" />
                  <span className="text-[11px] font-semibold text-navy/70">Chat</span>
                </button>
              )}
            </div>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  )
}
```

### Analogous Pattern from Projects.tsx (verified working)

```typescript
// Source: src/pages/Projects.tsx line 11 and line 96
import { features } from '../config/features'

// ...

{features.beforeAfter && (
  <BeforeAfterSlider beforeImage={project.beforeAfter.before} afterImage={project.beforeAfter.after} />
)}
```

### Analogous Pattern from Layout.tsx (verified working, Phase 11)

```typescript
// Source: src/components/layout/Layout.tsx line 8 and line 13
import { features } from '../../config'

const showAvaWidget = pathname !== '/ava' && features.assistant

// ...

{showAvaWidget && <AvaWidget />}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| AvaWidget always rendered | AvaWidget gated by `features.assistant && pathname check` in Layout.tsx | Phase 11 (2026-02-28) | DOM removal confirmed; E2E Flow 4 partially fixed |
| Chat button in StickyMobileCTA always rendered | Chat button gated by `{features.assistant && ...}` | Phase 12 (this phase) | Completes E2E Flow 4 fix; INT-01 closed |

---

## Open Questions

None. The change is fully understood, the pattern is established, and no ambiguity exists.

---

## Validation Architecture

> `workflow.nyquist_validation` is not present in `.planning/config.json` (key absent). Treating as false — Validation Architecture section is **included** for completeness but no automated test framework is configured in this project.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None — no jest/vitest config detected in project |
| Config file | None |
| Quick run command | `npx tsc --noEmit` (TypeScript only) |
| Full suite command | `npx tsc --noEmit` |
| Estimated runtime | ~5 seconds |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CFG-06 | `features.assistant = false` hides Chat button in StickyMobileCTA | manual | Set flag, run dev server, scroll to trigger CTA bar, confirm Chat button absent | N/A — no test file |
| CFG-06 | `features.assistant = true` (default) shows Chat button | manual | Default state; scroll, confirm all 3 buttons visible | N/A — no test file |
| CFG-06 | TypeScript compiles cleanly after import addition | automated | `npx tsc --noEmit` | existing tsconfig |

### Nyquist Sampling Rate

- **Minimum sample interval:** After the single task commits → run: `npx tsc --noEmit`
- **Full suite trigger:** Before verification
- **Phase-complete gate:** TypeScript clean + manual browser check

### Wave 0 Gaps

None — no new test infrastructure is required. The change is verifiable by:
1. TypeScript compilation (`npx tsc --noEmit`) — automated
2. Browser inspection of the sticky bar with `features.assistant = false` — manual

---

## Sources

### Primary (HIGH confidence)

- `src/components/ui/StickyMobileCTA.tsx` — full file read; current structure, imports, Chat button location confirmed
- `src/config/features.ts` — full file read; `features.assistant: true` (default) confirmed
- `src/components/layout/Layout.tsx` — full file read; Phase 11 AvaWidget gating pattern confirmed
- `src/App.tsx` — full file read; barrel import pattern `import { features } from './config'` confirmed
- `src/pages/Contact.tsx` (grep) — direct import pattern `import { features } from '../config/features'` confirmed
- `src/pages/Projects.tsx` (grep) — direct import + `{features.beforeAfter && ...}` inline conditional confirmed
- `src/config/index.ts` — full file read; barrel re-exports `features` from `./features` confirmed
- `.planning/phases/11-final-gap-closure-cleanup/11-VERIFICATION.md` — Phase 11 scope and INT-01 origin confirmed

### Secondary (MEDIUM confidence)

None needed — all facts drawn from direct codebase reads.

### Tertiary (LOW confidence)

None.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — direct codebase inspection; no external dependencies
- Architecture: HIGH — two identical patterns already exist in production code (Contact.tsx, Projects.tsx)
- Pitfalls: HIGH — path depth is mechanically verifiable from existing import on line 5 of the file; scope pitfall is obvious from reading the component structure

**Research date:** 2026-03-01
**Valid until:** Indefinite — this is a static codebase change; no external library versions involved
