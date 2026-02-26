# ROADMAP — Premium Home Services Template v1.0

**Created:** 2026-02-21
**Milestone:** v1.0 — Premium Template Launch
**Phases:** 10

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

**Plans:** 3 plans

Plans:
- [ ] 03-01-PLAN.md — Form infrastructure + Contact form refactor with RHF + Zod validation
- [ ] 03-02-PLAN.md — Custom booking calendar + Contact page tab UI
- [ ] 03-03-PLAN.md — Financing calculator page + announcement banner with external CMS

---

## Phase 4: Blog System

**Goal:** Implement markdown-based "Resources" section with Vite glob + gray-matter + react-markdown, card-grid listing page with tag filtering and pagination, individual post pages with typography and JSON-LD, and 12 SEO/GEO-optimized demo posts.

**Requirements:**
- SEO-01: Markdown Blog System

**Key Changes:**
- Install gray-matter, react-markdown, remark-gfm, @tailwindcss/typography
- Create `src/content/blog/` directory with 12 demo posts
- Build `src/lib/blog.ts` (Vite glob import, gray-matter frontmatter parsing, Zod validation, sorting/filtering)
- Build `ResourcesIndex.tsx` (listing page with card grid, tag filter pills, pagination)
- Build `ResourcesPost.tsx` (renders markdown with @tailwindcss/typography, JSON-LD BlogPosting, CTA footer, related posts)
- Wire feature flag, routes, and navigation for "Resources" section
- Add `BlogPosting` JSON-LD schema per post

**Dependencies:** Phase 1 (route generator, feature flags, navigation system)

**Success Criteria:**
- Resources listing page shows 12 published posts sorted by date in card grid
- Individual post pages render markdown with proper typography (Medium-style)
- Frontmatter validated with Zod at load time
- Blog posts have proper meta tags (title, description, OG) and JSON-LD
- 12 demo posts covering storm damage, insurance, roofing, siding, maintenance topics
- Resources nav item appears when `features.blog: true`
- Tag filtering and pagination functional

**Estimated Complexity:** MEDIUM

**Plans:** 2/2 plans complete

Plans:
- [x] 04-01-PLAN.md — Blog engine infrastructure + Resources listing page
- [x] 04-02-PLAN.md — Individual post page + 12 demo blog posts with cover images

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

**Plans:** 4/4 plans complete

Plans:
- [ ] 05-01-PLAN.md — Complete meta tag system (OG, Twitter, canonical) + reviews config with filtering fields
- [ ] 05-02-PLAN.md — Portfolio enhancement with routable project detail pages
- [ ] 05-03-PLAN.md — City/service-area pages with 20-25 demo cities and unique content
- [ ] 05-04-PLAN.md — JSON-LD structured data across all page types + sitemap/robots.txt generation

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

## Phase 7: Foundation Verification & Tech Debt Cleanup

**Goal:** Formally verify Phase 01 pre-GSD work (CFG-01 to CFG-06), update REQUIREMENTS.md traceability for SEO-01, and clean up low-severity tech debt from the milestone audit.

**Requirements:**
- CFG-01: Modular Config System (verify)
- CFG-02: Config-Driven Navigation (verify)
- CFG-03: Config-Driven Routing (verify)
- CFG-04: Content Migration to Config (verify)
- CFG-05: 404 Page (verify)
- CFG-06: Feature Flags System (verify)

**Gap Closure:** Closes verification gaps from v1.0 milestone audit

**Key Changes:**
- Run formal verification of Phase 01 against CFG-01 to CFG-06 acceptance criteria
- Create VERIFICATION.md for Phase 01
- Update SEO-01 checkboxes in REQUIREMENTS.md (verified satisfied, checkboxes not updated)
- Remove `getPostsByTag()` dead code from `src/lib/blog.ts`
- Fix noindex meta tag placement in `src/pages/ThankYou.tsx` (move into PageMeta)

**Dependencies:** None (verification of completed work)

**Success Criteria:**
- CFG-01 to CFG-06 formally verified with evidence
- VERIFICATION.md exists for Phase 01
- SEO-01 checkboxes updated in REQUIREMENTS.md
- Dead code removed, meta tag placement fixed
- All tech debt items from audit addressed or documented

**Estimated Complexity:** LOW

**Plans:** 2/2 plans complete

Plans:
- [x] 07-01-PLAN.md — Phase 01 CFG verification report (CFG-01 through CFG-06) — 24/27 criteria pass
- [x] 07-02-PLAN.md — REQUIREMENTS.md traceability update + dead code removal + STATE.md closure

---

## Phase 8: Feature Flag & Integration Polish

**Goal:** Fix partial MUST requirement gaps in feature flag gating and resolve integration inconsistencies identified by the v1.0 milestone audit.

**Requirements:**
- CFG-02: Config-Driven Navigation (partial gap — `features.assistant` not gating nav/route)
- CFG-06: Feature Flags System (partial gap — `features.beforeAfter` flag missing)
- SEO-04: Sitemap & Robots.txt (edge case — hardcoded routes ignore feature flags)

**Gap Closure:** Closes integration gaps from v1.0 audit

**Key Changes:**
- Add `features.beforeAfter` flag to `src/config/features.ts`
- Gate Ava nav link and `/ava` route behind `features.assistant` flag
- Fix sitemap to respect feature flags (don't include `/financing` or `/resources` when flags are off)
- Fix ServicePage redirect inconsistency (redirect to parent like CityPage/ResourcesPost)

**Dependencies:** Phase 1 (config system), Phase 7 (verification baseline)

**Success Criteria:**
- `features.assistant = false` hides Ava nav link and blocks `/ava` route
- `features.beforeAfter` flag exists in features.ts and gates before/after UI
- Sitemap excludes routes for disabled features
- All pages redirect consistently on invalid slugs

**Estimated Complexity:** LOW

**Plans:** 1/1 plans complete

Plans:
- [ ] 08-01-PLAN.md — Feature flag gating (Ava nav/route, beforeAfter, sitemap) + ServicePage redirect fix

---

## Phase 9: Ava Chat Enhancement

**Goal:** Implement context-aware chat, lead capture, and security hardening for the Ava AI assistant, completing the broken "Visitor chats with Ava" E2E flow.

**Requirements:**
- AVA-01: Chat Context Awareness
- AVA-02: Lead Capture in Chat
- AVA-03: Chat Rate Limiting & Security

**Gap Closure:** Closes requirement + flow gaps from v1.0 audit

**Key Changes:**
- Add page context to Ava system prompt (current page, available services)
- Change quick actions based on current page context
- Implement lead capture flow (name/phone/email after 2-3 exchanges)
- Add "Talk to a real person" escalation button
- Send captured leads to form submission backend
- Restrict CORS to site domain (remove wildcard `*`)
- Cap conversation history at 10 messages sent to API
- Add client-side rate limiting (max 1 message per 2 seconds)
- Graceful degradation on 429 — switch to demo mode

**Dependencies:** Phase 8 (feature flag gating for assistant), Phase 3 (form submission backend)

**Success Criteria:**
- Ava provides context-aware responses based on current page
- Chat captures leads and sends to form backend
- Chat API secured (no wildcard CORS, rate limited)
- "Visitor chats with Ava → Lead capture" E2E flow works end-to-end

**Estimated Complexity:** MEDIUM

**Plans:** 2/2 plans complete

Plans:
- [x] 09-01-PLAN.md — Chat infrastructure: context utility, API enhancements (history cap, 429 handling, demo enrichment), CORS hardening
- [x] 09-02-PLAN.md — Widget & page integration: useChatEnhancements hook, lead capture state machine, persistent escalation chip

---

## Phase 10: Performance Monitoring

**Goal:** Add Core Web Vitals monitoring and performance reporting to meet PERF-02 requirements.

**Requirements:**
- PERF-02: Performance Monitoring

**Gap Closure:** Closes remaining requirement gap from v1.0 audit

**Key Changes:**
- Install `web-vitals` library
- Create `src/lib/vitals.ts` to report CLS, INP, LCP
- Wire vitals reporting into `src/main.tsx`
- Add optional Vercel Speed Insights integration
- Verify Lighthouse score targets: Performance 90+, Accessibility 90+, SEO 90+

**Dependencies:** All prior phases (measures final performance)

**Success Criteria:**
- `web-vitals` reports CLS, INP, LCP to console/analytics
- Vercel Speed Insights integration point available
- Lighthouse scores meet 90+ targets across Performance, Accessibility, SEO

**Estimated Complexity:** LOW

**Plans:** 1 plan

Plans:
- [ ] 10-01-PLAN.md — Web-vitals reporting + Vercel Speed Insights integration + Lighthouse score verification

---

## Phase Dependency Graph

```
Phase 1: Foundation & Config ──┬──> Phase 2: Visual Polish
                               ├──> Phase 3: Lead Generation
                               └──> Phase 4: Blog System
                                         │
Phase 2 + Phase 4 ────────────────> Phase 5: SEO & Content
                                         │
All Phases ────────────────────────> Phase 6: Integration & Polish (NOT STARTED — gaps addressed by 8-10)

Phase 7: Foundation Verification (independent — verifies Phase 1)
Phase 1 + 7 ──────────────────────> Phase 8: Feature Flag & Integration Polish
Phase 8 + 3 ──────────────────────> Phase 9: Ava Chat Enhancement
All Phases ────────────────────────> Phase 10: Performance Monitoring
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
| SEO-02 | 5 | 4/4 | Complete   | 2026-02-24 | 5 | MUST |
| SEO-04 | 5 | MUST |
| SEO-05 | 5 | MUST |
| SEO-06 | 5 | MUST |
| SEO-07 | 5 | MUST |
| AVA-01 | 9 | 2/2 | Complete   | 2026-02-26 | 9 | SHOULD |
| AVA-03 | 9 | SHOULD |
| PERF-02 | 10 | COULD |

**Coverage:** 28/28 requirements mapped to phases. All 17 MUST requirements covered in Phases 1-5. Phase 7 verifies CFG-01–06. Phase 8 closes CFG-02/CFG-06 partial gaps. Phase 9 closes AVA-01/02/03. Phase 10 closes PERF-02.

---

*Roadmap created: 2026-02-21*
*Updated: 2026-02-26 — Gap closure phases 08-10 added from v1.0 milestone audit*
