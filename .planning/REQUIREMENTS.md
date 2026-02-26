# REQUIREMENTS — Premium Home Services Template v1.0

**Created:** 2026-02-21
**Milestone:** v1.0 — Premium Template Launch

---

## Requirement Format

Each requirement has:
- **REQ-ID**: Category prefix + number (e.g., CFG-01)
- **Priority**: MUST (v1 launch blocker) | SHOULD (v1 stretch) | COULD (v2 candidate) | OUT (explicitly excluded)
- **Description**: What must be true when complete
- **Acceptance Criteria**: How to verify

---

## Category: Infrastructure & Config (CFG)

### CFG-01: Modular Config System — MUST [COMPLETE]

Split `src/config/site.ts` into modular config files with Zod schema validation.

**Files:** `src/config/index.ts`, `src/config/schema.ts`, `src/config/company.ts`, `src/config/services.ts`, `src/config/service-areas.ts`, `src/config/testimonials.ts`, `src/config/projects.ts`, `src/config/navigation.ts`, `src/config/assistant.ts`, `src/config/forms.ts`, `src/config/theme.ts`, `src/config/seo.ts`, `src/config/features.ts`

**Acceptance Criteria:**
- [x] Config split into 10+ domain-specific files
- [x] Zod schemas validate all config at import time
- [x] Invalid config produces clear, actionable error messages (not React crashes)
- [x] Existing `SITE` import still works (backward-compatible barrel export)
- [x] All existing components render correctly with new config structure

### CFG-02: Config-Driven Navigation — MUST [COMPLETE]

Header and Footer navigation auto-generated from services config and page registry. Adding a service to config automatically adds it to nav, routes, and footer.

**Files:** `src/config/navigation.ts`, `src/components/layout/Header.tsx`, `src/components/layout/Footer.tsx`

**Acceptance Criteria:**
- [x] Header nav links generated from config (no hardcoded link arrays in Header.tsx)
- [x] Footer links generated from config (no hardcoded link arrays in Footer.tsx)
- [x] Services dropdown populated from services config
- [x] Adding a service to `services.ts` automatically appears in nav and footer
- [x] Feature-flagged pages (blog, AI assistant) appear/disappear based on `features.ts` — COMPLETE: all flags gate nav links, routes, and UI sections correctly

### CFG-03: Config-Driven Routing — MUST [COMPLETE]

Routes generated from services, cities, and feature flags. One template page per entity type instead of per-service page files.

**Files:** `src/App.tsx`, `src/lib/route-generator.ts`, `src/pages/ServicePage.tsx`

**Acceptance Criteria:**
- [x] Routes generated from `services.ts` config array
- [x] Single `ServicePage.tsx` renders any service by URL slug matching
- [x] Adding a new service requires only a config entry (zero component code)
- [x] Existing service URLs (`/roofing`, `/siding`, `/storm-damage`) still work
- [x] 404 catch-all route exists

### CFG-04: Content Migration to Config — MUST [COMPLETE]

Move all hardcoded content data from components into config files.

**Files:** `src/config/testimonials.ts`, `src/config/projects.ts`, `src/pages/Projects.tsx`, `src/components/sections/Testimonials.tsx`, `src/pages/TestimonialsPage.tsx`

**Acceptance Criteria:**
- [x] Testimonials data in `testimonials.ts`, not in component files
- [x] `featured` flag controls homepage vs. full-page display (no duplication)
- [x] Project/portfolio data in `projects.ts`, not in `Projects.tsx`
- [x] FAQ data moved to respective service configs in `services.ts`
- [x] Team member data in `team.ts`, not in `About.tsx`

### CFG-05: 404 Page — MUST [PARTIAL]

Add a catch-all route with a styled 404 page.

**Files:** `src/pages/NotFound.tsx`, `src/App.tsx`

**Acceptance Criteria:**
- [x] Unknown URLs render a styled 404 page inside the Layout
- [x] 404 page includes navigation links to key pages
- [ ] 404 page includes phone CTA — MISSING: NotFound.tsx has Go Home/Go Back but no tel: link
- [x] Page has appropriate meta tags (noindex)

### CFG-06: Feature Flags System — MUST [COMPLETE]

Boolean config flags that gate routes, navigation items, and component rendering.

**Files:** `src/config/features.ts`

**Acceptance Criteria:**
- [x] `features.blog`, `features.assistant`, `features.cityPages`, `features.beforeAfter` flags exist — COMPLETE: all 6 flags including beforeAfter now in features.ts
- [x] Disabling a feature removes its route, nav item, and any related UI — COMPLETE: all flags gate routes, nav links, and component sections
- [x] All features enabled by default for demo

---

## Category: Visual Polish (VIS)

### VIS-01: Framer Motion Performance Optimization — MUST [COMPLETE]

Optimize Framer Motion bundle and fix CWV-damaging animations.

**Files:** `src/main.tsx`, all section components using `motion`

**Acceptance Criteria:**
- [x] `LazyMotion` with `domAnimation` wraps the app (replaces full motion import)
- [x] All `motion.div` replaced with `m.div` (reduced bundle)
- [x] Hero content renders without opacity animation delay (above-fold elements instant)
- [x] `MotionConfig reducedMotion="user"` set at app root
- [x] Bundle size reduced by ~15KB gzipped vs. current

### VIS-02: Interactive Before/After Slider — SHOULD [COMPLETE]

Replace static side-by-side project comparisons with a draggable slider component.

**Files:** `src/components/ui/BeforeAfterSlider.tsx`, `src/pages/Projects.tsx`

**Acceptance Criteria:**
- [x] Draggable slider divider between before/after images
- [x] Touch-friendly on mobile
- [x] Keyboard accessible (arrow keys move slider)
- [x] Projects with `beforeImage`/`afterImage` in config render with slider
- [ ] Falls back gracefully when only one image exists

### VIS-03: Sticky Mobile CTA Bar — MUST [COMPLETE]

Fixed bottom bar on mobile with click-to-call and quote CTA.

**Files:** `src/components/ui/StickyMobileCTA.tsx`, `src/components/layout/Layout.tsx`

**Acceptance Criteria:**
- [x] Fixed bottom bar visible on mobile viewports (<768px)
- [x] Contains click-to-call phone button and "Get Free Quote" CTA
- [x] Hides when at top of page, shows on scroll down
- [x] Does not overlap with chat widget
- [x] Phone number and CTA text from config

### VIS-04: SectionHeading Component — SHOULD [COMPLETE]

Consistent heading component for all section titles with optional subtitle and accent line.

**Files:** `src/components/ui/SectionHeading.tsx`

**Acceptance Criteria:**
- [x] Reusable component with title, subtitle, alignment props
- [x] Used across all section components for consistent styling
- [x] Proper heading hierarchy (h2 for sections, configurable)

### VIS-05: Skeleton Loading States — SHOULD [COMPLETE]

Skeleton placeholders for lazy-loaded content instead of spinner.

**Files:** `src/components/ui/Skeleton.tsx`, `src/App.tsx`

**Acceptance Criteria:**
- [x] Skeleton component with pulse animation
- [x] Used as Suspense fallback for page-level lazy loads
- [x] Matches approximate layout of target page

---

## Category: Lead Generation (LEAD)

### LEAD-01: Working Contact Form Submission — MUST [COMPLETE]

Contact form sends data to a real backend. Formspree default, configurable webhook.

**Files:** `src/pages/Contact.tsx`, `src/lib/form-handler.ts`, `src/config/forms.ts`

**Acceptance Criteria:**
- [x] Form submission sends data to configured backend (Formspree by default)
- [x] Configurable webhook URL in `forms.ts` for CRM integration
- [x] Loading state shown during submission
- [x] Error state shown on failure with retry option
- [x] Success message shown after submission (text from config)
- [x] Honeypot field for spam protection

### LEAD-02: Form Validation — MUST [COMPLETE]

Client-side validation with React Hook Form + Zod.

**Files:** `src/pages/Contact.tsx`, `src/lib/schemas.ts`

**Acceptance Criteria:**
- [x] All required fields validated before submission
- [x] Email format validation
- [x] Phone number format validation
- [x] Inline error messages per field
- [x] Service options populated from config
- [x] Accessible error announcements (aria-live)

### LEAD-03: Custom Booking Calendar — SHOULD

Date/time picker for scheduling inspections.

**Files:** `src/components/ui/BookingCalendar.tsx`, `src/pages/Contact.tsx`

**Acceptance Criteria:**
- [x] Custom-built date picker (no third-party embed)
- [x] Shows available dates (configurable blocked dates)
- [x] Time slot selection
- [x] Integrates with contact form submission
- [x] Mobile-friendly, touch-accessible
- [x] Keyboard navigable

### LEAD-04: Financing Calculator — SHOULD [COMPLETE]

Interactive monthly payment calculator for common project costs.

**Files:** `src/components/ui/FinancingCalculator.tsx`, `src/pages/Financing.tsx`

**Acceptance Criteria:**
- [x] Slider/input for project cost
- [x] Configurable interest rates and terms
- [x] Real-time monthly payment display
- [x] CTA to contact/apply
- [x] Financing page template with calculator + FAQ + partner logos

### LEAD-05: Emergency Storm Banner — SHOULD [COMPLETE]

Config-toggled banner for storm events.

**Files:** `src/components/ui/AnnouncementBanner.tsx`, `src/config/banner.ts`, `src/lib/banner-client.ts`, `src/components/layout/Layout.tsx`

**Acceptance Criteria:**
- [x] Toggle in config activates site-wide top banner
- [x] Banner text, phone number, and CTA configurable
- [x] Dismissible by user (persists dismissal in session)
- [x] High-contrast, attention-grabbing design

---

## Category: Content & SEO (SEO)

### SEO-01: Markdown Blog System — MUST [COMPLETE]

File-based blog with frontmatter metadata, listing page, and post page.

**Files:** `src/content/blog/*.md`, `src/pages/BlogIndex.tsx`, `src/pages/BlogPost.tsx`, `src/lib/blog.ts`

**Acceptance Criteria:**
- [x] Blog posts written as markdown files with YAML frontmatter
- [x] Frontmatter validated with Zod (title, slug, date, excerpt, tags required)
- [x] Blog listing page with date, excerpt, cover image
- [x] Individual post page renders markdown as HTML
- [x] Proper meta tags per post (title, description, OG)
- [x] 3-5 demo blog posts included
- [x] Posts sorted by date, filterable by tag

### SEO-02: City/Service Area Pages — MUST [COMPLETE]

Auto-generated landing pages for each city in the service area config.

**Files:** `src/pages/CityPage.tsx`, `src/config/service-areas.ts`

**Acceptance Criteria:**
- [x] Each city in config gets its own route (`/service-areas/{slug}`)
- [x] City pages have unique content (description, meta title, meta description per city)
- [x] City pages show available services, local testimonials, nearby areas
- [x] 20-30 demo cities included with unique descriptions (20 cities: 12 TX + 8 OK)
- [x] Internal linking between nearby cities
- [x] Service area index page links to all city pages

**Completed:** 05-03 (2026-02-24)

### SEO-03: JSON-LD Structured Data — MUST [COMPLETE]

Schema.org markup generated from config, rendered per page.

**Files:** `src/components/seo/JsonLd.tsx`, `src/lib/seo.ts`

**Acceptance Criteria:**
- [x] `LocalBusiness` schema on every page (from company config)
- [x] `Service` schema on service pages
- [x] `FAQPage` schema on pages with FAQ sections
- [x] `AggregateRating` from testimonials config
- [x] `BreadcrumbList` on all pages
- [x] `BlogPosting` schema on blog posts
- [x] Validates with Google Rich Results Test

**Completed:** 05-04 (2026-02-24)

### SEO-04: Sitemap & Robots.txt — MUST [COMPLETE]

Auto-generated sitemap.xml and robots.txt at build time.

**Files:** `vite.config.ts`

**Acceptance Criteria:**
- [x] Custom Vite plugin generates sitemap.xml including all static routes, service pages, city pages, blog posts (54 URLs)
- [x] robots.txt generated with sitemap reference
- [x] Routes dynamically sourced from config (new pages auto-included)

**Completed:** 05-04 (2026-02-24)

### SEO-05: Complete Meta Tag System — MUST [COMPLETE]

Enhance PageMeta with OG image, Twitter cards, canonical URLs.

**Files:** `src/components/ui/PageMeta.tsx`, `src/config/seo.ts`

**Acceptance Criteria:**
- [x] `og:image` with absolute URL on all pages
- [x] Twitter card meta tags (twitter:card, twitter:image)
- [x] Canonical URL on all pages
- [x] Default SEO config in `seo.ts` (title template, default description, default OG image)
- [x] Per-page override capability

### SEO-06: Reviews Config System — MUST [COMPLETE]

Testimonial/review data managed entirely in config.

**Files:** `src/config/testimonials.ts`

**Acceptance Criteria:**
- [x] All review data in `testimonials.ts` (name, location, service, quote, rating, image, featured flag)
- [x] Homepage shows `featured: true` testimonials
- [x] Testimonials page shows all
- [x] Service-filtered testimonials available on service pages
- [x] Google Reviews integration point (placeholder section with embed instructions)

### SEO-07: Portfolio Enhancement — MUST ✓ COMPLETE (05-02)

Portfolio/project data in config with before/after support.

**Files:** `src/config/projects.ts`, `src/pages/Projects.tsx`

**Acceptance Criteria:**
- [x] Projects defined in `projects.ts` with category, location, images, description
- [x] `beforeImage`/`afterImage` fields for before/after comparisons
- [x] Category filter on projects page
- [x] Featured projects shown on homepage
- [x] Project detail view or expanded card

---

## Category: AI Assistant (AVA)

### AVA-01: Chat Context Awareness — SHOULD [Pending → Phase 9 gap closure]

Ava responds with awareness of current page and user journey.

**Files:** `src/components/ui/AvaWidget.tsx`, API backend

**Acceptance Criteria:**
- [ ] System prompt includes current page context
- [ ] Quick actions change based on current page
- [ ] Conversation history limited to last 10 messages sent to API

### AVA-02: Lead Capture in Chat — SHOULD [Pending → Phase 9 gap closure]

Ava collects contact info during natural conversation flow.

**Files:** `src/components/ui/AvaWidget.tsx`, `src/lib/api.ts`

**Acceptance Criteria:**
- [ ] After 2-3 exchanges, Ava offers to capture name/phone/email
- [ ] Captured leads sent to the same form submission backend
- [ ] "Talk to a real person" escalation button shown after initial exchanges
- [ ] Lead capture is optional (user can continue chatting without providing info)

### AVA-03: Chat Rate Limiting & Security — SHOULD [Pending → Phase 9 gap closure]

Protect chat API from abuse.

**Files:** `api/chat.js`, `src/components/ui/AvaWidget.tsx`

**Acceptance Criteria:**
- [ ] CORS restricted to site domain (not wildcard `*`)
- [ ] Conversation history capped at 10 messages sent to API
- [ ] Client-side rate limiting (max 1 message per 2 seconds)
- [ ] Graceful degradation on 429 (rate limit) — switch to demo mode

---

## Category: Performance (PERF)

### PERF-01: Image Optimization Pipeline — SHOULD [COMPLETE]

Build-time image compression and responsive image support.

**Files:** `vite.config.ts`, image components

**Acceptance Criteria:**
- [x] `vite-plugin-image-optimizer` compresses images at build time
- [ ] Hero images use `<picture>` with WebP + fallback
- [x] All images have explicit `width`/`height` attributes
- [x] Below-fold images use `loading="lazy"` and `decoding="async"`

### PERF-02: Performance Monitoring — COULD [Pending → Phase 10 gap closure]

Built-in Core Web Vitals monitoring.

**Files:** `src/lib/vitals.ts`, `src/main.tsx`

**Acceptance Criteria:**
- [ ] `web-vitals` library reports CLS, INP, LCP
- [ ] Vercel Speed Insights integration (optional)
- [ ] Lighthouse score targets: Performance 90+, Accessibility 90+, SEO 90+

---

## Out of Scope (v2+)

| ID | Feature | Reason |
|----|---------|--------|
| OUT-01 | Dark mode toggle | Adds complexity; light-only for v1 per project decision |
| OUT-02 | Multi-step quote wizard | High complexity; basic form + booking calendar sufficient for v1 |
| OUT-03 | Google Maps embed | Requires API key setup; city list is sufficient for v1 |
| OUT-04 | Appointment scheduling (Calendly/Cal.com) | External dependency; custom calendar covers this |
| OUT-05 | Multi-language (i18n) | Major scope; English-only for v1 |
| OUT-06 | Photo upload in lead form | Requires backend file handling |
| OUT-07 | Customer portal / project tracker | Requires backend + auth; out of template scope |
| OUT-08 | Online payment integration | Requires payment processor; out of template scope |
| OUT-09 | CMS admin panel | Template is config-driven, not CMS-driven |
| OUT-10 | Pre-rendering / SSG | Significant refactor (RR7 framework mode); dedicated milestone |
| OUT-11 | Cost/price calculator widget | Complex to make generic; financing calculator is sufficient |

---

## Requirement Summary

| Category | MUST | SHOULD | COULD | Total |
|----------|------|--------|-------|-------|
| Infrastructure & Config | 6 | 0 | 0 | 6 |
| Visual Polish | 2 | 3 | 0 | 5 |
| Lead Generation | 2 | 3 | 0 | 5 |
| Content & SEO | 7 | 0 | 0 | 7 |
| AI Assistant | 0 | 3 | 0 | 3 |
| Performance | 0 | 1 | 1 | 2 |
| **Total** | **17** | **10** | **1** | **28** |

---

*Requirements defined: 2026-02-21*
