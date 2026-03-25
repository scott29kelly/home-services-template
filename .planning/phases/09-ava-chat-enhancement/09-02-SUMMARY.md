---
phase: 09-ava-chat-enhancement
plan: "02"
subsystem: ui
tags: [chat, ai, react, hooks, lead-capture, rate-limiting, context-aware, typescript]

# Dependency graph
requires:
  - phase: 09-01
    provides: chat-context.ts (getPageContext, buildSystemPrompt), enhanced api.ts (sendMessage with systemPrompt, history cap, 429 detection)
  - phase: 08-feature-flag-integration-polish
    provides: existing AvaWidget.tsx and Ava.tsx component foundations

provides:
  - src/hooks/useChatEnhancements.ts — shared hook with page context, lead capture state machine, rate limiting, escalation
  - src/components/ui/AvaWidget.tsx — enhanced floating widget using the shared hook
  - src/pages/Ava.tsx — enhanced full-page chat using the shared hook

affects: [future-ava-features, any-component-using-chat]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Shared custom hook pattern for chat: useChatEnhancements(initialGreeting) returns all chat state and handlers
    - useLocation() inside hook for automatic page context on navigation (no prop drilling)
    - Lead capture state machine via useRef (idle -> offered -> capturing-name -> capturing-phone -> capturing-email -> captured)
    - Client-side rate limiting via lastSendTimeRef timestamp comparison with RATE_LIMIT_MS = 2000
    - Local message injection for escalation ('Talk to a real person' never hits the API)
    - "Please wait..." placeholder swap on input when rateLimited (no error toast)

key-files:
  created:
    - src/hooks/useChatEnhancements.ts
  modified:
    - src/components/ui/AvaWidget.tsx
    - src/pages/Ava.tsx

key-decisions:
  - "useChatEnhancements hook uses useLocation() internally — components don't pass pathname as prop"
  - "Quick actions rendered after every last assistant message (not just when messages.length === 1)"
  - "'Talk to a real person' chip gets border border-brand-blue/20 to visually distinguish it from standard chips"
  - "Rate limit feedback: placeholder changes to 'Please wait...' and input/button disabled — no error message"
  - "Escalation path injects local message with company.phone and hours — no API call for this flow"
  - "Lead capture: AI drives the conversation; hook detects offering and extracts name/phone from replies"

patterns-established:
  - "Hook encapsulation pattern: all chat enhancement logic lives in one hook, components only handle UI-specific state (isOpen, refs)"
  - "Escalation injection pattern: exact string match 'Talk to a real person' routes to local message, bypasses sendMessage"
  - "Rate limit pattern: useRef timestamp + useState boolean; setTimeout clears rateLimited after remaining wait"

requirements-completed: [AVA-01, AVA-02, AVA-03]

# Metrics
duration: 6min
completed: 2026-02-26
---

# Phase 9 Plan 02: Ava Chat Component Integration Summary

**Shared useChatEnhancements hook wiring page-aware context, lead capture state machine, rate limiting, and escalation into both AvaWidget and Ava full-page chat with zero logic duplication**

## Performance

- **Duration:** ~6 min
- **Started:** 2026-02-26T15:06:04Z
- **Completed:** 2026-02-26T15:11:25Z
- **Tasks:** 3 (2 auto + 1 checkpoint:human-verify — approved)
- **Files modified:** 3

## Accomplishments

- Created `src/hooks/useChatEnhancements.ts` — unified hook encapsulating page context (useLocation + getPageContext/buildSystemPrompt), lead capture state machine (8 states, name→phone→email collection, submitForm() integration), client-side rate limit (2s with self-clearing timeout), and 'Talk to a real person' local message injection
- Refactored `src/components/ui/AvaWidget.tsx` to use the hook: removed inline state/send logic, quick actions now page-specific from hook, chips show after every assistant message (not just first), rate limit disables input with "Please wait..." placeholder
- Refactored `src/pages/Ava.tsx` identically to AvaWidget but using `pageGreeting` and without Escape handling (full page, not modal)
- Both components now have identical behavior with zero logic duplication — the hook is the single source of truth

## Task Commits

Each task was committed atomically:

1. **Task 1: Create useChatEnhancements hook and integrate into AvaWidget** - `6d21ecf` (feat)
2. **Task 2: Integrate useChatEnhancements into Ava full-page chat** - `1b2a173` (feat)
3. **Task 3: Verify Ava chat E2E flow** - checkpoint:human-verify approved by user

**Plan metadata:** `e4d6bbb` (docs: initial) / updated on checkpoint approval

## Files Created/Modified

- `src/hooks/useChatEnhancements.ts` - New: shared hook with all chat enhancement logic
- `src/components/ui/AvaWidget.tsx` - Refactored: uses hook, page-specific quick actions, persistent escalation chip, rate limit UI
- `src/pages/Ava.tsx` - Refactored: uses hook with pageGreeting, identical enhancement behavior

## Decisions Made

- useChatEnhancements uses `useLocation()` internally so components don't need to pass pathname — context updates automatically on navigation without any extra wiring
- Quick actions are shown after every last assistant message (not just the first) — makes escalation chip always accessible even deep in a conversation
- 'Talk to a real person' chip gets `border border-brand-blue/20` per plan spec to differentiate it visually while staying consistent with chip pattern
- Rate limit feedback is a placeholder change ("Please wait...") with input+button disabled — no error toast or banner, per CONTEXT.md "subtle" requirement
- Lead capture state machine in hook uses useRef (not useState) so state changes don't trigger re-renders; AI drives the conversation through the system prompt

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Removed dead code causing TS2367 type error in lead capture extraction**
- **Found during:** Task 2 verify (`npm run build`)
- **Issue:** Inside an `if` block already narrowing leadStateRef to capturing states, there was a redundant check `!== 'captured'` — TypeScript correctly flagged this as an unreachable comparison (TS2367)
- **Fix:** Removed the dead `if (hasEnough && leadStateRef.current !== 'captured')` branch — `tryExtractLeadData()` call was sufficient
- **Files modified:** `src/hooks/useChatEnhancements.ts`
- **Verification:** `npm run build` succeeded with zero errors after fix
- **Committed in:** `1b2a173` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 — bug)
**Impact on plan:** Auto-fix corrected dead code TypeScript would have caught in strict mode. No scope creep.

## Issues Encountered

None beyond the TS2367 dead-code fix above.

## User Setup Required

None — no new external services or environment variables required. All behavior uses the existing form-handler.ts submitForm() for lead capture, which was configured in Phase 3.

## Next Phase Readiness

- E2E flow is fully implemented and human-verified (Task 3 checkpoint approved 2026-02-26)
- Hook is designed to be backward-compatible: adding new states (e.g., 'declined-final' full flow) requires only hook changes, not component updates
- If lead capture needs tuning (e.g., pattern matching, state advancement heuristics), all changes are isolated to `useChatEnhancements.ts`
- Phase 9 is complete — Phase 10 (Performance Monitoring) is the only remaining phase

## Self-Check: PASSED

- FOUND: src/hooks/useChatEnhancements.ts
- FOUND: src/components/ui/AvaWidget.tsx (modified)
- FOUND: src/pages/Ava.tsx (modified)
- FOUND: .planning/phases/09-ava-chat-enhancement/09-02-SUMMARY.md
- FOUND: commit 6d21ecf (Task 1)
- FOUND: commit 1b2a173 (Task 2)
- CONFIRMED: Task 3 checkpoint:human-verify approved by user 2026-02-26

---
*Phase: 09-ava-chat-enhancement*
*Completed: 2026-02-26*
