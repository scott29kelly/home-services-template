# Research Summary

**Synthesized:** 2026-02-21
**Sources:** STACK.md, FEATURES.md, ARCHITECTURE.md, PITFALLS.md

---

## Top-Level Findings

### The template is already 70% of the way to premium

The existing stack (React 19 + Vite 7 + Tailwind v4 + Framer Motion + TypeScript) is excellent. The 11-page structure, scroll animations, and AI chat widget are genuine differentiators. The gap to premium pricing ($200-500) is primarily:

1. **Working lead generation** — The contact form is a no-op. This is the #1 critical fix.
2. **SEO infrastructure** — No structured data, no sitemap, SPA serves empty HTML to crawlers.
3. **Config system scale** — Current single-file config won't scale to the planned feature set.
4. **City-level SEO pages** — The highest-ROI feature for local service businesses.
5. **Visual "wow" moments** — Interactive before/after slider, sticky mobile CTA, premium polish.

### The AI chat is the true unique differentiator

No competing home services template on any marketplace offers an AI-powered chatbot. This alone justifies a premium price. The chat needs guardrails (conversation length cap, reduced-motion, human escalation path) but the foundation is strong.

---

## Critical Decisions Informed by Research

| Decision | Research Finding | Recommendation |
|----------|-----------------|----------------|
| Config architecture | Single file won't scale past ~100 fields (ARCHITECTURE) | Split into modular files + Zod validation |
| Form backend | Form is a no-op, needs zero-backend default (FEATURES, PITFALLS) | Formspree default + configurable webhook |
| SEO approach | SPA serves empty HTML to crawlers (PITFALLS) | Build-time pre-rendering (vite-plugin-prerender or RR7 framework mode) — defer to later phase |
| City pages | #1 feature agencies pay for, 23% revenue increase (FEATURES) | Config-driven with unique content per city |
| Blog system | Markdown with frontmatter + Vite glob imports (ARCHITECTURE) | File-based blog with Zod-validated frontmatter |
| Animation perf | Hero animations hurt LCP, Framer Motion ~34KB (PITFALLS, STACK) | LazyMotion + domAnimation, remove hero opacity animation |
| Image optimization | No build-time optimization, images copied raw (PITFALLS) | vite-plugin-image-optimizer + responsive images |
| Form validation | No validation at all currently (STACK, PITFALLS) | React Hook Form + Zod |
| Navigation | Hardcoded in 3+ files (ARCHITECTURE) | Auto-generate from services config |
| Accessibility | No prefers-reduced-motion support (PITFALLS) | MotionConfig reducedMotion="user" — single line fix |

---

## Package Additions (Confirmed by Research)

### Production Dependencies
| Package | Purpose | Bundle Impact |
|---------|---------|---------------|
| `react-hook-form` | Form state + validation | ~12KB gzipped |
| `zod` | Schema validation + config types | ~14KB gzipped |
| `@hookform/resolvers` | RHF-Zod bridge | ~2KB gzipped |
| `web-vitals` | Core Web Vitals monitoring | ~2KB gzipped |

### Dev Dependencies
| Package | Purpose |
|---------|---------|
| `vite-plugin-sitemap` | Auto-generate sitemap.xml + robots.txt |
| `vite-plugin-image-optimizer` | Build-time image compression (Sharp.js) |

### Deferred (Future Phases)
| Package | Purpose | Phase |
|---------|---------|-------|
| `vite-plugin-markdown` | Markdown blog imports | Blog phase |
| `@vercel/speed-insights` | Real user monitoring | Polish phase |

---

## Architecture Consensus

All four research dimensions converge on the same architecture:

```
src/config/
  index.ts              — Barrel export, validation gateway
  schema.ts             — Zod schemas (users never touch)
  company.ts            — Business info (users edit)
  services.ts           — Service definitions (users edit)
  service-areas.ts      — Cities with unique content (users edit)
  testimonials.ts       — Review data (users edit)
  projects.ts           — Portfolio data (users edit)
  navigation.ts         — Auto-generated from services
  assistant.ts          — AI chat config
  forms.ts              — Form fields + submission backend
  theme.ts              — Colors, fonts
  seo.ts                — Meta defaults, OG image
  features.ts           — Feature flags
```

**Key patterns:**
- Config files are pure data (no JSX, no imports of React components)
- Zod validates at build/dev time with clear error messages
- One template page per entity type (ServicePage, CityPage, BlogPost)
- Navigation auto-generates from services + features config
- Feature flags gate routes AND nav items

---

## Risk Register (from Pitfalls Research)

### Must Address in Phase 1
| Risk | Severity | Mitigation |
|------|----------|------------|
| Contact form no-op | CRITICAL | Implement Formspree default backend |
| Config doesn't scale | HIGH | Modular config with Zod validation |
| Hardcoded navigation | HIGH | Auto-generate from config |
| No 404 page | MEDIUM | Add catch-all route |

### Must Address Early (Phases 2-3)
| Risk | Severity | Mitigation |
|------|----------|------------|
| Hero animations hurt LCP | HIGH | LazyMotion, remove hero opacity animation |
| No reduced-motion support | HIGH | MotionConfig reducedMotion="user" |
| Images unoptimized | HIGH | Build-time optimization pipeline |
| Schema.org hardcoded in HTML | MEDIUM | Generate from config dynamically |
| No sitemap/robots.txt | MEDIUM | vite-plugin-sitemap |

### Address Before Launch
| Risk | Severity | Mitigation |
|------|----------|------------|
| SPA empty HTML for crawlers | HIGH | Pre-rendering (defer to dedicated phase) |
| City pages duplicate content | HIGH | Require unique content per city in config |
| Chat API open CORS/no rate limit | MEDIUM | Restrict CORS, add rate limiting |
| Email deliverability | MEDIUM | Use transactional email service |
| Demo data left in production | LOW | Build-time check for default values |

---

## Phase Ordering Consensus

Research converges on this ordering:

1. **Config System Foundation** — Everything else depends on this. Split config, add Zod, make nav config-driven.
2. **Visual Polish + Performance** — LazyMotion, reduced-motion, hero optimization, image pipeline. Premium feel.
3. **Lead Generation** — Form backend, validation, sticky mobile CTA, multi-step form option.
4. **Blog System** — Markdown blog with frontmatter, blog listing/post pages.
5. **SEO & Content** — City pages, JSON-LD structured data, sitemap, 404 page, Schema.org.
6. **Integration & Polish** — Ava enhancement, cross-feature CTAs, demo data polish, performance audit.

Pre-rendering (React Router Framework Mode or vite-plugin-prerender) is the biggest open question. It's critical for SEO but is a significant refactor. Research recommends deferring to a dedicated phase or addressing it within the SEO phase.

---

*Synthesis: 2026-02-21*
