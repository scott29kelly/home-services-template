---
phase: 09-ava-chat-enhancement
plan: "01"
subsystem: api
tags: [chat, ai, cors, context, typescript, groq, anthropic, cloudflare-workers, vercel]

# Dependency graph
requires:
  - phase: 03-lead-generation
    provides: company config, services config used for building system prompts
  - phase: 08-feature-flag-integration-polish
    provides: assistant feature flag and existing AvaWidget/api.ts foundation
provides:
  - src/lib/chat-context.ts — page context mapper and dynamic system prompt builder
  - src/lib/api.ts — enhanced sendMessage with systemPrompt param, history cap, 429 detection, enriched demo responses
  - api/chat.js — CORS-restricted Vercel handler with systemPrompt passthrough
  - api/worker.js — CORS-restricted Cloudflare Anthropic handler with systemPrompt passthrough
  - api/worker-groq.js — CORS-restricted Cloudflare Groq handler with systemPrompt passthrough
affects: [09-02-ava-chat-components, future-ava-features]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Dynamic CORS origin using ALLOWED_ORIGIN env var with dev fallback (no wildcard in production)
    - Client-side + server-side double message history cap (.slice(-10))
    - 429 graceful degradation to demo mode with demoMode flag in return type
    - Page-context-aware system prompt injection via optional sendMessage parameter
    - Lead capture language woven into all demo mode responses

key-files:
  created:
    - src/lib/chat-context.ts
  modified:
    - src/lib/api.ts
    - api/chat.js
    - api/worker.js
    - api/worker-groq.js

key-decisions:
  - "Dynamic CORS uses ALLOWED_ORIGIN env var — dev allows any origin, production restricts to configured domain"
  - "Vary: Origin header added to all API files (required when Access-Control-Allow-Origin is dynamic)"
  - "demoMode boolean added to sendMessage return type so components can optionally detect demo state"
  - "Every quick action set ends with 'Talk to a real person' as final item per CONTEXT.md locked decision"
  - "System prompt silently incorporates page context — no AI announcement of page awareness per CONTEXT.md"

patterns-established:
  - "Page context pattern: getPageContext(pathname) -> PageContext { pageName, pageUrl, quickActions }"
  - "System prompt pattern: buildSystemPrompt(pathname) -> full contextual prompt string"
  - "API passthrough pattern: client sends systemPrompt in body, server uses systemPrompt || SYSTEM_PROMPT fallback"
  - "History cap pattern: client caps at 10 before send, server caps again as safety layer"

requirements-completed: [AVA-01, AVA-03]

# Metrics
duration: 5min
completed: 2026-02-26
---

# Phase 9 Plan 01: Ava Chat Infrastructure Summary

**Page-context mapper (chat-context.ts), enriched demo responses with lead capture, 429 graceful degradation, and CORS hardening across all 3 API backends**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-02-26T14:57:58Z
- **Completed:** 2026-02-26T15:02:17Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments

- Created `src/lib/chat-context.ts` with `getPageContext()` mapping all routes (service pages, static pages, city pages) to page-specific names and quick actions — with 'Talk to a real person' always last
- Built `buildSystemPrompt()` that dynamically includes company name, services list, hours, phone, service area, certifications, and lead capture instructions without triggering page-awareness announcements
- Enhanced `sendMessage()` with optional `systemPrompt` param, 10-message history cap, 429 -> demo mode graceful degradation, and `demoMode` boolean in return type
- Enriched all demo responses with natural lead capture language; added roof, siding, gutter keyword responses
- Replaced wildcard CORS (`*`) with dynamic `ALLOWED_ORIGIN` env var pattern across all 3 API files, preserving dev experience while enabling production hardening

## Task Commits

Each task was committed atomically:

1. **Task 1: Create chat-context utility and enhance api.ts** - `0947e27` (feat)
2. **Task 2: Harden CORS and add systemPrompt passthrough in API files** - `932b6c1` (feat)

**Plan metadata:** (docs commit — see below)

## Files Created/Modified

- `src/lib/chat-context.ts` - New: page context mapper with getPageContext() and buildSystemPrompt() exports
- `src/lib/api.ts` - Enhanced: systemPrompt param, history cap, 429 detection, enriched demo responses
- `api/chat.js` - CORS hardened: dynamic ALLOWED_ORIGIN, Vary header, systemPrompt passthrough, server-side message cap
- `api/worker.js` - CORS hardened: dynamic ALLOWED_ORIGIN (env.ALLOWED_ORIGIN), Vary header, systemPrompt passthrough, server-side message cap
- `api/worker-groq.js` - CORS hardened: dynamic ALLOWED_ORIGIN (env.ALLOWED_ORIGIN), Vary header, systemPrompt passthrough, server-side message cap

## Decisions Made

- Dynamic CORS origin pattern chosen over static allowlist — simpler config: one env var controls production restriction
- `demoMode` boolean added to sendMessage return value so components in Plan 02 can optionally surface different UI state without requiring it
- Service page quick actions follow pattern: `['Get a {service} quote', 'Emergency service?', 'How does insurance work?', 'Talk to a real person']`
- System prompt uses template literal with Ava persona kept at top, visitor context block in middle, behavioral guidelines at end

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - TypeScript compilation passed with zero errors on first attempt, full build succeeded.

## User Setup Required

None - no external service configuration required for this infrastructure plan. API files already accept ALLOWED_ORIGIN env var; users set it at deployment time.

## Next Phase Readiness

- Chat context infrastructure is complete and ready for Plan 02 component integration
- `getPageContext()` and `buildSystemPrompt()` are exported and typed for AvaWidget and Ava page consumption
- `sendMessage()` signature is backward-compatible (systemPrompt is optional)
- All 3 API backends accept systemPrompt from the client body with proper fallback

## Self-Check: PASSED

- FOUND: src/lib/chat-context.ts
- FOUND: src/lib/api.ts
- FOUND: api/chat.js
- FOUND: api/worker.js
- FOUND: api/worker-groq.js
- FOUND: .planning/phases/09-ava-chat-enhancement/09-01-SUMMARY.md
- FOUND: commit 0947e27 (Task 1)
- FOUND: commit 932b6c1 (Task 2)

---
*Phase: 09-ava-chat-enhancement*
*Completed: 2026-02-26*
