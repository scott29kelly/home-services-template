# Feature Research — v1.2 Feature Expansion

**Domain:** Premium home services website template — roofing, siding, storm damage
**Milestone:** v1.2 — adding multi-step quote wizard, project cost estimator, Google Maps embed, photo upload
**Researched:** 2026-03-05
**Confidence:** HIGH (multiple sources verified, existing codebase reviewed)

---

## Scope Note

This document covers ONLY the four new features being added in v1.2. The v1.0/v1.1 feature
inventory (contact form, booking calendar, financing calculator, AI chat, city pages, etc.)
is documented in commit history. Items marked "Already Built" below refer to components in
the v1.1 codebase that the new features must integrate with.

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features that home services website visitors and template buyers expect from quote/estimation flows.
Missing any of these makes the new feature feel incomplete or unpolished.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Step progress indicator | Multi-step forms without progress feel broken. Reduces abandonment by 20-30%. Industry standard for 3+ step flows. | LOW | Numbered steps or progress bar. "Step 2 of 4" minimum. |
| Back/forward navigation between steps | Users correct mistakes. Forms with no back button are frustrating. Expected at any price point. | LOW | State must persist across steps — don't reset on back. |
| Per-step validation (not all-at-once) | Users should not see errors for fields not yet reached. Validate on step exit. | LOW | React Hook Form with `trigger()` per step. Already using RHF. |
| Mobile-friendly touch inputs | 60%+ of home service searches are mobile. Tap targets, readable labels, no horizontal scroll. | LOW | Already a site-wide constraint. Apply consistently to new forms. |
| Thank-you / confirmation state | After final submit, users need confirmation their request was received. | LOW | Reuse existing `/thank-you` route. Already built. |
| Approximate cost range output | Users asking "how much will this cost?" expect a number, even a rough range. Refusing to show any number is unhelpful and loses the lead. | MEDIUM | Show range (e.g., "$8,000–$15,000") not a false-precision number. Include disclaimer. |
| Service area map on city pages | Maps on local business pages are a trust signal and usability aid. Homeowners scan for "are you near me?" | MEDIUM | Embedded map showing service area is expected on city pages at premium tier. |
| Photo attachment in damage quote flows | Storm damage and insurance claim contexts: homeowners expect to be able to submit photos. "Show us what's broken" is intuitive. | MEDIUM | Photos contextualize the job. Particularly expected in storm damage flow. |

### Differentiators (Competitive Advantage)

Features that distinguish this template from both generic templates and the existing v1.1 feature set.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| 4-step quote wizard (`/get-quote`) | Guided lead capture collects richer data than the basic contact form. Industry research shows multi-step forms convert 86% better than single-page equivalents and deliver 300% higher conversion vs. single-page alternatives. Template buyers who want premium lead gen will demo this first. | HIGH | Step flow: Service Type → Project Details → Photos (optional) → Contact Info. Integrates with existing Formspree submission pipeline and `forms.ts` config. |
| Service-based cost range estimator | "How much does a new roof cost?" is the #1 home services search query. Config-driven cost ranges per service type (roofing, siding, storm damage) surfaced alongside the financing calculator gives users immediate value without requiring contact. | HIGH | Inputs: service type, rough sq footage or home size (small/medium/large), material tier. Output: cost range + monthly payment estimate (tap into existing financing calculator config). |
| Merged cost estimator + financing calculator | Existing financing calculator (`/financing`) is standalone. Surfacing estimated cost ranges alongside payment options on the same page or within the quote wizard creates a decision-support tool that competitors rarely offer. | MEDIUM | Pull `financing.ts` config (rates, terms). Apply to estimated project cost. No new data — new presentation. |
| Config-driven Google Maps embed on city pages | Interactive map on each city page proves local presence. Currently city pages list nearby areas as text links only. A map makes the service area concrete. Maps Embed API is free (unlimited usage) — no per-load billing. | MEDIUM | One API key in `site.ts` or new config entry. Renders iframe per city page. Lazy-load to avoid performance impact on pre-rendered pages. Feature-flagged. |
| Client-side photo upload with preview in quote wizard | Photo upload step (Step 3) with drag-and-drop, file type/size validation, thumbnail previews, and submission via Formspree multipart. Differentiates from basic contact forms. Storm damage context makes photos especially valuable. | HIGH | react-dropzone for DnD interface. FileReader API for client-side preview. Formspree supports up to 10 files, 25 MB each, 100 MB total per submission with `enctype="multipart/form-data"`. No external storage service needed. |
| Wizard pre-fills from service page context | If user clicks "Get Quote" on the Roofing service page, Step 1 of the wizard should pre-select "Roofing." Reduces friction, increases completion rate. | MEDIUM | URL query param (`/get-quote?service=roofing`) or React Router state. Step 1 reads param and pre-selects service. |
| Wizard tied into feature flag system | `quoteWizard` flag in `features.ts` controls whether `/get-quote` route exists. Consistent with existing pattern for `financingCalculator`, `onlineBooking`, etc. | LOW | Add to `features.ts`. Route guard returns `<Navigate to="/contact" />` when disabled. |

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Real-time cost calculation (live as user types) | Feels interactive and impressive. | Home services pricing is highly variable. Live calculation implies false precision. Users take numbers literally and argue with estimates. Creates liability. | Show range on completion of inputs. Include mandatory disclaimer. Make ranges configurable in `services.ts` so buyers can set their own. |
| Photo storage / gallery in admin | "See what customers uploaded" | Requires a backend, auth, database, file storage — fundamentally changes the product from static template to SaaS. | Formspree dashboard shows submitted files. That's sufficient for a template. |
| Google Maps with service area polygon overlay | Visually impressive. Shows exact coverage area. | Requires Maps JavaScript API (not Embed API). JavaScript API has per-load cost ($7/1,000 loads) and needs domain restriction setup. Adds 200+ KB of runtime JS. Much higher implementation complexity. | Maps Embed API (free, iframe, no JS bundle cost) showing a pin or place search is sufficient for the use case. Buyers can upgrade independently if they need polygons. |
| Mandatory photo upload (required field) | Ensures richer lead data. | Creates abandonment. Users on mobile may not have photos ready. Storm damage requires inspection anyway — photo is helpful context, not a replacement. | Make photo upload optional (Step 3 explicitly says "optional"). Wizard proceeds without photos. |
| Cloudinary / Uploadthing cloud storage for photos | Persistent photo URLs, CDN delivery. | Adds external service dependency with its own API key, account setup, billing. Overkill for a template where the business owner just needs to see the photos in their email. | Formspree receives photos as attachments and stores them per-submission. Template buyer gets photos in their Formspree dashboard. Zero additional service. |
| ZIP code validation against service area list | Filter out-of-area leads early. | Service areas change. Config-driven list would be stale. Creates friction for users on the boundary. False rejects lose real leads. | Let any zip submit. Business owner filters manually. Note in config that service area list is for SEO city pages, not wizard gate. |
| Saving wizard progress to localStorage | "Resume later" for long forms. | Quote wizard is 4 steps and takes under 2 minutes. Save/resume complexity is disproportionate to task length. LocalStorage state can leak between sessions. | Keep wizard stateless within session. If user navigates away, the form resets. This is fine for a 4-step form. |

---

## Feature Dependencies

```
Existing: React Hook Form + Zod (ContactForm.tsx) [BUILT]
    └──reuse──> Multi-Step Quote Wizard
                    └──extends──> Photo Upload Step (react-dropzone)
                    └──submits via──> Formspree multipart (existing submitForm handler)
                    └──redirects to──> /thank-you (existing route)
                    └──reads from──> forms.ts config (existing)
                    └──reads from──> services.ts (service list for Step 1 dropdown)

Existing: financing.ts config (rates, terms, loan amounts) [BUILT]
    └──consumed by──> Project Cost Estimator
                          └──merged with──> service cost ranges (new: services.ts addition)
                          └──displayed on──> /get-quote Step 2 OR standalone /estimate page

Existing: cityPages array in service-areas.ts [BUILT]
    └──extended by──> Google Maps Embed
                          └──reads from──> new maps config (site.ts addition: mapsApiKey, hqCoordinates)
                          └──renders in──> service-areas.$slug.tsx (city page route)
                          └──gated by──> features.ts: googleMaps flag (new)

Existing: features.ts feature flags [BUILT]
    └──extended by──> quoteWizard flag (new)
    └──extended by──> googleMaps flag (new)
    └──extended by──> costEstimator flag (new)
```

### Dependency Notes

- **Quote wizard requires existing RHF + Zod setup:** The existing `ContactForm.tsx` uses React Hook Form and Zod. The wizard should reuse the same validation patterns and the existing `submitForm()` handler from `lib/form-handler.ts`. No new submission infrastructure needed.
- **Photo upload requires Formspree multipart support:** Formspree natively supports file uploads up to 25 MB each / 100 MB total via `enctype="multipart/form-data"`. No new backend. The existing `forms.ts` `formspreeId` is reused.
- **Cost estimator consumes financing.ts:** The existing financing calculator config (rates, terms, min/max amounts) feeds directly into the cost estimator's monthly payment output. New config needed: cost ranges per service per home size tier.
- **Google Maps depends on new config key:** The existing `site.ts` or a new `maps.ts` config will hold the API key and HQ coordinates. City pages already receive the city `slug` and `name` — they need coordinates or a place query added to `CityConfig`.
- **Wizard pre-fill depends on URL params:** Service pages (roofing, siding, storm-damage) link to `/get-quote?service=roofing`. The wizard reads the query param on mount to pre-select Step 1. This is a one-way dependency — service pages don't change, just their CTA `href` updates.

---

## MVP Definition

### Launch With (v1.2)

This is the full v1.2 scope — all four features are the milestone.

- [ ] **Multi-step quote wizard** (`/get-quote`) — 4 steps: Service → Project Details → Photos (optional) → Contact. Progress indicator. Per-step validation. Submits via existing Formspree pipeline. Feature-flagged. Pre-fills from `?service=` param.
- [ ] **Project cost estimator** — Config-driven cost ranges per service. Inputs: service type + home size tier. Output: cost range + monthly payment (using existing financing rates). Embedded in wizard Step 2 or shown on `/get-quote` results panel. Disclaimer required.
- [ ] **Google Maps embed on city pages** — Maps Embed API iframe on each `/service-areas/:slug` page. API key in config. Feature-flagged. Lazy-loaded. Shows city location pin.
- [ ] **Photo upload in wizard Step 3** — react-dropzone. Accept: JPG, PNG, HEIC, WebP. Max 5 files, 10 MB each. Client-side preview thumbnails. Optional step (skip allowed). Submits via Formspree multipart.

### Add After Validation (v1.x)

- [ ] **Cost estimator as standalone page** — If buyers want to link to `/estimate` directly from nav. Trigger: user feedback that estimator deserves its own page outside the wizard flow.
- [ ] **Wizard analytics events** — Custom events per step completion (Google Analytics / GTM). Trigger: buyers ask for conversion tracking on wizard. Low implementation cost but low priority for template launch.
- [ ] **Maps embed on Contact page** — Show HQ location map on `/contact`. Currently contact page has address in sidebar. Trigger: user request or if Maps embed on city pages tests well.

### Future Consideration (v2+)

- [ ] **Google Maps JavaScript API with service area polygon** — Full interactive map with drawn service area boundary. Deferred: Maps JS API billing complexity, bundle weight, implementation overhead. Not needed for the use case.
- [ ] **Photo gallery from submissions** — View uploaded photos in a customer-facing gallery. Requires backend + auth. Out of scope for template product.
- [ ] **AI-powered cost estimation** — Use property data / address lookup to auto-fill size. Requires third-party API. Disproportionate complexity for v1.2 scope.

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Multi-step quote wizard | HIGH — 86% better conversion vs. single form | HIGH — new route, multi-state management, step validation | P1 |
| Photo upload (step 3 of wizard) | HIGH — especially storm damage context | MEDIUM — react-dropzone + Formspree multipart | P1 |
| Google Maps on city pages | MEDIUM — trust signal, local SEO | MEDIUM — new config key, iframe integration, lazy load | P2 |
| Project cost estimator | HIGH — #1 homeowner question | HIGH — new config schema, calculator logic, presentation | P1 |
| Estimator + financing merger | MEDIUM — decision support, differentiator | LOW — reuse existing financing.ts, new display component | P2 |
| Wizard pre-fill from service pages | MEDIUM — reduces friction | LOW — URL param read on mount | P2 |
| Feature flags for new features | LOW — infrastructure | LOW — add 3 keys to features.ts | P1 (do first) |

**Priority key:**
- P1: Must have for v1.2 launch
- P2: Should have, include if schedule allows
- P3: Nice to have, defer

---

## Implementation Behavior Reference

### Multi-Step Quote Wizard — Expected Behavior

Based on industry research and competitor analysis:

**Step 1 — Service Type**
- Radio cards or large tap targets, one per service: Roofing, Siding, Storm Damage, Other
- Pre-selected if `?service=` param present in URL
- CTA: "Next: Project Details →"

**Step 2 — Project Details**
- Inputs vary by service selection (conditional fields):
  - All services: approximate home size (Small < 1,500 sqft / Medium 1,500–2,500 / Large 2,500+), project timeline (Urgent / Within 3 months / Just exploring)
  - Roofing + Siding: material preference dropdown (populated from services.ts)
  - Storm Damage: insurance claim? (Yes / No / Not sure)
- **Cost range display**: After service + size selected, show estimated cost range and monthly payment. Config-driven ranges from new cost config.
- CTA: "Next: Add Photos →" or "Skip to Contact →"

**Step 3 — Photos (Optional)**
- Drag-and-drop zone + "or click to browse"
- Accept: image/jpeg, image/png, image/webp, image/heic
- Max 5 files, 10 MB each
- Client-side thumbnail previews with remove button per file
- Validation: file type and size errors shown inline
- Explicit "Skip this step" link — photos are optional
- CTA: "Next: Your Information →"

**Step 4 — Contact Information**
- Fields: First Name, Last Name, Phone, Email, Address (optional), Additional Notes
- Reuse existing `contactSchema` Zod validation where fields overlap
- Honeypot field (consistent with existing ContactForm anti-spam)
- CTA: "Submit Request" → calls existing `submitForm()` → redirects to `/thank-you`

**Progress indicator:** "Step X of 4" text + visual step dots or numbered tabs. No percentage bars (overkill for 4 steps).

**State management:** `useState` with a step index and accumulated form data object. No external state library. Data accumulates across steps; full payload submitted at Step 4.

### Project Cost Estimator — Expected Behavior

**Inputs:**
- Service (from Step 1, already selected in wizard context)
- Home size tier: Small / Medium / Large (radio or segmented control)
- Optional: material tier (Standard / Premium) for roofing/siding

**Outputs:**
- Cost range: e.g., "$8,500 – $14,000" displayed prominently
- Monthly payment range: calculated using existing `financing.ts` option rates applied to low and high end of range
- Disclaimer: "Estimates vary by location, materials, and site conditions. Schedule a free inspection for an accurate quote."

**Config shape (new in services.ts or separate estimate.ts):**
```typescript
export const costRanges = {
  roofing: {
    small:  { low: 7000,  high: 12000 },
    medium: { low: 10000, high: 18000 },
    large:  { low: 15000, high: 30000 },
  },
  siding: {
    small:  { low: 6000,  high: 10000 },
    medium: { low: 9000,  high: 16000 },
    large:  { low: 13000, high: 25000 },
  },
  'storm-damage': {
    small:  { low: 3000,  high: 8000  },
    medium: { low: 5000,  high: 14000 },
    large:  { low: 8000,  high: 22000 },
  },
}
```

### Google Maps Embed — Expected Behavior

**Implementation:** Maps Embed API iframe (not JavaScript API). Free, unlimited, no per-load billing.

**On city pages:** Show map centered on the city with a search query or place lookup. Because city pages are pre-rendered, the iframe must be client-only rendered (no SSR) to avoid hydration mismatch. Use `ClientOnly` wrapper or `useEffect` guard.

**URL format:**
```
https://www.google.com/maps/embed/v1/place
  ?key={API_KEY}
  &q={cityName}+{state}+roofing
  &zoom=12
```

**Config additions:**
- `site.ts`: `googleMapsApiKey: ''` (empty = Maps disabled even if feature flag on)
- `service-areas.ts` `CityConfig`: optional `lat` and `lng` for precision, falls back to city name query

**Performance:** iframe lazy-load attribute (`loading="lazy"`). Wrap in `features.googleMaps` guard. Do not load if API key is empty.

**Fallback:** If `googleMapsApiKey` is empty or `features.googleMaps` is false, render the existing city area description section unchanged. No broken UI.

### Photo Upload — Expected Behavior

**Library:** `react-dropzone` (well-maintained, 10M+ weekly downloads, hooks-based, tree-shakeable)

**Behavior:**
- Drag files onto drop zone OR click to open file picker
- Immediate client-side thumbnail preview using `URL.createObjectURL()`
- Per-file remove button (X)
- Validation on drop: reject files exceeding size limit or wrong type, show inline error
- State: `files: File[]` in wizard step state
- On form submit (Step 4): include files in FormData — Formspree multipart handles storage

**Formspree multipart requirement:** The existing `submitForm()` handler must be updated to use `FormData` with `enctype="multipart/form-data"` when files are present. Currently it likely sends JSON. This is a targeted modification to `lib/form-handler.ts`.

---

## Competitor Feature Analysis

| Feature | Modernize.com | Jobber Free Tools | Our Approach |
|---------|---------------|-------------------|--------------|
| Cost estimator | Multi-step wizard with ZIP + material inputs, shows local range | Single-page calculator, sq footage + material | Config-driven ranges, integrated into quote wizard flow, no ZIP lookup required |
| Quote flow | 4–6 step lead gen wizard (service, ZIP, contact) | N/A (estimator only) | 4 steps with photos; richer data collection; integrates with existing Formspree pipeline |
| Maps on local pages | Not applicable (aggregator) | Not applicable (SaaS tool) | Maps Embed API iframe on city pages; free; lazy loaded |
| Photo upload | Not offered in quote flow | Not offered | react-dropzone in Step 3; optional; Formspree storage |

---

## Sources

- [Lollypop Design: Wizard UI Best Practices 2026](https://lollypop.design/blog/2026/january/wizard-ui-design/) — MEDIUM confidence (industry blog)
- [LeadCapture.io: Multi-Step Form Examples](https://leadcapture.io/blog/multi-step-form-example/) — MEDIUM confidence
- [Hook Agency: Best Home Service Websites](https://hookagency.com/blog/home-service-website-examples/) — MEDIUM confidence
- [Growform: Must-Follow UX Best Practices for Multi-Step Forms](https://www.growform.co/must-follow-ux-best-practices-when-designing-a-multi-step-form/) — MEDIUM confidence
- [Zuko: Single Page vs Multi-Step Form Conversion](https://www.zuko.io/blog/single-page-or-multi-step-form-for-conversion) — MEDIUM confidence
- [Modernize: 2026 Home Siding Cost Calculator](https://modernize.com/siding/cost-calculator) — HIGH confidence (live product reference)
- [Style Exteriors: Roofing Siding Project Cost Calculator](https://styleexteriorsbc.com/roofing-siding-project-cost-calculator/) — HIGH confidence (live product reference)
- [HomeAdvisor: 2026 Siding Cost Estimator](https://www.homeadvisor.com/cost/siding/) — HIGH confidence (live product reference)
- [Google Maps Platform: Maps Embed API Overview](https://developers.google.com/maps/documentation/embed/get-started) — HIGH confidence (official docs)
- [Google Maps Platform: Maps Embed API Get API Key](https://developers.google.com/maps/documentation/embed/get-api-key) — HIGH confidence (official docs)
- [KiwiSprout: Google Maps Embedded vs Static vs JS](https://kiwisprout.nz/blog/google-maps--embedded-static-or-js--whats-better) — MEDIUM confidence (verified against official docs)
- [Formspree: File Uploads Documentation](https://help.formspree.io/hc/en-us/articles/115008380088-File-uploads) — HIGH confidence (official docs)
- [Formspree: How to Create a File Upload Form](https://formspree.io/blog/file-upload-form/) — HIGH confidence (official docs)
- [LogRocket: Create Drag-and-Drop with react-dropzone](https://blog.logrocket.com/create-drag-and-drop-component-react-dropzone/) — HIGH confidence (technical implementation guide)
- [react.wiki: File Upload Hook with Preview 2026](https://react.wiki/hooks/file-upload-hook/) — MEDIUM confidence

---

*Feature research for: home-services-template v1.2 Feature Expansion*
*Researched: 2026-03-05*
