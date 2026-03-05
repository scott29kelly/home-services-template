---
phase: 13-rr7-framework-mode-migration
plan: 01
subsystem: build-infrastructure
tags: [react-router, framework-mode, vite, typescript, entry-files]
dependency_graph:
  requires: []
  provides: [framework-mode-infrastructure, entry-files, route-config]
  affects: [vite.config.ts, package.json, tsconfig.app.json, .gitignore]
tech_stack:
  added:
    - "@react-router/dev@7.13.1 (devDependency) — Vite plugin, route type generation, dev server"
    - "@react-router/node@7.13.1 — Node.js streaming utilities for entry.server.tsx"
    - "@vercel/react-router@1.2.5 — Vercel preset for React Router CDN-aware routing"
    - "vite-tsconfig-paths@6.1.1 — resolves @/* TypeScript path aliases in Vite"
  patterns:
    - "reactRouter() Vite plugin replaces @vitejs/plugin-react"
    - "HydratedRouter + hydrateRoot replaces BrowserRouter + createRoot"
    - "RouteConfig in routes.ts replaces Routes/Route JSX in App.tsx"
    - "Layout export in root.tsx replaces index.html document shell"
key_files:
  created:
    - src/root.tsx
    - src/entry.client.tsx
    - src/entry.server.tsx
    - src/routes.ts
    - src/routes/layout.tsx
    - react-router.config.ts
  modified:
    - package.json
    - vite.config.ts
    - tsconfig.app.json
    - .gitignore
decisions:
  - "Used explicit service routes (roofing/siding/storm-damage) instead of :serviceSlug dynamic route to avoid route collision with /services and other top-level routes"
  - "Created react-router.config.ts with appDirectory: src, buildDirectory: build, ssr: false (required for framework mode to find files in src/ instead of default app/)"
  - "generateSitemap() outDir updated from dist to build/client to match framework mode build output directory"
  - "vite-tsconfig-paths installed as regular dependency (npm auto-placed it there; works correctly regardless)"
metrics:
  duration_seconds: 298
  completed_date: "2026-03-03"
  tasks_completed: 2
  files_created: 6
  files_modified: 4
---

# Phase 13 Plan 01: RR7 Framework Mode Infrastructure Summary

**One-liner:** Installed React Router 7 framework mode packages and created all entry files (root.tsx, entry.client.tsx, entry.server.tsx, routes.ts, routes/layout.tsx) with reactRouter() Vite plugin replacing @vitejs/plugin-react.

---

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Install packages and update build configuration | 09bf73a | package.json, vite.config.ts, tsconfig.app.json, .gitignore, react-router.config.ts |
| 2 | Create framework mode entry files, routes config, and layout route | 82ff2f6 | src/root.tsx, src/entry.client.tsx, src/entry.server.tsx, src/routes.ts, src/routes/layout.tsx |

---

## What Was Built

### Package Changes
- Installed `@react-router/dev@7.13.1` (devDependency) — the core framework mode Vite plugin
- Installed `@react-router/node@7.13.1`, `@vercel/react-router@1.2.5`, `vite-tsconfig-paths@6.1.1`
- Upgraded `react-router-dom` from `^7.13.0` to `^7.13.1` (required for peer dep compatibility with @react-router/dev)
- Uninstalled `@vitejs/plugin-react` (replaced by `reactRouter()` from `@react-router/dev/vite`)
- Updated scripts: `dev` → `react-router dev`, `build` → `react-router build`

### Build Configuration
- `vite.config.ts`: Replaced `react()` with `reactRouter()`, added `tsconfigPaths()`, removed `rollupOptions.input`
- `tsconfig.app.json`: Added `"types": ["@react-router/dev"]`, `"rootDirs": [".", "./.react-router/types"]`, extended `include` to `.react-router/types/**/*`
- `.gitignore`: Added `.react-router/` and `build/` entries
- `react-router.config.ts` (new): Sets `appDirectory: "src"`, `buildDirectory: "build"`, `ssr: false`

### Framework Entry Files
- **`src/root.tsx`**: Document shell with `Layout` export (full html/head/body structure) and default `Root` component (`<Outlet />`). Includes `<Meta />`, `<Links />`, `<ScrollRestoration />`, `<Scripts />` from react-router. Moves all `<head>` content from `index.html` (fonts, favicon, OG tags, schema.org JSON-LD). Wraps children in `LazyMotion`/`MotionConfig` (moved from `main.tsx`).
- **`src/entry.client.tsx`**: Browser hydration entry using `hydrateRoot` + `HydratedRouter` (replaces `createRoot` + `BrowserRouter`).
- **`src/entry.server.tsx`**: Server/pre-render entry using `renderToPipeableStream` with streaming response, 5-second abort timeout.
- **`src/routes.ts`**: Config-first route declaration using `layout()`, `index()`, `route()` from `@react-router/dev/routes`. All routes declared unconditionally (feature flags handled at route module level, not config level).
- **`src/routes/layout.tsx`**: Shared layout route wrapping all pages with Header, Footer, ScrollToTop, AnnouncementBanner, AvaWidget, StickyMobileCTA, SpeedInsights. Imports from `react-router` (not `react-router-dom`).

---

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Upgraded react-router-dom to resolve peer dependency conflict**
- **Found during:** Task 1 — npm install of @react-router/dev
- **Issue:** `@react-router/dev@7.13.1` requires `react-router@^7.13.1` but project had `react-router-dom@^7.13.0` which installs `react-router@7.13.0`
- **Fix:** Upgraded `react-router-dom` to `^7.13.1` before installing framework packages
- **Files modified:** package.json, package-lock.json
- **Commit:** 09bf73a

**2. [Rule 3 - Blocking] Created react-router.config.ts**
- **Found during:** Task 1 — framework mode requires this file to locate `appDirectory: "src"`
- **Issue:** Without `react-router.config.ts`, the framework defaults to `appDirectory: "app/"` which does not exist in this project
- **Fix:** Created `react-router.config.ts` at project root with `appDirectory: "src"`, `buildDirectory: "build"`, `ssr: false`
- **Files modified:** react-router.config.ts (new)
- **Commit:** 09bf73a

---

## Decisions Made

1. **Explicit service routes over dynamic `:serviceSlug`** — Used `route('roofing', ...)`, `route('siding', ...)`, `route('storm-damage', ...)` instead of `route(':serviceSlug', ...)` to eliminate route collision risk with `/services`, `/projects`, and other top-level static routes. Confirmed by research Pitfall 5.

2. **`ssr: false` in react-router.config.ts** — All content is static and known at build time. No server runtime needed. Pre-rendering (Plan 03) will handle static HTML generation.

3. **`generateSitemap()` outDir updated to `build/client`** — Framework mode outputs to `build/client/` instead of `dist/`. Sitemap/robots.txt must be written to the correct output directory.

4. **Did not add `@vercel/react-router` preset to react-router.config.ts** — The `vercelPreset()` import requires the package to be fully configured. The Vercel preset will be added in Plan 03 when the full prerender configuration is set up, since that's when the complete Vercel deployment config is established.

---

## Expected State After This Plan

The dev server (`react-router dev`) will start but show errors for missing route modules (`src/routes/home.tsx`, etc.) because those files don't exist yet. This is expected — Plan 02 creates all route modules from existing page components.

---

## Self-Check: PASSED

All created files verified present on disk. Both task commits (09bf73a, 82ff2f6) verified in git log.
