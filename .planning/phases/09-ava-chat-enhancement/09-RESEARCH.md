# Phase 9: Ava Chat Enhancement - Research

**Researched:** 2026-02-26
**Domain:** React chat widget, AI system prompts, lead capture flow, CORS/rate limiting
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Context-Aware Chat Behavior**
- Silently tailor Ava's system prompt based on current page — do NOT explicitly announce page awareness (e.g., don't say "I see you're on our plumbing page")
- Quick actions (suggestion chips) should be page-specific: service pages show relevant actions (e.g., "Get a plumbing quote", "Emergency service?"), homepage shows general actions
- Pass full business context to system prompt: current page name/URL, list of available services, AND business details (hours, phone number, service area) so Ava can answer operational questions
- Context updates on navigation — if user navigates to a different page mid-conversation, Ava's system prompt updates to reflect the new page

**Lead Capture Flow**
- Natural transition to lead capture after approximately 2-3 exchanges, but flexible — Ava should read the conversation and find a natural transition point rather than rigidly counting turns. More exchanges are fine if the conversation hasn't reached a natural capture moment
- Collect contact info conversationally, one field at a time (not all at once): name first, then phone, then email
- Name and phone number are required; email is optional
- If visitor declines: continue chatting and try once more later at a natural point. If declined a second time, offer the business phone number or contact page link as alternatives

**Escalation Experience**
- "Talk to a real person" is always visible as a quick action chip (not hidden or delayed)
- Tapping it shows the business phone number with a click-to-call link
- Chat stays open after showing the phone number — user can continue chatting if they prefer
- Placement: as a quick action chip alongside other suggestions, consistent with existing chat patterns

**Rate Limit & Degradation UX**
- Client-side rate limit (1 msg per 2 seconds): subtle send-button disable with a "Please wait..." hint. No error message — just a brief pause
- Server 429 response triggers demo mode: switch to pre-written canned responses that still feel natural and helpful (e.g., service info with links)
- Demo mode is invisible to the user — no indication they're getting canned responses
- Canned responses in demo mode should still attempt lead capture (e.g., "Want us to call you? Leave your number.")

### Claude's Discretion
- Exact wording of Ava's lead capture prompts (as long as they feel conversational)
- Specific canned response content for demo mode
- Technical approach to context updates on page navigation
- System prompt structure and formatting

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope

</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| AVA-01 | Chat Context Awareness: System prompt includes current page context; quick actions change based on current page; conversation history limited to last 10 messages sent to API | useLocation() already used in Layout.tsx — same pattern applies to AvaWidget; services config provides full service list for system prompt; SITE config provides business hours/phone/area |
| AVA-02 | Lead Capture in Chat: After 2-3 exchanges, Ava offers to capture name/phone/email; captured leads sent to form submission backend; "Talk to a real person" escalation button; lead capture optional | submitForm() in form-handler.ts is the existing backend abstraction; lead state machine (idle → capturing-name → capturing-phone → capturing-email → captured) handles flow; "Talk to a real person" fits as persistent quick action chip |
| AVA-03 | Chat Rate Limiting & Security: CORS restricted to site domain (not wildcard `*`); conversation history capped at 10 messages sent to API; client-side rate limiting (max 1 msg per 2 seconds); graceful degradation on 429 | CORS fix is a 2-line change in api/chat.js and both worker files; history cap is a slice before API call; client rate limit uses useRef timestamp comparison; 429 detection feeds existing demo mode in api.ts |

</phase_requirements>

## Summary

Phase 9 enhances the existing Ava AI chat widget across two files (AvaWidget.tsx, Ava.tsx) and the API backend (api/chat.js + worker variants). The codebase is already well-structured for these additions: `useLocation()` is already imported in Layout.tsx, `submitForm()` from form-handler.ts provides the lead submission abstraction, and a demo-mode fallback already exists in api.ts. No new libraries are required — all changes use patterns already established in the project.

The main architectural decision is how to pass page context from the router into AvaWidget. Since AvaWidget is rendered inside the React Router tree (via Layout), it can call `useLocation()` directly to get `pathname`. A pure utility function maps `pathname` to a descriptive page context string that gets prepended to the system prompt on each API call — this is the simplest approach and consistent with how Layout.tsx already uses `useLocation()`.

Lead capture is best modeled as a small state machine inside AvaWidget: an `leadState` ref tracks progress (idle → capturing-name → capturing-phone → capturing-email → captured). Ava's AI responses drive the conversational collection, while the widget intercepts user replies at specific lead-capture stages to extract and store the contact data locally, then submits when complete. The CONTEXT.md specifies that the AI itself should handle the natural transition prompting — the widget only needs to detect when the AI has reached a natural moment and start tracking responses.

Security hardening across the three API files is straightforward: dynamic CORS origin checking (compare `Origin` header against `company.url`), a `messages.slice(-10)` before sending to the AI API, a client-side `lastSendTime` ref for rate limiting, and 429 detection that flips a `demoMode` state flag.

**Primary recommendation:** Build all state locally in AvaWidget.tsx with no new libraries. Pass page context via a utility function, model lead capture as a state machine, and treat demo-mode as a fallback flag in api.ts.

## Standard Stack

### Core (No New Dependencies Required)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-router-dom | 7.13.0 (installed) | `useLocation()` for current page pathname | Already in project; Layout.tsx already uses this pattern |
| framer-motion | 12.34.0 (installed) | Existing chat animations | Already powering AvaWidget |
| lucide-react | 0.564.0 (installed) | Icons for escalation button (Phone icon) | Already used in AvaWidget |

### Supporting (Already in Project)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| form-handler.ts | project lib | Submit lead data to Formspree/webhook | Reuse existing `submitForm()` for captured leads |
| api.ts | project lib | Chat API call + demo mode | Extend existing `sendMessage()` to accept context param + handle 429 |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| useLocation() in AvaWidget | React Context or CustomEvent with pathname | useLocation() is simpler and correct — widget is already inside the Router tree |
| Lead state machine (useRef) | Separate React state per field | useRef avoids re-renders for transient capture state; useState for captured data is fine |
| Extending sendMessage() | Separate sendContextualMessage() | Single function with optional context param is cleaner |

**Installation:** No new packages required.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/ui/
│   └── AvaWidget.tsx          # Enhanced: page context, lead capture, rate limiting
├── lib/
│   └── api.ts                 # Enhanced: context param, 429 detection, demo mode enrichment
│   └── chat-context.ts        # NEW: utility to map pathname → page context string + quick actions
├── config/
│   └── assistant.ts           # Enhanced: page-specific quickActions map
api/
├── chat.js                    # Fix: wildcard CORS → dynamic origin check
├── worker.js                  # Fix: wildcard CORS → dynamic origin check
└── worker-groq.js             # Fix: wildcard CORS → dynamic origin check
```

### Pattern 1: Page Context via useLocation() in AvaWidget

AvaWidget is rendered inside `<Layout>`, which is inside `<Routes>` in App.tsx. This means AvaWidget is within the React Router context and can call `useLocation()` directly — no prop drilling or context needed.

```typescript
// src/lib/chat-context.ts
import { services } from '../config/services'
import { company } from '../config/company'

export interface PageContext {
  pageName: string
  pageUrl: string
  quickActions: string[]
}

export function getPageContext(pathname: string): PageContext {
  // Strip leading slash, match service slug
  const slug = pathname.replace(/^\//, '')
  const service = services.find(s => s.slug === slug)

  if (service) {
    return {
      pageName: `${service.name} service page`,
      pageUrl: pathname,
      quickActions: [
        `Get a ${service.name.toLowerCase()} quote`,
        'Emergency service?',
        'How does insurance work?',
        'Talk to a real person',
      ],
    }
  }

  // Map known static paths
  const pageMap: Record<string, string> = {
    '/': 'homepage',
    '/services': 'services overview page',
    '/contact': 'contact page',
    '/about': 'about page',
    '/projects': 'projects/portfolio page',
    '/testimonials': 'testimonials page',
  }

  return {
    pageName: pageMap[pathname] ?? 'general page',
    pageUrl: pathname,
    quickActions: [
      'I have storm damage',
      'How do insurance claims work?',
      'Schedule an inspection',
      'Talk to a real person',
    ],
  }
}

export function buildSystemPrompt(pathname: string): string {
  const { pageName, pageUrl } = getPageContext(pathname)
  const serviceList = services.map(s => s.name).join(', ')

  return `You are Ava, an AI Virtual Assistant for ${company.name}.

Your personality: Warm, knowledgeable, reassuring, patient. Professional but friendly.

Current visitor context:
- Page: ${pageName} (${pageUrl})
- Available services: ${serviceList}
- Business hours: ${company.hours.weekday}, ${company.hours.saturday}
- Phone: ${company.phone}
- Service area: ${company.address.city}, ${company.address.state} and surrounding areas

Key points to emphasize:
- FREE inspections, no obligation
- We meet with insurance adjusters on homeowners' behalf
- Most customers pay only their deductible
- Certifications: ${company.certifications.join(', ')}

Lead capture: After a few exchanges when there's a natural opening, offer to have someone reach out. Collect name first, then phone, then email (optional). Keep it conversational — never form-like. If declined, continue helping and try once more later.

Keep responses concise (2-4 sentences) unless detail is requested.
Never provide specific dollar estimates or guarantee claim approval.`
}
```

**Key insight:** The system prompt is rebuilt on every API call using the current `pathname` from `useLocation()`, so mid-conversation navigation automatically updates context. The AI does not announce the page — it just responds with appropriate context baked in.

### Pattern 2: Lead Capture State Machine

Lead capture state is modeled with `useRef` for the state tracker (no re-renders) and `useState` for the stored contact data (triggers UI update when captured).

```typescript
// Inside AvaWidget.tsx

type LeadState = 'idle' | 'capturing-name' | 'capturing-phone' | 'capturing-email' | 'captured' | 'declined-once' | 'declined-final'

// Refs (no re-renders needed)
const leadStateRef = useRef<LeadState>('idle')
const exchangeCountRef = useRef(0)  // counts user messages only

// State (triggers form submission when complete)
const [capturedLead, setCapturedLead] = useState<{name?: string; phone?: string; email?: string}>({})

// After each AI response, check if lead capture should trigger
// The AI is instructed to ask naturally — widget detects user replies
// and routes them into the lead collection when in capture states
```

The capture flow works as follows:
1. Widget counts user exchanges (not AI messages) via `exchangeCountRef`
2. After 2-3 user messages, the AI is implicitly prompted by the system prompt to transition naturally
3. When the user replies with what looks like a name/phone/email while in a capture state, the widget stores it and advances the state
4. On `captured` state transition, `submitForm()` is called with `{ source: 'ava-chat', name, phone, email }`
5. The "Talk to a real person" chip is always visible — clicking it injects a special message that shows the phone number inline

### Pattern 3: Client-Side Rate Limiting

Simple timestamp-based throttle — no library needed.

```typescript
// Inside AvaWidget.tsx
const lastSendTimeRef = useRef<number>(0)
const RATE_LIMIT_MS = 2000

const handleSend = async (text?: string) => {
  const now = Date.now()
  if (now - lastSendTimeRef.current < RATE_LIMIT_MS) {
    // Disable button, show brief "Please wait..." hint
    setRateLimited(true)
    setTimeout(() => setRateLimited(false), RATE_LIMIT_MS - (now - lastSendTimeRef.current))
    return
  }
  lastSendTimeRef.current = now
  // ... rest of send logic
}
```

### Pattern 4: CORS Origin Restriction in API Files

All three API files (chat.js, worker.js, worker-groq.js) currently use wildcard CORS. The fix is dynamic origin validation.

```javascript
// api/chat.js — Vercel serverless handler
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'https://example.com'

export default async function handler(req, res) {
  const origin = req.headers.origin
  const allowedOrigin = origin === ALLOWED_ORIGIN ? origin : ALLOWED_ORIGIN

  res.setHeader('Access-Control-Allow-Origin', allowedOrigin)
  res.setHeader('Vary', 'Origin')  // Required when origin varies
  // ... rest unchanged
}
```

```javascript
// api/worker.js / worker-groq.js — Cloudflare Workers
const ALLOWED_ORIGINS = [env.ALLOWED_ORIGIN, 'http://localhost:5173']

const origin = request.headers.get('Origin')
const corsOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]

const corsHeaders = {
  'Access-Control-Allow-Origin': corsOrigin,
  'Vary': 'Origin',
  // ...
}
```

### Pattern 5: History Cap Before API Call

Cap messages sent to the API at 10 (not the UI history, which stays complete).

```typescript
// src/lib/api.ts
export async function sendMessage(
  messages: Message[],
  systemPrompt?: string
): Promise<{ response: string }> {
  // Cap at 10 most recent messages for API call (keep full history in UI)
  const cappedMessages = messages.slice(-10)

  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: cappedMessages,
      systemPrompt,  // pass dynamic prompt from widget
    }),
  })

  if (res.status === 429) {
    // Signal to widget to use demo mode
    throw new Error('RATE_LIMITED')
  }
  // ...
}
```

The API handler then uses `systemPrompt` from the request body if provided, falling back to its hardcoded default.

### Anti-Patterns to Avoid

- **Announcing page awareness:** Do NOT put "I see you're on the [X] page" in AI output — the system prompt silently guides context
- **Form-like lead capture:** Never ask all fields at once or use "Enter your name:" phrasing — the AI handles natural phrasing
- **Capping UI history:** Only cap the array sent to the API, not the local `messages` state — users should see full conversation
- **Re-rendering on every keystroke for rate limit:** Use `useRef` for timestamp tracking, not `useState`
- **Hard-coding allowed origin:** Use environment variable `ALLOWED_ORIGIN` so deployments to different domains work without code changes

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Lead form submission | Custom fetch to Formspree | `submitForm()` from form-handler.ts | Already handles all providers (Formspree, webhook, Netlify, console fallback) |
| System prompt templating | Custom template engine | Simple string interpolation | All data is already in config objects; no dynamic DSL needed |
| Conversation history management | Redux/Zustand store | Local component state (useState) | Chat state is local to widget; no cross-component sharing needed |
| Demo mode canned responses | External content CMS | Extend existing `demoResponses` map in api.ts | Map is already structured for this; just expand with lead capture variants |

**Key insight:** This phase is pure enhancement of existing code — no new abstractions, no new libraries. The patterns (useLocation, submitForm, demo fallback) are all already established.

## Common Pitfalls

### Pitfall 1: Sending Full Message History to AI API
**What goes wrong:** With a long conversation, the API payload grows unbounded. Groq and Claude have token limits; the request eventually fails, or costs balloon.
**Why it happens:** The current `sendMessage()` sends the entire `messages` array without truncation.
**How to avoid:** Slice to last 10 messages BEFORE the fetch: `messages.slice(-10)`. Keep full history in component state for display.
**Warning signs:** Chat fails after ~15-20 messages in production.

### Pitfall 2: Context Updates Breaking Mid-Conversation Continuity
**What goes wrong:** User starts chatting on the homepage, navigates to Roofing — the system prompt changes but the AI loses the prior thread because it no longer has the old context framing.
**Why it happens:** The system prompt is rebuilt on every API call using current pathname.
**How to avoid:** This is actually desired behavior per CONTEXT.md decisions. The AI receives message history alongside the new system prompt, giving it continuity. The AI is a stateless function — it always sees the full history plus the current context. No special handling needed.
**Warning signs:** If the AI seems to "forget" prior context, check that `messages` (including history) is sent alongside the new system prompt.

### Pitfall 3: Lead Capture State Desync
**What goes wrong:** User navigates away mid-capture and returns — `leadState` ref resets if AvaWidget unmounts.
**Why it happens:** AvaWidget unmounts on page navigation (it's inside Layout but React can unmount it if feature flag changes or component tree shifts).
**How to avoid:** AvaWidget is rendered conditionally in Layout (`showAvaWidget` check) but the component itself persists across most navigations since Layout doesn't remount. Verify with `key` prop analysis. If desync is a real problem, persist `leadState` and captured fields to `sessionStorage`. For Phase 9, this edge case is LOW priority — the widget staying mounted across navigation is the typical case.
**Warning signs:** Lead capture state resets when user navigates between pages.

### Pitfall 4: CORS Regression with localhost Dev
**What goes wrong:** Restricting CORS to the production domain breaks local development (localhost:5173).
**Why it happens:** `ALLOWED_ORIGIN` env var is set to production domain but dev requests come from localhost.
**How to avoid:** Allow an array of origins: production domain + localhost in dev. Use `process.env.NODE_ENV` to conditionally include localhost, OR check for missing `ALLOWED_ORIGIN` env var as the signal to allow all (dev fallback).
**Warning signs:** Chat fails entirely in local development after CORS fix.

### Pitfall 5: "Talk to a Real Person" Chip Disappearing
**What goes wrong:** Quick actions currently only show when `messages.length === 1`. The escalation chip needs to be always visible.
**Why it happens:** Current AvaWidget renders quick actions only at the first message. After the user sends any message, chips disappear.
**How to avoid:** Separate the "Talk to a real person" chip from the general quick actions. Render it persistently in its own row, or always include it in the current quick actions list. Per CONTEXT.md: it must always be visible as a chip.
**Warning signs:** After the first user message, there's no escalation path visible.

### Pitfall 6: Demo Mode Inconsistency in api.ts
**What goes wrong:** Current `getDemoResponse()` uses keyword matching on the last user message. Demo mode responses need to also attempt lead capture (per CONTEXT.md).
**Why it happens:** Existing demo responses are purely informational — they don't prompt for contact info.
**How to avoid:** Extend `demoResponses` with lead-capture variants (e.g., "Want us to have someone call you? Just leave your number."). Add these to the rotation when the exchange count crosses the capture threshold.
**Warning signs:** Users in demo mode never get offered the lead capture flow.

## Code Examples

Verified patterns from existing codebase:

### Current API Call Pattern (api.ts)
```typescript
// Source: src/lib/api.ts (current)
export async function sendMessage(messages: Message[]): Promise<{ response: string }> {
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
    })
    if (!res.ok) throw new Error('API error')
    const data = await res.json()
    if (data.response) return data
    throw new Error('No response')
  } catch {
    await new Promise((r) => setTimeout(r, 500 + Math.random() * 500))
    return { response: getDemoResponse(messages.at(-1)?.content) }
  }
}
```

### Enhanced API Call Pattern (Phase 9 target)
```typescript
// src/lib/api.ts — Phase 9 enhancement
export async function sendMessage(
  messages: Message[],
  systemPrompt?: string
): Promise<{ response: string; rateLimited?: boolean }> {
  try {
    const cappedMessages = messages.slice(-10)  // AVA-03 history cap
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: cappedMessages, systemPrompt }),
    })
    if (res.status === 429) {
      // AVA-03 graceful degradation
      return { response: getDemoResponse(messages.at(-1)?.content), rateLimited: true }
    }
    if (!res.ok) throw new Error('API error')
    const data = await res.json()
    if (data.response) return data
    throw new Error('No response')
  } catch {
    await new Promise((r) => setTimeout(r, 500 + Math.random() * 500))
    return { response: getDemoResponse(messages.at(-1)?.content) }
  }
}
```

### submitForm() Usage for Lead Submission (form-handler.ts)
```typescript
// Source: src/lib/form-handler.ts (current)
// The existing abstraction handles all providers automatically
await submitForm({
  source: 'ava-chat',
  name: capturedLead.name,
  phone: capturedLead.phone,
  email: capturedLead.email,
  page: pathname,
})
```

### useLocation() in a Sibling Component (Layout.tsx)
```typescript
// Source: src/components/layout/Layout.tsx (current)
import { Outlet, useLocation } from 'react-router-dom'
const { pathname } = useLocation()
// AvaWidget is rendered inside this same Layout — same hook works in AvaWidget
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Wildcard CORS (`*`) | Dynamic origin validation | Phase 9 (this phase) | Closes security gap |
| Static system prompt | Dynamic system prompt with page context | Phase 9 (this phase) | Enables context-aware responses |
| Static quick actions | Page-specific quick action chips | Phase 9 (this phase) | Matches user intent to current context |
| No lead capture | Conversational lead capture state machine | Phase 9 (this phase) | Completes E2E flow |
| Unbounded message history to API | Capped at 10 messages | Phase 9 (this phase) | Prevents token overflow |

**No deprecated approaches** — this phase adds new capabilities, not replacements of current tech.

## Open Questions

1. **Where does the system prompt come from in the API handler — client or server?**
   - What we know: Currently system prompt is hardcoded in api/chat.js. The Phase 9 design passes `systemPrompt` from the client in the request body so the widget can inject page context.
   - What's unclear: Is sending the system prompt from the client a security concern? Anyone could craft a request with a different system prompt.
   - Recommendation: For this template, it's acceptable — the AI is customer-facing with no sensitive data access. The system prompt controls personality/context, not permissions. Document this tradeoff in a comment in api/chat.js. A more hardened alternative (build context server-side from a `page` param) can be deferred.

2. **How should the Ava.tsx full-page chat handle the new features?**
   - What we know: There are two chat surfaces — the floating AvaWidget.tsx and the full-page Ava.tsx page. Both use `sendMessage()` from api.ts.
   - What's unclear: CONTEXT.md and requirements reference AvaWidget specifically, but REQUIREMENTS.md lists both files. The Ava.tsx page also needs context awareness (it's on `/ava`), rate limiting, and lead capture.
   - Recommendation: Apply all the same enhancements to Ava.tsx. Since both components share api.ts, the API changes (history cap, 429 handling) apply automatically. Lead capture state machine and rate limiting need to be added to Ava.tsx as well. Consider extracting a `useChatEnhancement()` custom hook to avoid duplicating logic.

3. **Session persistence for lead capture state**
   - What we know: If AvaWidget unmounts (unlikely but possible), `leadState` resets.
   - What's unclear: Is sessionStorage persistence needed for v1 or is it over-engineering?
   - Recommendation: Defer. The widget stays mounted across navigation in the normal flow. If the user closes and reopens the widget, resetting the lead capture state is acceptable — they can re-engage.

## Sources

### Primary (HIGH confidence)
- Codebase: `src/components/ui/AvaWidget.tsx` — current widget implementation
- Codebase: `src/lib/api.ts` — existing sendMessage() and demo mode pattern
- Codebase: `src/lib/form-handler.ts` — existing submitForm() abstraction
- Codebase: `api/chat.js`, `api/worker.js`, `api/worker-groq.js` — current CORS wildcard pattern
- Codebase: `src/components/layout/Layout.tsx` — useLocation() usage pattern
- Codebase: `src/config/assistant.ts` — quickActions and pageQuickActions already defined
- [React Router v7 useLocation API](https://reactrouter.com/api/hooks/useLocation) — returns `{ pathname, search, hash, state, key }`

### Secondary (MEDIUM confidence)
- [Vercel CORS guide](https://vercel.com/kb/guide/how-to-enable-cors) — dynamic origin validation pattern for serverless handlers
- [Cloudflare Workers CORS example](https://developers.cloudflare.com/workers/examples/cors-header-proxy/) — origin header extraction in Workers
- WebSearch: Client-side rate limiting via timestamp comparison — verified as standard pattern (no library needed)

### Tertiary (LOW confidence)
- None — all claims verified against codebase or official docs

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new libraries; all patterns verified in existing codebase
- Architecture: HIGH — useLocation pattern already used in Layout; submitForm already works; patterns are well-established
- Pitfalls: HIGH — identified from actual current code gaps (e.g., quick actions disappear after message 1, CORS is wildcard, no history cap)

**Research date:** 2026-02-26
**Valid until:** 2026-03-28 (stable stack; React Router v7, Cloudflare Workers, Vercel patterns are stable)
