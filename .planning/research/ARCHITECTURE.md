# Architecture Patterns

**Domain:** Config-driven premium home services website template
**Researched:** 2026-02-21
**Stack:** React 19 + Vite 7 + Tailwind CSS v4 + TypeScript + Framer Motion + React Router v7

---

## Table of Contents

1. [Current State Analysis](#current-state-analysis)
2. [Recommended Architecture](#recommended-architecture)
3. [Config System Architecture](#config-system-architecture)
4. [Config-Driven Routing](#config-driven-routing)
5. [Config-Driven Navigation](#config-driven-navigation)
6. [Content Config vs Feature Config vs Theme Config](#content-config-vs-feature-config-vs-theme-config)
7. [Markdown Blog Architecture](#markdown-blog-architecture)
8. [Auto-Generated City/Service Pages](#auto-generated-cityservice-pages)
9. [Form Submission Architecture](#form-submission-architecture)
10. [SEO and Prerendering Strategy](#seo-and-prerendering-strategy)
11. [Component Boundaries](#component-boundaries)
12. [Data Flow](#data-flow)
13. [Anti-Patterns to Avoid](#anti-patterns-to-avoid)
14. [Sources](#sources)

---

## Current State Analysis

### What exists today

The template has a single `src/config/site.ts` exporting a `SITE` const with `as const` for literal types. This object mixes company info, contact details, service areas, stats, social links, and AI assistant config into one flat namespace.

**Problems identified in the current architecture:**

| Problem | Location | Impact |
|---------|----------|--------|
| Navigation hardcoded in components | `Header.tsx` lines 6-23, `Footer.tsx` lines 5-18 | Adding a page requires editing 3+ files (App.tsx route, Header nav, Footer nav) |
| Content hardcoded in page files | `Projects.tsx` lines 10-38, `TestimonialsPage.tsx` lines 15-80 | Non-technical users must edit React components to change content |
| Duplicate testimonial data | `Testimonials.tsx` (section) vs `TestimonialsPage.tsx` (page) | Same testimonials defined in two places with different shapes |
| Service data hardcoded | `Roofing.tsx` lines 9-46, `BentoGrid.tsx` | Service info scattered across multiple component files |
| No config validation | `site.ts` uses `as const` only | Typos and missing fields produce no error until runtime |
| Form has no backend | `Contact.tsx` line 57 | `handleSubmit` just sets `submitted = true`, no actual submission |
| FAQs hardcoded per page | `Roofing.tsx` lines 72-93, `Contact.tsx` lines 29-50 | Same pattern duplicated, data buried in components |
| Routes hardcoded in App.tsx | `App.tsx` lines 28-48 | Adding pages requires code changes in multiple files |

### What the architecture upgrade must solve

1. A non-technical user edits config files only (never touches React components)
2. Adding a service, city, blog post, or testimonial requires zero code changes
3. Navigation generates automatically from the services and pages defined in config
4. The system validates config at build time and provides clear error messages
5. SEO metadata generates automatically for every page including auto-generated ones

---

## Recommended Architecture

### Directory Structure

```
src/
  config/
    index.ts              # Re-exports validated config, single import point
    schema.ts             # Zod schemas for all config types
    defaults.ts           # Default values for optional config fields
    company.ts            # Company name, contact, address, hours, social
    services.ts           # Service definitions (roofing, siding, etc.)
    service-areas.ts      # States, cities, per-city content templates
    navigation.ts         # Nav structure (auto-generated from services + pages)
    testimonials.ts       # All testimonial data in one place
    projects.ts           # Portfolio/project gallery data + before/after
    team.ts               # Team member profiles
    assistant.ts          # AI assistant config (name, greetings, actions)
    forms.ts              # Form fields, submission endpoints, webhooks
    theme.ts              # Colors, fonts, spacing overrides
    seo.ts                # Default meta, OG image, structured data config
    features.ts           # Feature flags (blog enabled, chat enabled, etc.)
  content/
    blog/                 # Markdown blog posts with frontmatter
      2026-01-15-storm-season.md
      2026-02-01-insurance-guide.md
  components/
    sections/             # Reusable page sections (read from config)
    layout/               # Header, Footer, Layout (read from config)
    ui/                   # Atoms: Button, Card, etc.
    pages/                # Page-level compositions
  lib/
    config-loader.ts      # Merges configs, validates, provides runtime access
    route-generator.ts    # Generates route config from services + cities + blog
    seo.ts                # Structured data / meta tag generation
    form-handler.ts       # Form submission + webhook logic
    blog.ts               # Blog post loading + frontmatter parsing
  hooks/
    useConfig.ts          # React context hook for config access
    useScrollReveal.ts    # Existing animation hook
  pages/                  # Page components (consume config, no hardcoded data)
```

### Why modular config files, not a single mega-file

**Confidence: HIGH** (architectural best practice, verified across multiple template products)

A single `site.ts` works for a 10-field config. This product will have 200+ fields across services, testimonials, projects, cities, blog posts, FAQs, team members, and feature flags. A single file becomes:

- Impossible to navigate (800+ lines)
- Merge-conflict-prone when multiple sections are edited
- Intimidating to non-technical users who only need to edit testimonials

The modular approach lets a user open `testimonials.ts`, see only testimonials, edit them, and close the file. Each file is self-documenting, short (50-150 lines), and validates independently.

**Re-export pattern for developer convenience:**

```typescript
// src/config/index.ts
export { company } from './company'
export { services } from './services'
export { serviceAreas } from './service-areas'
export { testimonials } from './testimonials'
export { projects } from './projects'
export { navigation } from './navigation'
export { assistant } from './assistant'
export { forms } from './forms'
export { theme } from './theme'
export { seo } from './seo'
export { features } from './features'

// Validated aggregate for components that need multiple config sections
export { siteConfig } from './schema'
```

Components import what they need:

```typescript
// Clean, explicit imports
import { company } from '@/config'
import { services } from '@/config'
```

---

## Config System Architecture

### TypeScript Pattern: Zod Schema + Inferred Types

**Confidence: HIGH** (Zod is the industry standard for runtime TypeScript validation)

Use Zod to define schemas that serve triple duty: runtime validation, TypeScript type inference, and documentation via schema structure. Add Zod as a dependency (~52KB, tree-shakes well).

```bash
npm install zod
```

**Why Zod, not just TypeScript types:**

| Approach | Compile-time safety | Runtime safety | Error messages | Self-documenting |
|----------|-------------------|---------------|----------------|-----------------|
| `as const` (current) | Partial | None | None | No |
| TypeScript interfaces | Yes | None | None | Somewhat |
| Zod schemas | Yes (via `z.infer`) | Yes | Detailed, human-readable | Yes |

**Schema definition pattern:**

```typescript
// src/config/schema.ts
import { z } from 'zod'

// ── Company ────────────────────────────────────────
export const CompanySchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  tagline: z.string().min(1, 'Tagline is required'),
  phone: z.string().regex(/^[\d\-\(\)\s\+]+$/, 'Invalid phone format'),
  email: z.string().email('Invalid email address'),
  url: z.string().url('Invalid URL'),
  address: z.object({
    street: z.string().min(1),
    city: z.string().min(1),
    state: z.string().length(2, 'Use 2-letter state code'),
    zip: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code'),
  }),
  hours: z.object({
    weekday: z.string(),
    saturday: z.string(),
    sunday: z.string(),
    emergency: z.string().optional(),
  }),
  social: z.record(z.string().url()).optional(),
  certifications: z.array(z.string()).default([]),
})

export type Company = z.infer<typeof CompanySchema>

// ── Service ────────────────────────────────────────
export const ServiceSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens'),
  name: z.string().min(1),
  shortDescription: z.string().max(160, 'Keep under 160 chars for meta descriptions'),
  heroImage: z.string(),
  icon: z.string(), // Lucide icon name
  features: z.array(z.object({
    title: z.string(),
    description: z.string(),
    image: z.string().optional(),
    bulletPoints: z.array(z.string()).default([]),
  })),
  materials: z.array(z.object({
    title: z.string(),
    description: z.string(),
    items: z.array(z.string()),
  })).default([]),
  faqs: z.array(z.object({
    question: z.string(),
    answer: z.string(),
  })).default([]),
  seo: z.object({
    title: z.string().optional(),
    description: z.string().max(160).optional(),
  }).optional(),
})

export type Service = z.infer<typeof ServiceSchema>

// ── Testimonial ────────────────────────────────────
export const TestimonialSchema = z.object({
  name: z.string(),
  location: z.string(),
  service: z.string().optional(),
  quote: z.string(),
  shortQuote: z.string().max(200).optional(), // For homepage carousel
  image: z.string(),
  rating: z.number().min(1).max(5).default(5),
  featured: z.boolean().default(false), // Show on homepage
})

export type Testimonial = z.infer<typeof TestimonialSchema>

// ── Project ────────────────────────────────────────
export const ProjectSchema = z.object({
  id: z.number(),
  title: z.string(),
  location: z.string(),
  category: z.string(),
  detail: z.string(),
  image: z.string(),
  beforeImage: z.string().optional(),
  afterImage: z.string().optional(),
  description: z.string().optional(),
  featured: z.boolean().default(false),
})

export type Project = z.infer<typeof ProjectSchema>

// ── City / Service Area ────────────────────────────
export const CitySchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string(),
  state: z.string().length(2),
  stateFullName: z.string(),
  isHQ: z.boolean().default(false),
  description: z.string().optional(),     // Unique content for SEO
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  nearbyAreas: z.array(z.string()).default([]),
})

export type City = z.infer<typeof CitySchema>

export const ServiceAreaSchema = z.object({
  summary: z.string(),
  states: z.array(z.object({
    name: z.string(),
    abbreviation: z.string().length(2),
    badge: z.string().optional(),
    cities: z.array(CitySchema),
  })),
})

export type ServiceArea = z.infer<typeof ServiceAreaSchema>
```

### Config File Pattern (what non-technical users edit)

```typescript
// src/config/company.ts
import type { Company } from './schema'

export const company: Company = {
  name: 'Acme Home Services',
  tagline: 'Roofing & Siding',
  phone: '555-123-4567',
  email: 'info@acmehomeservices.com',
  url: 'https://acmehomeservices.com',
  address: {
    street: '123 Main St',
    city: 'Anytown',
    state: 'TX',
    zip: '78701',
  },
  hours: {
    weekday: 'Mon-Fri: 8am-6pm',
    saturday: 'Sat: 9am-2pm',
    sunday: 'Sun: Closed',
    emergency: 'Emergency services available 24/7',
  },
  social: {
    facebook: 'https://facebook.com/acmehomeservices',
    instagram: 'https://instagram.com/acmehomeservices',
  },
  certifications: ['BBB A+', 'Licensed & Insured', 'Manufacturer Certified'],
}
```

### Build-Time Validation

```typescript
// src/config/index.ts
import { CompanySchema, ServiceSchema, TestimonialSchema, ProjectSchema, ServiceAreaSchema } from './schema'
import { company as rawCompany } from './company'
import { services as rawServices } from './services'
import { testimonials as rawTestimonials } from './testimonials'
import { projects as rawProjects } from './projects'
import { serviceAreas as rawServiceAreas } from './service-areas'

function validate<T>(schema: { parse: (data: unknown) => T }, data: unknown, label: string): T {
  try {
    return schema.parse(data)
  } catch (error) {
    console.error(`\n\n========================================`)
    console.error(`CONFIG ERROR in ${label}`)
    console.error(`========================================`)
    if (error instanceof Error) console.error(error.message)
    console.error(`\nFix the error in src/config/${label}.ts\n`)
    throw error
  }
}

export const company = validate(CompanySchema, rawCompany, 'company')
export const services = rawServices.map((s, i) =>
  validate(ServiceSchema, s, `services[${i}]`)
)
export const testimonials = rawTestimonials.map((t, i) =>
  validate(TestimonialSchema, t, `testimonials[${i}]`)
)
export const projects = rawProjects.map((p, i) =>
  validate(ProjectSchema, p, `projects[${i}]`)
)
export const serviceAreas = validate(ServiceAreaSchema, rawServiceAreas, 'service-areas')
```

This pattern catches errors at build time AND dev time with clear, actionable messages. When a user misspells a field or uses an invalid email, they get:

```
CONFIG ERROR in company
  - email: Invalid email address
  Fix the error in src/config/company.ts
```

---

## Config-Driven Routing

**Confidence: HIGH** (pattern is well-established, React Router v7 supports it natively)

### Strategy: Generate route arrays from config

The current `App.tsx` has 11 hardcoded routes. The config-driven version generates routes from services, cities, and blog posts.

```typescript
// src/lib/route-generator.ts
import { lazy } from 'react'
import type { RouteObject } from 'react-router-dom'
import { services } from '@/config'
import { serviceAreas } from '@/config'
import { features } from '@/config'

// Static page imports (always present)
const Home = lazy(() => import('@/pages/Home'))
const About = lazy(() => import('@/pages/About'))
const Contact = lazy(() => import('@/pages/Contact'))
const ProjectsPage = lazy(() => import('@/pages/Projects'))
const TestimonialsPage = lazy(() => import('@/pages/Testimonials'))
const ServiceAreasPage = lazy(() => import('@/pages/ServiceAreas'))
const ServicesPage = lazy(() => import('@/pages/Services'))

// Template pages (reused for each service/city)
const ServicePage = lazy(() => import('@/pages/ServicePage'))
const CityPage = lazy(() => import('@/pages/CityPage'))
const BlogIndex = lazy(() => import('@/pages/BlogIndex'))
const BlogPost = lazy(() => import('@/pages/BlogPost'))

// Optional pages
const AvaPage = lazy(() => import('@/pages/Ava'))

export function generateRoutes(): RouteObject[] {
  const routes: RouteObject[] = [
    { index: true, element: <Home /> },
    { path: 'about', element: <About /> },
    { path: 'contact', element: <Contact /> },
    { path: 'projects', element: <ProjectsPage /> },
    { path: 'testimonials', element: <TestimonialsPage /> },
    { path: 'service-areas', element: <ServiceAreasPage /> },
    { path: 'services', element: <ServicesPage /> },
  ]

  // Generate a route for each service defined in config
  for (const service of services) {
    routes.push({
      path: service.slug,
      element: <ServicePage />,
      // Pass service slug via route; component reads config by slug
    })
  }

  // Generate a route for each city (for local SEO)
  for (const state of serviceAreas.states) {
    for (const city of state.cities) {
      routes.push({
        path: `service-areas/${city.slug}`,
        element: <CityPage />,
      })
    }
  }

  // Blog routes (if blog feature enabled)
  if (features.blog) {
    routes.push(
      { path: 'blog', element: <BlogIndex /> },
      { path: 'blog/:slug', element: <BlogPost /> },
    )
  }

  // AI assistant page (if assistant feature enabled)
  if (features.assistant) {
    routes.push({ path: 'ava', element: <AvaPage /> })
  }

  return routes
}
```

**Updated App.tsx:**

```typescript
// src/App.tsx
import { Routes, Route, Suspense } from 'react-router-dom'
import Layout from './components/layout/Layout'
import { generateRoutes } from './lib/route-generator'

const routes = generateRoutes()

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<Layout />}>
          {routes.map((route, i) => (
            <Route key={route.path ?? i} {...route} />
          ))}
        </Route>
      </Routes>
    </Suspense>
  )
}
```

### Template Page Pattern (ServicePage)

Instead of a separate `Roofing.tsx`, `Siding.tsx`, `StormDamage.tsx`, use one `ServicePage.tsx` that reads the current service from config by matching the URL slug:

```typescript
// src/pages/ServicePage.tsx
import { useParams, Navigate } from 'react-router-dom'
import { services } from '@/config'
import Hero from '@/components/sections/Hero'
import FAQ from '@/components/sections/FAQ'
import CTA from '@/components/sections/CTA'
import ServiceFeatures from '@/components/sections/ServiceFeatures'
import ServiceMaterials from '@/components/sections/ServiceMaterials'
import PageMeta from '@/components/ui/PageMeta'
import { company } from '@/config'

export default function ServicePage() {
  const { slug } = useParams()  // won't exist - we use path matching
  // Since the route IS the slug (e.g., /roofing), we extract from pathname
  const pathname = window.location.pathname.replace(/^\//, '')
  const service = services.find(s => s.slug === pathname)

  if (!service) return <Navigate to="/" replace />

  return (
    <>
      <PageMeta
        title={service.seo?.title ?? `${service.name} Services`}
        description={service.seo?.description ?? service.shortDescription}
        path={`/${service.slug}`}
      />
      <Hero
        backgroundImage={service.heroImage}
        headline="Professional"
        highlightText={service.name}
        subhead={service.shortDescription}
        compact
      />
      <ServiceFeatures features={service.features} />
      {service.materials.length > 0 && (
        <ServiceMaterials materials={service.materials} />
      )}
      {service.faqs.length > 0 && (
        <FAQ title={`${service.name} FAQs`} items={service.faqs} />
      )}
      <CTA />
    </>
  )
}
```

This eliminates the need for separate Roofing.tsx, Siding.tsx, StormDamage.tsx. Adding a new service (e.g., "gutters") means adding an entry to `services.ts` -- zero component code changes.

---

## Config-Driven Navigation

**Confidence: HIGH** (direct application of observed current code patterns)

### Strategy: Derive navigation from services config + static pages

The header and footer currently have hardcoded nav link arrays. Replace with a system that auto-generates navigation from the services config and a simple page registry.

```typescript
// src/config/navigation.ts
import { services } from './services'
import { features } from './features'

export interface NavItem {
  href: string
  label: string
  dropdown?: NavItem[]
  showInHeader?: boolean
  showInFooter?: boolean
  footerGroup?: 'services' | 'company'
}

// Auto-generate from config
export function generateNavigation(): NavItem[] {
  const nav: NavItem[] = [
    { href: '/', label: 'Home', showInHeader: true, showInFooter: false },
    {
      href: '/services',
      label: 'Services',
      showInHeader: true,
      showInFooter: false,
      footerGroup: 'services',
      dropdown: services.map(s => ({
        href: `/${s.slug}`,
        label: s.name,
        showInHeader: true,
        showInFooter: true,
        footerGroup: 'services' as const,
      })),
    },
    { href: '/projects', label: 'Projects', showInHeader: true, showInFooter: true, footerGroup: 'company' },
    { href: '/testimonials', label: 'Testimonials', showInHeader: true, showInFooter: true, footerGroup: 'company' },
    { href: '/about', label: 'About', showInHeader: true, showInFooter: true, footerGroup: 'company' },
    { href: '/service-areas', label: 'Service Areas', showInHeader: true, showInFooter: true, footerGroup: 'company' },
  ]

  if (features.blog) {
    nav.push({ href: '/blog', label: 'Blog', showInHeader: true, showInFooter: true, footerGroup: 'company' })
  }

  if (features.assistant) {
    nav.push({ href: '/ava', label: 'Ask Ava', showInHeader: true, showInFooter: true, footerGroup: 'company' })
  }

  nav.push({ href: '/contact', label: 'Contact', showInHeader: true, showInFooter: true, footerGroup: 'company' })

  return nav
}

export const navigation = generateNavigation()
```

**Header consumes config:**

```typescript
// In Header.tsx - replace hardcoded navLinks with:
import { navigation } from '@/config/navigation'

const navLinks = navigation.filter(n => n.showInHeader)
```

**Footer consumes config:**

```typescript
// In Footer.tsx - replace hardcoded arrays with:
import { navigation } from '@/config/navigation'

const serviceLinks = navigation
  .flatMap(n => n.dropdown ?? [n])
  .filter(n => n.showInFooter && n.footerGroup === 'services')

const companyLinks = navigation
  .filter(n => n.showInFooter && n.footerGroup === 'company')
```

When someone adds a service to `services.ts`, it automatically appears in the Services dropdown in the header AND in the footer's services column. Zero manual navigation updates.

---

## Content Config vs Feature Config vs Theme Config

**Confidence: HIGH** (separation of concerns is fundamental architecture)

### The Three Config Layers

This separation is critical for the non-technical user experience. Each layer has a different audience and change frequency:

| Layer | What it contains | Who edits it | Change frequency | File(s) |
|-------|-----------------|-------------|------------------|---------|
| **Content** | Text, images, testimonials, projects, FAQs, blog | Business owner / marketing | Weekly | `company.ts`, `services.ts`, `testimonials.ts`, `projects.ts`, `service-areas.ts`, `team.ts`, `content/blog/*.md` |
| **Feature** | What capabilities are enabled | Developer during setup | Once at setup, rarely after | `features.ts`, `forms.ts`, `assistant.ts` |
| **Theme** | Colors, fonts, spacing, brand identity | Designer / developer | Once at setup | `theme.ts` |

### Content Config (user-facing, pure data)

```typescript
// src/config/testimonials.ts
import type { Testimonial } from './schema'

export const testimonials: Testimonial[] = [
  {
    name: 'Michael R.',
    location: 'Anytown',
    service: 'Roofing',
    quote: 'They made our roof replacement seamless...',
    shortQuote: 'They made our roof replacement seamless. Couldn\'t be happier!',
    image: '/images/testimonial-1.webp',
    rating: 5,
    featured: true,   // Will appear on homepage
  },
  // ... more testimonials
]
```

The `featured` flag pattern is how you handle data that needs to appear in multiple places (homepage carousel vs. full testimonials page) without duplicating the data. The homepage testimonials section filters `testimonials.filter(t => t.featured)`. The testimonials page shows all.

### Feature Config (developer-facing, boolean flags + endpoints)

```typescript
// src/config/features.ts
export const features = {
  /** Enable the blog section with markdown posts */
  blog: true,
  /** Enable the AI chat assistant */
  assistant: true,
  /** Enable individual city landing pages for local SEO */
  cityPages: true,
  /** Enable the project gallery before/after feature */
  beforeAfter: true,
  /** Contact form submission method */
  formBackend: 'formspree' as 'formspree' | 'webhook' | 'netlify' | 'none',
}
```

### Theme Config (design-facing, CSS custom properties)

```typescript
// src/config/theme.ts
export const theme = {
  colors: {
    primary: '#1e3a5f',      // navy - main brand color
    accent: '#f97316',       // safety-orange - CTAs and highlights
    surface: '#f8fafc',      // light background
    border: '#e2e8f0',       // border color
  },
  fonts: {
    heading: 'Inter',
    body: 'Inter',
  },
  borderRadius: {
    card: '1rem',            // rounded-2xl
    button: '9999px',        // rounded-full (pill)
    input: '0.75rem',        // rounded-xl
  },
}
```

Theme config maps to CSS custom properties injected at the root level:

```typescript
// In Layout.tsx or main.tsx
import { theme } from '@/config/theme'

// Inject as CSS custom properties
const style = {
  '--color-primary': theme.colors.primary,
  '--color-accent': theme.colors.accent,
  '--color-surface': theme.colors.surface,
  '--color-border': theme.colors.border,
} as React.CSSProperties
```

Tailwind v4 can consume these via `@theme` in the CSS file, mapping custom properties to utility classes.

---

## Markdown Blog Architecture

**Confidence: MEDIUM** (vite-plugin-markdown is stable at v2.2.0 but should verify Vite 7 compatibility)

### Strategy: File-based blog posts with frontmatter, loaded via Vite plugin

Use `vite-plugin-markdown` for importing `.md` files with frontmatter parsed and HTML rendered. Blog posts live in `src/content/blog/` as markdown files.

```bash
npm install vite-plugin-markdown
```

### Frontmatter Schema

```typescript
// src/lib/blog.ts
import { z } from 'zod'

export const BlogFrontmatterSchema = z.object({
  title: z.string(),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  excerpt: z.string().max(200),
  coverImage: z.string().optional(),
  author: z.string().default('Team'),
  tags: z.array(z.string()).default([]),
  published: z.boolean().default(true),
})

export type BlogFrontmatter = z.infer<typeof BlogFrontmatterSchema>
```

### Blog Post File Format

```markdown
---
title: "What to Do After Storm Damage"
slug: "what-to-do-after-storm-damage"
date: "2026-01-15"
excerpt: "A step-by-step guide for homeowners dealing with storm damage to their roof or siding."
coverImage: "/images/blog/storm-damage-guide.webp"
author: "Team"
tags: ["storm damage", "insurance", "roofing"]
published: true
---

# What to Do After Storm Damage

When a storm hits your area, the first thing to do is...
```

### Vite Plugin Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import markdown from 'vite-plugin-markdown'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    markdown({ mode: ['html', 'meta'] }),  // Parse frontmatter + HTML
  ],
})
```

### Blog Post Loading Pattern

Use Vite's `import.meta.glob` to dynamically load all blog posts at build time:

```typescript
// src/lib/blog.ts
import { BlogFrontmatterSchema, type BlogFrontmatter } from './schema'

interface BlogPost {
  frontmatter: BlogFrontmatter
  html: string
  slug: string
}

// Vite glob import - resolves at build time
const postModules = import.meta.glob('/src/content/blog/*.md', { eager: true }) as Record<
  string,
  { attributes: Record<string, unknown>; html: string }
>

export function getAllPosts(): BlogPost[] {
  return Object.entries(postModules)
    .map(([filepath, mod]) => {
      const frontmatter = BlogFrontmatterSchema.parse(mod.attributes)
      return {
        frontmatter,
        html: mod.html,
        slug: frontmatter.slug,
      }
    })
    .filter(post => post.frontmatter.published)
    .sort((a, b) => b.frontmatter.date.localeCompare(a.frontmatter.date))
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return getAllPosts().find(p => p.slug === slug)
}
```

### TypeScript Declaration for Markdown Imports

```typescript
// src/markdown.d.ts
declare module '*.md' {
  const attributes: Record<string, unknown>
  const html: string
  const toc: { level: string; content: string }[]
  const ReactComponent: React.FC
  export { attributes, html, toc, ReactComponent }
}
```

### Why file-based, not config-based for blog

Blog posts are long-form content. Putting them in TypeScript config files would be awkward (escaping quotes, no syntax highlighting, no markdown preview). Markdown files give:

- Familiar editing experience for content creators
- IDE markdown preview support
- Easy copy/paste from Google Docs or similar
- Git-friendly diffs for content changes
- Frontmatter provides structured metadata without mixing it into the content

---

## Auto-Generated City/Service Pages

**Confidence: HIGH** (local SEO pattern is well-established, implementation is straightforward)

### The SEO Problem

The current `ServiceAreas.tsx` shows all cities as chips on a single page. This is terrible for local SEO -- Google cannot rank a single page for "roofing in Springfield TX" AND "roofing in Cedar Park TX" simultaneously. Each city needs its own URL with unique content.

### Architecture: Config-driven city pages with template content

```typescript
// src/config/service-areas.ts
import type { ServiceArea } from './schema'

export const serviceAreas: ServiceArea = {
  summary: 'Serving the Greater Metro Area',
  states: [
    {
      name: 'Texas',
      abbreviation: 'TX',
      badge: 'HQ',
      cities: [
        {
          slug: 'anytown-tx',
          name: 'Anytown',
          state: 'TX',
          stateFullName: 'Texas',
          isHQ: true,
          description: 'As our headquarters city, Anytown homeowners receive priority scheduling and our most experienced crews.',
          metaTitle: 'Roofing & Siding Services in Anytown, TX',
          metaDescription: 'Expert roofing, siding, and storm damage repair in Anytown, Texas. BBB A+ rated. Free inspections. Call 555-123-4567.',
          nearbyAreas: ['Springfield', 'Riverside', 'Fairview'],
        },
        {
          slug: 'springfield-tx',
          name: 'Springfield',
          state: 'TX',
          stateFullName: 'Texas',
          description: 'Springfield residents trust us for fast, reliable storm damage repair and roof replacements.',
          nearbyAreas: ['Anytown', 'Riverside'],
        },
        // ... more cities
      ],
    },
  ],
}
```

### City Page Template

```typescript
// src/pages/CityPage.tsx
import { useParams, Navigate } from 'react-router-dom'
import { serviceAreas, company, services, testimonials } from '@/config'
import Hero from '@/components/sections/Hero'
import PageMeta from '@/components/ui/PageMeta'
import CTA from '@/components/sections/CTA'

export default function CityPage() {
  const { citySlug } = useParams()

  // Find city across all states
  const city = serviceAreas.states
    .flatMap(s => s.cities)
    .find(c => c.slug === citySlug)

  if (!city) return <Navigate to="/service-areas" replace />

  // Filter testimonials from this city or nearby
  const localTestimonials = testimonials.filter(t =>
    t.location === city.name || city.nearbyAreas.includes(t.location)
  )

  return (
    <>
      <PageMeta
        title={city.metaTitle ?? `${company.name} in ${city.name}, ${city.state}`}
        description={city.metaDescription ?? `Professional roofing and siding services in ${city.name}, ${city.stateFullName}. Licensed & insured. Free inspections.`}
        path={`/service-areas/${city.slug}`}
      />
      <Hero
        headline={`${city.name}, ${city.state}`}
        highlightText="Home Services"
        subhead={city.description ?? `Trusted roofing, siding, and storm repair services for ${city.name} homeowners.`}
        compact
      />

      {/* Services available */}
      <section className="py-20">
        <h2>Services in {city.name}</h2>
        {services.map(service => (
          <ServiceCard key={service.slug} service={service} city={city} />
        ))}
      </section>

      {/* Local testimonials */}
      {localTestimonials.length > 0 && (
        <TestimonialsSection testimonials={localTestimonials} />
      )}

      {/* Nearby areas (internal linking for SEO) */}
      <NearbyAreas city={city} allCities={serviceAreas.states.flatMap(s => s.cities)} />

      <CTA />
    </>
  )
}
```

### Critical SEO Requirement: Unique Content Per City

Google explicitly penalizes "doorway pages" -- pages that are identical except for the city name swapped in. Each city page MUST have at least one of:

1. **Unique description** in the config (most important)
2. **Filtered testimonials** from that city
3. **Filtered projects** completed in that city
4. **Nearby areas** section with internal links
5. **Local details** (specific driving directions, landmarks, local weather patterns)

The config schema supports this with the optional `description`, `metaTitle`, and `metaDescription` fields per city.

---

## Form Submission Architecture

**Confidence: HIGH** (pattern well-established for static site deployments)

### Strategy: Configurable backend with Formspree as default, webhook as extension

The current form does nothing (`handleSubmit` just sets a boolean). The architecture needs to support:

1. **Formspree** (default, zero-backend) -- form data goes to Formspree, email notifications sent automatically
2. **Custom webhook** -- form data POSTed to a configurable URL (for CRMs, Zapier, etc.)
3. **Netlify Forms** -- native form handling for Netlify-deployed sites
4. **None** -- demo/development mode (current behavior)

```typescript
// src/config/forms.ts
import type { FormConfig } from './schema'

export const forms: FormConfig = {
  contact: {
    /** Backend for form submission. Options: 'formspree' | 'webhook' | 'netlify' | 'none' */
    backend: 'formspree',

    /** Formspree form ID (get from formspree.io dashboard) */
    formspreeId: 'xpznqkdl',

    /** Optional webhook URL - receives POST with form data as JSON */
    webhookUrl: undefined,

    /** Fields configuration */
    fields: {
      serviceOptions: [
        'Free Roof Inspection',
        'Roof Replacement',
        'Roof Repair',
        'Siding Installation/Repair',
        'Storm Damage Assessment',
        'Insurance Claim Help',
        'Other',
      ],
      referralOptions: [
        'Google Search',
        'Facebook',
        'Friend/Family Referral',
        'Saw work in neighborhood',
        'Door knock',
        'Other',
      ],
    },

    /** Success message shown after submission */
    successMessage: "We've received your message and will get back to you within 24 hours.",

    /** Enable honeypot spam protection */
    honeypot: true,
  },
}
```

### Form Handler Implementation

```typescript
// src/lib/form-handler.ts
import { forms } from '@/config/forms'

interface FormData {
  [key: string]: string
}

interface SubmissionResult {
  success: boolean
  message: string
}

export async function submitForm(
  formName: keyof typeof forms,
  data: FormData
): Promise<SubmissionResult> {
  const config = forms[formName]

  switch (config.backend) {
    case 'formspree':
      return submitToFormspree(config.formspreeId!, data)

    case 'webhook':
      return submitToWebhook(config.webhookUrl!, data)

    case 'netlify':
      return submitToNetlify(formName, data)

    case 'none':
    default:
      // Demo mode - simulate success
      await new Promise(r => setTimeout(r, 800))
      return { success: true, message: config.successMessage }
  }
}

async function submitToFormspree(formId: string, data: FormData): Promise<SubmissionResult> {
  const res = await fetch(`https://formspree.io/f/${formId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(data),
  })

  if (res.ok) {
    return { success: true, message: 'Thank you! We\'ll be in touch soon.' }
  }

  const body = await res.json().catch(() => ({}))
  return { success: false, message: body.error ?? 'Submission failed. Please try again.' }
}

async function submitToWebhook(url: string, data: FormData): Promise<SubmissionResult> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...data,
      _submitted_at: new Date().toISOString(),
      _source: window.location.href,
    }),
  })

  if (res.ok) {
    return { success: true, message: 'Thank you! We\'ll be in touch soon.' }
  }

  return { success: false, message: 'Submission failed. Please try again or call us directly.' }
}

async function submitToNetlify(formName: string, data: FormData): Promise<SubmissionResult> {
  const formData = new URLSearchParams()
  formData.append('form-name', formName)
  for (const [key, value] of Object.entries(data)) {
    formData.append(key, value)
  }

  const res = await fetch('/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData.toString(),
  })

  if (res.ok) {
    return { success: true, message: 'Thank you! We\'ll be in touch soon.' }
  }

  return { success: false, message: 'Submission failed. Please try again.' }
}
```

### Why Formspree as default

| Option | Pros | Cons | Setup effort |
|--------|------|------|-------------|
| **Formspree** | Zero backend, email notifications built-in, spam protection, free tier (50/month), webhook support | Paid above 50 submissions/month ($8/mo) | 2 minutes (create form, copy ID) |
| **Netlify Forms** | Free (100/month), automatic for Netlify deploys | Only works on Netlify | 1 minute |
| **Custom webhook** | Maximum flexibility, works with any CRM/Zapier | Requires external service setup | 10-30 minutes |
| **Resend** | Developer-friendly email API, free tier 3000/month | Requires serverless function, more complex setup | 30-60 minutes |

Formspree is the right default because the template buyer wants forms to "just work" without deploying a backend.

---

## SEO and Prerendering Strategy

**Confidence: MEDIUM** (approach is sound, specific tool compatibility with Vite 7 needs verification)

### The SPA SEO Problem

React SPAs serve a blank `<div id="root"></div>` to crawlers. While Google's crawler can execute JavaScript, other search engines and social media scrapers cannot. The auto-generated city pages are especially useless without prerendering -- the whole point is Google indexing `roofing-anytown-tx` as a distinct page.

### Recommended Approach: Build-time prerendering with vite-plugin-prerender

```bash
npm install -D vite-plugin-prerender
```

```typescript
// vite.config.ts
import vitePrerender from 'vite-plugin-prerender'
import { services } from './src/config/services'
import { serviceAreas } from './src/config/service-areas'
import { getAllPostSlugs } from './src/lib/blog'

const staticRoutes = [
  '/', '/about', '/contact', '/projects', '/testimonials',
  '/service-areas', '/services',
]

const serviceRoutes = services.map(s => `/${s.slug}`)

const cityRoutes = serviceAreas.states
  .flatMap(s => s.cities)
  .map(c => `/service-areas/${c.slug}`)

const blogRoutes = getAllPostSlugs().map(slug => `/blog/${slug}`)

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    vitePrerender({
      staticDir: path.join(__dirname, 'dist'),
      routes: [
        ...staticRoutes,
        ...serviceRoutes,
        ...cityRoutes,
        ...blogRoutes,
      ],
      renderer: new vitePrerender.PuppeteerRenderer({
        renderAfterDocumentEvent: 'app-rendered',
        maxConcurrentRoutes: 4,
      }),
    }),
  ],
})
```

The route list for prerendering is generated from the same config that generates the routes, ensuring every page gets prerendered.

### Alternative: React Router v7 Framework Mode

React Router v7 (which this project already uses as react-router-dom v7.13.0) has built-in pre-rendering support, but only in "Framework Mode" which requires a different project structure (using `@react-router/dev` plugin, `routes.ts` file, different entry point). Migrating to Framework Mode would be a larger refactor but would provide native SSG/SSR without a third-party plugin.

**Recommendation:** Start with `vite-plugin-prerender` for the initial upgrade (lower risk, works with existing SPA architecture). Consider migrating to React Router Framework Mode in a future phase if SSR or more advanced rendering strategies are needed.

### JSON-LD Structured Data

Auto-generate structured data from config for rich search results:

```typescript
// src/lib/seo.ts
import { company, services, testimonials } from '@/config'

export function generateLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'HomeAndConstructionBusiness',
    name: company.name,
    telephone: company.phone,
    email: company.email,
    url: company.url,
    address: {
      '@type': 'PostalAddress',
      streetAddress: company.address.street,
      addressLocality: company.address.city,
      addressRegion: company.address.state,
      postalCode: company.address.zip,
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: (testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length).toFixed(1),
      reviewCount: testimonials.length,
    },
  }
}
```

---

## Component Boundaries

### How components relate to config

| Component | Config Source | Role |
|-----------|-------------|------|
| `Header` | `navigation`, `company` | Reads nav items, company name, phone |
| `Footer` | `navigation`, `company` | Reads nav items grouped by `footerGroup`, contact info |
| `Hero` | Props from page (which reads `services`, `company`) | Reusable, receives data via props |
| `ServicePage` | `services` (matched by slug) | Template page, renders any service |
| `CityPage` | `serviceAreas` (matched by slug), `services`, `testimonials` | Template page, renders any city |
| `Testimonials` section | `testimonials` (filtered by `featured`) | Homepage section, shows featured only |
| `TestimonialsPage` | `testimonials` (all) | Full page, shows all |
| `Projects` | `projects` | Gallery with filter |
| `FAQ` | Props (from `services[n].faqs` or page-specific) | Reusable, receives items via props |
| `BlogIndex` | `getAllPosts()` from blog loader | Lists all published posts |
| `BlogPost` | `getPostBySlug()` from blog loader | Renders single post HTML |
| `ContactForm` | `forms.contact` | Reads field options, submission config |
| `Stats` | `company.stats` (moved to company config) | Animated counters |

### Component Design Rules

1. **Components never import content directly** -- they receive data via props or read from config using a slug/filter
2. **Config files never import components** -- config is pure data, no JSX
3. **One template page per dynamic entity type** -- `ServicePage`, `CityPage`, `BlogPost` (not `Roofing.tsx`, `Siding.tsx`, `StormDamage.tsx`)
4. **Sections are reusable** -- `FAQ`, `Hero`, `CTA`, `Testimonials` accept props, work anywhere
5. **Feature flags gate routes AND nav items** -- if `features.blog` is false, no blog route exists and no "Blog" nav item appears

---

## Data Flow

```
Config Files (*.ts)
    |
    v
Config Index (validates with Zod)
    |
    +---> Route Generator -----> App.tsx (route tree)
    |
    +---> Navigation Generator -> Header.tsx, Footer.tsx
    |
    +---> Template Pages -------> ServicePage, CityPage
    |         |
    |         v
    |      Section Components (FAQ, Hero, CTA, etc.)
    |
    +---> Blog Loader ----------> BlogIndex, BlogPost
    |       (import.meta.glob)
    |
    +---> Form Handler ----------> ContactForm
    |       (Formspree / webhook)
    |
    +---> SEO Generator ---------> PageMeta, JSON-LD
    |
    +---> Theme Generator -------> CSS custom properties

Blog Markdown Files (*.md)
    |
    v
vite-plugin-markdown (parse frontmatter + compile HTML)
    |
    v
Blog Loader (import.meta.glob, validate frontmatter)
    |
    v
BlogIndex / BlogPost pages
```

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Putting everything in one giant config file
**What:** Cramming 800+ lines of services, testimonials, projects, cities, and blog config into a single `site.ts`
**Why bad:** Intimidates non-technical users, merge conflicts, impossible to scan, violates single responsibility
**Instead:** One file per concern (company, services, testimonials, etc.) with a barrel export index

### Anti-Pattern 2: Config objects with display logic
**What:** Putting React components, JSX, or Lucide icon imports in config files
**Why bad:** Config files become coupled to the rendering framework, non-technical users see import statements and JSX
**Instead:** Use string identifiers (icon names like `'Home'`, `'Shield'`) and resolve them to components in the rendering layer

```typescript
// BAD - config file imports React components
import { Home } from 'lucide-react'
export const services = [{ icon: Home, ... }]

// GOOD - config uses string identifiers
export const services = [{ icon: 'Home', ... }]

// Component resolves the string to a component
import * as icons from 'lucide-react'
const Icon = icons[service.icon]
```

### Anti-Pattern 3: Config that requires understanding TypeScript
**What:** Complex generics, utility types, or TypeScript syntax in config files that non-technical users edit
**Why bad:** The target user (business owner customizing their template) should not need to understand TypeScript
**Instead:** Config files use simple object literals. All complexity (validation, type inference) lives in `schema.ts` which users never touch

### Anti-Pattern 4: Deriving slugs from titles at runtime
**What:** Auto-generating URL slugs from service names (e.g., "Storm Repair" -> "storm-repair")
**Why bad:** URLs change if someone renames a service, breaking bookmarks and SEO
**Instead:** Slugs are explicit in config. The service name can change without affecting the URL

### Anti-Pattern 5: Dynamic imports in config
**What:** Using `import()` or `require()` in config files
**Why bad:** Makes config files async, complicates validation, breaks tree-shaking
**Instead:** Config files export plain synchronous objects. Dynamic loading happens in the consuming layer (route-generator.ts with `lazy()`)

### Anti-Pattern 6: City pages that are identical except for the city name
**What:** Template city pages where only `${cityName}` is different
**Why bad:** Google penalizes these as "doorway pages" and may deindex all of them
**Instead:** Each city config entry has a `description` field. Provide a content template system that fills in unique local details, and show local testimonials/projects per city

---

## Scalability Considerations

| Concern | At 10 cities | At 50 cities | At 200 cities |
|---------|-------------|-------------|---------------|
| Build time (prerender) | ~15 seconds | ~45 seconds | ~3 minutes |
| Config file size | Single file OK | Split by state | Split by state |
| Bundle size | Negligible | Negligible (config is tree-shaken) | Negligible |
| SEO content | Can write unique descriptions | Need template system for descriptions | Definitely need template system |

| Concern | At 5 blog posts | At 50 posts | At 200 posts |
|---------|----------------|-------------|-------------|
| Build time | ~10 seconds | ~30 seconds | ~2 minutes |
| import.meta.glob | Fine | Fine | May need pagination |
| Bundle size | Small | Moderate (HTML strings) | Consider lazy loading post content |

---

## Sources

- [Zod - TypeScript-first schema validation](https://github.com/colinhacks/zod) - HIGH confidence
- [vite-plugin-markdown - Markdown imports for Vite](https://github.com/hmsk/vite-plugin-markdown) - MEDIUM confidence (v2.2.0, verify Vite 7 compatibility)
- [vite-plugin-prerender - Build-time prerendering](https://github.com/Rudeus3Greyrat/vite-plugin-prerender) - MEDIUM confidence (verify Vite 7 compatibility)
- [React Router v7 Pre-Rendering](https://reactrouter.com/how-to/pre-rendering) - HIGH confidence (Framework Mode only)
- [React Router v7 Modes](https://reactrouter.com/start/modes) - HIGH confidence
- [Formspree - Form backend for static sites](https://formspree.io/) - HIGH confidence
- [Resend - Email API](https://resend.com) - HIGH confidence (alternative for advanced setups)
- [Service Area Pages SEO](https://searchengineland.com/guide/service-area-pages) - HIGH confidence (SEO best practices)
- [Vite SSR Guide](https://vite.dev/guide/ssr) - HIGH confidence
- [vite-react-ssg](https://github.com/Daydreamer-riri/vite-react-ssg) - MEDIUM confidence (for RR v6 only, superseded by RR v7 built-in)
