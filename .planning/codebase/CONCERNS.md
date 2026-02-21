# Codebase Concerns

**Analysis Date:** 2026-02-21

## Tech Debt

**Contact Form Does Not Persist Submissions:**
- Issue: Form in `src/pages/Contact.tsx` only sets `submitted` state locally without sending data to backend. Form submission is a no-op—user data is never captured or stored.
- Files: `src/pages/Contact.tsx` (line 56-58)
- Impact: Lead capture completely broken. No inquiries are being recorded; customers think they've submitted requests when they haven't.
- Fix approach: Implement form submission logic to send FormData to a backend endpoint. Currently `handleSubmit` only calls `preventDefault()` and sets state. Need to collect form fields, validate, and POST to API endpoint for storage (database or email service).

**Overly Permissive CORS on Chat API:**
- Issue: `api/chat.js` and `api/server.js` set `Access-Control-Allow-Origin: '*'` allowing any domain to call the chat endpoint.
- Files: `api/chat.js` (line 3), `api/server.js` (line 33)
- Impact: Chat API can be abused from any website; potential for rate limiting attacks or service hijacking. Exposes Groq/Anthropic API key risk if credentials are leaked.
- Fix approach: Restrict CORS to specific origin domains (e.g., `https://yourdomain.com`). Only allow requests from your own website in production.

**Uncontrolled Error Exposure in Chat API:**
- Issue: `api/server.js` returns full error details to client in error responses (line 92: `details: data`). API parsing errors and validation failures expose internal implementation details.
- Files: `api/server.js` (line 92, 96)
- Impact: Information disclosure vulnerability. Error messages could reveal API structure or keys if malformed requests are sent. Users see technical debug info instead of friendly messages.
- Fix approach: Log full errors server-side only. Return generic error messages to client (e.g., "Something went wrong, please try again."). Never send raw API responses or details to frontend.

**Chat Demo Mode Silently Replaces Real API Calls:**
- Issue: In `src/lib/api.ts`, API errors cause silent fallback to demo mode (line 46) without notifying user that real API failed.
- Files: `src/lib/api.ts` (line 33-50)
- Impact: Confusing user experience—canned responses look real. No indication when AI is unavailable. Users may think their messages were understood when they received a hardcoded response. Security risk: API failures go unmonitored.
- Fix approach: Return error state to UI. Show user when chat is in demo mode. Log API failures. Provide user feedback (e.g., "Chat temporarily unavailable, using offline assistant").

## Security Considerations

**No Input Validation on Chat Messages:**
- Risk: Chat endpoint accepts arbitrary user input without sanitization or length limits (line 39 in `api/chat.js` just destructures `messages`).
- Files: `api/chat.js` (line 39), `api/server.js` (line 48)
- Current mitigation: Groq/Anthropic APIs have their own protections; message count is limited by UX (message array grows with chat history).
- Recommendations: Add explicit validation—check message count (max 50), message length (max 2000 chars), reject non-string content. Implement rate limiting per IP/session. Add request signing or auth tokens.

**Contact Form Has No CSRF Protection:**
- Risk: POST endpoint at `/api/chat` (if extended to form submission) has no CSRF token or SameSite cookie protection.
- Files: `api/chat.js`, `api/server.js`, `src/pages/Contact.tsx`
- Current mitigation: None detected.
- Recommendations: Add CSRF token to form. Set `SameSite=Strict` on auth cookies. Use POST-only endpoints (already done). Validate referer header for extra protection.

**Environment Variables Not Validated at Runtime:**
- Risk: API keys (`GROQ_API_KEY`, `ANTHROPIC_API_KEY`) checked only for existence, not validity. No fallback logic if key is malformed.
- Files: `api/chat.js` (line 15-19), `api/server.js` (line 5, 50)
- Current mitigation: API providers reject invalid keys; requests fail with 401.
- Recommendations: Test key validity at startup. Log key configuration status. Implement graceful degradation (e.g., disable chat if key is invalid).

## Performance Bottlenecks

**Contact Form Styling Recalculates on Every Render:**
- Problem: No memoization of form layout. Contact page renders full form grid on state changes without preventing re-renders of unchanged sections.
- Files: `src/pages/Contact.tsx` (line 72-256)
- Cause: Form section not wrapped in `React.memo()`. All child inputs re-render when `submitted` state changes even though submit button is disabled during submission.
- Improvement path: Wrap form section in `React.memo()` or split into separate component (`FormSection`). Use `useCallback` for `handleSubmit`. Memoize individual form fields.

**BentoGrid Images Not Optimized for Mobile:**
- Problem: Large hero images (up to 1920x1080 assumed from README) loaded at full size on mobile devices.
- Files: `src/components/sections/BentoGrid.tsx` (line 56-60, 84-88, 112-116)
- Cause: All image tags use same `src` regardless of screen size. No responsive images with `srcset` or `picture` element.
- Improvement path: Add `srcset` to image tags with mobile/tablet/desktop variants. Use `sizes` attribute for responsive loading. Consider using Vite's dynamic import or `import.meta.glob` for image variants.

**Chat Messages Array Has No Limit:**
- Problem: Message history stored in component state grows indefinitely. Long chats accumulate 100+ messages causing re-render performance degradation.
- Files: `src/components/ui/AvaWidget.tsx` (line 9, 34, 38)
- Cause: Messages array appended without pruning. No max message history enforced.
- Improvement path: Implement message history limit (e.g., keep last 30 messages). Store old messages separately or send to backend for archiving. Use `useReducer` for better history management.

## Fragile Areas

**Header Navigation Hard-Coded Array:**
- Files: `src/components/layout/Header.tsx` (line 6-23)
- Why fragile: Navigation links must match route definitions in `src/App.tsx` manually. No single source of truth. Adding/removing routes risks broken navigation.
- Safe modification: Extract nav config to shared constant in `src/config/` or generate from React Router route definitions. Use route names instead of hardcoded paths.
- Test coverage: No tests for navigation link validity. Could have broken links without being caught.

**Contact Form Not Integrated With Any Backend:**
- Files: `src/pages/Contact.tsx` (line 93-189)
- Why fragile: Form collects data but doesn't send it anywhere. User experience breaks silently. Adding backend later requires refactoring form and API integration.
- Safe modification: Before adding new form fields, implement form submission endpoint. Use `fetch()` to POST collected data. Add error state and loading state to UI.
- Test coverage: No form submission tests. No validation of required fields at submission.

**About Page TODO Comment Blocks Customization:**
- Files: `src/pages/About.tsx` (line 17)
- Why fragile: Template has placeholder content with TODO. Easily missed during customization. Team member images hard-coded with wrong paths, all team members initially show same image.
- Safe modification: Replace TODO comment with actual team data before deploying. Verify all image paths exist. Add unit test that checks no placeholder image paths remain in production builds.
- Test coverage: No validation that team images exist or are unique.

## Scaling Limits

**Chat History Stored in Browser Memory:**
- Current capacity: ~30-50 messages per session before noticeable slowdown
- Limit: Browser memory + React component state overhead. Each message is ~200-500 bytes + React object overhead.
- Scaling path: Move message history to IndexedDB or backend storage. Implement pagination/lazy loading for long conversations. Use `sessionStorage` as intermediate cache.

**No Rate Limiting on Chat API:**
- Current capacity: Groq/Anthropic API limits apply (typically 100-1000 req/min), but no client-side enforcement
- Limit: Single user can spam chat endpoint; no per-session or per-IP limits implemented
- Scaling path: Add request queue with backoff (exponential retry). Implement client-side throttling. Add server-side rate limiting with redis/database. Track usage per IP/session ID.

**Single Page App with No Caching Strategy:**
- Current capacity: Every page navigation requires full route load; no service worker
- Limit: No offline support. Slow networks result in blank page while route loads.
- Scaling path: Implement service worker for offline-first caching. Use React Router data loading for route caching. Add precaching of frequently visited pages.

## Dependencies at Risk

**Groq API Key Exposed in Error Messages:**
- Risk: If API request fails, `api/server.js` line 92 returns `details: data` which could include sensitive headers or request body with key.
- Impact: API key compromise if error messages are logged or displayed publicly.
- Migration plan: Never return raw API response to client. Use request correlation IDs instead. Log full responses server-side only. Consider using Anthropic instead of Groq for better error handling (already have `api/server.js` implementation).

**Framer Motion Large Bundle Impact:**
- Risk: `framer-motion` ^12.34.0 is a large dependency (~30-50KB gzipped). Every page uses animations heavily.
- Impact: Initial page load slowed, especially on 3G connections. Not critical for core functionality.
- Migration plan: If bundle size becomes issue, replace scroll animations with CSS-only alternatives using Intersection Observer. Keep Framer Motion only for modal/widget animations.

**React Router v7 Breaking Changes Risk:**
- Risk: Using `^7.13.0` which could receive breaking updates.
- Impact: Future `npm update` could break routing.
- Migration plan: Lock to specific version `7.13.0` instead of `^7.13.0`. Test before upgrading minor versions.

## Missing Critical Features

**No Form Validation Before Submission:**
- Problem: Contact form fields have `required` attribute but no JavaScript validation. Server doesn't validate. Email format not checked.
- Blocks: Lead data quality is poor; invalid emails prevent follow-up.
- Fix: Add client-side email/phone validation using regex or `validator` library. Add server-side validation on API endpoint. Show inline error messages.

**No Email Notification System:**
- Problem: Contact form doesn't send confirmation email to user or notification to admin.
- Blocks: Users don't know form was received. Admin doesn't know new leads arrived.
- Fix: Integrate with SendGrid, Nodemailer, or AWS SES. Send transactional emails on form submission and lead notification.

**No Analytics or Lead Tracking:**
- Problem: No Google Analytics, Hotjar, or custom tracking. Can't measure form conversion rate or user behavior.
- Blocks: No data on which pages convert best, where users drop off, form abandonment rate.
- Fix: Add Google Analytics 4 or Plausible. Track form field interactions, submission attempts, and completions. Set up conversion goals.

**No Accessibility Testing:**
- Problem: Components use semantic HTML but no automated accessibility testing (axe, Pa11y, lighthouse).
- Blocks: Website may fail WCAG 2.1 AA compliance without being caught. Screen reader users may have trouble.
- Fix: Add accessibility testing to build process. Use Playwright or Cypress with `@axe-core/playwright`. Audit colors for contrast. Test keyboard navigation.

## Test Coverage Gaps

**No Tests for Contact Form:**
- What's not tested: Form field validation, submission handler, error states, loading states, success message display
- Files: `src/pages/Contact.tsx`
- Risk: Form could be completely broken and no tests would catch it. Changes to form structure easily break functionality.
- Priority: High—forms are critical user interaction points

**No Tests for Chat Component:**
- What's not tested: Message sending, loading state, quick actions, keyboard shortcuts (Enter to send, Escape to close), scroll to bottom on new message
- Files: `src/components/ui/AvaWidget.tsx`
- Risk: Chat widget could malfunction (e.g., Escape key not closing, messages not scrolling) without being caught.
- Priority: Medium—affects engagement but widget is secondary feature

**No Tests for Header Navigation:**
- What's not tested: Active link highlighting, dropdown menu interactions, mobile menu toggle, menu close on route change, body scroll lock
- Files: `src/components/layout/Header.tsx`
- Risk: Navigation could be broken on mobile (e.g., menu doesn't close on link click) without being caught.
- Priority: High—affects user ability to navigate

**No API Tests:**
- What's not tested: Chat API error handling, CORS headers, invalid request handling, API key validation, malformed message arrays
- Files: `api/chat.js`, `api/server.js`
- Risk: API could fail silently or expose errors to client. Changes to request format could break frontend-backend contract.
- Priority: High—API is critical path

**No End-to-End Tests:**
- What's not tested: Full user flows (landing → contact form → submission), chat widget workflow, page navigation and loading
- Risk: Changes that break page structure or routing could ship without being caught.
- Priority: Medium—project is small enough to catch most issues manually, but E2E tests would prevent regressions

---

*Concerns audit: 2026-02-21*
