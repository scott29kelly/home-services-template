# PROJECT — Premium Home Services Template

## What This Is

A **premium, demo-ready website template** for small home service businesses (roofing, siding, storm damage restoration). Config-driven customization, full lead generation suite, SEO engine with 20 city pages, markdown blog, and AI chat assistant — all without touching component code.

## Core Value

**Config-driven customizability** — a developer rebrands the entire site by editing config files. Adding a service, city, blog post, or testimonial requires zero component changes.

## Problem

Small home service businesses need professional websites but face two bad options:
1. **Generic website builders** — cheap but cookie-cutter, no industry-specific features
2. **Custom development** — expensive, slow, and hard to maintain

This template fills the gap: premium, pre-built, purpose-built for home services.

## Target Audience

**Primary buyer**: Small home service businesses (1-20 employees) in roofing, siding, and storm damage restoration. Template is fully configurable for any US market.

## Requirements

### Validated

- ✓ CFG-01: Modular Config System — v1.0
- ✓ CFG-02: Config-Driven Navigation — v1.0
- ✓ CFG-03: Config-Driven Routing — v1.0
- ✓ CFG-04: Content Migration to Config — v1.0
- ✓ CFG-05: 404 Page — v1.0
- ✓ CFG-06: Feature Flags System — v1.0
- ✓ VIS-01: Framer Motion Performance Optimization — v1.0
- ✓ VIS-02: Interactive Before/After Slider — v1.0
- ✓ VIS-03: Sticky Mobile CTA Bar — v1.0
- ✓ VIS-04: SectionHeading Component — v1.0
- ✓ VIS-05: Skeleton Loading States — v1.0
- ✓ PERF-01: Image Optimization Pipeline — v1.0
- ✓ LEAD-01: Working Contact Form Submission — v1.0
- ✓ LEAD-02: Form Validation — v1.0
- ✓ LEAD-03: Custom Booking Calendar — v1.0
- ✓ LEAD-04: Financing Calculator — v1.0
- ✓ LEAD-05: Emergency Storm Banner — v1.0
- ✓ SEO-01: Markdown Blog System — v1.0
- ✓ SEO-02: City/Service Area Pages — v1.0
- ✓ SEO-03: JSON-LD Structured Data — v1.0
- ✓ SEO-04: Sitemap & Robots.txt — v1.0
- ✓ SEO-05: Complete Meta Tag System — v1.0
- ✓ SEO-06: Reviews Config System — v1.0
- ✓ SEO-07: Portfolio Enhancement — v1.0
- ✓ AVA-01: Chat Context Awareness — v1.0
- ✓ AVA-02: Lead Capture in Chat — v1.0
- ✓ AVA-03: Chat Rate Limiting & Security — v1.0
- ✓ PERF-02: Performance Monitoring — v1.0 (partial: Lighthouse Performance below 90+ target, SSR deferred)

### Active

(None — define with `/gsd:new-milestone`)

### Out of Scope

- Dark mode toggle — light-only; reduces complexity
- Multi-step quote wizard — basic form + booking calendar sufficient
- Google Maps embed — requires API key; city list sufficient
- Calendly/Cal.com integration — custom calendar covers this
- Multi-language (i18n) — English-only
- Photo upload in lead form — requires backend file handling
- Customer portal / project tracker — requires backend + auth
- Online payment integration — requires payment processor
- CMS admin panel — template is config-driven, not CMS-driven
- Pre-rendering / SSG — significant refactor (RR7 framework mode); dedicated milestone
- Cost/price calculator widget — financing calculator is sufficient

## Context

Shipped v1.0 with 9,031 LOC TypeScript/TSX across 210 files.

**Tech stack:** React 19 + Vite 7 + Tailwind CSS v4 + TypeScript 5.9 + Framer Motion 12 + React Router 7

**Pages:** Home, Services (dynamic), Projects, Portfolio detail, Testimonials, About, Contact (with booking calendar), Financing, Resources (blog index + posts), Service Areas (index + 20 city pages), Ava (AI chat), 404

**Config system:** 13 modular config files with Zod validation, feature flags, barrel export

**Known issues:**
- Lighthouse Performance 87 desktop / 51 mobile — SPA without SSR; pre-rendering deferred
- `api/contact.js` and `api/banner.js` orphan serverless files
- `getTestimonialsByService()` exported but unused
- `vitals.ts` production handler is no-op placeholder

## Key Decisions

| Decision | Choice | Outcome |
|----------|--------|---------|
| Quote form submission | Formspree default + webhook | ✓ Good — working submission pipeline |
| Blog source | Local markdown + Vite glob | ✓ Good — 12 posts, no external deps |
| Reviews/testimonials | Config-driven | ✓ Good — featured flag, service/city tags |
| Calendar/booking | Custom date/time picker | ✓ Good — ARIA accessible, touch-friendly |
| City pages | Config-driven, auto-generated | ✓ Good — 20 cities with unique content |
| Theme | Light only | ✓ Good — reduced complexity |
| Navigation | Config-driven | ✓ Good — feature flags gate all nav items |
| Framer Motion | LazyMotion + domAnimation | ✓ Good — ~15KB bundle savings |
| Hero animation | Zero framer-motion on above-fold | ✓ Good — instant LCP |
| Image optimization | Custom Vite plugin | ✓ Good — works around Windows junction bug |
| Ava CORS | ALLOWED_ORIGIN env var | ✓ Good — dev-friendly, production-secure |
| Pre-rendering | Deferred to future milestone | ⚠️ Revisit — Lighthouse Performance below target |

## Constraints

- **No dark mode** — Light theme only
- **No external service dependencies for core features** — config/file-driven
- **Vercel deployment** — existing target
- **Config-driven** — non-technical users edit config files only
- **React 19 + Vite + Tailwind v4** — keep existing stack

## Milestones

- ✅ **v1.0 Premium Template Launch** — shipped 2026-03-01

---

*Last updated: 2026-03-01 after v1.0 milestone*
