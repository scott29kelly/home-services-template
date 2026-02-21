# Testing Patterns

**Analysis Date:** 2026-02-21

## Test Framework

**Runner:**
- Playwright (`@playwright/test` v1.58.2)
- Config: Not detected (no `playwright.config.ts` file found)

**Assertion Library:**
- Playwright's built-in assertions

**Run Commands:**
```bash
npm run dev              # Dev server (Vite)
npm run build           # Build for production
npm run preview         # Preview production build
# No test script configured
```

## Test File Organization

**Location:**
- No test files detected in repository (`*.test.tsx`, `*.spec.tsx` not found)
- Playwright installed but no test suite present
- Only `node_modules/gensync/test/index.test.js` found (external dependency)

**Naming:**
- Not applicable (no test files present)

**Structure:**
- Not applicable (no test infrastructure configured)

## Test Structure

**Suite Organization:**
- Not implemented in codebase

**Patterns:**
- No testing patterns established yet

## Mocking

**Framework:**
- Not implemented

**Patterns:**
- API fallback pattern in `src/lib/api.ts` simulates demo responses when fetch fails
  ```typescript
  export async function sendMessage(messages: Message[]): Promise<{ response: string }> {
    try {
      const res = await fetch('/api/chat', { ... })
      // ... validation
    } catch {
      // Graceful fallback with demo response
      await new Promise((r) => setTimeout(r, 500 + Math.random() * 500))
      return { response: getDemoResponse(messages.at(-1)?.content) }
    }
  }
  ```
- No formal mocking library (Jest, Vitest, MSW) configured

**What to Mock:**
- External API calls via `/api/chat` endpoint
- Router navigation (react-router-dom)
- Framer Motion animations (if testing UI behavior)
- useScrollReveal hook (returns ref and isInView state)

**What NOT to Mock:**
- Component rendering logic
- React hooks (useState, useEffect, useCallback)
- Tailwind CSS classnames
- Icon components (lucide-react)

## Fixtures and Factories

**Test Data:**
- Sample data hardcoded in component files (e.g., testimonials in Testimonials.tsx)
  ```typescript
  const testimonials: Testimonial[] = [
    { name: 'Michael R.', location: 'Anytown', quote: '...', image: '/images/testimonial-1.webp' },
    // ...
  ]
  ```
- Configuration centralized in `src/config/site.ts` (SITE constant)
- Demo API responses in `src/lib/api.ts` (demoResponses object)

**Location:**
- Test data embedded in component/utility files
- No separate fixtures directory or factory functions created
- Mock data spread across `config/`, `lib/`, and component files

## Coverage

**Requirements:**
- None enforced (no coverage threshold configured)

**View Coverage:**
- No coverage tool configured; would need Jest or Vitest setup

## Test Types

**Unit Tests:**
- Not implemented
- Would focus on:
  - Component prop rendering and defaults
  - Hook state changes (useScrollReveal)
  - Utility function behavior (sendMessage, getDemoResponse)
  - Type safety with TypeScript

**Integration Tests:**
- Not implemented
- Playwright installed, ready for E2E tests
- Would focus on:
  - Page routing and navigation flows
  - Mobile menu open/close interactions
  - API chat endpoint responses
  - Form submissions (Contact page)

**E2E Tests:**
- Framework available: Playwright (`@playwright/test` v1.58.2)
- No test files created yet
- Ready to test full user workflows

## Common Patterns

**Async Testing:**
- API calls wrapped in try-catch with fallback (api.ts)
  ```typescript
  const res = await fetch('/api/chat', { ... })
  if (!res.ok) throw new Error('API error')
  ```
- Demo delay simulated with setTimeout:
  ```typescript
  await new Promise((r) => setTimeout(r, 500 + Math.random() * 500))
  ```

**Error Testing:**
- Error conditions handled via fallback responses
- No explicit error boundary components found
- Error messages generic ('API error', 'No response')

## Known Testing Gaps

**Not Tested:**
- Component rendering and visual regression
- Accessibility compliance (despite good semantic HTML)
- Mobile responsiveness and layout breakpoints
- Form validation and submission (Contact page)
- Route navigation and page transitions
- API integration with backend
- Performance metrics (Core Web Vitals, LCP, etc.)
- Browser compatibility

**Components Lacking Tests:**
- `src/components/layout/Header.tsx` (complex state management: mobileOpen, dropdownOpen, route handling)
- `src/components/ui/AvaWidget.tsx` (chat interaction state)
- `src/pages/Contact.tsx` (form submission)
- Page components with API calls (chat endpoints)

**Critical Areas Needing Coverage:**
- Mobile navigation state management (Header.tsx)
- Animation component behavior (Framer Motion)
- Custom hook functionality (useScrollReveal)
- API error handling and fallback (sendMessage)
- Type safety across component prop passing

## Setup Requirements

**To Enable Testing:**

1. **Choose test runner:** Jest or Vitest (recommended: Vitest for Vite integration)
   ```bash
   npm install --save-dev vitest @vitest/ui
   ```

2. **Add assertion library:** Vitest includes Chai; add React testing utilities
   ```bash
   npm install --save-dev @testing-library/react @testing-library/dom @testing-library/user-event
   ```

3. **Mock framer-motion:**
   ```bash
   npm install --save-dev jest-mock-extended
   ```

4. **Configure vitest.config.ts:**
   - Set up jsdom environment
   - Configure module resolution for `@/*` paths
   - Enable coverage reporting
   - Mock framer-motion and react-router-dom

5. **Create test structure:**
   - Mirror `src/` structure in `src/__tests__/`
   - Or co-locate `.test.tsx` files next to source files

6. **E2E Testing with Playwright:**
   - Already installed; create `e2e/` directory
   - Configure `playwright.config.ts` with baseURL, browsers
   - Write tests in `e2e/*.spec.ts`

---

*Testing analysis: 2026-02-21*
