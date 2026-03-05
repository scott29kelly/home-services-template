# Project Research Summary

**Project:** Home Services Template — v1.2 Feature Expansion
**Domain:** Config-driven premium home services website template (roofing, siding, storm damage)
**Researched:** 2026-03-05
**Confidence:** HIGH

## Executive Summary

The v1.2 milestone adds four features to an existing, production-validated static pre-rendered React 19 + React Router 7 + Tailwind v4 template: a multi-step quote wizard, a project cost estimator, Google Maps embed on city pages, and photo upload within the wizard. The existing architecture is well-suited to all four additions. The core finding across all research is that these features require minimal new dependencies — only `react-dropzone` must be installed. Everything else builds on patterns already in the codebase: `react-hook-form` for multi-step wizard orchestration, `Intl.NumberFormat` for cost display, an iframe embed for Maps, and native `FormData` for file delivery. The template stays lean and config-driven by design.

The recommended implementation strategy is infrastructure-first: add `src/config/quote.ts` and extend `features.ts` and `company.ts` before touching any UI. This unblocks parallel build of atomic components (CostEstimator, GoogleMapEmbed, PhotoUpload) before the wizard orchestration layer is assembled. The wizard itself uses a `useReducer` orchestrator with one shared `useForm` instance at the root — not one `useForm` per step — and URL-based step encoding (`?step=N`) to preserve browser Back button behavior.

The three highest-stakes risks are all architectural decisions that must be made at the start of the wizard phase, not retrofitted later: (1) how wizard state is shared across steps (single `useForm` at root, not per-step instances), (2) how the browser Back button is handled (URL query params, not pure `useState`), and (3) how photos are submitted (direct multipart `FormData` to Formspree's endpoint, bypassing Vercel's 4.5 MB serverless body limit). Get these three right upfront and the rest of the implementation is low-risk additive work.

---

## Key Findings

### Recommended Stack

The existing stack (React 19, React Router 7, Vite 7, Tailwind v4, react-hook-form, Zod, Lucide) handles all four features without modification. The only required new package is `react-dropzone@15.0.0` for the photo upload drag-and-drop zone (~8 KB gzip, confirmed React 19 compatible). Google Maps uses the free Embed API iframe (zero bundle cost). The cost estimator and wizard extend existing RHF + Zod patterns with zero additional dependencies. Cloudinary and `@vis.gl/react-google-maps` are optional enhancements, not defaults.

See `STACK.md` for full version compatibility table, alternatives considered, and install instructions.

**Core technologies:**
- `react-hook-form@7.71.2` (existing): Multi-step wizard via single `useForm` root + `trigger(stepFields)` per-step validation — no new install
- `zod@4.3.6` (existing): Per-step schemas as subsets of the master `quoteSchema` — no new install
- `react-dropzone@15.0.0` (new): Drag-and-drop file input; hooks-only, no opinionated UI — `npm install react-dropzone`
- Google Maps Embed API (iframe, no package): Free, unlimited, zero JS bundle cost — API key in env var `VITE_GOOGLE_MAPS_KEY`
- `FormData` + `multipart/form-data` (browser native): Direct submission to Formspree endpoint bypasses Vercel body limit

**Rejected alternatives and why:**
- `rhf-wizard` / `react-multistep`: RHF natively supports wizard patterns; external libs add 5–15 KB unnecessarily
- `@vis.gl/react-google-maps` as default: Adds ~35 KB; iframe is zero-cost and sufficient for a "service area" city page use case
- `FilePond` / `Uppy`: 50–130 KB vs react-dropzone's 8 KB; FilePond CSS conflicts with Tailwind v4

### Expected Features

See `FEATURES.md` for full competitor analysis, prioritization matrix, and detailed expected behavior per feature.

**Must have (table stakes) — all four v1.2 features:**
- Multi-step quote wizard with progress indicator — users abandon forms without visible progress; industry data shows 20–30% lower abandonment with a step counter
- Per-step validation (not all-at-once) — errors for fields not yet reached break the UX; `trigger(stepFields)` is the RHF-native solution
- Back/forward navigation with state preserved — browser Back must not lose entered data
- Mobile-first touch inputs — 60%+ of home service searches are mobile
- Cost range output with disclaimer — "#1 homeowner question"; ranges without disclaimers create liability for template buyers
- Service area map on city pages — local trust signal; expected at premium tier
- Photo attachment in storm damage context — homeowners expect to attach damage photos

**Should have (competitive differentiators):**
- 4-step quote wizard (`/get-quote`) converting 86% better than single-page forms
- Wizard pre-fill from service page via `?service=` URL param — reduces friction, increases completion
- Cost estimator merged with financing calculator display — decision-support tool competitors rarely offer
- Client-side photo previews with thumbnail grid and per-file remove
- Feature flags for all three new features (`quoteWizard`, `googleMaps`, `costEstimator`)

**Defer to v1.x / v2+:**
- Standalone `/estimate` page (trigger: buyer demand; wizard integration is sufficient for v1.2)
- Wizard analytics events per step (trigger: buyer request for conversion tracking)
- Google Maps JS API with service area polygon (billing complexity, +342 KB JS, overkill for use case)
- Photo gallery from submissions (requires backend + auth — fundamentally different product)
- AI-powered cost estimation via property data API (disproportionate complexity)

**Anti-features (do not build):**
- Real-time live cost calculation — implies false precision; creates buyer liability
- Mandatory photo upload — increases abandonment; Step 3 must have an explicit "Skip" path
- ZIP code validation against service area list — stale config causes false rejections
- Saving wizard progress to localStorage — 4-step form takes under 2 minutes; save/resume is disproportionate

### Architecture Approach

See `ARCHITECTURE.md` for full component boundaries, data flow diagrams, build order, and anti-patterns.

All four features integrate into the existing config-first, static pre-rendered architecture without structural changes. The wizard lives at a new `/get-quote` route (auto-discovered by `getStaticPaths()`, no manual addition needed). State flows through a `useReducer` orchestrator at the `QuoteWizard` page level — not React Context. Each step renders fields via a single shared `useForm` instance passed via props. New config file `src/config/quote.ts` owns wizard copy, project types, photo constraints, and cost ranges. Maps config co-locates in `company.ts` alongside address data. All submissions preserve the existing `forms.ts` provider routing, with a new `submitQuote()` function added alongside (not replacing) the existing `submitForm()`.

**Major components (build order):**
1. `src/config/quote.ts` — wizard copy, project types, cost ranges, photo constraints (build first; unblocks everything)
2. `src/config/features.ts` additions — `quoteWizard`, `googleMaps`, `costEstimator` flags
3. `src/config/company.ts` addition — `googleMaps: { apiKey, defaultZoom, mapType }` (reads from env var)
4. `src/lib/schemas.ts` additions — `quoteSchema` master + per-step subset schemas
5. `src/components/ui/CostEstimator.tsx` — pure presentational; reads `quote.costRanges[service][projectType]`
6. `src/components/ui/GoogleMapEmbed.tsx` — conditional iframe; `loading="lazy"`, explicit dimensions, `referrerPolicy="no-referrer-when-downgrade"`
7. `src/components/forms/PhotoUpload.tsx` — controlled file input + preview grid using `URL.createObjectURL()`
8. `src/components/forms/QuoteWizard/` — six files: orchestrator (useReducer) + StepIndicator + Steps 1–4
9. `src/lib/form-handler.ts` — add `submitQuote()` using `FormData` multipart; do not modify `submitForm()`
10. `src/routes/get-quote.tsx` + `src/routes.ts` update — lazy-loaded route wrapper + single route line addition
11. Integration: `Contact.tsx` + `CityPage.tsx` — add `<GoogleMapEmbed>` conditional on feature flag

### Critical Pitfalls

See `PITFALLS.md` for all 10 pitfalls with full recovery strategies, UX pitfalls, and the "Looks Done But Isn't" checklist.

The five pitfalls that would require the most expensive retrofits if caught late:

1. **Wizard state lost on browser Back** — Using `useState` for step index means the browser Back button exits the wizard entirely. Use `useSearchParams` to encode step in URL (`?step=1`). Architecture decision — fix it at the start, not after the wizard is built.

2. **Single `useForm` per step loses data between steps** — Each step mounting its own `useForm()` means Steps 1–3 data is gone when Step 4 submits. Use one `useForm` at the wizard root, pass `register`/`control`/`trigger` down as props. ARCHITECTURE.md explicitly calls out the multi-`useForm` approach as Anti-Pattern 1.

3. **`formState.isValid` blocks all Next buttons** — When using a single shared `useForm` with the full schema, `isValid` is false until every required field across all steps is filled. Never gate step progression on `isValid`. Use `form.trigger(stepFields[currentStep])` instead.

4. **Photo upload hits Vercel 4.5 MB serverless limit** — The existing contact form routes through Vercel functions. The photo wizard must submit directly to `formspree.io/f/{id}` (bypassing Vercel), using `FormData` without a manually set `Content-Type` header (let the browser set the multipart boundary).

5. **Google Maps API key committed to source control** — The key must live in `VITE_GOOGLE_MAPS_KEY` env var, read via `import.meta.env`. HTTP referrer restriction AND API restriction (Maps Embed API only) must be set in Google Cloud Console before launch. Post-2025 risk: exposed Google API keys can escalate to Gemini/AI services on the same Cloud project (Truffle Security, March 2025).

Additional pitfalls to manage during implementation:
- EXIF GPS data transmitted with photos — canvas re-encode before upload strips metadata and reduces file size from ~10 MB to ~500 KB
- Maps iframe destroying Lighthouse scores — `loading="lazy"` + explicit dimensions required; test city page Lighthouse delta before/after
- Referrer policy breaking Maps in production — `referrerPolicy="no-referrer-when-downgrade"` on the iframe overrides page-level policy
- Tailwind dynamic class names purged in production — use lookup tables, never template literal class construction
- Cost estimator setting unrealistic price expectations — disclaimer must be un-hideable; default config values must be `0` or obviously placeholder

---

## Implications for Roadmap

Based on the research, the architecture's dependency graph maps cleanly to a 5-phase delivery. Each phase is additive and independently testable.

### Phase 1: Foundation and Config
**Rationale:** Config files and schema additions unblock all parallel UI work. Nothing else can be built until `quote.ts` exists and feature flags are in place. This phase has zero user-visible output but is the critical path gating everything downstream.
**Delivers:** `src/config/quote.ts`, feature flag additions to `features.ts`, `googleMaps` field in `company.ts`, `quoteSchema` + per-step schemas in `schemas.ts`, `submitQuote()` in `form-handler.ts`
**Addresses:** Multi-step wizard configuration, cost ranges, photo constraints, Maps API key env var pattern
**Avoids:** API key committed to source (Pitfall 2), single Zod schema gating Next buttons (Pitfall 6)

### Phase 2: Atomic UI Components
**Rationale:** These three components have no dependencies on each other or on the wizard orchestrator. They can be built and tested in isolation. Building them before the wizard means Step 2 and Step 3 of the wizard can import finished, tested components rather than placeholders.
**Delivers:** `CostEstimator.tsx` (pure display), `GoogleMapEmbed.tsx` (conditional iframe), `PhotoUpload.tsx` (controlled file input + preview)
**Uses:** `react-dropzone`, Maps Embed API iframe, `URL.createObjectURL()` for previews
**Avoids:** FileReader base64 pattern (Anti-Pattern 2 in ARCHITECTURE.md), naive iframe without lazy loading (Pitfall 3), EXIF GPS data in uploads (Pitfall 8)

### Phase 3: Quote Wizard — Core Flow (Steps 1, 2, 4 + Orchestrator)
**Rationale:** Build the wizard skeleton with service selection, property details, and contact/submit steps before adding the optional photo step. This validates the end-to-end data flow (accumulation via `useReducer`, single `useForm` root, `trigger()` per step, `submitQuote()` multipart) without the complexity of file handling.
**Delivers:** `QuoteWizard/index.tsx` (useReducer orchestrator), `StepIndicator.tsx`, `Step1Service.tsx`, `Step2Details.tsx` (with CostEstimator embedded), `Step4Contact.tsx`, `/get-quote` route + navigation wiring
**Implements:** Single `useForm` at root (not per-step), URL-based step encoding (`?step=N`), `trigger(stepFields)` per-step validation
**Avoids:** Browser Back losing state (Pitfall 1), multi-`useForm` data loss (Pitfall 5), `isValid` blocking Next buttons (Pitfall 6), Tailwind dynamic class purge (Pitfall 10)

### Phase 4: Quote Wizard — Photo Step
**Rationale:** Step 3 (Photos) is the most complex and highest-risk step. Isolating it to its own phase means any complexity or rework is contained and does not block the rest of the wizard from shipping. The wizard should be fully functional end-to-end (Steps 1, 2, 4) before Step 3 is integrated.
**Delivers:** `Step3Photos.tsx` integrating `PhotoUpload.tsx`, canvas EXIF-stripping and resize utility, direct-to-Formspree multipart submission validation, file type/size client-side validation, "Skip" path through Step 3
**Addresses:** Photo upload with drag-and-drop, 5-file / 10 MB limit enforcement, thumbnail previews with remove
**Avoids:** Vercel 4.5 MB body limit (Pitfall 4), EXIF GPS data transmitted (Pitfall 8), base64 JSON submission (Anti-Pattern 3 in ARCHITECTURE.md)

### Phase 5: Google Maps Integration
**Rationale:** Maps are independent of the wizard — they touch `Contact.tsx` and `CityPage.tsx` only. Deferring to Phase 5 means the wizard is complete and tested before Maps adds complexity to city pages. Lighthouse testing of city pages must happen in this phase.
**Delivers:** `GoogleMapEmbed.tsx` integrated into `Contact.tsx` and `CityPage.tsx`, env var documentation for buyers, Google Cloud Console setup instructions in README
**Addresses:** Service area map on city pages, HQ location map on Contact page
**Avoids:** API key in source control (Pitfall 2), Lighthouse regression on city pages (Pitfall 3), referrer policy breaking Maps in production (Pitfall 9)

### Phase Ordering Rationale

- Phase 1 before everything: `quote.ts` is imported by `CostEstimator`, all wizard steps, and `schemas.ts`. Feature flags must exist before any conditional rendering. This is a strict dependency.
- Phase 2 before Phase 3/4: Atomic components are imported by wizard steps. Building them first means wizard step development never blocks on a missing dependency.
- Phase 3 before Phase 4: The photo step integrates into the wizard orchestrator. The orchestrator must exist and be wired end-to-end before adding the photo step. Testing the full wizard flow without photos first validates the data accumulation pattern.
- Phase 5 is independent: Maps has no dependency on the wizard. It can be slotted earlier if schedule allows, but keeping it last avoids Lighthouse regressions on city pages during wizard development.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 3 (Wizard Core):** The interaction between `useSearchParams` (for URL-based step encoding) and React Router 7 framework mode's pre-rendering deserves a targeted spike. Verify that `useSearchParams` works correctly on a pre-rendered static route with `ssr: false` before committing to this pattern.
- **Phase 4 (Photo Step):** Canvas API availability and HEIC format handling on iOS Safari needs verification. `canvas.toBlob()` with `image/jpeg` output should handle HEIC input via Safari's native decoder, but this should be tested on an actual iOS device before calling the phase done.

Phases with standard patterns (skip research-phase):
- **Phase 1 (Foundation):** Config file creation and schema extensions follow exactly established patterns already in the codebase. No research needed.
- **Phase 2 (Atomic Components):** All three components are pure display or controlled input with well-documented APIs. GoogleMapEmbed and CostEstimator are essentially config-to-JSX transforms. PhotoUpload follows the `useDropzone` hook example from react-dropzone docs.
- **Phase 5 (Google Maps):** The iframe embed pattern is fully documented in official Google Maps Embed API docs. The pitfall mitigations (lazy loading, referrer policy, env var) are all well-specified in PITFALLS.md.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | npm registry versions verified live; React 19 compatibility confirmed via closed GitHub issues for both react-dropzone (PR #1422, Feb 2026) and @vis.gl/react-google-maps (issue #596, Nov 2024) |
| Features | HIGH | Core claims verified against live competitor implementations (Modernize, HomeAdvisor); conversion data from multiple sources (Zuko, Growform, Lollypop) is MEDIUM confidence individually but convergent |
| Architecture | HIGH | Patterns derived from official RHF docs, official React Router 7 pre-rendering docs, and existing v1.1 codebase structure. Build order is based on verified import dependencies |
| Pitfalls | HIGH | Top pitfalls verified against official sources: Vercel body limit (Vercel KB), Formspree file limits (Formspree docs), Maps API key security (Truffle Security March 2025, Google security guidance), RHF multi-step issue #3648 |

**Overall confidence:** HIGH

### Gaps to Address

- **Formspree file upload plan requirement:** ARCHITECTURE.md notes that Formspree file uploads may require a Gold plan or higher. The template defaults to `provider: 'none'` (console.log fallback) in demo mode, so this does not block development, but buyers must be informed of the plan requirement in documentation before launch. Verify current Formspree plan tier requirements at launch time — pricing may have changed.

- **`useSearchParams` + pre-rendering interaction:** The URL-based step encoding recommendation (`?step=N` via `useSearchParams`) has not been explicitly verified against React Router 7's `ssr: false` pre-rendering mode. The wizard route pre-renders to a single HTML file — query params are client-side only and should work correctly after hydration, but a quick smoke test during Phase 3 planning is warranted.

- **HEIC format on iOS Safari:** react-dropzone accepts `image/heic` in the MIME type allowlist, but canvas API re-encoding of HEIC files depends on the browser's native HEIC decoder. Safari on iOS supports HEIC natively; Chrome on Android does not. The template should either test this explicitly or document that HEIC upload is Safari/iOS only and fallback to JPEG is recommended for cross-browser compatibility.

- **Cloudinary pricing:** The Cloudinary free plan specs (25 credits/month, 10 MB limit) are noted in STACK.md as MEDIUM confidence because pricing pages change. If the Cloudinary optional path is documented for buyers, verify the current free tier before writing buyer documentation.

---

## Sources

### Primary (HIGH confidence)
- npm registry live queries — `react-dropzone@15.0.0`, `@vis.gl/react-google-maps@1.7.1` versions
- [react-dropzone PR #1422](https://github.com/react-dropzone/react-dropzone/pull/1422) — React 19 compatibility confirmed, closed Feb 2026
- [visgl/react-google-maps issue #596](https://github.com/visgl/react-google-maps/issues/596) — React 19 fixed in v1.4.1, closed Nov 2024
- [React Hook Form: Advanced Usage / Wizard Forms](https://react-hook-form.com/advanced-usage) — FormProvider + trigger() pattern
- [React Hook Form issue #3648](https://github.com/react-hook-form/react-hook-form/issues/3648) — multi-step wizard state loss warning
- [Google Maps Embed API overview](https://developers.google.com/maps/documentation/embed/get-started) — free, unlimited usage confirmed
- [Google Maps API security best practices](https://developers.google.com/maps/api-security-best-practices) — referrer + API restrictions
- [Truffle Security: Google API key Gemini escalation](https://trufflesecurity.com/blog/google-api-keys-werent-secrets-but-then-gemini-changed-the-rules) — March 2025
- [Formspree file upload docs](https://help.formspree.io/hc/en-us/articles/115008380088-File-uploads) — 10 files / 25 MB each / 100 MB total
- [Formspree system limits](https://help.formspree.io/hc/en-us/articles/7017303616659-System-Limits) — confirmed limits
- [Vercel body size limit](https://vercel.com/kb/guide/how-to-bypass-vercel-body-size-limit-serverless-functions) — 4.5 MB confirmed
- [React Router 7 pre-rendering docs](https://reactrouter.com/how-to/pre-rendering) — `getStaticPaths()` auto-discovery confirmed
- [Tailwind CSS dynamic class names discussion #18137](https://github.com/tailwindlabs/tailwindcss/discussions/18137) — safelist / lookup table requirement
- [Modernize: 2026 Home Siding Cost Calculator](https://modernize.com/siding/cost-calculator) — live competitor reference
- [Cloudinary client-side uploading docs](https://cloudinary.com/documentation/client_side_uploading) — unsigned preset, no backend

### Secondary (MEDIUM confidence)
- [Building reusable multi-step form with RHF and Zod — LogRocket](https://blog.logrocket.com/building-reusable-multi-step-form-react-hook-form-zod/) — single useForm pattern, verified against RHF docs
- [Google Maps 100% PageSpeed — corewebvitals.io](https://www.corewebvitals.io/pagespeed/google-maps-100-percent-pagespeed) — LCP/CLS measurements for naive iframe embed
- [Zuko: Single Page vs Multi-Step Form Conversion](https://www.zuko.io/blog/single-page-or-multi-step-form-for-conversion) — 86% conversion improvement claim
- [Baymard Institute: Back Button UX](https://baymard.com/blog/back-button-expectations) — 59% of sites get Back button wrong in multi-step flows
- [web.dev: Best practices for third-party embeds](https://web.dev/articles/embed-best-practices) — lazy loading recommendation
- [Cloudinary pricing](https://cloudinary.com/pricing) — 25 credits/month free tier (verify before quoting to buyers)

---

*Research completed: 2026-03-05*
*Ready for roadmap: yes*
