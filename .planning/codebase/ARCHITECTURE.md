# Architecture

**Analysis Date:** 2026-02-21

## Pattern Overview

**Overall:** Client-Server SPA with Modular Component Architecture

**Key Characteristics:**
- Single-page application (React 19 + React Router 7) for frontend
- Modular component hierarchy: layout → sections → UI components
- Configuration-driven (single source of truth in `src/config/site.ts`)
- Lazy-loaded routes for performance optimization
- Serverless API backend for chat functionality (Vercel/Cloudflare compatible)
- Framer Motion for scroll-triggered animations throughout

## Layers

**Frontend (Client) - SPA:**
- Purpose: Render responsive multi-page website with navigation, animations, and AI chat
- Location: `src/`
- Contains: Pages, components, hooks, utilities, configuration
- Depends on: React Router (navigation), Framer Motion (animations), Lucide icons
- Used by: Browser (entry point via `index.html`)

**Backend API (Serverless):**
- Purpose: Handle AI chat requests by proxying to Groq API
- Location: `api/`
- Contains: Vercel serverless functions and Cloudflare Worker implementations
- Depends on: Groq API (for LLM responses)
- Used by: Frontend chat widget via `/api/chat` POST endpoint

**Configuration Layer:**
- Purpose: Centralized, editable configuration for all dynamic content
- Location: `src/config/site.ts`
- Contains: Company info, contact details, service areas, AI assistant config
- Depends on: Nothing (standalone)
- Used by: Every component that displays company/brand information

## Data Flow

**Chat Message Flow:**

1. User types message in `AvaWidget` (`src/components/ui/AvaWidget.tsx`)
2. `handleSend()` collects messages array and calls `sendMessage()` from `src/lib/api.ts`
3. `sendMessage()` attempts POST to `/api/chat` with message history
4. If API succeeds, returns assistant response from Groq API
5. If API fails, falls back to demo mode with pattern-matched responses
6. Response rendered in chat modal with message history maintained
7. Auto-scroll to latest message, loading indicator shown during request

**Page Navigation Flow:**

1. User clicks nav link (desktop header, mobile menu, or internal link)
2. React Router matches route to page component in `src/pages/`
3. Pages use lazy loading except Home (eager loaded for FCP)
4. `Suspense` boundary shows `PageLoader` spinner during chunk load
5. `ScrollToTop` scrolls viewport to top when route changes
6. Page renders with `Layout` wrapper (Header, Footer, AvaWidget)

**Section Rendering Flow:**

1. Home page imports section components (Hero, Stats, Testimonials, etc.)
2. Each section uses `useScrollReveal()` hook to detect when entering viewport
3. `useScrollReveal()` uses Framer Motion `useInView` with `once: true`
4. When in view, section animates in with staggered child animations
5. Sections compose reusable UI components (Button, Card, etc.)

**State Management:**

- **Local Component State**: React `useState` for UI state (mobile menu open, modal open, loading)
- **Route State**: React Router manages active page/path (consumed by Header for active links)
- **Scroll State**: Framer Motion tracks viewport intersection, no external state needed
- **Chat History**: Maintained locally in `AvaWidget` component state during session
- **Config State**: Imported as constant from `src/config/site.ts` (immutable)

## Key Abstractions

**Hero Component:**
- Purpose: Full-width hero section with background image, headline, and CTA buttons
- Examples: `src/components/sections/Hero.tsx`
- Pattern: Props-driven (configurable headline, image, CTA text/link); used on Home and service pages with different content
- Accepts: backgroundImage, headline, highlightText, subhead, primaryCTA, secondaryCTA, compact flag

**Section Components:**
- Purpose: Reusable, self-contained page sections (BentoGrid, Stats, Testimonials, etc.)
- Examples: `src/components/sections/BentoGrid.tsx`, `src/components/sections/Stats.tsx`, `src/components/sections/Testimonials.tsx`
- Pattern: Import static data inline or from config; use `useScrollReveal()` for animation trigger; compose UI components
- Responsibility: Render structured content with animations, handle layout responsiveness

**UI Component Library:**
- Purpose: Styled, reusable building blocks (Button, Card, PageMeta)
- Examples: `src/components/ui/Button.tsx`, `src/components/ui/Card.tsx`
- Pattern: Props-based variants (Button has variant/size options); compound composition; Framer Motion for micro-interactions
- Dependency: Components use Tailwind CSS classes + design tokens from `src/index.css`

**Layout Wrapper:**
- Purpose: Persistent structure around all pages (Header, Footer, AvaWidget)
- Location: `src/components/layout/Layout.tsx`
- Pattern: React Router outlet-based nested routing; conditional rendering (AvaWidget hidden on /ava page)
- Responsibility: Ensure consistent chrome across navigation, manage global layout concerns

**AvaWidget (Chat Assistant):**
- Purpose: Floating AI chat interface with message persistence and quick-action buttons
- Location: `src/components/ui/AvaWidget.tsx`
- Pattern: Modal component with animations; manages local message state; integrates with `src/lib/api.ts`
- Features: Auto-scroll to latest message, loading indicators, demo mode fallback, keyboard interactions (Enter to send, Esc to close)

## Entry Points

**SPA Entry Point:**
- Location: `index.html` → `src/main.tsx`
- Triggers: Page load in browser
- Responsibilities:
  1. Render React app into `#root` element
  2. Wrap app in `BrowserRouter` for routing
  3. Initialize Vite module system

**API Entry Point:**
- Location: `api/chat.js` (Vercel) or `api/worker.js` (Cloudflare)
- Triggers: POST request to `/api/chat` from frontend
- Responsibilities:
  1. Extract message array from request body
  2. Inject system prompt describing Ava assistant role
  3. Call Groq API with message history
  4. Return parsed response or error

**Home Page:**
- Location: `src/pages/Home.tsx`
- Triggers: Route `/` or app initialization
- Responsibilities:
  1. Render full hero → stats → testimonials → CTA flow
  2. Eager-loaded (not lazy) for fast First Contentful Paint
  3. Set page metadata via `PageMeta` component

**Service Pages:**
- Location: `src/pages/Roofing.tsx`, `src/pages/Siding.tsx`, `src/pages/StormDamage.tsx`
- Triggers: Routes `/roofing`, `/siding`, `/storm-damage`
- Responsibilities:
  1. Render service-specific hero with tailored headline/image
  2. Show service details, benefits, process, CTA
  3. Lazy-loaded to reduce initial bundle

## Error Handling

**Strategy:** Graceful degradation with fallbacks

**Patterns:**

- **Chat API Failure:** If `/api/chat` request fails or times out, `sendMessage()` returns demo response based on keyword matching. Chat still works, user doesn't see error.

- **Route Not Found:** React Router allows undefined routes to render nothing (no 404 page implemented; app is SPA with predefined routes).

- **Missing Images:** `<img>` tags include alt text. If image fails to load, browser shows alt text. No JS error handling for image failures.

- **Scroll Animation Failure:** If Framer Motion doesn't load or `useScrollReveal` fails, section content still renders but without animation. Non-critical to functionality.

## Cross-Cutting Concerns

**Logging:** No structured logging. Some console logging possible but not seen in codebase.

**Validation:** Form validation not visible (Contact page likely has form library or custom validation not in scope).

**Authentication:** Not applicable—public marketing website with no auth.

**Accessibility:**
- Keyboard navigation: Mobile menu closes on Escape, Header uses `aria-label` and `aria-expanded`
- Screen readers: `PageMeta` sets page title/description for SEO; images have alt text; skip-to-content link in Layout
- Focus management: Chat widget receives focus when opened; buttons are keyboard-accessible

**Performance:**
- Lazy route loading reduces initial bundle size
- Home page eagerly loaded for fast FCP
- Hero image preloaded in `<head>` via `<link rel="preload">`
- Hero uses `<img>` with `fetchPriority="high"` for LCP optimization
- Images use webp format with lazy loading (`loading="lazy"`)

**Security:**
- Chat API validates GROQ_API_KEY environment variable; returns 500 if missing
- CORS headers on API endpoint allow cross-origin requests
- No sensitive data in frontend (all API keys server-side)

---

*Architecture analysis: 2026-02-21*
