# CONTEXT — Phase 2: Visual Polish & Performance

**Created:** 2026-02-22
**Source:** User discussion session

---

## Phase Boundary

Optimize Framer Motion bundle, fix CWV-damaging animations, add premium visual components (before/after slider, sticky CTA, section headings, skeletons), and set up image optimization pipeline.

---

## Decisions Captured

### Animation Feel

- **Hero:** Best practices for home services — instant text/CTA render, subtle image treatment (Claude's discretion on exact approach)
- **Scroll animations:** Subtle fade-up only (~20px slide + opacity) — clean, professional, not flashy
- **Page transitions:** Best practices (Claude's discretion)
- **Reduced motion:** Respect `prefers-reduced-motion` OS setting via Framer Motion's `reducedMotion="user"` — no site toggle needed
- **Quality bar: PREMIUM, 2026-state-of-the-art.** Researcher must deeply investigate latest Framer Motion, GSAP patterns, and high-end home services sites. User is open to changing branding/colors if it produces a more stunning result.

### Before/After Slider

- **Reveal style:** Draggable divider (classic handle)
- **Placement:** Everywhere it makes sense, but don't overuse — best practices for strategic placement
- **Image data:** From portfolio config — add optional `beforeImage`/`afterImage` fields to project entries (single source of truth, less config per customer fork)
- **Mobile layout:** Claude's discretion

### Sticky Mobile CTA

- **Content:** Phone + Quote button + Ava chat icon (three actions)
- **Trigger:** Claude's discretion (best practice for conversion timing)
- **Device treatment:** Mobile gets sticky bottom bar; Desktop gets NO sticky/floating elements (except Ava chat bubble). Desktop CTAs are strategically placed inline throughout page content.
- **Visual style:** Premium feel, Claude's discretion
- **Note:** Ava chat is already a floating circle button — that's the one floating element on desktop

### Section Headings & Skeletons

- **Heading anatomy:** Claude's discretion — premium look
- **Heading animation:** Subtle fade-up, consistent with other scroll-triggered elements
- **Skeletons:** Images only (lazy-loaded below fold). Text renders instantly from bundled config — no skeletons needed for text.
- **Skeleton style:** Animated shimmer (pulse/wave)

### Testimonials Visual Treatment

- **Reference component:** Aceternity UI's AnimatedTestimonials — stacked image cards with rotation, word-by-word blur reveal for quotes, prev/next navigation
- **Critical adaptation:** Images must be completed job photos (house with new siding, bathroom remodel, etc.) — NOT customer faces. Most home service companies cannot get customer headshots.
- Quotes are from the customer about quality of work done
- Needs Vite/React adaptation (reference uses Next.js `Image`, `@tabler/icons-react`)
- Should integrate with existing testimonials config from Phase 1
- Autoplay behavior and interaction patterns: Claude's discretion, make it premium

---

## Claude's Discretion Areas

- Hero exact treatment (within best practices)
- Page transition style
- Reduced motion behavior
- Before/after slider mobile layout
- Sticky CTA trigger timing
- Sticky CTA visual treatment
- Section heading anatomy/design
- Desktop CTA placement strategy
- Testimonials component exact implementation (adapt Aceternity reference to fit stack and theme)

---

## Deferred Ideas

None — discussion stayed within phase scope.
