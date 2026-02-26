# Phase 9: Ava Chat Enhancement - Context

**Gathered:** 2026-02-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Enhance the Ava AI chat widget with page-aware context, lead capture during conversation, an escalation path to a real person, and security hardening (CORS, rate limiting, conversation capping). This completes the broken "Visitor chats with Ava → Lead capture" E2E flow. New chat capabilities beyond what's scoped in the roadmap belong in future phases.

</domain>

<decisions>
## Implementation Decisions

### Context-Aware Chat Behavior
- Silently tailor Ava's system prompt based on current page — do NOT explicitly announce page awareness (e.g., don't say "I see you're on our plumbing page")
- Quick actions (suggestion chips) should be page-specific: service pages show relevant actions (e.g., "Get a plumbing quote", "Emergency service?"), homepage shows general actions
- Pass full business context to system prompt: current page name/URL, list of available services, AND business details (hours, phone number, service area) so Ava can answer operational questions
- Context updates on navigation — if user navigates to a different page mid-conversation, Ava's system prompt updates to reflect the new page

### Lead Capture Flow
- Natural transition to lead capture after approximately 2-3 exchanges, but flexible — Ava should read the conversation and find a natural transition point rather than rigidly counting turns. More exchanges are fine if the conversation hasn't reached a natural capture moment
- Collect contact info conversationally, one field at a time (not all at once): name first, then phone, then email
- Name and phone number are required; email is optional
- If visitor declines: continue chatting and try once more later at a natural point. If declined a second time, offer the business phone number or contact page link as alternatives

### Escalation Experience
- "Talk to a real person" is always visible as a quick action chip (not hidden or delayed)
- Tapping it shows the business phone number with a click-to-call link
- Chat stays open after showing the phone number — user can continue chatting if they prefer
- Placement: as a quick action chip alongside other suggestions, consistent with existing chat patterns

### Rate Limit & Degradation UX
- Client-side rate limit (1 msg per 2 seconds): subtle send-button disable with a "Please wait..." hint. No error message — just a brief pause
- Server 429 response triggers demo mode: switch to pre-written canned responses that still feel natural and helpful (e.g., service info with links)
- Demo mode is invisible to the user — no indication they're getting canned responses
- Canned responses in demo mode should still attempt lead capture (e.g., "Want us to call you? Leave your number.")

### Claude's Discretion
- Exact wording of Ava's lead capture prompts (as long as they feel conversational)
- Specific canned response content for demo mode
- Technical approach to context updates on page navigation
- System prompt structure and formatting

</decisions>

<specifics>
## Specific Ideas

- Lead capture should feel like a conversation, not a form — "I'd love to have one of our technicians reach out. What's a good name to use?" rather than "Please enter your name:"
- The escalation quick action chip should always be present so users never feel trapped talking to a bot
- Demo mode canned responses should be written to be indistinguishable from live AI responses

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 09-ava-chat-enhancement*
*Context gathered: 2026-02-26*
