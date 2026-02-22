# Technology Stack

**Project:** Home Services Premium Template
**Researched:** 2026-02-21
**Overall Confidence:** HIGH (stack decisions verified against official docs and multiple sources)

---

## Current Stack Assessment

The existing stack is strong and modern. React 19 + Vite 7 + Tailwind v4 + TypeScript is the correct foundation for a premium template in 2026. No framework migration is needed. The core decisions below focus on what to ADD to elevate this from "free template" to "premium product."

### What We Keep (Already Excellent)

| Technology | Version | Verdict |
|------------|---------|---------|
| React 19 | ^19.2.4 | Keep. Native metadata hoisting, Suspense, lazy loading all working correctly. |
| Vite 7 | ^7.3.1 | Keep. Fastest DX in the ecosystem. |
| Tailwind CSS v4 | ^4.1.18 | Keep. CSS-first `@theme` approach is already in use. |
| TypeScript | ^5.9.3 | Keep. Strict mode enabled. |
| React Router | ^7.13.0 | Keep, but upgrade usage (see Pre-rendering below). |
| Lucide React | ^0.564.0 | Keep. Tree-shakeable, consistent icon set. |
| Framer Motion | ^12.34.0 | Keep, but optimize bundle (see Motion section below). |

---

## Recommended Additions

### 1. Form Handling: React Hook Form + Zod

**Why:** The current contact form uses raw `useState` with no validation, no error states, and no type safety. This is the single biggest gap between "free template" and "premium product." Lead capture is the entire point of a home services website.

| Package | Purpose | Bundle Impact |
|---------|---------|---------------|
| `react-hook-form` | Form state, validation, submission | ~12kb gzipped |
| `zod` | Schema validation, TypeScript inference | ~14kb gzipped |
| `@hookform/resolvers` | Bridge between RHF and Zod | ~2kb gzipped |

**What this enables:**
- Field-level validation with inline error messages
- Phone number formatting/validation
- Email validation
- Required field enforcement with accessible error announcements
- Type-safe form schemas that match the config system
- Multi-step forms (future differentiator)
- Config-driven form fields (service options, referral sources from `site.ts`)

**Implementation pattern:**

```typescript
// src/lib/schemas.ts
import { z } from 'zod'

export const contactSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  address: z.string().min(5, 'Please enter your property address'),
  service: z.string().min(1, 'Please select a service'),
  referral: z.string().optional(),
  message: z.string().optional(),
})

export type ContactFormData = z.infer<typeof contactSchema>
```

**Confidence:** HIGH -- React Hook Form + Zod is the undisputed standard for React form handling in 2025-2026. Every credible source recommends this combination. Zod v4+ supports automatic TypeScript type inference from schemas.

```bash
npm install react-hook-form zod @hookform/resolvers
```

---

### 2. SEO: Structured Data (JSON-LD) + Sitemap Generation

The current `PageMeta` component handles basic `<title>` and OG tags using React 19 native metadata hoisting. This is correct and should be kept -- no need for `react-helmet-async`. But premium templates need structured data for rich search results.

**React 19 Native Metadata:** The existing approach of rendering `<title>` and `<meta>` tags directly in components (which React 19 hoists to `<head>`) is the officially recommended approach. Do NOT add react-helmet-async -- it is unmaintained as of 2025 and React 19 makes it unnecessary for our use case.

#### JSON-LD Structured Data

No additional package needed. Implement as a component that renders a `<script type="application/ld+json">` tag.

**Essential schemas for home services:**

| Schema Type | Purpose | Where |
|-------------|---------|-------|
| `LocalBusiness` | Company info, address, hours, phone | Every page (in Layout) |
| `Service` | Individual service descriptions | Service pages (Roofing, Siding, Storm) |
| `FAQPage` | FAQ sections for rich snippets | Pages with FAQ components |
| `Review` / `AggregateRating` | Testimonials for star ratings in search | Testimonials page, Home |
| `BreadcrumbList` | Navigation path | All pages |

**Implementation pattern:**

```typescript
// src/components/seo/JsonLd.tsx
interface JsonLdProps {
  data: Record<string, unknown>
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

// Usage in Layout.tsx - pulls from SITE config
export function LocalBusinessJsonLd() {
  return (
    <JsonLd data={{
      '@context': 'https://schema.org',
      '@type': 'HomeAndConstructionBusiness',
      name: SITE.name,
      telephone: SITE.phone,
      email: SITE.email,
      address: {
        '@type': 'PostalAddress',
        streetAddress: SITE.address.street,
        addressLocality: SITE.address.city,
        addressRegion: SITE.address.state,
        postalCode: SITE.address.zip,
      },
      // ...etc from SITE config
    }} />
  )
}
```

**Confidence:** HIGH -- Google explicitly recommends JSON-LD for structured data. `HomeAndConstructionBusiness` is a recognized Schema.org subtype of LocalBusiness, perfect for roofing/siding companies.

#### Sitemap Generation

| Package | Purpose |
|---------|---------|
| `vite-plugin-sitemap` | Auto-generates sitemap.xml + robots.txt at build time |

```bash
npm install -D vite-plugin-sitemap
```

Configuration in `vite.config.ts`:

```typescript
import sitemap from 'vite-plugin-sitemap'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    sitemap({
      hostname: 'https://example.com', // pulled from env or config
      dynamicRoutes: [
        '/', '/roofing', '/siding', '/storm-damage', '/services',
        '/projects', '/testimonials', '/about', '/contact',
        '/service-areas', '/ava',
      ],
    }),
  ],
})
```

**Confidence:** HIGH -- vite-plugin-sitemap is the standard Vite sitemap tool, actively maintained, 300k+ weekly npm downloads.

---

### 3. Performance: Motion Bundle Optimization

Framer Motion (now "Motion") is ~34kb bundled. For a marketing site template, this is the largest single dependency. Use **LazyMotion** with **domAnimation** to cut this roughly in half.

**Current:** Every page loads the full Motion bundle (~34kb).
**Optimized:** Initial load gets ~4.6kb core + ~18kb domAnimation features loaded sync/async.

**Implementation:**

```typescript
// src/main.tsx
import { LazyMotion, domAnimation } from 'framer-motion'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LazyMotion features={domAnimation} strict>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </LazyMotion>
  </StrictMode>,
)
```

Then replace `motion.div` imports with `m.div` from `framer-motion`:

```typescript
// Before
import { motion } from 'framer-motion'
<motion.div animate={{ opacity: 1 }}>

// After
import { m } from 'framer-motion'
<m.div animate={{ opacity: 1 }}>
```

**What we keep:** Animations, variants, exit animations, hover/focus/press gestures. These are all in `domAnimation`.

**What we do NOT need:** Pan/drag gestures and layout animations (`domMax`). No component in the current template uses drag or layout animations.

**Confidence:** HIGH -- Official Motion documentation. The `domAnimation` feature set covers every animation pattern used in the current codebase (opacity, y transforms, stagger, AnimatePresence exit animations, hover/press gestures on buttons).

---

### 4. Performance: Image Optimization

The current build copies images with `cp -r` and serves unoptimized originals. This is the single biggest LCP bottleneck.

| Package | Purpose |
|---------|---------|
| `vite-plugin-image-optimizer` | Compresses images at build time using Sharp.js |

```bash
npm install -D vite-plugin-image-optimizer
```

**Configuration:**

```typescript
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    ViteImageOptimizer({
      jpg: { quality: 80 },
      png: { quality: 80 },
      webp: { quality: 80 },
      avif: { quality: 65, speed: 4 },
    }),
  ],
})
```

**Additional image practices to implement (no packages needed):**

1. **Hero image preloading** -- already using `fetchPriority="high"` on hero `<img>`, good. Add `<link rel="preload">` in `index.html` for the hero image.
2. **Responsive images** -- add `srcset` and `sizes` attributes to hero and gallery images.
3. **AVIF with WebP fallback** -- use `<picture>` element for hero images.
4. **Explicit dimensions** -- add `width` and `height` attributes to ALL images to prevent CLS.

**Confidence:** HIGH -- vite-plugin-image-optimizer uses Sharp.js (the industry standard), actively maintained, well-documented.

---

### 5. Performance Monitoring: Web Vitals + Vercel Speed Insights

| Package | Purpose |
|---------|---------|
| `web-vitals` | Google's official CWV measurement library (~2kb) |
| `@vercel/speed-insights` | Real user monitoring on Vercel dashboard |

```bash
npm install web-vitals @vercel/speed-insights
```

**Why this matters for a premium template:** Buyers want to know their template scores well on PageSpeed Insights. Including built-in monitoring lets them verify performance and demonstrates our commitment to quality.

**Implementation:**

```typescript
// src/lib/vitals.ts
import { onCLS, onINP, onLCP } from 'web-vitals'

export function reportWebVitals() {
  onCLS(console.log)  // or send to analytics
  onINP(console.log)
  onLCP(console.log)
}

// src/main.tsx
import { SpeedInsights } from '@vercel/speed-insights/react'

// Add <SpeedInsights /> in the app root
```

**Confidence:** HIGH -- web-vitals is Google's own library. @vercel/speed-insights is the official Vercel package.

---

### 6. Config Architecture: Enhanced Type-Safe Configuration

The current `src/config/site.ts` is a good start but needs expansion for a premium product. No new packages needed -- this is an architecture pattern.

**What to add to the config system:**

```typescript
// src/config/site.ts - expanded structure
export const SITE = {
  // ... existing fields ...

  // NEW: Theme configuration
  theme: {
    colors: {
      primary: '#0EA5E9',     // brand-blue
      accent: '#F97316',      // safety-orange
      dark: '#0F172A',        // navy
      surface: '#F8FAFC',
      border: '#E2E8F0',
    },
    fonts: {
      heading: 'Plus Jakarta Sans',
      body: 'Inter',
    },
    radius: 'rounded-2xl',    // border radius preset
  },

  // NEW: Feature flags
  features: {
    aiChat: true,
    blog: false,
    googleReviews: false,
    beforeAfterGallery: true,
    videoTestimonials: false,
    multiStepForm: false,
    serviceAreaMap: false,
  },

  // NEW: Services (config-driven, not hardcoded)
  services: [
    {
      slug: 'roofing',
      name: 'Roofing',
      icon: 'Home',
      shortDescription: 'Complete roof replacements...',
      heroImage: '/images/hero-roofing.webp',
    },
    // ...
  ],

  // NEW: Testimonials data
  testimonials: [
    {
      name: 'John Smith',
      location: 'Anytown, TX',
      rating: 5,
      text: '...',
      image: '/images/testimonial-1.webp',
    },
  ],

  // NEW: SEO defaults
  seo: {
    titleTemplate: '%s | Acme Home Services',
    defaultDescription: '...',
    ogImage: '/images/og-default.webp',
  },

  // NEW: Analytics/tracking
  tracking: {
    gtmId: '',
    googleAdsId: '',
    facebookPixelId: '',
  },
} as const
```

**Why this architecture matters:**
- Buyers edit ONE file, not dozens of components
- TypeScript catches config errors at build time
- Demo mode works by swapping config files
- Multiple "skins" or industry variants become trivial

**Confidence:** HIGH -- this is a well-established pattern in successful template products (ThemeForest best sellers, shadcn/ui, Tailwind Plus templates all use centralized config).

---

### 7. Pre-rendering for SEO (Future Phase)

React Router v7 now supports build-time pre-rendering via `react-router.config.ts`. This is the correct path for SEO-critical marketing sites -- NOT migrating to Next.js.

**NOTE:** This requires migrating from React Router "library mode" (current: `BrowserRouter` in `main.tsx`) to React Router "framework mode" (using `react-router.config.ts` + `routes.ts`). This is a significant refactor and should be a dedicated phase, not mixed with other work.

**What pre-rendering gives us:**
- Each route generates static HTML at build time
- Search engines get fully-rendered content (no JS required)
- Faster First Contentful Paint (FCP) and LCP
- Still works as an SPA after hydration
- No server required -- deploy to any static host or CDN

**Configuration (when ready):**

```typescript
// react-router.config.ts
import type { Config } from "@react-router/dev/config"

export default {
  ssr: false,
  prerender: [
    "/", "/roofing", "/siding", "/storm-damage",
    "/services", "/projects", "/testimonials",
    "/about", "/contact", "/service-areas", "/ava",
  ],
} satisfies Config
```

**Confidence:** MEDIUM -- React Router v7 pre-rendering is well-documented but the migration from library mode to framework mode has rough edges per GitHub issues. This should be researched specifically when that phase begins.

---

### 8. Blog / Content (Future Differentiator)

For a future phase, adding a blog elevates SEO significantly for home services sites. The recommended approach:

| Package | Purpose |
|---------|---------|
| `@mdx-js/rollup` | MDX compilation in Vite (Rollup plugin) |
| `@mdx-js/react` | MDX React provider for component mapping |

MDX allows blog posts to include React components (before/after sliders, CTAs, embedded forms) while being authored as markdown. This is the standard approach for Vite + React content sites in 2025-2026.

**Confidence:** MEDIUM -- MDX + Vite is well-documented and works, but blog functionality is a later-phase feature. Research specifics when that phase begins.

---

## Alternatives Considered (and Rejected)

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Meta tags | React 19 native | react-helmet-async | Unmaintained since 2024. React 19 handles this natively. |
| Framework | Vite + React Router | Next.js | Migration cost too high. React Router v7 pre-rendering provides SSG without framework switch. |
| Framework | Vite + React Router | Astro | Astro is great for content sites but we need SPA behavior for the AI chat widget and interactive elements. |
| CSS | Tailwind v4 | CSS Modules / styled-components | Tailwind v4 is faster, config-driven, and what the market expects for premium templates. |
| Animation | Framer Motion (LazyMotion) | CSS animations only | Framer Motion's declarative API enables the complex staggered/scroll-reveal animations that make a template feel premium. Worth the ~18kb. |
| Animation | Framer Motion | GSAP | GSAP licensing is complex for template products. Framer Motion is MIT-licensed and easier for buyers to customize. |
| Forms | React Hook Form + Zod | Formik + Yup | RHF is smaller, faster, and better maintained. Zod has superior TypeScript integration vs Yup. |
| State mgmt | React Context + useState | Redux / Zustand | Overkill. A template has no complex global state. Config is static, form state is local. |
| Icons | Lucide React | Heroicons / React Icons | Lucide is already in use, tree-shakeable, consistent style. No reason to switch. |
| Component lib | Custom components | shadcn/ui | Adding shadcn/ui would bloat the template with unused components and add a dependency on Radix UI. Our custom components are purpose-built and simpler for buyers to customize. |

---

## Full Installation Commands

### New Production Dependencies

```bash
npm install react-hook-form zod @hookform/resolvers web-vitals @vercel/speed-insights
```

### New Dev Dependencies

```bash
npm install -D vite-plugin-image-optimizer vite-plugin-sitemap
```

### Already Installed (No Changes)

```
react, react-dom, react-router-dom, framer-motion, lucide-react
tailwindcss, @tailwindcss/vite, @vitejs/plugin-react, typescript, vite
```

---

## Complete Recommended Stack Table

### Core Framework

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| React | ^19.2.4 | UI framework | Current. Native metadata hoisting, Suspense, lazy. |
| Vite | ^7.3.1 | Build tool | Fastest builds, excellent DX, huge plugin ecosystem. |
| TypeScript | ^5.9.3 | Type safety | Strict mode. Catches config errors at build time. |
| React Router | ^7.13.0 | Routing | Pre-rendering capability. Already installed. |
| Tailwind CSS | ^4.1.18 | Styling | CSS-first @theme tokens. Industry standard for templates. |

### Animation & UX

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Framer Motion | ^12.34.0 | Animations | Use with LazyMotion + domAnimation to cut bundle ~50%. |
| Lucide React | ^0.564.0 | Icons | Tree-shakeable. 1500+ icons. Consistent style. |

### Forms & Validation

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| react-hook-form | latest | Form state management | Minimal re-renders, performant, accessible. |
| zod | latest | Schema validation | Type-safe schemas, TypeScript inference, composable. |
| @hookform/resolvers | latest | RHF-Zod bridge | Official integration adapter. |

### SEO & Performance

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| vite-plugin-sitemap | latest | Sitemap generation | Auto-generates sitemap.xml + robots.txt at build. |
| vite-plugin-image-optimizer | latest | Image compression | Sharp.js-based, WebP/AVIF optimization at build. |
| web-vitals | latest | CWV monitoring | Google's official library. ~2kb. |
| @vercel/speed-insights | latest | Real user monitoring | Free with Vercel. Dashboard metrics for buyers. |

### Infrastructure

| Technology | Purpose | Why |
|------------|---------|-----|
| Vercel | Hosting + serverless | Free tier, instant deploys, Edge Functions for AI chat. |
| Groq API | AI chat backend | Fast inference, free tier, Llama 3.3 70B model. |

---

## Theme Architecture: How Colors Flow from Config

```
site.ts (SITE.theme.colors)
    |
    v
index.css (@theme { --color-brand-blue: ... })
    |
    v
Tailwind utilities (bg-brand-blue, text-safety-orange, etc.)
    |
    v
Components (className="bg-brand-blue")
```

**For premium customization:** Colors in `site.ts` should drive the `@theme` block in `index.css`. This can be achieved with a build-time script that reads `site.ts` and generates the CSS custom properties, OR by documenting that buyers update both files (simpler, more transparent).

Recommendation: **Document the two-file approach** (site.ts for data, index.css for colors). A build-time script adds complexity that makes the template harder for non-technical buyers to understand.

---

## Performance Budget

Target Core Web Vitals for the template:

| Metric | Target | How |
|--------|--------|-----|
| LCP | < 2.0s | Preload hero image, optimize images, code-split |
| INP | < 150ms | Minimal JS on main thread, use `requestIdleCallback` for analytics |
| CLS | < 0.05 | Explicit image dimensions, font-display: swap, no layout shifts |
| Total JS (gzipped) | < 120kb | LazyMotion, code-splitting, tree-shaking |
| First Load | < 200kb total | Critical CSS inline, deferred non-critical JS |

---

## What Makes THIS Template "Premium"

Based on market research of top-selling templates on ThemeForest and competing platforms (Framer marketplace, Webflow templates), premium templates justify their price through:

1. **Config-driven customization** -- single file to rebrand (we have this, expanding it)
2. **Real form validation** -- not just visual, actually validates and handles errors (adding RHF + Zod)
3. **SEO out of the box** -- structured data, sitemap, proper meta tags (adding JSON-LD + sitemap)
4. **Performance scores** -- demonstrable 90+ Lighthouse scores (optimizing images + motion bundle)
5. **AI-powered feature** -- the chat widget is a genuine differentiator most templates lack (already have)
6. **Polished animations** -- scroll reveals, staggered entries, micro-interactions (already have, optimizing)
7. **Multiple page variants** -- service pages, testimonials, projects, contact (already have 11 pages)
8. **Responsive and accessible** -- mobile-first, WCAG compliance, keyboard navigation (partially done, needs audit)
9. **Documentation** -- setup guide, customization guide, deployment guide (needs creation)
10. **Demo-ready** -- works immediately with placeholder content (already works, needs polish)

**What the competition lacks that we have:** AI chat assistant. This is the single biggest differentiator. No competing roofing/siding template offers an AI-powered lead qualification chatbot.

---

## Sources

- [React 19 Document Metadata](https://react.dev/blog/2024/12/05/react-19) -- HIGH confidence
- [Motion Reduce Bundle Size](https://motion.dev/docs/react-reduce-bundle-size) -- HIGH confidence
- [Motion LazyMotion docs](https://motion.dev/docs/react-lazy-motion) -- HIGH confidence
- [React Router v7 Pre-Rendering](https://reactrouter.com/how-to/pre-rendering) -- HIGH confidence
- [vite-plugin-sitemap GitHub](https://github.com/jbaubree/vite-plugin-sitemap) -- HIGH confidence
- [vite-plugin-image-optimizer GitHub](https://github.com/FatehAK/vite-plugin-image-optimizer) -- HIGH confidence
- [React Hook Form + Zod integration](https://react-hook-form.com/get-started) -- HIGH confidence
- [Schema.org LocalBusiness](https://schema.org/LocalBusiness) -- HIGH confidence
- [Google web-vitals library](https://github.com/GoogleChrome/web-vitals) -- HIGH confidence
- [Vercel Speed Insights](https://vercel.com/docs/speed-insights) -- HIGH confidence
- [Core Web Vitals 2026 metrics](https://nitropack.io/blog/most-important-core-web-vitals-metrics/) -- MEDIUM confidence
- [ThemeForest React Templates](https://themeforest.net/search/react) -- market research
- [Roofing Website Best Practices](https://hookagency.com/blog/best-roofing-websites/) -- MEDIUM confidence
- [SPA SEO Strategies 2026](https://www.copebusiness.com/technical-seo/spa-seo-strategies/) -- MEDIUM confidence
