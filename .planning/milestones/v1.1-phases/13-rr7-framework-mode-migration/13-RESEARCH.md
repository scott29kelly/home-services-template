# Phase 13: RR7 Framework Mode Migration - Research

**Researched:** 2026-03-03
**Domain:** React Router 7 Framework Mode, Static Pre-rendering, Vercel Deployment
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| PERF-03 | Convert project from SPA mode to React Router 7 framework mode — react-router.config.ts, Vite plugin, server/client entries, root.tsx, routes.ts, route modules with loaders, all routes converted | Full official migration guide found; step-by-step process documented below |
| PERF-04 | Static pre-rendering for all routes — every route built to HTML at build time, dynamic routes (blog/city/service/portfolio) enumerated, HTML contains real content, pages hydrate correctly, Vercel deployment updated | Pre-rendering API fully documented; `async prerender({ getStaticPaths })` pattern confirmed for dynamic routes |
</phase_requirements>

---

## Summary

This project currently runs React Router 7 in **SPA/Declarative mode** — `BrowserRouter` wraps the app in `main.tsx`, all routing happens client-side via `<Routes>/<Route>`, and Vite produces a single `index.html` with the `dist/` directory. The current `vercel.json` rewrites all routes to `index.html` to handle client-side routing. Lighthouse mobile Performance is 51 because crawlers and first-time visitors see a blank shell until JS executes.

React Router 7 Framework Mode adds a Vite plugin (`@react-router/dev/vite`) that transforms the project: routes are declared in `src/routes.ts` (config-first), pages become **route modules** with typed `loader`, `meta`, and `default` exports, and the build system pre-renders every route to static HTML at build time. No Node.js server is needed — the output is pure static files in `build/client/` served from Vercel CDN. The migration is officially documented and designed to be incremental.

All content in this project is static and known at build time (config files, markdown, no auth, no per-request data), making the `ssr: false` + `prerender: async function` approach the ideal fit. The 20 city pages, 3 service pages, 12 blog posts, and portfolio pages are all enumerable from config at build time. The key migration work is: (1) install `@react-router/dev`, (2) swap the Vite plugin, (3) create `root.tsx` from `index.html`, (4) create `entry.client.tsx` from `main.tsx`, (5) declare all routes in `routes.ts`, (6) convert page components to route modules with `loader` + typed `meta`, (7) configure `prerender` with the full route list.

**Primary recommendation:** Use `ssr: false` with `async prerender({ getStaticPaths })` in `react-router.config.ts`. Set `appDirectory: "src"` and `buildDirectory: "build"`. All content is static — no server runtime needed. Update `vercel.json` to point `outputDirectory` at `build/client`.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@react-router/dev` | 7.x (match `react-router-dom` version ~7.13) | Vite plugin, route type generation, dev server, build orchestration | Required for framework mode — the Vite plugin IS framework mode |
| `@react-router/node` | 7.x | Node.js streaming utilities for `entry.server.tsx` | Required for `createReadableStreamFromReadable` in server entry |
| `react-router` | already installed (via `react-router-dom`) | Unified router package — exports `Links`, `Meta`, `Scripts`, `Outlet`, `HydratedRouter`, etc. | Framework mode uses `react-router`, not `react-router-dom` imports |
| `@vercel/react-router` | latest | Vercel preset for React Router — enables CDN-aware routing on Vercel | Highly recommended by Vercel docs; enables proper static file CDN serving |

### Package status: `react-router-dom` vs `react-router`
In React Router 7, `react-router-dom` is a re-export shim — it re-exports everything from `react-router`. All existing component imports (`Link`, `useParams`, `useNavigate`, `useLocation`, `Navigate`, etc.) continue working unchanged. Framework mode entry points use `react-router/dom` (for `HydratedRouter`). **Do not remove `react-router-dom` from package.json** until all imports are updated to `react-router`.

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `vite-tsconfig-paths` | latest | Resolves `@/*` TypeScript path aliases in Vite | Needed because `@react-router/dev` Vite plugin replaces `@vitejs/plugin-react` and tsconfig paths need explicit resolution |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `ssr: false` + prerender | `ssr: true` + prerender | `ssr: true` requires a Vercel serverless function runtime; since all content is static, `ssr: false` is simpler and cheaper. Known issue: Vercel CDN doesn't always skip function invocations for pre-rendered paths when `ssr: true`. |
| `@vercel/react-router` preset | No preset | Without preset, static file serving may invoke Vercel Functions unnecessarily. Vercel strongly recommends the preset. |
| `async prerender({ getStaticPaths })` | `prerender: [hardcoded array]` | `getStaticPaths()` helper auto-discovers all static paths from `routes.ts`, then dynamic paths are appended — cleaner than a full hardcoded array |

**Installation:**
```bash
npm install -D @react-router/dev
npm install @react-router/node @vercel/react-router vite-tsconfig-paths
```

---

## Architecture Patterns

### Recommended Project Structure (post-migration)

```
src/
├── root.tsx              # Document shell (replaces index.html) — Layout export + default Root
├── entry.client.tsx      # Browser entry (replaces main.tsx) — HydratedRouter
├── entry.server.tsx      # Server/pre-render entry — handleRequest for streaming
├── routes.ts             # Route config (replaces App.tsx Routes/Route JSX)
├── routes/               # Route module files (renamed from pages/)
│   ├── home.tsx          # index route
│   ├── service-page.tsx  # dynamic: /roofing, /siding, /storm-damage
│   ├── services.tsx      # /services
│   ├── projects.tsx      # /projects
│   ├── portfolio.$slug.tsx # dynamic: /portfolio/:slug
│   ├── testimonials.tsx
│   ├── about.tsx
│   ├── contact.tsx
│   ├── thank-you.tsx
│   ├── service-areas.tsx
│   ├── service-areas.$slug.tsx # dynamic city pages
│   ├── ava.tsx
│   ├── financing.tsx
│   ├── resources.tsx     # blog index
│   ├── resources.$slug.tsx # blog posts
│   └── $.tsx             # 404 catch-all
├── components/           # unchanged
├── config/               # unchanged
├── content/              # unchanged
├── hooks/                # unchanged
└── lib/                  # unchanged
react-router.config.ts    # project root
```

**Note on `appDirectory`:** Set `appDirectory: "src"` in `react-router.config.ts` so the framework finds `src/root.tsx`, `src/routes.ts`, `src/entry.client.tsx`, and `src/entry.server.tsx` rather than the default `app/` directory.

### Pattern 1: Framework Config (`react-router.config.ts`)

**What:** The single config file controls framework mode behavior — ssr flag, app directory, build directory, prerender function, and Vercel preset.
**When to use:** Always — this is the entry point for framework mode.

```typescript
// react-router.config.ts (project root)
// Source: https://reactrouter.com/api/framework-conventions/react-router.config.ts
import { vercelPreset } from '@vercel/react-router/vite'
import type { Config } from '@react-router/dev/config'
import { getAllPosts } from './src/lib/blog'
import { cityPages } from './src/config/service-areas'
import { services } from './src/config/services'
import { projects } from './src/config/projects'
import { features } from './src/config/features'

export default {
  appDirectory: 'src',
  buildDirectory: 'build',
  ssr: false,
  presets: [vercelPreset()],
  async prerender({ getStaticPaths }) {
    // Static paths from routes.ts (home, services, projects, etc.)
    const staticPaths = getStaticPaths()

    // Dynamic: service pages
    const servicePaths = services.map(s => `/${s.slug}`)

    // Dynamic: city pages (feature-flag guarded)
    const cityPaths = features.cityPages
      ? cityPages.map(c => `/service-areas/${c.slug}`)
      : []

    // Dynamic: blog posts (feature-flag guarded)
    const blogPaths = features.blog
      ? getAllPosts().map(p => `/resources/${p.slug}`)
      : []

    // Dynamic: portfolio detail pages
    const portfolioPaths = projects.items.map(p => `/portfolio/${p.slug}`)

    return [
      ...staticPaths,
      ...servicePaths,
      ...cityPaths,
      ...blogPaths,
      ...portfolioPaths,
    ]
  },
} satisfies Config
```

**IMPORTANT NOTE on `react-router.config.ts` and imports:** This file runs in Node.js context at build time (not browser). Importing from `./src/lib/blog` will work because `blog.ts` uses `import.meta.glob` which Vite processes — but `react-router.config.ts` is a plain Node.js module, NOT processed by Vite. The blog module uses `import.meta.glob` which is a Vite-only API. **This means `getAllPosts()` CANNOT be called from `react-router.config.ts` directly.** Use the same Node.js file-reading approach already used in `vite.config.ts` (the `getRouteList()` function reads config files with `fs.readFileSync` + regex). See the "Common Pitfalls" section below.

### Pattern 2: Updated `vite.config.ts`

**What:** Replace `@vitejs/plugin-react` with `@react-router/dev/vite`'s `reactRouter()` plugin.

```typescript
// vite.config.ts
// Source: https://reactrouter.com/upgrading/component-routes
import { reactRouter } from '@react-router/dev/vite'
import tailwindcss from '@tailwindcss/vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vite'
// ... keep existing custom plugins (copyAndOptimizeImages, generateSitemap)

export default defineConfig({
  plugins: [
    reactRouter(),          // replaces react() from @vitejs/plugin-react
    tailwindcss(),
    tsconfigPaths(),        // resolves @/* aliases
    copyAndOptimizeImages(),
    generateSitemap(),
  ],
  publicDir: false,         // keep existing behavior
  // Remove rollupOptions.input — reactRouter() handles the entry point
})
```

**Remove from devDependencies:** `@vitejs/plugin-react` (no longer needed when using `reactRouter()` plugin)

### Pattern 3: `src/root.tsx` — Document Shell

**What:** Replaces `index.html`. Exports `Layout` function (wraps every page in the HTML document) and a default `Root` component (renders `<Outlet />`).

```tsx
// src/root.tsx
// Source: https://reactrouter.com/upgrading/component-routes
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from 'react-router'
import { LazyMotion, domAnimation, MotionConfig } from 'framer-motion'
import './index.css'

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        {/* Meta and Links inject per-route <title>, <meta>, <link> tags */}
        <Meta />
        <Links />
        {/* Global font preconnect + schema.org from index.html go here */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
        <link rel="preload" as="image" href="/images/hero-roofing.webp" type="image/webp" />
      </head>
      <body>
        {/* LazyMotion wraps children so framer-motion is available globally */}
        <LazyMotion features={domAnimation} strict>
          <MotionConfig reducedMotion="user">
            {children}
          </MotionConfig>
        </LazyMotion>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function Root() {
  return <Outlet />
}
```

**Key decisions for this project:**
- Move Google Fonts links, hero image preload, and favicon from `index.html` into `root.tsx` `<head>`
- Move `LazyMotion` / `MotionConfig` from `main.tsx` into `root.tsx` `Layout` function
- The `<Meta />` component renders route-level `meta()` exports (replaces `PageMeta` component's function OR works alongside it)
- Do NOT move `SpeedInsights` here — keep it in a layout route or `root.tsx` default component

### Pattern 4: `src/entry.client.tsx` — Browser Entry

**What:** Replaces `main.tsx`. Uses `hydrateRoot` + `HydratedRouter` instead of `createRoot` + `<BrowserRouter><App />`.

```tsx
// src/entry.client.tsx
// Source: https://reactrouter.com/upgrading/component-routes
import { StrictMode } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { HydratedRouter } from 'react-router/dom'

hydrateRoot(
  document,
  <StrictMode>
    <HydratedRouter />
  </StrictMode>,
)
```

**What to remove from `main.tsx`:**
- `BrowserRouter` (framework mode handles routing)
- `LazyMotion` / `MotionConfig` (move to `root.tsx`)
- `reportWebVitals()` call (handle separately per CLEAN-02 — remove or integrate)
- `createRoot` → `hydrateRoot` (pre-rendered HTML must be hydrated, not replaced)

### Pattern 5: `src/entry.server.tsx` — Server/Pre-render Entry

**What:** Controls how React Router renders each route during pre-rendering. Optional for pure static sites — React Router provides a default if absent. Include it for completeness and future flexibility.

```tsx
// src/entry.server.tsx
// Source: https://reactrouter.com/api/framework-conventions/entry.server.tsx
import { PassThrough } from 'node:stream'
import type { EntryContext } from 'react-router'
import { createReadableStreamFromReadable } from '@react-router/node'
import { ServerRouter } from 'react-router'
import { renderToPipeableStream } from 'react-dom/server'

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext,
) {
  return new Promise((resolve, reject) => {
    const { pipe, abort } = renderToPipeableStream(
      <ServerRouter context={routerContext} url={request.url} />,
      {
        onShellReady() {
          responseHeaders.set('Content-Type', 'text/html')
          const body = new PassThrough()
          const stream = createReadableStreamFromReadable(body)
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode,
            }),
          )
          pipe(body)
        },
        onShellError(error: unknown) {
          reject(error)
        },
      },
    )
    setTimeout(abort, 5000)
  })
}
```

### Pattern 6: `src/routes.ts` — Route Configuration

**What:** Replaces the `<Routes>/<Route>` JSX in `App.tsx`. Declarative route config using `index`, `route`, `layout`, `prefix` helpers.

```typescript
// src/routes.ts
// Source: https://reactrouter.com/start/framework/routing
import {
  type RouteConfig,
  index,
  route,
  layout,
} from '@react-router/dev/routes'

export default [
  // Layout wraps all routes in the shared header/footer
  layout('routes/layout.tsx', [
    index('routes/home.tsx'),

    // Config-driven service routes (roofing, siding, storm-damage)
    route(':serviceSlug', 'routes/service-page.tsx'),

    route('services', 'routes/services.tsx'),
    route('projects', 'routes/projects.tsx'),
    route('portfolio/:slug', 'routes/portfolio.$slug.tsx'),
    route('testimonials', 'routes/testimonials.tsx'),
    route('about', 'routes/about.tsx'),
    route('contact', 'routes/contact.tsx'),
    route('thank-you', 'routes/thank-you.tsx'),
    route('service-areas', 'routes/service-areas.tsx'),
    route('service-areas/:slug', 'routes/service-areas.$slug.tsx'),
    route('ava', 'routes/ava.tsx'),
    route('financing', 'routes/financing.tsx'),
    route('resources', 'routes/resources.tsx'),
    route('resources/:slug', 'routes/resources.$slug.tsx'),

    // 404 catch-all
    route('*', 'routes/$.tsx'),
  ]),
] satisfies RouteConfig
```

**Note on service routes:** The current app uses config-driven service routes — same component (`ServicePage`) rendered for `/roofing`, `/siding`, `/storm-damage`. In framework mode, a single `:serviceSlug` dynamic route handles all of them. The route module's loader validates the slug against config and throws a 404 response if not found.

**Note on feature flags:** Feature-flag-gated routes (ava, financing, blog) should still be declared in `routes.ts` — the route module's `loader` or component handles the redirect to `/` if the feature is disabled. Do NOT conditionally add routes at the config level.

### Pattern 7: Route Module Format (Page Components)

**What:** Each page file exports a `loader` function (returns data), a `meta` function (returns head metadata), and a default component (receives `loaderData` prop).

```tsx
// src/routes/service-areas.$slug.tsx (city page example)
// Source: https://reactrouter.com/start/framework/route-module
import type { Route } from './+types/service-areas.$slug'
import { data, redirect } from 'react-router'
import { getCityBySlug, cityPages } from '../config/service-areas'
import { company } from '../config/company'
// ... other imports

export async function loader({ params }: Route.LoaderArgs) {
  const city = getCityBySlug(params.slug)
  if (!city) throw redirect('/service-areas')
  return { city }
}

export function meta({ data }: Route.MetaArgs) {
  if (!data) return []
  const { city } = data
  return [
    { title: city.metaTitle ?? `${city.name} Roofing & Siding | ${company.name}` },
    { name: 'description', content: city.metaDescription ?? city.description.slice(0, 160) },
  ]
}

export default function CityPageRoute({ loaderData }: Route.ComponentProps) {
  const { city } = loaderData
  // ... component body (same as current CityPage.tsx but without useParams/useState for slug)
}
```

**Key shift:** Replace `useParams()` + `useEffect`/`navigate` redirect pattern with `loader` throwing `redirect()`. Loader runs at build time during prerendering — route params are populated from the prerender path list.

### Pattern 8: Layout Route (`src/routes/layout.tsx`)

**What:** Preserves the existing `Layout.tsx` component as a route layout — wraps all routes with Header, Footer, AvaWidget, StickyMobileCTA, ScrollToTop, AnnouncementBanner.

```tsx
// src/routes/layout.tsx
import { Outlet } from 'react-router'
import { SpeedInsights } from '@vercel/speed-insights/react'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
// ... other layout imports

export default function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      {/* skip-to-content, AnnouncementBanner, Header, etc. */}
      <main id="main-content" className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <StickyMobileCTA />
      <AvaWidget />
      {import.meta.env.VITE_VERCEL_SPEED_INSIGHTS === 'true' && <SpeedInsights />}
    </div>
  )
}
```

### Pattern 9: Updated `vercel.json`

**What:** Switch from SPA rewrite-all to static file serving from `build/client/`.

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "build/client",
  "cleanUrls": true,
  "trailingSlash": false
}
```

**Remove** the `rewrites` array — pre-rendered routes each have their own `index.html`. The SPA fallback (`build/client/__spa-fallback.html`) handles any routes not explicitly pre-rendered (e.g., `thank-you` which has `noindex` and doesn't need pre-rendering but should still work).

### Pattern 10: Updated `package.json` Scripts

**What:** Dev script changes from `vite` to `react-router dev`.

```json
{
  "scripts": {
    "dev": "react-router dev",
    "build": "react-router build",
    "preview": "vite preview"
  }
}
```

**Note:** `tsc -b` is no longer needed in the build step — `@react-router/dev` runs type checking as part of `react-router build`.

### Anti-Patterns to Avoid

- **Keeping `<BrowserRouter>` in `entry.client.tsx`:** Framework mode manages routing — wrapping with `BrowserRouter` causes a double-router error.
- **Using `useParams()` in route modules for slug lookup:** In framework mode, move slug resolution to the `loader`. The loader runs at build time for pre-rendered routes.
- **Using `useEffect` + `navigate` for 404 redirects:** Throw `redirect()` from the loader instead. `useEffect` redirects don't work during pre-rendering (server context).
- **Importing `import.meta.glob` modules from `react-router.config.ts`:** The config file runs in Node.js context, not Vite context. Use `fs.readFileSync` pattern (same as `getRouteList()` in current `vite.config.ts`).
- **Putting `LazyMotion` inside individual route components:** Keep it in `root.tsx` Layout so it wraps the entire app and framer-motion features are loaded once.
- **Keeping `rollupOptions.input: 'index.html'` in `vite.config.ts`:** The `reactRouter()` plugin manages the entry point. Remove this config.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Route type generation | Manual type files | `@react-router/dev` auto-generates `.react-router/types/+types/` | Framework generates `Route.LoaderArgs`, `Route.MetaArgs`, `Route.ComponentProps` per route automatically |
| Static path enumeration for prerender | Custom build script | `async prerender({ getStaticPaths })` in `react-router.config.ts` | Framework's `getStaticPaths()` auto-discovers static routes from `routes.ts`; just append dynamic paths |
| SPA fallback HTML | Custom 404 server logic | `ssr: false` automatically writes `build/client/__spa-fallback.html` | Framework handles this — serves the SPA shell for any path not explicitly pre-rendered |
| Per-route meta tags | `PageMeta` component with `<title>` / `<meta>` elements | Route module `meta()` export + `<Meta />` in `root.tsx` | Framework generates `<head>` elements at pre-render time rather than hydrating them client-side |
| Scroll restoration | Custom `ScrollToTop.tsx` component | `<ScrollRestoration />` in `root.tsx` + existing `ScrollToTop.tsx` | Framework provides `ScrollRestoration` for route transitions; `ScrollToTop` can be kept or removed |

**Key insight:** The `@react-router/dev` Vite plugin generates TypeScript types for every route automatically in `.react-router/types/`. These types (`Route.LoaderArgs`, `Route.ComponentProps`, etc.) make loaders fully type-safe without any manual type work.

---

## Common Pitfalls

### Pitfall 1: `import.meta.glob` Not Available in `react-router.config.ts`

**What goes wrong:** `react-router.config.ts` is evaluated by Node.js (not Vite) at build time. Calling `getAllPosts()` from `src/lib/blog.ts` fails because `blog.ts` uses `import.meta.glob` which is a Vite-specific API unavailable in Node context.
**Why it happens:** `react-router.config.ts` is a plain TypeScript module loaded by `@react-router/dev` before Vite starts. It shares the same limitation as the current `getRouteList()` function in `vite.config.ts`.
**How to avoid:** Use the same Node.js file-reading pattern already in `vite.config.ts` — read markdown files with `fs.readdirSync` + `gray-matter`, and read config files with `fs.readFileSync` + regex extraction. Extract a shared `getBuildTimeRoutes()` utility that both `vite.config.ts` (for sitemap) and `react-router.config.ts` (for prerender) can call.
**Warning signs:** Build fails with `"import.meta is not defined"` or `"import.meta.glob is not a function"`.

### Pitfall 2: `useEffect` + `navigate` Redirects Break Pre-rendering

**What goes wrong:** Current `CityPage.tsx`, `ProjectDetail.tsx`, and `ServicePage.tsx` use `useEffect(() => { if (!found) navigate('/...') }, [...])` to handle missing slugs. During pre-rendering, effects don't run (server environment). The page renders with a `null` return and no redirect occurs.
**Why it happens:** `useEffect` is a browser-only hook. Pre-rendering executes React's server rendering path which does not run effects.
**How to avoid:** In the route module's `loader`, check if the slug is valid and `throw redirect('/target-path')` if not. This runs during pre-rendering and produces a proper redirect response.

```tsx
export async function loader({ params }: Route.LoaderArgs) {
  const city = getCityBySlug(params.slug)
  if (!city) throw redirect('/service-areas', { status: 301 })
  return { city }
}
```

**Warning signs:** Pre-rendered HTML files are empty or contain "null" for dynamic route pages.

### Pitfall 3: Framer Motion SSR Compatibility

**What goes wrong:** Framer Motion relies on browser APIs (`window`, `document`, `ResizeObserver`). If a component with `m.div` / `useScrollReveal` renders server-side during pre-rendering without proper guards, it throws.
**Why it happens:** With `ssr: false`, React Router still renders to HTML during pre-rendering using `renderToPipeableStream`. Framer Motion 12 generally handles SSR well with `LazyMotion` + `domAnimation`, but `useScrollReveal` uses `useInView` which may reference browser APIs.
**How to avoid:** Keep `LazyMotion` in `root.tsx` (wraps the entire render tree including pre-render). The existing pattern of `m.div` with `initial`/`animate` props that check `isInView` state is safe — on the server, `isInView` starts as `false` so animated elements render in their initial state (opacity 0, etc.).
**Warning signs:** Build fails with `ReferenceError: window is not defined` or `ResizeObserver is not defined`.

**Specific check needed:** `useScrollReveal.ts` uses `useInView` from framer-motion. Verify that framer-motion 12's `useInView` has SSR-safe defaults (returns `false` on server). If not, add a `typeof window === 'undefined'` guard.

### Pitfall 4: `PageMeta` Component vs Route Module `meta()` Export

**What goes wrong:** The current `PageMeta` component uses React 19's native `<title>` / `<meta>` hoisting. This works client-side. In framework mode, route modules also have a `meta()` export that generates head elements at pre-render time. Using both simultaneously can produce duplicate head elements.
**Why it happens:** React 19 hoists `<title>` elements to `<head>` via the DOM. Pre-rendering renders these too, but the route module `meta()` export is the canonical mechanism for head elements in framework mode.
**How to avoid:** For pre-rendered pages, migrate metadata to the `meta()` export. The `<Meta />` component in `root.tsx` outputs the result of `meta()` into `<head>` at render time. The `PageMeta` component can be kept for dynamic client-side metadata that doesn't need to be pre-rendered (no pages match this case in this project), or removed entirely.
**Warning signs:** Duplicate `<title>` tags in pre-rendered HTML, or meta tags missing from pre-rendered HTML.

### Pitfall 5: Service Route Collision with `:serviceSlug`

**What goes wrong:** Using a top-level `:serviceSlug` dynamic route to catch `/roofing`, `/siding`, `/storm-damage` creates an ambiguity with other top-level routes like `/services`, `/projects`, `/about`, etc.
**Why it happens:** React Router matches routes in order. If `:serviceSlug` is defined before `/services`, it catches `/services` first.
**How to avoid:** Define all specific static routes BEFORE the dynamic `:serviceSlug` route in `routes.ts`. React Router evaluates more-specific routes first, but order still matters for ambiguous cases. Alternatively, use explicit routes for each service slug instead of a dynamic catch-all.

```typescript
// Specific routes FIRST, then dynamic
route('services', 'routes/services.tsx'),  // before :serviceSlug
route('roofing', 'routes/service-page.tsx'),
route('siding', 'routes/service-page.tsx'),
route('storm-damage', 'routes/service-page.tsx'),
// NOT: route(':serviceSlug', ...) — too broad
```

**Warning signs:** `/services` page renders the `ServicePage` component and shows a 404 for service not found.

### Pitfall 6: `vite.config.ts` Plugin Conflict

**What goes wrong:** Keeping `@vitejs/plugin-react` alongside `reactRouter()` causes a conflict — both try to handle React JSX transformation.
**Why it happens:** `reactRouter()` from `@react-router/dev/vite` includes React transformation internally.
**How to avoid:** Remove `react()` import and plugin from `vite.config.ts` when adding `reactRouter()`. Also remove `@vitejs/plugin-react` from devDependencies.
**Warning signs:** Build errors like `"The plugin [react] already handles JSX"` or duplicate transform warnings.

### Pitfall 7: TypeScript Config Paths with `@react-router/dev`

**What goes wrong:** The current `tsconfig.app.json` has `"paths": { "@/*": ["src/*"] }` but `@react-router/dev` Vite plugin doesn't automatically resolve TypeScript path aliases.
**Why it happens:** The `@vitejs/plugin-react` plugin doesn't resolve aliases either — in the current project, paths work because Vite's default alias config handles them. When switching to `reactRouter()`, the `tsconfigPaths()` plugin from `vite-tsconfig-paths` is needed to make Vite respect `tsconfig.app.json` paths.
**How to avoid:** Install and add `tsconfigPaths()` to the `plugins` array in `vite.config.ts`.
**Warning signs:** Build errors like `Cannot find module '@/config/...'`.

### Pitfall 8: `.react-router/` Gitignore Entry

**What goes wrong:** `@react-router/dev` generates type files in `.react-router/types/` during build. These are generated artifacts and should not be committed.
**Why it happens:** Framework mode generates per-route type files that reference virtual modules.
**How to avoid:** Add `.react-router/` to `.gitignore`. This is a standard step in the official migration guide.
**Warning signs:** Large number of generated `.ts` files appear in git status after first build.

---

## Code Examples

Verified patterns from official sources:

### Service Page Route Module (Dynamic Route with Loader)

```tsx
// src/routes/service-page.tsx
// Source: https://reactrouter.com/start/framework/route-module
import type { Route } from './+types/service-page'
import { redirect } from 'react-router'
import { getServiceBySlug } from '../config/services'
import { company } from '../config/company'
import PageMeta from '../components/ui/PageMeta'
// ... other page imports

export async function loader({ params }: Route.LoaderArgs) {
  const slug = params.serviceSlug  // matches route(':serviceSlug', ...)
  const service = getServiceBySlug(slug)
  if (!service) throw redirect('/services', { status: 301 })
  return { service }
}

export function meta({ data }: Route.MetaArgs) {
  if (!data) return []
  const { service } = data
  return [
    { title: service.meta.title },
    { name: 'description', content: service.meta.description },
    { property: 'og:title', content: service.meta.title },
  ]
}

export default function ServicePageRoute({ loaderData }: Route.ComponentProps) {
  const { service } = loaderData
  // ... same JSX as current ServicePage.tsx, using `service` from loaderData
  // instead of `getServiceBySlug(location.pathname.replace(/^\//, ''))`
}
```

### Blog Post Route Module

```tsx
// src/routes/resources.$slug.tsx
// Source: https://reactrouter.com/start/framework/route-module
import type { Route } from './+types/resources.$slug'
import { redirect } from 'react-router'
import { getAllPosts, getPostBySlug } from '../lib/blog'

export async function loader({ params }: Route.LoaderArgs) {
  const post = getPostBySlug(params.slug)
  if (!post) throw redirect('/resources', { status: 301 })
  const allPosts = getAllPosts()
  return { post, allPosts }
}

export function meta({ data }: Route.MetaArgs) {
  if (!data) return []
  const { post } = data
  return [
    { title: post.title },
    { name: 'description', content: post.excerpt },
    { property: 'og:image', content: post.coverImage },
  ]
}

export default function ResourcesPost({ loaderData }: Route.ComponentProps) {
  const { post, allPosts } = loaderData
  // ... component body (same as current ResourcesPost.tsx)
}
```

### Prerender Config with Node.js File Reading (for blog posts)

```typescript
// react-router.config.ts — blog post slug extraction (Node.js-safe)
// Source: same pattern as vite.config.ts getRouteList()
import { readdirSync, readFileSync } from 'fs'
import { resolve } from 'path'
import matter from 'gray-matter'

function getBlogSlugs(): string[] {
  try {
    const blogDir = resolve('src/content/blog')
    return readdirSync(blogDir)
      .filter(f => f.endsWith('.md'))
      .map(f => {
        const { data } = matter(readFileSync(resolve(blogDir, f), 'utf-8'))
        return data.published !== false ? data.slug : null
      })
      .filter(Boolean) as string[]
  } catch {
    return []
  }
}
```

### 404 Catch-All Route Module

```tsx
// src/routes/$.tsx (catch-all — renders current NotFound page)
import type { Route } from './+types/$'

export function meta(): Route.MetaFunction {
  return [
    { title: 'Page Not Found' },
    { name: 'robots', content: 'noindex, nofollow' },
  ]
}

export default function NotFound() {
  // Same JSX as current NotFound.tsx
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| SPA: blank HTML + JS bundle | Framework Mode: pre-rendered HTML per route | RR7 (2024) | Crawlers see real content; LCP dramatically faster |
| `BrowserRouter` + `createRoot` | `HydratedRouter` + `hydrateRoot` | RR7 Framework Mode | Proper hydration of pre-rendered HTML |
| Routes defined as JSX `<Routes>/<Route>` | Declarative `routes.ts` config | RR7 Framework Mode | Type safety, code splitting, build-time optimization |
| `useParams()` for data lookup | `loader({ params })` | RR7 Framework Mode | Runs at build time; enables prerendering with real data |
| `useEffect` redirect for 404 | `throw redirect()` in loader | RR7 Framework Mode | Works during prerendering; no client-side flash |
| `<title>` component hoisting (React 19) | Route module `meta()` export + `<Meta />` | RR7 Framework Mode | Metadata in pre-rendered HTML (not just client-injected) |
| `vercel.json` rewrite-all to `index.html` | `outputDirectory: build/client` with `cleanUrls` | Framework Mode adoption | Proper static file serving; no function invocations for static pages |
| `react-router-dom` package | `react-router` unified package | RR7 | `react-router-dom` still works as re-export shim; no breaking change |

**Deprecated/outdated:**
- `@vitejs/plugin-react` in `vite.config.ts`: Replaced by `reactRouter()` from `@react-router/dev/vite`
- `BrowserRouter` in `main.tsx`: Framework mode handles routing via `HydratedRouter`
- `createRoot` in `main.tsx`: Must use `hydrateRoot` to attach to pre-rendered HTML
- `rollupOptions.input: 'index.html'` in Vite config: `reactRouter()` manages the entry point
- `tsc -b` in build script: `react-router build` includes type checking

---

## Open Questions

1. **`useScrollReveal` SSR safety with Framer Motion 12's `useInView`**
   - What we know: The hook uses `useInView` which tracks IntersectionObserver — a browser API
   - What's unclear: Whether framer-motion 12's `useInView` returns `false` (safe) or throws during server-side rendering
   - Recommendation: Test immediately after first `react-router build`. If it throws, add `const isBrowser = typeof window !== 'undefined'` guard in `useScrollReveal.ts` and return `{ ref, isInView: false }` on server.

2. **`ServicePage` route param approach — individual routes vs `:serviceSlug` dynamic**
   - What we know: The current app has 3 service pages (roofing, siding, storm-damage) — all use the same `ServicePage` component. A dynamic `:serviceSlug` route is the cleanest approach but risks route collision.
   - What's unclear: Route collision risk with other top-level routes (`/services`, `/projects`, etc.) if ordering is wrong
   - Recommendation: Use explicit routes for each service slug (`route('roofing', ...)`, `route('siding', ...)`, `route('storm-damage', ...)`) rather than a wildcard `:serviceSlug`. This avoids any collision risk and is more explicit for pre-rendering.

3. **`ServicePage` using `useLocation().pathname` for slug extraction**
   - What we know: Current `ServicePage` uses `const slug = location.pathname.replace(/^\//, '')`. In framework mode, the `loader` receives `params` directly.
   - What's unclear: Nothing — the `params` object approach is clearly superior
   - Recommendation: In the service page `loader`, receive slug from the route param name or read from `request.url`. If using explicit routes (`route('roofing', ...)`), use `new URL(request.url).pathname.replace(/^\//, '')` to get the slug in the loader.

4. **`PageMeta` component compatibility with route `meta()` exports**
   - What we know: `PageMeta` uses React 19's native `<title>` hoisting which works client-side. Route `meta()` exports are pre-rendered into `<head>`. Both technically work but may produce duplicates.
   - What's unclear: Whether using both simultaneously causes visible duplicate tags or just DOM duplication
   - Recommendation: Migrate all metadata to route `meta()` exports and remove `PageMeta` usage. This is the correct framework mode pattern and ensures metadata is in pre-rendered HTML.

5. **`AnnouncementBanner` + `banner-client.ts` in SSR/prerender context**
   - What we know: `banner-client.ts` likely makes a fetch to `api/banner.js` (an orphan Vercel function). During pre-rendering, this fetch would fail or return an error.
   - What's unclear: Exactly what `banner-client.ts` does and whether it runs at render time
   - Recommendation: Inspect `banner-client.ts` before migration. If it makes a browser-side fetch, guard it with `typeof window !== 'undefined'`. Since `api/banner.js` is flagged for removal in CLEAN-01, this feature may simply be disabled/removed.

---

## Sources

### Primary (HIGH confidence)
- [React Router 7 Upgrading from Component Routes](https://reactrouter.com/upgrading/component-routes) — official step-by-step SPA-to-framework migration
- [React Router 7 Pre-Rendering How-To](https://reactrouter.com/how-to/pre-rendering) — prerender config, getStaticPaths, build output structure
- [React Router 7 Route Module API](https://reactrouter.com/start/framework/route-module) — loader, meta, action, clientLoader exports
- [React Router 7 Routing](https://reactrouter.com/start/framework/routing) — routes.ts config API, route/index/layout/prefix helpers
- [React Router 7 Data Loading](https://reactrouter.com/start/framework/data-loading) — loader/clientLoader patterns, loaderData prop
- [React Router 7 Rendering Strategies](https://reactrouter.com/start/framework/rendering) — ssr: false, ssr: true, static prerender differences
- [entry.server.tsx API](https://reactrouter.com/api/framework-conventions/entry.server.tsx) — handleRequest signature and implementation
- [react-router.config.ts API](https://reactrouter.com/api/framework-conventions/react-router.config.ts) — all config options including appDirectory, buildDirectory, ssr, prerender, presets
- [Vercel React Router Docs](https://vercel.com/docs/frameworks/frontend/react-router) — @vercel/react-router, vercelPreset, deployment configuration

### Secondary (MEDIUM confidence)
- [React Router v7 Official Changelog](https://reactrouter.com/changelog) — package consolidation (react-router-dom → react-router re-export)
- [Vercel GitHub Issue #14281](https://github.com/remix-run/react-router/issues/14281) — confirms CDN serving issue with ssr: true + prerender on Vercel; ssr: false resolves it
- [React Router Upgrading from RouterProvider](https://reactrouter.com/upgrading/router-provider) — HydratedRouter details, convert helper pattern

### Tertiary (LOW confidence)
- Community forums (Netlify, DEV.to, Medium) — corroborate build output structure and general migration patterns; not used as primary authority

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — `@react-router/dev`, `@react-router/node`, `@vercel/react-router` all confirmed via official docs
- Architecture: HIGH — migration steps directly from official React Router upgrading guide
- Pitfalls: MEDIUM-HIGH — Pitfalls 1-4 verified against official docs; Pitfalls 5-8 inferred from docs + project code analysis
- Pre-rendering config: HIGH — full API documented; dynamic route enumeration pattern confirmed
- Vercel deployment: MEDIUM — `@vercel/react-router` strongly recommended; exact `vercel.json` keys confirmed from Vercel docs

**Research date:** 2026-03-03
**Valid until:** 2026-04-03 (React Router 7 is stable but moving fast — verify if version jumps occur)
