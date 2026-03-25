# Phase 14: Performance Validation & Optimization - Research

**Researched:** 2026-03-03
**Domain:** Lighthouse CLI measurement, hero image responsive delivery, Google Fonts async loading, JS bundle analysis, Core Web Vitals
**Confidence:** HIGH

## Summary

Phase 13 completed a full migration from SPA mode to React Router 7 framework mode with static pre-rendering. All 56 routes now produce real HTML at build time. This single architectural change is the dominant performance driver — the Phase 10 baseline (Desktop 87, Mobile 51) was caused almost entirely by client-side rendering with a blank initial HTML shell. Pre-rendering eliminates that root cause.

After Phase 13, the largest remaining performance bottleneck is the hero image. The hero `<img>` tag serves a 381KB WebP to every device at 1920x1280 resolution. A mobile viewport only needs a 768px-wide image (71KB), representing an 81% savings. No `srcset` exists on the hero element. This is the single highest-impact optimization and should be addressed first. The second issue is Google Fonts loading: the stylesheet `<link rel="stylesheet">` is render-blocking and delays FCP. Fixing it to async with `<link rel="preload" ... onload>` is a low-risk change that eliminates a render-blocking resource.

There is also a duplicate `<link rel="preload" as="image">` for the hero image in the rendered HTML — once from React Router's `Links` component processing root.tsx, and once from the explicit preload in root.tsx itself. This is a minor cleanup with no Lighthouse impact but keeps the HTML clean.

**Primary recommendation:** Establish baseline measurements first (3-run median, desktop and desktop for all page templates), then apply optimizations in priority order: (1) responsive hero srcset, (2) async Google Fonts loading, (3) verify JS bundle TBT is acceptable post-pre-rendering. Aim 95+ desktop and 90+ mobile on homepage and service pages.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Measurement approach:**
- Run Lighthouse CLI against local build/preview output for fast iteration
- Establish baseline measurements for all target pages before any optimization work
- Take median of 3 runs per page to smooth score variance
- Record scores and key metrics in planning/verification docs (no raw JSON reports in repo)

**Optimization priorities:**
- Use modern image formats (WebP/AVIF with fallbacks) for maximum compression
- Inline critical above-the-fold CSS, defer non-critical stylesheets
- Use font-display: swap with preloaded critical fonts (minor FOUT acceptable, no FOIT)
- Code-split JS, defer non-critical scripts, lazy-load below-fold components

**Target thresholds:**
- Floor: 90+ Performance score on all measured pages
- Aim for 95+ where achievable without diminishing returns (margin for regressions)
- Same targets for desktop and mobile — no lower mobile threshold
- LCP: under 2.5s desktop, under 4s mobile (matches Core Web Vitals "good")
- CLS: under 0.1
- If a page can't reach 90+ without significant architectural changes, document the blocker and defer to a follow-up task

**Page coverage:**
- Measure all pre-rendered routes (homepage, all service pages, contact, about, etc.)
- Group pages by template — optimize the template once, verify a sample per group
- Equal weight for mobile and desktop optimization
- Include 404/error pages in optimization scope

### Claude's Discretion
- Specific Lighthouse CLI flags and configuration
- Order of optimization passes (which issues to fix first)
- Whether to use a build-time critical CSS extraction tool or manual approach
- Image format selection per image (WebP vs AVIF based on content type)

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| PERF-05 | Lighthouse Performance 90+ on desktop and mobile. LCP under 2.5s desktop / 4s mobile. CLS under 0.1. No render-blocking resources. Above-the-fold content visible in initial HTML. | Pre-rendering from Phase 13 addresses the core architectural blocker. Remaining fixes: hero responsive srcset (biggest LCP win on mobile), async Google Fonts (render-blocking resource elimination), baseline measurement before optimizing. |
</phase_requirements>

---

## Standard Stack

### Core (Already Installed — No New Dependencies)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `sharp` | `^0.34.5` | Image resizing for responsive srcset generation | Already in devDependencies; used by copyAndOptimizeImages Vite plugin. Supports resizing, WebP, AVIF output. |
| `lighthouse` | CLI via `npx` | Performance measurement | Official Google tool, no install required. `npx lighthouse@latest` fetches on demand. |

### Supporting (No New Installs Needed)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `vite-plugin-image-optimizer` | `^2.0.3` | Optimize pipeline-imported images | Already installed. For images imported through JS/CSS bundle. |
| `@vercel/speed-insights` | `^1.3.1` | Real-user metrics tracking | Already installed. Wire to entry.client.tsx for production monitoring. |

### Not Recommended for This Phase

| Tool | Why Skip |
|------|----------|
| `critters` (critical CSS inliner) | Complex integration with React Router 7 framework mode and Tailwind v4. The CSS (78KB uncompressed) would benefit theoretically, but Tailwind v4's build system generates a single optimized CSS file and critters' ability to extract truly critical CSS from pre-rendered HTML without breaking hydration is not well-established for this stack. Risk outweighs reward given baseline is already pre-rendered. Defer unless post-optimization scores still fall short. |
| `vite-plugin-compression` | Vercel's Edge Network applies gzip and Brotli automatically. Adding build-time compression generates files that Vercel ignores and inflates build size. |

**Installation:**
```bash
# No new installs needed. All required tools are present.
```

---

## Architecture Patterns

### Baseline Measurement Workflow

```
1. npm run build                     # Fresh build in build/client/
2. npm run preview &                 # Start preview server (port 4173)
3. npx lighthouse http://localhost:4173 --output json --output-path /dev/null --quiet [flags]
4. Repeat 3x, take median score
5. Record scores in planning doc
```

**Note on `vite preview` and React Router:** `npm run preview` runs `vite preview`. The React Router Vite plugin sets `build.outDir` to `build/client` for the client build; `vite preview` reads this and serves from `build/client` correctly. No additional flags needed.

**Windows note:** `npx lighthouse` requires Chrome/Chromium to be installed. The `--chrome-flags` flag allows pointing to a specific Chrome binary. On Windows, the standard path is `"C:\Program Files\Google\Chrome\Application\chrome.exe"`.

### Lighthouse CLI Commands

**Desktop (no CPU throttling simulation):**
```bash
npx lighthouse http://localhost:4173 --preset=desktop --output json --output-path ./lh-desktop.json --quiet --chrome-flags="--headless=new"
```

**Mobile (default — Moto G Power, 4x CPU slowdown, slow 4G):**
```bash
npx lighthouse http://localhost:4173 --output json --output-path ./lh-mobile.json --quiet --chrome-flags="--headless=new"
```

**Batch run for median (3 runs per page):**
Run each command 3 times, take the middle Performance score. Key metrics: `performance`, `lcp`, `tbt`, `fcp`, `cls`.

**Extract key scores from JSON:**
```bash
node -e "const r=require('./lh-desktop.json'); const cats=r.categories; const audits=r.audits; console.log('Perf:', cats.performance.score*100, 'LCP:', audits['largest-contentful-paint'].numericValue/1000, 'TBT:', audits['total-blocking-time'].numericValue, 'CLS:', audits['cumulative-layout-shift'].numericValue)"
```

### Responsive Hero Image Pattern

**What:** Add `srcset` and `sizes` to the hero `<img>` tag. Generate multiple image sizes at build time using the existing sharp pipeline.

**Current state:** Hero is `1920x1280` WebP at 381KB. Mobile gets full 1920px image — needs only 768px (71KB). Savings: 81% on mobile.

**AVIF vs WebP for hero:** AVIF saves ~7% over WebP at comparable quality. AVIF has near-universal browser support in 2026 (Chrome, Firefox, Safari 16+). However the current pipeline uses WebP. Recommendation: add AVIF generation for the hero image as the primary format, WebP as fallback using `<picture>`. For simpler implementation: add `srcset` to existing WebP images (no format change needed for 90+ target).

**Simple srcset approach (WebP only, recommended first):**
```tsx
// In src/components/sections/Hero.tsx
<img
  src={backgroundImage}
  srcSet={`
    ${backgroundImage.replace('.webp', '-768w.webp')} 768w,
    ${backgroundImage.replace('.webp', '-1280w.webp')} 1280w,
    ${backgroundImage} 1920w
  `}
  sizes="100vw"
  alt=""
  role="presentation"
  fetchPriority="high"
  width={1920}
  height={1080}
  className="absolute inset-0 w-full h-full object-cover"
/>
```

**Build pipeline addition to `vite.config.ts` `copyAndOptimizeImages`:**
```typescript
// Inside the image processing loop, after writing optimized full-size:
if (relPath === 'hero-roofing.webp' || file.includes('hero')) {
  // Generate 768w variant
  const w768 = await sharp(srcBuffer).resize(768).webp({ quality: 80 }).toBuffer()
  await fs.writeFile(path.join(destDir, relPath.replace('.webp', '-768w.webp')), w768)
  // Generate 1280w variant
  const w1280 = await sharp(srcBuffer).resize(1280).webp({ quality: 80 }).toBuffer()
  await fs.writeFile(path.join(destDir, relPath.replace('.webp', '-1280w.webp')), w1280)
}
```

**Alternative: AVIF + WebP `<picture>` approach (higher impact, more complexity):**
```tsx
<picture>
  <source
    srcSet="/images/hero-roofing-768w.avif 768w, /images/hero-roofing-1280w.avif 1280w, /images/hero-roofing.avif 1920w"
    sizes="100vw"
    type="image/avif"
  />
  <source
    srcSet="/images/hero-roofing-768w.webp 768w, /images/hero-roofing-1280w.webp 1280w, /images/hero-roofing.webp 1920w"
    sizes="100vw"
    type="image/webp"
  />
  <img
    src="/images/hero-roofing.webp"
    alt=""
    role="presentation"
    fetchPriority="high"
    width={1920}
    height={1080}
    className="absolute inset-0 w-full h-full object-cover"
  />
</picture>
```

**Decision on AVIF vs WebP first:** Given the user's discretion on format selection, recommend WebP-only srcset first (simpler, less build complexity), then measure. If mobile still short of 90, add AVIF. AVIF saves only 7% over WebP at full size; the size gain comes from responsive sizing, not format.

### Async Google Fonts Pattern

**What:** Replace render-blocking `<link rel="stylesheet">` with async preload + onload pattern.

**Current state:** `<link href="...googleapis.com/css2?..." rel="stylesheet"/>` is in `<head>` and is render-blocking. The URL already includes `display=swap` which prevents FOIT, but the blocking is the issue.

**Fix in `src/root.tsx`:**
```tsx
{/* Async Google Fonts loading — eliminates render-blocking resource */}
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
<link
  rel="preload"
  as="style"
  href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap"
  onLoad={(e) => { (e.currentTarget as HTMLLinkElement).rel = 'stylesheet'; }}
/>
<noscript>
  <link
    rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap"
  />
</noscript>
```

**Note on FOUT:** The user decision accepts minor FOUT (font flash of unstyled text). `display=swap` in the URL handles this at the Google Fonts CSS level. Async loading means text renders in the system fallback font until the webfont loads — this is acceptable.

**TypeScript compatibility:** React's `onLoad` event handler on `<link>` elements may require a type cast. The pattern `(e.currentTarget as HTMLLinkElement).rel = 'stylesheet'` is correct.

### Hero Preload Deduplication

**Current state:** The rendered HTML has two `<link rel="preload" as="image" href="/images/hero-roofing.webp">` entries. One comes from root.tsx's explicit preload. Another appears to come from React Router's `Links` rendering — this may be a React Router behavior when a `<link rel="preload">` is in the head and also detected from `Links`.

**Fix:** Investigate if the duplication is from React Router injecting a second preload. If so, the explicit preload in root.tsx may conflict. Check by removing the explicit `<link rel="preload">` from root.tsx — React Router's `Links` component may already handle it.

**Note:** The preload should reference the 1x/largest image OR the new srcset preload pattern:
```html
<link rel="preload" as="image" href="/images/hero-roofing.webp"
  imagesrcset="/images/hero-roofing-768w.webp 768w, /images/hero-roofing-1280w.webp 1280w, /images/hero-roofing.webp 1920w"
  imagesizes="100vw" />
```

### Page Template Groups (for Measurement)

Based on pre-rendered routes in `build/client/`:

| Template Group | Example URL | Why Measure |
|----------------|-------------|-------------|
| Homepage | `/` | Highest traffic, most sections, hero LCP |
| Service page | `/roofing` | Service pages all share `service-page.tsx` route module |
| Static page | `/about`, `/contact` | Simpler, should score highest |
| City page | `/service-areas/anytown` | Dynamic template, unique city content |
| Blog post | `/resources/best-roofing-materials-harsh-winters` | react-markdown, largest HTML |
| Portfolio | `/portfolio/[slug]` | Before/after slider, image-heavy |
| Error | `/404` (via `$.tsx`) | Lightweight, should score 100 |

**Optimization strategy:** Fix the template, re-verify a sample from each group. Not every route needs individual measurement.

### JS Bundle Assessment (TBT)

**Current bundle profile (home page critical path, uncompressed):**
- `entry.client-CP7BlUFu.js`: 186KB — React + ReactDOM + hydration runtime
- `chunk-LFPYN7LY-J63Ylv69.js`: 123KB — React Router runtime
- `root-FdVJ6mSh.js`: 35KB — app root + framer-motion bootstrap
- `is-svg-component-f43dqbgZ.js`: 32KB — framer-motion core animations
- `site-BBUDCKSD.js`: 31KB — all 20 city configs (eager loaded)
- Estimated gzip: ~149KB total

**TBT context:** With pre-rendering, LCP content is visible before any JS executes. TBT still occurs from hydration but it does not block the LCP metric. Lighthouse measures TBT as long tasks on the main thread, which hydration causes. However the mobile TBT that was 720ms in Phase 10 was partly due to the SPA needing to render ALL content before showing anything — pre-rendering eliminates that portion. Hydration-only TBT should be significantly lower.

**Expected post-Phase-13 TBT range:** 200-400ms mobile (estimate). Lighthouse's mobile TBT threshold for "good" is under 200ms. If TBT is still high after pre-rendering, investigate `schemas-BiSNXTVm.js` (65KB Zod schemas) — it is in modulepreloads for all pages but may not be in the critical import chain.

**Vite manualChunks:** Can be added to `vite.config.ts` to split vendors for better caching. However, this interacts with React Router's Vite plugin which manages its own chunk splitting. Manual chunks that work well are library-level separations:
```typescript
// In vite.config.ts defineConfig > build:
build: {
  rollupOptions: {
    output: {
      manualChunks(id) {
        if (id.includes('node_modules/framer-motion')) return 'framer-motion'
        if (id.includes('node_modules/react-dom')) return 'react-dom'
        if (id.includes('node_modules/zod')) return 'zod'
      }
    }
  }
}
```
**Warning:** `manualChunks` with React Router 7's `reactRouter()` Vite plugin has known issues (GitHub issue #12209, #17653). Some configurations break lazy loading. Only add manualChunks if TBT baseline measurements show it's needed and test thoroughly. Do NOT add this preemptively.

### Measurement Script Workflow

```bash
# Step 1: Build
npm run build

# Step 2: Start preview server (stays running)
npm run preview &
# Note: preview runs at port 4173 by default

# Step 3: Baseline measurement (3 runs desktop, 3 runs mobile per page)
# Desktop run (3x):
npx lighthouse http://localhost:4173 --preset=desktop --output json --chrome-flags="--headless=new --disable-dev-shm-usage" --quiet

# Mobile run (3x):
npx lighthouse http://localhost:4173 --output json --chrome-flags="--headless=new --disable-dev-shm-usage" --quiet

# Service page desktop (3x):
npx lighthouse http://localhost:4173/roofing --preset=desktop --output json --chrome-flags="--headless=new --disable-dev-shm-usage" --quiet

# Step 4: Record median scores in verification doc
```

**Important Lighthouse CLI notes:**
- `--disable-dev-shm-usage` is recommended on Windows to prevent memory issues
- The EPERM error from Phase 10 was a temp-dir cleanup issue on Windows, not a measurement error — results are valid despite the error
- Run from a separate terminal while preview server is running
- Kill background processes after measurement: `kill %1` or close terminal

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Image resizing for srcset | Custom Node.js resize script | `sharp` (already in devDependencies) | Already integrated into `copyAndOptimizeImages` Vite plugin. Add new size generation inside existing loop. |
| Lighthouse measurement | Custom curl-based timing | `npx lighthouse` CLI | Official tool with correct metric calculation (TBT requires tracing, not simple timing) |
| Font loading async | Custom JS font observer | `<link rel="preload" as="style" onLoad>` pattern | Zero-dependency browser API. Works without JS for `<noscript>` fallback. |
| Critical CSS extraction | Manual CSS splitting | Skip for this phase (see Pitfalls) | Critters + Tailwind v4 + React Router v7 = untested combination. Risk of breaking hydration. |

**Key insight:** The project already has most optimization infrastructure in place. Phase 14 work is primarily: measure existing state, apply targeted fixes (srcset, async fonts), and verify.

---

## Common Pitfalls

### Pitfall 1: Measuring Before Building

**What goes wrong:** Running Lighthouse against `npm run dev` server (port 5173) which serves unminified JS and unoptimized assets. Scores will be artificially low and not reflect production performance.
**Why it happens:** `npm run dev` starts the React Router dev server with source files; `npm run preview` serves the production `build/client/` output.
**How to avoid:** Always `npm run build` first, then `npm run preview`, then Lighthouse.
**Warning signs:** Dev server URL is `:5173`, preview is `:4173`. If you see `:5173` in the Lighthouse URL, you're measuring the wrong thing.

### Pitfall 2: Single-Run Lighthouse Variance

**What goes wrong:** A single Lighthouse run can vary ±5-10 Performance points on mobile due to CPU throttling simulation variance. Declaring 89 a failure or 91 a success based on one run is unreliable.
**Why it happens:** Lighthouse simulates CPU and network throttling. The simulation has natural variance. The LCP metric is particularly sensitive.
**How to avoid:** Take the median of 3 runs. Record min/max/median. The user decision already calls for this.
**Warning signs:** Two runs that differ by more than 8 points on the same build.

### Pitfall 3: Hero srcset Breaking LCP Preload

**What goes wrong:** Adding `srcset` to the hero `<img>` without updating the `<link rel="preload">` causes the preload to hint the wrong size. The browser preloads the 1920px image but displays the 768px version, wasting bandwidth and causing a LCP delay.
**Why it happens:** `<link rel="preload" as="image">` needs `imagesrcset` and `imagesizes` attributes to match the `<img>` srcset/sizes.
**How to avoid:** Update the preload in `root.tsx` simultaneously with the `<img>` srcset:
```html
<link rel="preload" as="image"
  href="/images/hero-roofing.webp"
  imagesrcset="/images/hero-roofing-768w.webp 768w, /images/hero-roofing-1280w.webp 1280w, /images/hero-roofing.webp 1920w"
  imagesizes="100vw" />
```
**Warning signs:** Lighthouse shows "Preloaded image not used" warning.

### Pitfall 4: Google Fonts onLoad in React JSX

**What goes wrong:** The `onLoad` pattern for async fonts uses `this.rel = 'stylesheet'` in vanilla HTML but React JSX needs the event object: `(e.currentTarget as HTMLLinkElement).rel = 'stylesheet'`.
**Why it happens:** React's synthetic events vs DOM event model.
**How to avoid:** Use the typed event handler pattern shown in the Architecture Patterns section.
**Warning signs:** TypeScript error on `<link onLoad>`.

### Pitfall 5: critters + Tailwind v4 Critical CSS

**What goes wrong:** critters extracts critical CSS by analyzing the pre-rendered HTML and inlining only used styles. With Tailwind v4, the CSS output is already purged (no unused utilities). critters may inline effectively all 78KB into the HTML, making the HTML file enormous and removing the browser's ability to cache the CSS separately.
**Why it happens:** critters is designed for traditional CSS files with many unused rules. Tailwind v4's output is already minimal.
**How to avoid:** Do not add critters unless post-optimization scores still fall short of 90 and Lighthouse specifically flags the CSS as a blocking resource with significant waste.
**Warning signs:** HTML file size exceeds 100KB after critters runs.

### Pitfall 6: manualChunks Breaking React Router Lazy Loading

**What goes wrong:** Adding `build.rollupOptions.output.manualChunks` in `vite.config.ts` can conflict with React Router's own code-splitting. Known issues: route chunks that become circular, or lazy imports that no longer split correctly.
**Why it happens:** React Router's Vite plugin generates its own chunk assignments; manualChunks overrides can conflict.
**How to avoid:** Only add manualChunks AFTER baseline measurement confirms TBT is the blocking issue. Test the build thoroughly for chunk loading errors. If added, use the function form (not object form) and limit to clearly separable vendors like `framer-motion` and `zod`.
**Warning signs:** Browser console shows "Failed to fetch dynamically imported module" errors.

### Pitfall 7: vite preview Port Conflicts

**What goes wrong:** `vite preview` fails if port 4173 is already in use. Background processes from previous runs stay alive.
**Why it happens:** `npm run preview &` runs in the background; killing the terminal doesn't kill the process on Windows.
**How to avoid:** Check for existing preview processes before starting: `tasklist | findstr node` or `lsof -i :4173`. Use `--port` flag to specify an alternate port if needed.

---

## Code Examples

### Hero Component with srcset

```tsx
// src/components/sections/Hero.tsx
// Add srcset helper function — call only when backgroundImage matches pattern
function buildSrcSet(src: string): string | undefined {
  if (!src.endsWith('.webp')) return undefined
  const base = src.replace('.webp', '')
  return `${base}-768w.webp 768w, ${base}-1280w.webp 1280w, ${src} 1920w`
}

// In the <img> element:
<img
  src={backgroundImage}
  srcSet={buildSrcSet(backgroundImage)}
  sizes="100vw"
  alt=""
  role="presentation"
  fetchPriority="high"
  width={1920}
  height={1080}
  className="absolute inset-0 w-full h-full object-cover"
/>
```

### root.tsx Async Font Loading

```tsx
// src/root.tsx — replace the Google Fonts stylesheet link

{/* Async Google Fonts — eliminates render-blocking resource */}
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
<link
  rel="preload"
  as="style"
  href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap"
  // eslint-disable-next-line react/no-unknown-property
  onLoad={(e: React.SyntheticEvent<HTMLLinkElement>) => {
    e.currentTarget.rel = 'stylesheet'
  }}
/>
<noscript>
  <link
    rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap"
  />
</noscript>
```

### Image Size Generation in vite.config.ts

```typescript
// Inside copyAndOptimizeImages plugin's closeBundle(), within the imageFiles.map loop:
// After writing the standard optimized image, generate responsive variants for hero images:
const heroPattern = /^hero-.*\.webp$/

if (heroPattern.test(path.basename(relPath))) {
  const w768Path = path.join(destDir, relPath.replace('.webp', '-768w.webp'))
  const w1280Path = path.join(destDir, relPath.replace('.webp', '-1280w.webp'))

  const w768 = await sharp(srcBuffer).resize(768).webp({ quality: 80 }).toBuffer()
  const w1280 = await sharp(srcBuffer).resize(1280).webp({ quality: 80 }).toBuffer()

  await fs.mkdir(path.dirname(w768Path), { recursive: true })
  await fs.writeFile(w768Path, w768)
  await fs.writeFile(w1280Path, w1280)

  results.push(`  ${relPath} [768w]: ${(w768.byteLength/1024).toFixed(0)}kB`)
  results.push(`  ${relPath} [1280w]: ${(w1280.byteLength/1024).toFixed(0)}kB`)
}
```

### Baseline Measurement Recording Template

```markdown
## Page: Homepage (/)
### Desktop (3 runs)
| Run | Perf | LCP | TBT | CLS |
|-----|------|-----|-----|-----|
| 1   | XX   | X.Xs | XXXms | 0.00X |
| 2   | XX   | X.Xs | XXXms | 0.00X |
| 3   | XX   | X.Xs | XXXms | 0.00X |
| **Median** | **XX** | **X.Xs** | **XXXms** | **0.00X** |

### Mobile (3 runs)
... same format
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| SPA with blank HTML shell | Pre-rendered HTML (Phase 13) | 2026-03-03 | Eliminates the dominant cause of Mobile 51 score |
| Single full-size hero image | Responsive srcset (Phase 14 target) | Phase 14 | 81% reduction in mobile hero image size |
| Render-blocking Google Fonts | Async preload + onload | Phase 14 target | Eliminates one render-blocking resource audit |
| No image `srcset` | Multi-resolution srcset | Phase 14 target | Proper image for each viewport |

**Deprecated/outdated:**
- `--emulated-form-factor` flag: Replaced by `--preset=desktop` in Lighthouse v9+. Use `--preset=desktop` for desktop testing.
- `splitVendorChunkPlugin` for Vite: Deprecated in Vite v5. `manualChunks` function form is the current approach.

---

## Open Questions

1. **Actual post-Phase-13 Lighthouse scores**
   - What we know: Phase 10 baseline was Desktop 87, Mobile 51 (SPA). Phase 13 adds pre-rendering.
   - What's unclear: Exact scores with pre-rendering. Expected: Desktop 90-95, Mobile 75-88 before Phase 14 optimizations.
   - Recommendation: Establish baseline in Plan 01 (Wave 1) before any code changes. This tells us which optimizations are actually needed.

2. **TBT after pre-rendering: is 90+ achievable on mobile?**
   - What we know: Mobile TBT was 720ms with SPA. Hydration JS is still ~310KB gzipped. Lighthouse mobile simulates 4x CPU slowdown.
   - What's unclear: How much of the 720ms TBT was SPA rendering vs hydration. Pre-rendering removes rendering TBT but not hydration TBT.
   - Recommendation: Measure first. If TBT is still >400ms on mobile post-pre-rendering, investigate whether `schemas-BiSNXTVm.js` (65KB Zod) is eagerly loaded on routes that don't need it.

3. **Hero preload duplication source**
   - What we know: The rendered HTML has two `<link rel="preload" as="image" href="/images/hero-roofing.webp">` entries.
   - What's unclear: Whether this is from React Router's Links component processing the explicit preload in root.tsx, or a react-router framework mode behavior.
   - Recommendation: Check during Wave 1. If it's double-preloading the same resource, remove one occurrence and update to include `imagesrcset` + `imagesizes`.

4. **Service page hero images: same srcset treatment?**
   - What we know: Service pages (roofing, siding, storm-damage) use the Hero component with different `backgroundImage` props (e.g., `/images/siding-hero.webp`).
   - What's unclear: Whether the build pipeline needs to generate responsive variants for ALL hero images or just the homepage hero.
   - Recommendation: Generate responsive variants for all images matching the pattern `*-hero.webp` in the build pipeline. The Hero component's `buildSrcSet` function will automatically pick up the variants.

---

## Validation Architecture

> `workflow.nyquist_validation` is not set in `.planning/config.json` — Validation Architecture section omitted.

---

## Sources

### Primary (HIGH confidence)

- Direct codebase analysis — `build/client/index.html`, `src/root.tsx`, `src/components/sections/Hero.tsx`, `vite.config.ts`, `react-router.config.ts`, `package.json`
- Phase 10 Lighthouse measurements (`10-LIGHTHOUSE.md`) — baseline scores Desktop 87, Mobile 51 confirmed
- Phase 13 verification (`13-VERIFICATION.md`) — 56 pre-rendered HTML files confirmed, real content
- Sharp image compression tests — verified: 1920px WebP=381KB, 768px WebP=71KB (81% savings), AVIF saves 7% over WebP at same size
- v1.1 REQUIREMENTS.md — PERF-05 acceptance criteria verified

### Secondary (MEDIUM confidence)

- WebSearch: "responsive images srcset picture element webp avif 2025 lighthouse LCP optimization" — confirmed current best practices, `<picture>` + `srcset` + `imagesrcset` on preload
- WebSearch: "Google Fonts render-blocking fix async loading" — confirmed preload + onload pattern
- WebSearch: "React Router 7 vite build.rollupOptions manualChunks 2025" — confirmed manualChunks compatibility issues with RR7, function form recommended

### Tertiary (LOW confidence — flag for validation)

- Estimated Lighthouse scores post-Phase-13: "Desktop 90-95, Mobile 75-88" — not yet measured. This is a prediction based on architectural change significance.
- TBT post-pre-rendering: "200-400ms mobile" — prediction based on Phase 10 data and pre-rendering impact analysis.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all tools verified installed or available via npx
- Architecture patterns: HIGH — srcset pattern, async fonts pattern verified against codebase
- Pitfalls: HIGH — most derived from direct codebase analysis (duplicate preload found, manualChunks known issue)
- Score estimates: LOW — need actual measurement to confirm

**Research date:** 2026-03-03
**Valid until:** 2026-04-03 (stable performance tooling, low drift)
