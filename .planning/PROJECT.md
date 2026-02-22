# PROJECT — Premium Home Services Template

## Vision

Transform the existing home services website template from a basic marketing site into a **premium template product sold to small home service businesses**. The template must serve as a demo-ready showcase that justifies a significant price premium through visual polish, lead generation capability, content/SEO features, and config-driven customizability.

## Problem

Small home service businesses (roofing, siding, storm damage restoration) need professional websites but face two bad options:
1. **Generic website builders** — cheap but cookie-cutter, no industry-specific features
2. **Custom development** — expensive, slow, and hard to maintain

There's a gap for a **premium, pre-built template** purpose-built for home services that looks custom, generates leads, and can be configured without code changes.

## Target Audience

**Primary buyer**: Small home service businesses (1-20 employees) in the roofing, siding, and storm damage restoration space. Initial geographic focus is the tri-state/Philadelphia area, but the template must be fully configurable for any US market.

**Buyer profile**:
- Not technical — needs config-driven customization, not code editing
- Cares about looking professional and trustworthy
- Wants the site to generate leads (quote requests, phone calls, inspections)
- Values social proof (reviews, certifications, portfolio)

## Core Value Proposition

A demo-ready template that small businesses can see in action and immediately understand the value. Four pillars:

1. **Visual Polish** — Parallax effects, page transitions, micro-interactions, premium typography. The site must *feel* expensive.
2. **Lead Generation** — Multi-step quote form, custom booking calendar, financing calculator, CRM webhook support. Every page drives conversions.
3. **Content & SEO** — Markdown blog, auto-generated city/service-area pages, review showcase, portfolio with before/after, Schema.org markup. Organic traffic engine.
4. **Config-Driven Customizability** — Modular configuration system. Business owner (or their developer) edits config files to change branding, services, cities, reviews, portfolio, and content without touching component code.

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Quote form submission | Email notification default + configurable CRM webhook | Low-friction default; CRM integration for advanced users |
| Blog source | Local markdown files with frontmatter | No external dependency; CMS-pluggable architecture for future |
| Reviews/testimonials | Config-driven (paste into config) | No API dependency; business owner controls what's shown |
| Calendar/booking | Custom-built date/time picker component | No third-party embed; consistent design; no external dependency |
| Service area city pages | Config-driven, auto-generated routes | ~20-30 cities for demo; business configures their own cities |
| Portfolio/projects data | Config array | Moves out of hardcoded component into config |
| Theme | Light only | No dark mode toggle; reduces complexity |
| Navigation | Config-driven | Header/Footer links generated from config, not hardcoded |

## Existing Codebase

**Stack**: React 19 + Vite 7 + Tailwind CSS v4 + TypeScript 5.9 + Framer Motion 12 + React Router 7

**Current state** (11 pages):
- Home, Roofing, Siding, Storm Damage, Services, Projects, Testimonials, About, Contact, Service Areas, Ava (AI chat)
- Central config at `src/config/site.ts` (company info, contact, service areas, AI assistant)
- Framer Motion scroll animations throughout
- AI chat assistant (Ava) with Groq API backend + demo fallback
- Lazy-loaded routes with Suspense
- Serverless API (Vercel/Cloudflare) for chat

**Key gaps to address**:
- Navigation is hardcoded in Header.tsx (lines 6-23) and Footer.tsx (lines 6-18)
- Project data hardcoded in Projects.tsx (lines 10-38)
- Testimonial data hardcoded in Testimonials.tsx (lines 13-35)
- Contact form is a no-op (doesn't submit anywhere)
- No blog system
- No city-level SEO pages
- No booking/calendar functionality
- No 404 page
- Config is a single flat file; needs modular structure for premium template

## Constraints

- **No dark mode** — Light theme only
- **No external service dependencies for core features** — Reviews, portfolio, blog all config/file-driven
- **Must work on Vercel deployment** — Existing deployment target
- **Must remain config-driven** — Non-technical users should only edit config files
- **React 19 + Vite + Tailwind v4** — Keep existing stack, no framework migration

## Success Criteria

1. **Demo-ready**: A visitor to the demo site immediately sees a premium, polished product
2. **Lead generation**: At least 3 distinct conversion paths (quote form, calendar booking, phone CTA, chat)
3. **SEO-ready**: Blog posts render with proper meta tags, city pages have unique content, Schema.org markup present
4. **Configurable**: A developer can rebrand and customize the template by editing only config files
5. **No broken features**: Every interactive element (forms, chat, calendar, navigation) works end-to-end

## Milestone

**v1.0 — Premium Template Launch**: All four pillars implemented, demo site live, template ready for sale.

---

*Project initialized: 2026-02-21*
