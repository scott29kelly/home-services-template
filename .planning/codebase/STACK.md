# Technology Stack

**Analysis Date:** 2026-02-21

## Languages

**Primary:**
- TypeScript 5.9.3 - React components (`src/components/`, `src/pages/`), configuration, and hooks
- JavaScript - API backend handlers and utility scripts (`api/`)

**Secondary:**
- HTML - Static entry point (`index.html`), inline Schema.org markup
- CSS - Tailwind CSS v4 with custom theme tokens (`src/index.css`)

## Runtime

**Environment:**
- Node.js (standard for development and backend API)

**Package Manager:**
- npm 10.x (specified in package-lock.json)
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- React 19.2.4 - Frontend UI library
- React Router DOM 7.13.0 - Client-side routing
- Vite 7.3.1 - Build tool and dev server

**Styling:**
- Tailwind CSS 4.1.18 - Utility-first CSS framework with `@tailwindcss/vite` plugin
- Framer Motion 12.34.0 - Animation library for motion effects
- Lucide React 0.564.0 - Icon library

**Testing:**
- Playwright 1.58.2 - E2E testing framework (installed but not configured in scripts)

## Key Dependencies

**Critical:**
- `react` 19.2.4 - Core frontend framework
- `react-dom` 19.2.4 - DOM rendering for React
- `react-router-dom` 7.13.0 - SPA routing and navigation
- `framer-motion` 12.34.0 - Smooth animations and motion effects
- `tailwindcss` 4.1.18 - Responsive CSS framework with custom theme

**Build/Dev:**
- `vite` 7.3.1 - Lightning-fast build tool replacing webpack
- `@vitejs/plugin-react` 5.1.4 - Vite plugin for React Fast Refresh
- `@tailwindcss/vite` 4.1.18 - Tailwind integration with Vite
- `typescript` 5.9.3 - Type checking and compilation

**API Backend (Node.js):**
- `dotenv` 16.6.1 - Environment variable loading for API (`api/package.json`)

## Configuration

**Environment:**
- Frontend: Static hosting via Vercel (see `vercel.json`)
- Backend: Serverless functions (`/api/chat`) or Cloudflare Workers
- Environment variables required:
  - `GROQ_API_KEY` - For Groq LLM API (primary, free tier available)
  - `ANTHROPIC_API_KEY` - Alternative for Anthropic Claude API (Vercel workers only)

**Build:**
- `vite.config.ts` - Vite configuration with React and Tailwind plugins
- `tsconfig.json` - TypeScript root configuration with references
- `tsconfig.app.json` - Application TypeScript settings (ES2020 target, ESNext modules, strict mode)
- Path aliases: `@/*` maps to `src/*`

## Platform Requirements

**Development:**
- Node.js 18+ (ESM-based, `"type": "module"` in package.json)
- npm 10.x
- Supports Windows/Mac/Linux (cross-platform shell commands use Unix syntax)

**Production:**
- Vercel (recommended, see `vercel.json` configuration)
- Static site hosting (dist folder) + serverless backend for `/api/chat` endpoint
- Alternative: Cloudflare Workers for API backend

## Build Process

**Commands:**
- `npm run dev` - Start Vite dev server (port 5173 by default)
- `npm run build` - TypeScript compilation + Vite production build + image copying
  - Runs: `tsc -b && vite build && cp -r images dist/images`
- `npm run preview` - Preview production build locally

**Output:**
- Frontend: `dist/` folder with bundled HTML/JS/CSS/images
- Images: Manually copied to `dist/images/` during build

---

*Stack analysis: 2026-02-21*
