# ROADMAP — Premium Home Services Template v1.0

**Created:** 2026-02-21
**Milestone:** v1.0 — Premium Template Launch
**Phases:** 6

---

## Phase 1: Foundation & Config Refactor

**Goal:** Modularize the config system, make navigation config-driven, move hardcoded data to config, and add Zod validation. This is the foundation everything else builds on.

**Requirements:**
- CFG-01: Modular Config System
- CFG-02: Config-Driven Navigation
- CFG-03: Config-Driven Routing
- CFG-04: Content Migration to Config
- CFG-05: 404 Page
- CFG-06: Feature Flags System

**Key Changes:**
- Split `src/config/site.ts` into 13 modular files with barrel export
- Add Zod schemas in `src/config/schema.ts` for validation
- Auto-generate Header/Footer nav from services config
- Create `src/lib/route-generator.ts` for dynamic route generation
- Create `ServicePage.tsx` template (replaces separate Roofing/Siding/StormDamage pages)
- Move testimonials, projects, FAQs, team data from components into config files
- Add `NotFound.tsx` with catch-all route
- Add `features.ts` with boolean flags

**Dependencies:** None (Phase 1 has no prerequisites)

**Success Criteria:**
- All config in modular files with Zod validation
- Adding a service requires only a config entry (zero component changes)
- Navigation updates automatically when services change
- All existing pages render correctly
- 404 page works for unknown routes
- `npm run dev` shows validation errors for invalid config

**Estimated Complexity:** HIGH (touches many files, must maintain backward compatibility)

---

## Phase 2: Visual Polish & Performance

**Goal:** Optimize Framer Motion bundle, fix CWV-damaging animations, add premium visual features, and set up the image optimization pipeline.

**Requirements:**
- VIS-01: Framer Motion Performance Optimization
- VIS-02: Interactive Before/After Slider
- VIS-03: Sticky Mobile CTA Bar
- VIS-04: SectionHeading Component
- VIS-05: Skeleton Loading States
- PERF-01: Image Optimization Pipeline

**Key Changes:**
- Wrap app in `LazyMotion` + `domAnimation`, replace `motion` with `m`
- Add `MotionConfig reducedMotion="user"` at root
- Remove opacity animation from hero above-fold content
- Build `BeforeAfterSlider.tsx` component
- Build `StickyMobileCTA.tsx` component
- Build `SectionHeading.tsx` for consistent section titles
- Build `Skeleton.tsx` for lazy-load placeholders
- Add `vite-plugin-image-optimizer` to build pipeline
- Add `width`/`height` to all images, `loading="lazy"` below fold

**Dependencies:** Phase 1 (config system must be in place for sticky CTA phone number from config)

**Success Criteria:**
- Framer Motion bundle reduced ~15KB
- Hero content renders instantly (no opacity delay)
- Before/after slider works on mobile and desktop
- Sticky mobile CTA visible on scroll with phone + quote button
- Lighthouse Performance score improved vs. baseline
- `prefers-reduced-motion` respected across site

**Estimated Complexity:** MEDIUM

**Plans:** 3 plans

Plans:
- [ ] 02-01-PLAN.md — Framer Motion LazyMotion migration + SectionHeading component
- [ ] 02-02-PLAN.md — Premium UI components (AnimatedTestimonials, BeforeAfterSlider, Skeleton)
- [ ] 02-03-PLAN.md — Sticky mobile CTA bar + image optimization pipeline

---

## Phase 3: Lead Generation

**Goal:** Make the contact form actually work, add form validation, and build lead generation features.

**Requirements:**
- LEAD-01: Working Contact Form Submission
- LEAD-02: Form Validation
- LEAD-03: Custom Booking Calendar
- LEAD-04: Financing Calculator
- LEAD-05: Emergency Storm Banner

**Key Changes:**
- Install `react-hook-form`, `zod`, `@hookform/resolvers`
- Build `src/lib/form-handler.ts` (Formspree/webhook/Netlify/none)
- Refactor `Contact.tsx` with RHF + Zod validation
- Build `BookingCalendar.tsx` (custom date/time picker)
- Build `FinancingCalculator.tsx` with payment estimation
- Create `Financing.tsx` page
- Build `EmergencyBanner.tsx` with config toggle
- Add honeypot spam protection

**Dependencies:** Phase 1 (forms config in `forms.ts`, feature flags)

**Success Criteria:**
- Contact form sends data to Formspree (verifiable via email)
- Webhook URL in config sends form data to configured endpoint
- All form fields validated with inline error messages
- Booking calendar allows date/time selection
- Financing calculator shows monthly payment estimates
- Emergency banner toggleable via config
- Form submission works on mobile

**Estimated Complexity:** HIGH

---

## Phase 4: Blog System

**Goal:** Implement markdown-based blog with frontmatter, listing page, post page, and SEO markup.

**Requirements:**
- SEO-01: Markdown Blog System

**Key Changes:**
- Install `vite-plugin-markdown`
- Create `src/content/blog/` directory with 3-5 demo posts
- Build `src/lib/blog.ts` (glob import, frontmatter validation, sorting)
- Build `BlogIndex.tsx` (listing page with date, excerpt, cover image, tag filter)
- Build `BlogPost.tsx` (renders markdown HTML with proper styling)
- Add `markdown.d.ts` type declarations
- Add blog routes to route generator (gated by `features.blog`)
- Add blog to navigation (gated by feature flag)
- Add `BlogPosting` JSON-LD schema per post

**Dependencies:** Phase 1 (route generator, feature flags, navigation system)

**Success Criteria:**
- Blog listing page shows all published posts sorted by date
- Individual post pages render markdown with proper typography
- Frontmatter validation catches invalid posts at build time
- Blog posts have proper meta tags (title, description, OG)
- 3-5 demo posts covering storm damage, insurance, roofing topics
- Blog nav item appears when `features.blog: true`

**Estimated Complexity:** MEDIUM

---

## Phase 5: SEO & Content

**Goal:** Implement city/service-area pages, JSON-LD structured data, sitemap, meta tag enhancements, and content features.

**Requirements:**
- SEO-02: City/Service Area Pages
- SEO-03: JSON-LD Structured Data
- SEO-04: Sitemap & Robots.txt
- SEO-05: Complete Meta Tag System
- SEO-06: Reviews Config System
- SEO-07: Portfolio Enhancement

**Key Changes:**
- Build `CityPage.tsx` template (renders any city from config by slug)
- Add city routes to route generator
- Populate `service-areas.ts` with 20-30 demo cities with unique descriptions
- Build `src/components/seo/JsonLd.tsx` component
- Build `src/lib/seo.ts` (schema generators for LocalBusiness, Service, FAQ, Review, Breadcrumb)
- Install `vite-plugin-sitemap`, configure with dynamic route list
- Enhance `PageMeta.tsx` with OG image, Twitter cards, canonical URLs
- Create `src/config/seo.ts` with defaults
- Finalize `testimonials.ts` with featured flags, service tags, city tags
- Enhance `Projects.tsx` with before/after slider integration, detail view
- Add Google Reviews placeholder section with embed instructions
- Update service area index page with links to all city pages

**Dependencies:** Phase 1 (config system, route generator), Phase 2 (before/after slider for portfolio), Phase 4 (blog posts for sitemap)

**Success Criteria:**
- 20-30 city pages with unique content accessible via `/service-areas/{slug}`
- JSON-LD validates on Google Rich Results Test for all page types
- sitemap.xml includes all routes (static, services, cities, blog)
- robots.txt references sitemap
- OG images render correctly in Facebook/Twitter share previews
- Canonical URLs on all pages
- City pages have unique descriptions (not just city name swap)

**Estimated Complexity:** HIGH

---

## Phase 6: Integration & Polish

**Goal:** Enhance Ava, add cross-feature CTAs, polish demo data, audit performance, and prepare for launch.

**Requirements:**
- AVA-01: Chat Context Awareness
- AVA-02: Lead Capture in Chat
- AVA-03: Chat Rate Limiting & Security
- PERF-02: Performance Monitoring

**Key Changes:**
- Add page context to Ava system prompt
- Implement lead capture flow in chat (name/phone/email collection)
- Add "Talk to a real person" escalation after 2-3 exchanges
- Restrict chat API CORS to site domain
- Cap conversation history at 10 messages
- Add client-side rate limiting
- Install `web-vitals`, add reporting
- Cross-feature CTA audit (ensure every page has clear conversion path)
- Demo data polish (realistic content, consistent imagery)
- Performance audit (Lighthouse targets: 90+ Performance, Accessibility, SEO)
- Documentation review (config field comments, setup guide)
- Demo data check (warn if default "Acme Home Services" values unchanged)

**Dependencies:** All prior phases

**Success Criteria:**
- Ava provides context-aware responses based on current page
- Chat captures leads and sends to form backend
- Chat API secured (no wildcard CORS, rate limited)
- Lighthouse scores: Performance 90+, Accessibility 90+, SEO 90+
- Every page has at least one CTA leading to contact/quote
- Demo site works end-to-end with realistic content
- No "Acme Home Services" defaults visible in unexpected places

**Estimated Complexity:** MEDIUM

---

## Phase Dependency Graph

```
Phase 1: Foundation & Config ──┬──> Phase 2: Visual Polish
                               ├──> Phase 3: Lead Generation
                               └──> Phase 4: Blog System
                                         │
Phase 2 + Phase 4 ────────────────> Phase 5: SEO & Content
                                         │
All Phases ────────────────────────> Phase 6: Integration & Polish
```

---

## Requirement Coverage Matrix

| REQ-ID | Phase | Priority |
|--------|-------|----------|
| CFG-01 | 1 | MUST |
| CFG-02 | 1 | MUST |
| CFG-03 | 1 | MUST |
| CFG-04 | 1 | MUST |
| CFG-05 | 1 | MUST |
| CFG-06 | 1 | MUST |
| VIS-01 | 2 | MUST |
| VIS-02 | 2 | SHOULD |
| VIS-03 | 2 | MUST |
| VIS-04 | 2 | SHOULD |
| VIS-05 | 2 | SHOULD |
| PERF-01 | 2 | SHOULD |
| LEAD-01 | 3 | MUST |
| LEAD-02 | 3 | MUST |
| LEAD-03 | 3 | SHOULD |
| LEAD-04 | 3 | SHOULD |
| LEAD-05 | 3 | SHOULD |
| SEO-01 | 4 | MUST |
| SEO-02 | 5 | MUST |
| SEO-03 | 5 | MUST |
| SEO-04 | 5 | MUST |
| SEO-05 | 5 | MUST |
| SEO-06 | 5 | MUST |
| SEO-07 | 5 | MUST |
| AVA-01 | 6 | SHOULD |
| AVA-02 | 6 | SHOULD |
| AVA-03 | 6 | SHOULD |
| PERF-02 | 6 | COULD |

**Coverage:** 28/28 requirements mapped to phases. All 17 MUST requirements covered in Phases 1-5.

---

*Roadmap created: 2026-02-21*
