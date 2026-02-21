# Codebase Structure

**Analysis Date:** 2026-02-21

## Directory Layout

```
home-services-template/
├── src/                        # Frontend source code
│   ├── config/
│   │   └── site.ts             # Central configuration (EDIT THIS!)
│   ├── pages/                  # Route pages (lazy-loaded except Home)
│   ├── components/
│   │   ├── layout/             # Header, Footer, Layout wrapper
│   │   ├── sections/           # Reusable page sections
│   │   └── ui/                 # UI component library
│   ├── lib/
│   │   └── api.ts              # Chat API client
│   ├── hooks/
│   │   └── useScrollReveal.ts   # Scroll-to-animate hook
│   ├── main.tsx                # App entry point
│   └── index.css               # Tailwind + design tokens
│
├── api/                        # Serverless backend functions
│   ├── chat.js                 # Vercel function (Groq)
│   ├── worker.js               # Cloudflare Worker (Anthropic)
│   ├── worker-groq.js          # Cloudflare Worker (Groq)
│   ├── serve.js                # Local dev server
│   ├── package.json
│   └── wrangler.toml           # Cloudflare config
│
├── images/                     # Static images (webp preferred)
├── videos/                     # Static videos
├── dist/                       # Build output (generated)
├── index.html                  # HTML entry point
├── package.json                # Frontend dependencies
├── tsconfig.json               # TS config root
├── tsconfig.app.json           # TS config (app only)
├── vite.config.ts              # Vite config
├── vercel.json                 # Vercel deployment config
└── README.md                   # Project documentation
```

## Directory Purposes

**src/config/:**
- Purpose: Single source of truth for all dynamic content
- Contains: Site metadata, company info, contact details, service areas, AI assistant config
- Key files: `site.ts`
- Usage: Imported by components to display company branding, addresses, stats, assistant personality

**src/pages/:**
- Purpose: Top-level route components, one file per page
- Contains: Home, Roofing, Siding, StormDamage, Services, Projects, Testimonials, About, Contact, ServiceAreas, Ava
- Responsibility: Compose section components into full page, set page metadata, handle page-specific logic
- Lazy-loaded: All except Home (eager for FCP)
- Naming: PascalCase (e.g., `Roofing.tsx`, `About.tsx`)

**src/components/layout/:**
- Purpose: Persistent layout structure shared by all pages
- Contains:
  - `Layout.tsx` - Main wrapper with Header, Footer, Outlet, conditional AvaWidget
  - `Header.tsx` - Sticky navigation with mobile menu, dropdown menus, CTA
  - `Footer.tsx` - Footer content
  - `ScrollToTop.tsx` - Auto-scroll on route change
- Usage: Nested route parent in App routing

**src/components/sections/:**
- Purpose: Reusable, self-contained page sections
- Contains: Hero, BentoGrid, Stats, ProcessTimeline, Testimonials, Certifications, CTA, SocialProof, FAQ
- Responsibility: Render structured content block with internal animations and responsive layout
- Naming: PascalCase matching section type (e.g., `Testimonials.tsx`)
- Pattern: Import internal data or receive props, use `useScrollReveal()` for animations

**src/components/ui/:**
- Purpose: Reusable UI building blocks (no page/section-specific logic)
- Contains:
  - `Button.tsx` - Styled button with variants (primary, secondary, outline, ghost)
  - `Card.tsx` - Card wrapper with hover animation
  - `AvaWidget.tsx` - Floating chat assistant modal
  - `PageMeta.tsx` - Sets page title/description for SEO and meta tags
- Usage: Imported by pages and section components
- Naming: PascalCase, generic component names

**src/lib/:**
- Purpose: Shared utilities and API clients
- Contains: `api.ts` - Chat message sender with demo fallback
- Usage: Imported by AvaWidget for sending chat messages

**src/hooks/:**
- Purpose: Custom React hooks
- Contains: `useScrollReveal.ts` - Framer Motion intersection observer wrapper
- Usage: Imported by section components to trigger animations on scroll

**index.html:**
- Purpose: HTML entry point for entire app
- Contains: Meta tags, fonts, preload directives, schema.org structured data, root div, module script
- Scripts: `<script type="module" src="/src/main.tsx"></script>` initializes React app
- Optimization: Preload hero image, defer font loading

**api/:**
- Purpose: Serverless backend for chat functionality
- Contains: Multiple implementations (Vercel, Cloudflare, local)
- Responsible for: Authenticating with Groq/Anthropic, proxying chat requests, handling CORS
- Environment: `GROQ_API_KEY` or other API key via env vars (never in code)

**images/:**
- Purpose: Static image assets referenced throughout site
- Contains: Hero images, project gallery, testimonials, team photos, AI avatar
- Format: Webp with jpg fallback
- Naming: Descriptive kebab-case (e.g., `hero-roofing.webp`, `testimonial-1.webp`)

## Key File Locations

**Entry Points:**
- `index.html` - HTML root, loads app module
- `src/main.tsx` - React app bootstrap, creates root and renders App component
- `src/App.tsx` - React Router setup with routes and Suspense boundary

**Configuration:**
- `src/config/site.ts` - Company info, branding, AI assistant config (SINGLE POINT OF EDIT)
- `src/index.css` - Tailwind CSS with custom design tokens (colors, fonts)
- `tsconfig.app.json` - TypeScript compiler options with `@/*` path alias
- `vite.config.ts` - Vite build config with React and Tailwind plugins

**Core Logic:**
- `src/components/layout/Layout.tsx` - Routing wrapper, persistent chrome
- `src/components/layout/Header.tsx` - Navigation, mobile menu, dropdown
- `src/lib/api.ts` - Chat API client with demo mode fallback
- `src/hooks/useScrollReveal.ts` - Scroll animation trigger helper

**Testing/Quality:**
- `api/package.json` - Backend dependencies (minimal: dotenv only)
- `.playwright/` or tests in pages (E2E test integration directory, if used)

## Naming Conventions

**Files:**
- **React components**: PascalCase (e.g., `Header.tsx`, `Testimonials.tsx`)
- **Utilities/Hooks**: camelCase (e.g., `useScrollReveal.ts`, `api.ts`)
- **Config**: camelCase (e.g., `site.ts`)
- **Styles**: Single `index.css` at app root
- **Images**: kebab-case with descriptive names (e.g., `hero-roofing.webp`, `team-john.webp`)
- **API functions**: camelCase (e.g., `chat.js`, `serve.js`)

**Directories:**
- **Feature-based**: `pages/`, `components/`, `lib/`, `hooks/` organize by type/layer
- **Sub-organization**: Within `components/`, further split by purpose (`layout/`, `sections/`, `ui/`)
- **kebab-case for multi-word dirs**: `src/components/` not `src/Components/`

**React Components:**
- **Props interfaces**: Named `{ComponentName}Props` (e.g., `HeroProps`, `ButtonProps`)
- **Functional components**: Named export as PascalCase default export
- **Variants in UI components**: camelCase variant names (e.g., `primary`, `outline-white`)

**Functions:**
- **Handlers**: Prefixed with `handle` (e.g., `handleSend`, `handleKeyDown`)
- **Effect functions**: Descriptive name (e.g., `closeMobile`)
- **Selectors/Checkers**: Prefix with `is` or `get` (e.g., `isActive`, `getDemoResponse`)

**Variables:**
- **Local state**: camelCase (e.g., `mobileOpen`, `isLoading`)
- **Constants**: UPPER_SNAKE_CASE if config (e.g., `GROQ_API_KEY`)
- **Theme tokens**: `--color-*`, `--font-*` in CSS (e.g., `--color-navy`, `--color-brand-blue`)

## Where to Add New Code

**New Page:**
1. Create file: `src/pages/MyPage.tsx`
2. Export default functional component that imports section components
3. Add `PageMeta` to set title/description
4. Import page in `src/App.tsx` with `lazy(() => import(...))`
5. Add route in `<Routes>` (wrap with Layout parent)

**New Section Component:**
1. Create file: `src/components/sections/MySection.tsx`
2. Import `useScrollReveal()` for animation trigger
3. Use `motion` from Framer Motion for animations
4. Import UI components (Button, Card) as needed
5. Import `{ SITE }` from config for dynamic content
6. Use Tailwind for styling with design tokens
7. Import and use in a page component

**New UI Component:**
1. Create file: `src/components/ui/MyComponent.tsx`
2. Define TypeScript interface for props (e.g., `MyComponentProps`)
3. Use Tailwind CSS classes with design tokens
4. Consider Framer Motion for interactions
5. Export as default named export
6. Import and use in sections or pages

**New Utility/Helper:**
1. If reusable logic: `src/lib/myUtil.ts`
2. If reusable hook: `src/hooks/useMyHook.ts`
3. Export as named or default
4. Import where needed (typically multiple components)

**New Configuration:**
- Edit `src/config/site.ts` directly; don't create separate config files
- Add new property to SITE object with clear type
- Update `SiteConfig` type if interface changes

## Special Directories

**dist/:**
- Purpose: Production build output
- Generated: Yes (by `npm run build`)
- Committed: No (in .gitignore)
- Contents: Bundled JS, CSS, copied images, minified HTML

**node_modules/:**
- Purpose: Installed dependencies
- Generated: Yes (by npm install)
- Committed: No (in .gitignore)
- Size: Large (excluded from version control)

**api/ (Alternate Implementations):**
- `chat.js` - Vercel serverless (deploy with Vercel, env var GROQ_API_KEY)
- `worker.js` - Cloudflare Worker using Anthropic API
- `worker-groq.js` - Cloudflare Worker using Groq API
- `serve.js` - Local Node server for dev testing
- Only one is typically deployed; choose based on hosting platform

**images/:**
- Purpose: Static assets served publicly
- Committed: Yes (tracked in git)
- Path in HTML/JSX: `/images/filename.webp` (absolute path from public root)
- Optimization: Use webp format; provide jpg fallback if needed; lazy-load with `loading="lazy"`

---

*Structure analysis: 2026-02-21*
