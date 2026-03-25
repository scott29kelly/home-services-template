# Phase 2: Visual Polish & Performance - Research

**Researched:** 2026-02-22
**Domain:** Framer Motion optimization, premium UI components, image optimization, accessibility
**Confidence:** HIGH

## Summary

Phase 2 covers six requirement areas: Framer Motion bundle optimization (VIS-01), before/after slider (VIS-02), sticky mobile CTA (VIS-03), section heading component (VIS-04), skeleton loading states (VIS-05), and image optimization pipeline (PERF-01). The user also added a major testimonials visual overhaul (Aceternity-inspired AnimatedTestimonials) during discussion.

The codebase currently imports `motion` from `framer-motion` in 19 files, creating a ~34KB bloated bundle. Switching to `LazyMotion` + `m` component reduces this to ~4.6KB initial. A critical finding: the Projects page uses `layout` animation (filter transitions), which requires `domMax` (+25KB) rather than `domAnimation` (+15KB). The recommended approach is to use `domAnimation` globally and refactor the Projects page to remove `layout` animations (use CSS transitions or `AnimatePresence` with `mode="popLayout"` instead), saving ~15KB gzipped vs current.

The hero currently has a damaging opacity+y animation (`initial={{ opacity: 0, y: 40 }}`) on above-fold content, which delays LCP and hurts CWV scores. This must be removed -- hero text/CTA should render instantly.

**Primary recommendation:** Use `LazyMotion` with `domAnimation` at the app root, replace all `motion.xxx` with `m.xxx`, remove hero entrance animation, add `MotionConfig reducedMotion="user"`, and build the four new UI components (BeforeAfterSlider, StickyMobileCTA, SectionHeading, Skeleton) plus the AnimatedTestimonials overhaul.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **Hero:** Best practices for home services — instant text/CTA render, subtle image treatment (Claude's discretion on exact approach)
- **Scroll animations:** Subtle fade-up only (~20px slide + opacity) — clean, professional, not flashy
- **Page transitions:** Best practices (Claude's discretion)
- **Reduced motion:** Respect `prefers-reduced-motion` OS setting via Framer Motion's `reducedMotion="user"` — no site toggle needed
- **Quality bar: PREMIUM, 2026-state-of-the-art.** Researcher must deeply investigate latest Framer Motion, GSAP patterns, and high-end home services sites. User is open to changing branding/colors if it produces a more stunning result.
- **Before/After Slider — Reveal style:** Draggable divider (classic handle)
- **Before/After Slider — Placement:** Everywhere it makes sense, but don't overuse — best practices for strategic placement
- **Before/After Slider — Image data:** From portfolio config — add optional `beforeImage`/`afterImage` fields to project entries (single source of truth, less config per customer fork)
- **Sticky Mobile CTA — Content:** Phone + Quote button + Ava chat icon (three actions)
- **Sticky Mobile CTA — Device treatment:** Mobile gets sticky bottom bar; Desktop gets NO sticky/floating elements (except Ava chat bubble). Desktop CTAs are strategically placed inline throughout page content.
- **Sticky Mobile CTA — Note:** Ava chat is already a floating circle button — that's the one floating element on desktop
- **Section Headings & Skeletons — Heading animation:** Subtle fade-up, consistent with other scroll-triggered elements
- **Skeletons:** Images only (lazy-loaded below fold). Text renders instantly from bundled config — no skeletons needed for text.
- **Skeleton style:** Animated shimmer (pulse/wave)
- **Testimonials Visual Treatment — Reference component:** Aceternity UI's AnimatedTestimonials — stacked image cards with rotation, word-by-word blur reveal for quotes, prev/next navigation
- **Testimonials — Critical adaptation:** Images must be completed job photos (house with new siding, bathroom remodel, etc.) — NOT customer faces. Most home service companies cannot get customer headshots.
- Quotes are from the customer about quality of work done
- Needs Vite/React adaptation (reference uses Next.js `Image`, `@tabler/icons-react`)
- Should integrate with existing testimonials config from Phase 1

### Claude's Discretion
- Hero exact treatment (within best practices)
- Page transition style
- Reduced motion behavior
- Before/after slider mobile layout
- Sticky CTA trigger timing
- Sticky CTA visual treatment
- Section heading anatomy/design
- Desktop CTA placement strategy
- Testimonials component exact implementation (adapt Aceternity reference to fit stack and theme)

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| VIS-01 | Framer Motion Performance Optimization | LazyMotion + domAnimation + m component pattern verified. Import from `framer-motion` supported. Hero opacity animation removal documented. MotionConfig reducedMotion API confirmed. |
| VIS-02 | Interactive Before/After Slider | Custom build recommended (zero dependencies). Pointer Events API for unified mouse/touch. ARIA `role="slider"` pattern. Config schema changes documented. |
| VIS-03 | Sticky Mobile CTA Bar | Fixed bottom bar with show-on-scroll pattern. Three-action layout (phone, quote, Ava). Z-index coordination with AvaWidget documented. |
| VIS-04 | SectionHeading Component | Consistent heading extraction from 8+ section components. Fade-up animation with m component. Props: title, subtitle, alignment, tag level. |
| VIS-05 | Skeleton Loading States | Tailwind `animate-pulse` shimmer for image placeholders. Suspense fallback integration. Layout-stable sizing to prevent CLS. |
| PERF-01 | Image Optimization Pipeline | vite-plugin-image-optimizer with Sharp.js. WebP lossless defaults. width/height attributes on all img tags. loading="lazy" + decoding="async" for below-fold. |
| (NEW) | AnimatedTestimonials Overhaul | Aceternity-inspired component adapted for Vite/React. Stacked cards with rotation, word-by-word blur reveal. Job photos instead of headshots. Integrates with existing testimonials config. |
</phase_requirements>

---

## Standard Stack

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| framer-motion | ^12.34.0 | Animation library | Already in project; `LazyMotion`, `domAnimation`, `m`, `AnimatePresence`, `MotionConfig` all exported |
| tailwindcss | ^4.1.18 | CSS framework | Already in project; `animate-pulse` for skeletons, responsive utilities for mobile CTA |
| lucide-react | ^0.564.0 | Icons | Already in project; icons for CTA bar (Phone, MessageSquare) |
| react | ^19.2.4 | UI framework | Already in project |

### Supporting (New Install Required)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| vite-plugin-image-optimizer | ^2.0.3 | Build-time image compression | PERF-01: compress all images at build time |
| sharp | (peer dep) | Image processing engine | Required peer dependency for vite-plugin-image-optimizer |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom before/after slider | react-compare-slider | Adds dependency; custom is ~80 lines with full a11y |
| vite-plugin-image-optimizer | vite-plugin-imagemin | imagemin is unmaintained; sharp-based optimizer is actively maintained |
| Custom skeleton | react-loading-skeleton | Adds dependency; Tailwind `animate-pulse` is sufficient for image-only skeletons |

**Installation:**
```bash
npm install -D vite-plugin-image-optimizer sharp
```

---

## Architecture Patterns

### Recommended Project Structure
```
src/
├── main.tsx                    # Add LazyMotion + MotionConfig wrappers
├── App.tsx                     # Replace PageLoader with Skeleton
├── components/
│   ├── layout/
│   │   └── Layout.tsx          # Add StickyMobileCTA
│   ├── sections/
│   │   ├── Hero.tsx            # Remove opacity animation from content
│   │   ├── Testimonials.tsx    # Replace with AnimatedTestimonials
│   │   ├── [all sections]      # Replace motion.* → m.* imports
│   │   └── ...
│   └── ui/
│       ├── BeforeAfterSlider.tsx   # NEW
│       ├── StickyMobileCTA.tsx     # NEW
│       ├── SectionHeading.tsx      # NEW
│       ├── Skeleton.tsx            # NEW
│       └── AnimatedTestimonials.tsx # NEW (or replace Testimonials.tsx)
├── config/
│   ├── projects.ts             # Add beforeImage/afterImage to Project type
│   └── schema.ts               # Update projectSchema
└── hooks/
    └── useScrollReveal.ts      # No changes needed (useInView is standalone)
```

### Pattern 1: LazyMotion + m Component (VIS-01)

**What:** Wrap the app in `LazyMotion` with `domAnimation` features and `MotionConfig` for reduced motion. Replace all `motion.xxx` with `m.xxx`.

**When to use:** Every component that uses framer-motion animations.

**Example:**
```typescript
// src/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { LazyMotion, domAnimation, MotionConfig } from 'framer-motion'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <LazyMotion features={domAnimation} strict>
        <MotionConfig reducedMotion="user">
          <App />
        </MotionConfig>
      </LazyMotion>
    </BrowserRouter>
  </StrictMode>,
)
```

```typescript
// Any component — BEFORE:
import { motion } from 'framer-motion'
// ...
<motion.div animate={{ opacity: 1 }} />

// AFTER:
import { m } from 'framer-motion'
// ...
<m.div animate={{ opacity: 1 }} />
```

**Source:** [Motion docs — Reduce bundle size](https://motion.dev/docs/react-reduce-bundle-size), [LazyMotion docs](https://motion.dev/docs/react-lazy-motion)

**Confidence:** HIGH — verified `framer-motion` v12 exports `LazyMotion`, `domAnimation`, `m`, and `MotionConfig` by checking `node_modules` directly.

### Pattern 2: Hero Instant Render (VIS-01)

**What:** Remove the opacity/y animation from hero above-fold content so text and CTA render instantly. Keep a subtle image treatment instead.

**When to use:** Hero component only.

**Current problem (Hero.tsx line 40-43):**
```typescript
<motion.div
  initial={{ opacity: 0, y: 40 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
  className="max-w-2xl"
>
```

This delays hero text visibility by ~800ms, directly hurting LCP and FCP.

**Fix:** Remove the wrapping `motion.div` entirely or make it a plain `div`. The hero text and CTA must be visible at first paint with zero animation delay. A subtle CSS animation on the background image (slight scale/fade) is acceptable since the image is not LCP text.

```typescript
// Hero content: plain div, no animation delay
<div className="max-w-2xl">
  <h1>...</h1>
  <p>...</p>
  <div className="flex ...">
    <Button ... />
    <Button ... />
  </div>
</div>
```

**Confidence:** HIGH — standard CWV best practice.

### Pattern 3: Before/After Slider with Pointer Events (VIS-02)

**What:** Custom draggable slider using Pointer Events API for unified mouse/touch handling.

**When to use:** BeforeAfterSlider component.

**Key implementation details:**
- Use `onPointerDown`, `onPointerMove`, `onPointerUp` (unified mouse + touch)
- Set `touch-action: none` on the slider container to prevent default touch scroll
- Use `setPointerCapture` for drag continuation even when pointer leaves the element
- ARIA: `role="slider"`, `aria-valuenow`, `aria-valuemin="0"`, `aria-valuemax="100"`, `aria-label`
- Keyboard: Left/Right arrows adjust slider position (5% increments), Home/End for 0%/100%

**Example structure:**
```typescript
interface BeforeAfterSliderProps {
  beforeImage: string
  afterImage: string
  beforeLabel?: string
  afterLabel?: string
}

function BeforeAfterSlider({ beforeImage, afterImage, beforeLabel = 'Before', afterLabel = 'After' }: BeforeAfterSliderProps) {
  const [position, setPosition] = useState(50) // percentage
  const containerRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    updatePosition(e)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return
    updatePosition(e)
  }

  const handlePointerUp = () => {
    isDragging.current = false
  }

  const updatePosition = (e: React.PointerEvent) => {
    const rect = containerRef.current!.getBoundingClientRect()
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width))
    setPosition((x / rect.width) * 100)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const step = 5
    if (e.key === 'ArrowLeft') setPosition(p => Math.max(0, p - step))
    if (e.key === 'ArrowRight') setPosition(p => Math.min(100, p + step))
    if (e.key === 'Home') setPosition(0)
    if (e.key === 'End') setPosition(100)
  }

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden select-none"
      style={{ touchAction: 'none' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* After image (full width background) */}
      <img src={afterImage} alt={afterLabel} className="w-full h-full object-cover" />

      {/* Before image (clipped by position) */}
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}>
        <img src={beforeImage} alt={beforeLabel} className="w-full h-full object-cover" />
      </div>

      {/* Draggable divider handle */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize"
        style={{ left: `${position}%` }}
        role="slider"
        tabIndex={0}
        aria-valuenow={Math.round(position)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Comparison slider"
        onKeyDown={handleKeyDown}
      >
        {/* Handle grip indicator */}
      </div>
    </div>
  )
}
```

**Source:** [Building an Accessible Before/After Slider in React](https://jsdev.space/react-before-after-slider/), [Best React before/after slider libraries (Croct 2026)](https://blog.croct.com/post/best-react-before-after-image-comparison-slider-libraries)

**Confidence:** HIGH — Pointer Events API is well-supported and the pattern is well-documented.

### Pattern 4: Sticky Mobile CTA with Scroll Trigger (VIS-03)

**What:** Fixed bottom bar on mobile (<768px) with phone, quote, and Ava actions. Shows on scroll, hides at top. Coordinates z-index with existing AvaWidget.

**Key implementation details:**
- Track scroll position with `useEffect` + `scroll` event listener
- Show CTA bar when scrolled past ~300px (below hero fold)
- Use `position: fixed; bottom: 0;` with `z-index: 40` (below AvaWidget at z-50)
- Three action buttons in a flex row
- Hide on desktop via `md:hidden`
- Account for safe area insets on iOS: `pb-[env(safe-area-inset-bottom)]`
- AvaWidget z-index is 50; sticky CTA should be 40 (below it)
- On mobile, when sticky CTA is visible, AvaWidget button should be shifted up to avoid overlap

**z-index coordination (current):**
- AvaWidget button: `z-50` (fixed bottom-6 right-6)
- AvaWidget chat modal: `z-50`
- Skip-to-content: `z-[100]`

**Sticky CTA should use:** `z-40`, positioned `bottom-0` (below AvaWidget at `bottom-6`)

**Conversion best practices:**
- CTA clicks increase ~55% with sticky CTAs
- Must not cover content or create accidental taps
- Should be dismissible or positioned to avoid accidental interaction
- Action-driven text: "Get Free Quote", phone icon with number

**Source:** [Mobile CTA optimization (Lite14)](https://lite14.net/blog/2025/03/06/how-to-optimize-mobile-cta-call-to-action-buttons/), [AB Tasty sticky CTA research](https://www.abtasty.com/blog/mobile-stick-to-scroll/)

**Confidence:** HIGH — standard mobile pattern.

### Pattern 5: SectionHeading Component (VIS-04)

**What:** Extract the repeated heading pattern from 8+ section components into a reusable component.

**Current pattern (found in every section):**
```typescript
<motion.h2
  initial={{ opacity: 0, y: 20 }}
  animate={isInView ? { opacity: 1, y: 0 } : {}}
  transition={{ duration: 0.6 }}
  className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[color] mb-4"
>
  Title Text
</motion.h2>
<motion.p
  initial={{ opacity: 0, y: 20 }}
  animate={isInView ? { opacity: 1, y: 0 } : {}}
  transition={{ duration: 0.6, delay: 0.1 }}
  className="text-lg text-[color] max-w-2xl mx-auto"
>
  Subtitle text
</motion.p>
```

This pattern appears in: BentoGrid, Stats, ProcessTimeline, Testimonials, Certifications, CTA, Projects (x2), FAQ, About, Services, ServiceAreas, Contact, TestimonialsPage.

**Proposed API:**
```typescript
interface SectionHeadingProps {
  title: string
  subtitle?: string
  align?: 'center' | 'left'
  as?: 'h1' | 'h2' | 'h3'      // default: 'h2'
  theme?: 'dark' | 'light'      // dark = white text, light = navy text
  animated?: boolean             // default: true
  isInView?: boolean             // for scroll-triggered animation
}
```

**Confidence:** HIGH — straightforward refactor from existing repeated code.

### Pattern 6: Skeleton Loading States (VIS-05)

**What:** Image placeholder skeletons using Tailwind's `animate-pulse` class.

**Key implementation details:**
- Per user decision: skeletons for images ONLY (text renders instantly from bundled config)
- Use as `<Suspense fallback={<PageSkeleton />}>` for lazy-loaded pages
- Match approximate layout dimensions to prevent CLS
- Tailwind shimmer: `bg-slate-200 animate-pulse rounded-xl`

**Example:**
```typescript
function Skeleton({ className }: { className?: string }) {
  return <div className={`bg-slate-200 animate-pulse rounded-xl ${className ?? ''}`} />
}

function PageSkeleton() {
  return (
    <div className="min-h-[60vh]">
      {/* Hero skeleton */}
      <Skeleton className="h-[400px] w-full rounded-none" />
      {/* Content skeleton */}
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-2/3" />
        <div className="grid grid-cols-3 gap-6 mt-8">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    </div>
  )
}
```

**Confidence:** HIGH — standard Tailwind pattern.

### Pattern 7: AnimatedTestimonials (User-Requested Enhancement)

**What:** Replace the current grid-based Testimonials section with an Aceternity-inspired stacked card testimonial component. Features: stacked image cards with rotation, word-by-word blur reveal for quotes, prev/next navigation.

**Key adaptations from Aceternity reference:**
1. **No Next.js `Image` component** — use standard `<img>` with `loading="lazy"`, `width`/`height`
2. **No `@tabler/icons-react`** — use existing `lucide-react` (ChevronLeft, ChevronRight)
3. **Images are job photos (houses, roofs, siding)** — NOT customer headshots
4. **Integrate with existing `testimonials` config** — use `testimonials.featured` array
5. **Uses `m` component** (LazyMotion) not `motion` for bundle optimization
6. **Autoplay** with pause-on-hover, configurable interval

**Component structure:**
```typescript
interface AnimatedTestimonialsProps {
  testimonials: Array<{
    name: string
    location: string
    quote: string
    image: string     // Job photo, not headshot
    service?: string
  }>
  autoplay?: boolean
}
```

**Animation details from Aceternity reference:**
- **Stacked cards:** 3-4 images stacked with slight rotation (`rotate: [-3deg, 0deg, 3deg]`) and scale (`scale: [0.95, 1, 0.95]`)
- **Active image:** Front and center, no rotation
- **Inactive images:** Behind with rotation and reduced scale
- **Quote reveal:** Word-by-word with blur-to-clear animation (`filter: blur(10px) -> blur(0)`)
- **Transition:** Framer Motion `AnimatePresence` for smooth crossfade between testimonials
- **Navigation:** Prev/next buttons, optional autoplay with 5s interval

**Source:** [Aceternity UI AnimatedTestimonials](https://ui.aceternity.com/components/animated-testimonials), [Aceternity React adaptations](https://github.com/AshutoshRajGupta/Aceternity-UI-React)

**Confidence:** MEDIUM — reference component studied but full source code not extracted (Aceternity pages don't render well for scraping). Implementation will be custom-built inspired by the reference, not a direct port.

### Pattern 8: Image Optimization Pipeline (PERF-01)

**What:** Add build-time image compression via vite-plugin-image-optimizer.

**Configuration:**
```typescript
// vite.config.ts
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    ViteImageOptimizer({
      png: { quality: 80 },
      jpeg: { quality: 80 },
      webp: { lossless: false, quality: 80 },
      avif: { lossless: false, quality: 65 },
      // includePublic defaults to true — processes images/ via public dir
    }),
  ],
})
```

**Image element best practices:**
```html
<!-- Above fold (hero) — eager load -->
<img
  src="/images/hero-roofing.webp"
  alt="..."
  width="1920"
  height="1080"
  fetchPriority="high"
/>

<!-- Below fold — lazy load -->
<img
  src="/images/project-1.webp"
  alt="..."
  width="800"
  height="600"
  loading="lazy"
  decoding="async"
/>
```

**Current state:** Images directory is ~50MB with 100 files. Many images exist in both .jpg and .webp formats. No images have explicit `width`/`height` attributes in JSX.

**Note on project image architecture:** Images are in an `images/` directory and copied to `dist/images` via the build script (`cp -r images dist/images`). They are NOT in `public/`. The vite config has `copyPublicDir: false`. This means `vite-plugin-image-optimizer` with `includePublic: true` will NOT process these images unless the build pipeline is adjusted. The plugin processes assets in Vite's public directory AND assets referenced in source code. Since images are referenced as `/images/...` paths and copied manually, the optimizer may need the images to go through Vite's asset pipeline or `includePublic` with a proper public dir setup.

**IMPORTANT:** This is a potential integration issue. The optimizer may need to process the `images/` directory separately, or the build pipeline needs restructuring so images flow through Vite's normal asset handling.

**Source:** [vite-plugin-image-optimizer README](https://github.com/FatehAK/vite-plugin-image-optimizer/blob/main/README.md), [npm: vite-plugin-image-optimizer](https://www.npmjs.com/package/vite-plugin-image-optimizer)

**Confidence:** MEDIUM for plugin integration — the project's non-standard image pipeline (manual `cp -r`) may complicate optimizer integration. The plugin itself is well-documented, but Vite 7 compatibility is not explicitly confirmed (plugin requires Vite >=3, latest published 4 months ago).

### Anti-Patterns to Avoid
- **Animating above-fold content:** Never add opacity/transform animations to hero text or CTA. It delays LCP and hurts perceived performance.
- **Using `motion` instead of `m` after LazyMotion migration:** If `<LazyMotion strict>` is set, using `motion.div` anywhere will throw an error. Use `m.div` exclusively.
- **Using `layout` prop with `domAnimation`:** Layout animations require `domMax`. Either switch to `domMax` globally (+10KB more than `domAnimation`) or refactor to avoid `layout` prop.
- **Skeleton components for text content:** Per user decision, text renders instantly from bundled config. Only images need skeleton placeholders.
- **z-index conflicts with AvaWidget:** The AvaWidget uses `z-50`. New sticky elements must coordinate z-index (use `z-40` for sticky CTA).
- **Missing width/height on images:** Every `<img>` must have explicit `width` and `height` to prevent CLS (Cumulative Layout Shift).

---

## Critical Technical Decision: domAnimation vs domMax

### The Problem
The Projects page (`src/pages/Projects.tsx`) uses `layout` prop on `motion.div` for filter animation transitions (lines 50, 55). Layout animations are only available in `domMax`, not `domAnimation`.

### Feature Package Comparison
| Feature | domAnimation (+15KB) | domMax (+25KB) |
|---------|---------------------|----------------|
| Animations | Yes | Yes |
| Variants | Yes | Yes |
| Exit animations | Yes | Yes |
| InView detection | Yes | Yes |
| Tap/hover/focus | Yes | Yes |
| Pan/drag gestures | No | Yes |
| Layout animations | **No** | **Yes** |

### Recommended Approach: Use domAnimation + Refactor Projects Page
Remove the `layout` prop from the Projects page. Instead of layout animations for filter transitions, use:
- `AnimatePresence mode="popLayout"` (already used) for exit/enter animations
- CSS `transition` for any remaining smooth movements

This saves ~10KB gzipped compared to using `domMax` and is the approach recommended by the phase description.

### Alternative: If layout animations are deemed essential
Use `domMax` globally. The bundle savings vs. current `motion` import will be ~5-10KB instead of ~15KB, but layout animations will work everywhere.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Image compression | Custom Sharp script | vite-plugin-image-optimizer | Integrates with Vite build, handles all formats, automatic size comparison |
| Reduced motion detection | Custom `matchMedia` hook | `MotionConfig reducedMotion="user"` | Framer Motion handles it at framework level, disables transform/layout animations automatically |
| Touch/mouse unified input | Separate touch + mouse handlers | Pointer Events API | One handler covers all input types, `setPointerCapture` handles drag-out-of-element |
| Image lazy loading | Intersection Observer + state | Native `loading="lazy"` + `decoding="async"` | Browser-native, zero JS, excellent support |
| Shimmer animation | Custom CSS keyframes | Tailwind `animate-pulse` | Built-in, zero config, matches design system |

**Key insight:** This phase is primarily about combining existing tools (Framer Motion features, Tailwind utilities, native browser APIs) rather than building novel solutions. The complexity is in the integration, not the individual pieces.

---

## Common Pitfalls

### Pitfall 1: LazyMotion Strict Mode Errors
**What goes wrong:** After wrapping the app in `<LazyMotion strict>`, any component still using `motion.div` (instead of `m.div`) will throw a runtime error.
**Why it happens:** Incremental migration — developer updates some files but misses others.
**How to avoid:** Use find-and-replace across the entire `src/` directory. Search for `import { motion` and `import { motion,` patterns. The `strict` prop catches any misses at runtime.
**Warning signs:** Console errors mentioning `motion` component inside `LazyMotion strict`.

### Pitfall 2: AnimatePresence Without Exit Prop
**What goes wrong:** Components wrapped in `AnimatePresence` don't animate out because they lack an `exit` prop.
**Why it happens:** `m` component (like `motion`) needs explicit `exit` prop for exit animations.
**How to avoid:** Every `m` component that is a direct child of `AnimatePresence` must have an `exit` prop.
**Warning signs:** Elements disappear instantly instead of animating out.

### Pitfall 3: Layout Prop with domAnimation
**What goes wrong:** Layout animations silently don't work — elements just snap to position.
**Why it happens:** `domAnimation` doesn't include the layout feature. No error is thrown.
**How to avoid:** Remove all `layout` props when using `domAnimation`, or switch to `domMax`.
**Warning signs:** Filter transitions in Projects page stop animating smoothly.

### Pitfall 4: Missing Pointer Capture in Slider
**What goes wrong:** Dragging the before/after slider stops working if the pointer leaves the slider element.
**Why it happens:** PointerMove events stop firing when the pointer leaves the target element.
**How to avoid:** Call `setPointerCapture(e.pointerId)` on pointer down.
**Warning signs:** Slider handle gets "stuck" if user drags quickly past the edge.

### Pitfall 5: Sticky CTA Overlapping AvaWidget on Mobile
**What goes wrong:** The sticky CTA bar covers the Ava chat button, making chat inaccessible.
**Why it happens:** Both use `position: fixed` at the bottom of the screen.
**How to avoid:** Give the CTA bar `z-40` (below AvaWidget at `z-50`). When the CTA bar is visible on mobile, adjust AvaWidget button position upward by the CTA bar height (~64px). Or, integrate the Ava icon directly into the sticky CTA bar on mobile (the user decision suggests this: "Phone + Quote button + Ava chat icon").
**Warning signs:** Ava button hidden behind CTA bar.

### Pitfall 6: Image Optimizer Not Processing Project Images
**What goes wrong:** Build completes but images in `dist/images/` are not optimized.
**Why it happens:** The project uses a manual `cp -r images dist/images` build step, bypassing Vite's asset pipeline. `vite-plugin-image-optimizer` only processes assets that go through Vite.
**How to avoid:** Either (a) move images into `public/` and use Vite's standard public dir handling, or (b) create a junction/symlink from `public/images` to `images/`, or (c) run image optimization as a separate build step. The project already has a `public/` dir with a junction — verify this works with the optimizer.
**Warning signs:** No optimization stats logged during build, image file sizes unchanged.

### Pitfall 7: CLS from Images Without Dimensions
**What goes wrong:** Page layout shifts as images load, damaging CLS Core Web Vital score.
**Why it happens:** Without explicit `width`/`height`, the browser can't reserve space for images before they load.
**How to avoid:** Add `width` and `height` attributes to every `<img>` tag. For responsive images, the aspect ratio is what matters — the browser calculates the layout box from the ratio.
**Warning signs:** Lighthouse flags CLS issues, visible layout jumping during page load.

---

## Code Examples

### Complete LazyMotion Migration for main.tsx
```typescript
// Source: Verified against framer-motion v12 exports
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { LazyMotion, domAnimation, MotionConfig } from 'framer-motion'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <LazyMotion features={domAnimation} strict>
        <MotionConfig reducedMotion="user">
          <App />
        </MotionConfig>
      </LazyMotion>
    </BrowserRouter>
  </StrictMode>,
)
```

### Component Migration Pattern (e.g., CTA.tsx)
```typescript
// BEFORE:
import { motion } from 'framer-motion'

// AFTER:
import { m } from 'framer-motion'
// Then replace all motion.xxx with m.xxx:
// motion.h2 → m.h2
// motion.p → m.p
// motion.div → m.div
```

### Import Changes Needed Per File

Files requiring `motion` → `m` migration (19 files total):
1. `src/components/sections/Hero.tsx` — motion (ALSO remove hero content animation)
2. `src/components/sections/BentoGrid.tsx` — motion
3. `src/components/sections/CTA.tsx` — motion
4. `src/components/sections/Certifications.tsx` — motion
5. `src/components/sections/FAQ.tsx` — motion, AnimatePresence
6. `src/components/sections/ProcessTimeline.tsx` — motion, useScroll, useTransform, useInView
7. `src/components/sections/Stats.tsx` — motion
8. `src/components/sections/Testimonials.tsx` — motion (ALSO: replace with AnimatedTestimonials)
9. `src/components/ui/AvaWidget.tsx` — motion, AnimatePresence
10. `src/components/ui/Card.tsx` — motion
11. `src/pages/About.tsx` — motion
12. `src/pages/Ava.tsx` — motion
13. `src/pages/Contact.tsx` — motion
14. `src/pages/Projects.tsx` — motion, AnimatePresence (ALSO: remove layout prop)
15. `src/pages/ServiceAreas.tsx` — motion
16. `src/pages/ServicePage.tsx` — motion
17. `src/pages/Services.tsx` — motion
18. `src/pages/TestimonialsPage.tsx` — motion
19. `src/hooks/useScrollReveal.ts` — useInView (no change needed — hooks are standalone)

**Note:** `AnimatePresence`, `useScroll`, `useTransform`, `useInView` are standalone imports — they do NOT depend on the `motion` vs `m` component choice and do NOT need to change. Only `motion.xxx` → `m.xxx` for JSX elements.

### Skeleton with Shimmer
```typescript
// Source: Standard Tailwind pattern
interface SkeletonProps {
  className?: string
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`bg-slate-200 animate-pulse rounded-xl ${className}`}
      aria-hidden="true"
    />
  )
}
```

### vite-plugin-image-optimizer Config
```typescript
// Source: https://github.com/FatehAK/vite-plugin-image-optimizer
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    ViteImageOptimizer({
      png: { quality: 80 },
      jpeg: { quality: 80 },
      webp: { lossless: false, quality: 80 },
    }),
  ],
})
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `import { motion } from 'framer-motion'` (34KB) | `LazyMotion` + `m` component (4.6KB initial) | Framer Motion v4+ (2021) | ~30KB bundle reduction |
| `framer-motion` package name | `motion` package (rebranded) | November 2024 | Import path changes; `framer-motion` still works as legacy |
| Separate touch/mouse handlers | Pointer Events API | Widely supported since 2019 | Single handler for all input types |
| Custom IntersectionObserver | Native `loading="lazy"` | 2019-2020 (all browsers) | Zero-JS lazy loading |
| `will-change` on everything | Targeted use only | Chrome team guidance 2023+ | Overuse wastes GPU memory |

**Deprecated/outdated:**
- **`useViewportScroll`**: Replaced by `useScroll` in Framer Motion v6+
- **`framer-motion` package**: Being replaced by `motion` package, but `framer-motion` v12 still fully functional
- **`onPan` gesture in domAnimation**: Requires `domMax` — use Pointer Events for slider instead

---

## Open Questions

1. **vite-plugin-image-optimizer + manual image copy pipeline**
   - What we know: Project uses `cp -r images dist/images` in build script, not Vite's standard public dir. Plugin requires Vite's asset pipeline.
   - What's unclear: Whether `public/` junction already resolves this, or if build pipeline restructuring is needed.
   - Recommendation: Test during implementation. If plugin doesn't process the images, move them into `public/images/` properly or run sharp optimization as a separate npm script.

2. **Aceternity AnimatedTestimonials exact animation parameters**
   - What we know: Stacked cards with rotation, word-by-word blur reveal, prev/next navigation.
   - What's unclear: Exact rotation angles, scale values, timing functions, blur reveal implementation details (Aceternity pages are JS-rendered and don't scrape well).
   - Recommendation: Build inspired by reference with premium feel. Iterate on exact parameters during implementation. The concept is well-understood; the tuning is implementation-time work.

3. **StickyMobileCTA + AvaWidget interaction on mobile**
   - What we know: User wants three actions (phone, quote, Ava). AvaWidget is currently a floating button at bottom-right.
   - What's unclear: Whether Ava button should be embedded IN the sticky CTA bar (replacing the standalone floating button on mobile) or remain separate.
   - Recommendation: Embed Ava icon in the sticky CTA bar on mobile (it was specified as one of three buttons). Hide the standalone AvaWidget floating button when sticky CTA is visible. On desktop, AvaWidget remains as-is.

---

## Sources

### Primary (HIGH confidence)
- framer-motion v12 node_modules — directly verified exports: `LazyMotion`, `domAnimation`, `domMax`, `m`, `MotionConfig`, `AnimatePresence` (all confirmed available from `'framer-motion'` import)
- [Motion docs — Reduce bundle size](https://motion.dev/docs/react-reduce-bundle-size) — LazyMotion, m component, domAnimation vs domMax
- [Motion docs — LazyMotion](https://motion.dev/docs/react-lazy-motion) — API, strict mode, feature packages
- [Motion docs — MotionConfig](https://motion.dev/docs/react-motion-config) — reducedMotion prop
- [Motion docs — Accessibility](https://motion.dev/docs/react-accessibility) — reducedMotion="user" behavior
- [vite-plugin-image-optimizer README](https://github.com/FatehAK/vite-plugin-image-optimizer/blob/main/README.md) — configuration, defaults, requirements

### Secondary (MEDIUM confidence)
- [Aceternity UI AnimatedTestimonials](https://ui.aceternity.com/components/animated-testimonials) — reference component, props, concept
- [Building an Accessible Before/After Slider in React (jsdev.space)](https://jsdev.space/react-before-after-slider/) — Pointer Events, ARIA, keyboard a11y
- [Mobile CTA Best Practices (Lite14)](https://lite14.net/blog/2025/03/06/how-to-optimize-mobile-cta-call-to-action-buttons/) — conversion data, sizing
- [AB Tasty Sticky CTA Research](https://www.abtasty.com/blog/mobile-stick-to-scroll/) — 55% click increase data
- [Motion upgrade guide](https://motion.dev/docs/react-upgrade-guide) — framer-motion to motion migration

### Tertiary (LOW confidence)
- Aceternity AnimatedTestimonials implementation details — could not extract full source code; animation parameters are approximate

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries verified via direct import checks and official docs
- Architecture (LazyMotion migration): HIGH — import paths and feature packages verified against installed framer-motion v12
- Architecture (AnimatedTestimonials): MEDIUM — concept clear, exact implementation details need creative work during implementation
- Architecture (Image optimizer integration): MEDIUM — plugin well-documented but project's non-standard image pipeline may need adjustment
- Pitfalls: HIGH — based on direct codebase analysis and known patterns

**Research date:** 2026-02-22
**Valid until:** 2026-03-22 (30 days — stable domain, no rapidly changing APIs)
