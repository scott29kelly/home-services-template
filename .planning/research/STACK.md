# Stack Research

**Domain:** Home Services Template — v1.2 Feature Expansion
**Researched:** 2026-03-05
**Confidence:** HIGH (all critical claims verified against npm registry, official docs, or GitHub source)

> **Scope:** This document covers ONLY the four new v1.2 features. The existing stack
> (React 19, React Router 7, Vite 7, Tailwind v4, RHF, Zod, Zod resolvers, Lucide) is
> validated and locked. Do not re-research it.

---

## Existing Stack (Locked — Do Not Re-research)

| Technology | Version | Status |
|------------|---------|--------|
| React | ^19.2.4 | Locked |
| React Router 7 (framework mode) | ^7.13.1 | Locked |
| Vite | ^7.3.1 | Locked |
| Tailwind CSS | ^4.1.18 | Locked |
| TypeScript | ^5.9.3 | Locked |
| react-hook-form | ^7.71.2 | Already installed |
| @hookform/resolvers | ^5.2.2 | Already installed |
| zod | ^4.3.6 | Already installed |
| lucide-react | ^0.564.0 | Already installed |

---

## New Stack Additions for v1.2

### Summary: Only One New Package is Required

| Package | Version | Feature | Install |
|---------|---------|---------|---------|
| react-dropzone | ^15.0.0 | Photo upload drag-and-drop (quote wizard step 3) | `npm install react-dropzone` |
| @vis.gl/react-google-maps | ^1.7.1 | Google Maps (only if interactive markers needed — see below) | `npm install @vis.gl/react-google-maps` |

**Multi-step wizard** and **cost estimator** require zero new packages. Both build entirely
on existing react-hook-form, Zod, Tailwind, and the existing `FinancingCalculator` pattern.

---

## Feature 1: Multi-Step Quote Wizard (`/get-quote`)

### Decision: Zero new dependencies. Use native react-hook-form `FormProvider` + `useFormContext`.

The existing `react-hook-form@7.71.2` supports multi-step wizards natively. The official
documented pattern (`react-hook-form.com/advanced-usage` — Wizard Forms section) wraps all
steps in a single `<form>`, uses `FormProvider` to share state across step components, and
calls `trigger(fieldNames)` to validate only the current step's fields before advancing.

The existing `ContactForm.tsx` already uses `useForm` + `zodResolver`. The wizard is the
same pattern extended with step state.

| Concern | Solution | Rationale |
|---------|----------|-----------|
| Step routing | `useState<number>` in parent route component | Zero deps; step state is local to this page |
| Cross-step form state | `FormProvider` + `useFormContext` | Already in codebase; RHF native |
| Per-step validation | `trigger(['fieldA', 'fieldB'])` before advancing | RHF built-in; validates current step only |
| Per-step Zod schemas | Separate Zod schemas per step | Existing `src/lib/schemas.ts` pattern |
| Progress bar | Pure JSX + Tailwind | No dep; fits existing CSS animation approach |
| File field (step 3) | `useDropzone` hook wired to `setValue('photos', files)` | react-dropzone integration pattern |

**Implementation note:** The wizard's final step submits to Formspree. When photos are
attached, the `submitForm()` handler in `src/lib/form-handler.ts` must use `FormData`
(multipart) instead of `JSON.stringify`. Create a separate `submitQuoteForm()` function
for the wizard — do not modify the existing `submitForm()` used by the contact form.

**No new install.**

---

## Feature 2: Project Cost Estimator

### Decision: Zero new dependencies. Extend `FinancingCalculator.tsx` pattern.

`FinancingCalculator.tsx` already implements:
- Native `<input type="range">` styled with Tailwind
- `useState` for controlled slider value
- `Intl.NumberFormat` for currency formatting
- CSS variable-based slider fill (gradient background trick)

The cost estimator follows the identical pattern: service dropdown → lookup cost range
from config → display formatted range → optionally show "estimated monthly payment" by
passing the midpoint to the existing financing calculator logic.

| Concern | Solution | Rationale |
|---------|----------|-----------|
| Service cost data | New `costRanges` key per service in `src/config/services.ts` | Config-driven; zero component changes for new services |
| Service selector | Native `<select>` styled with Tailwind | Already used in `ContactForm.tsx`; no new dep |
| Range display | `Intl.NumberFormat` (already in codebase) | Re-use existing utility |
| Monthly payment | Import `calculateMonthlyPayment` from `FinancingCalculator.tsx` | Extract to `src/lib/financing.ts`; share between both components |
| Feature flag | `features.costEstimator` in `src/config/features.ts` | Follows existing feature flag pattern |

**No new install.**

---

## Feature 3: Google Maps Embed (City Pages)

### Decision: Maps Embed API iframe (primary). `@vis.gl/react-google-maps` as opt-in if interactive markers needed.

#### Option A — Maps Embed API iframe (DEFAULT, RECOMMENDED)

The Google Maps Embed API is **free with unlimited usage**. An API key is required but no
billing charges are ever incurred for embed requests (verified: Google official docs,
`developers.google.com/maps/documentation/embed/get-started`).

The iframe approach has zero bundle cost, pre-renders cleanly in static HTML (no JS
hydration required for the map itself), and is sufficient for a "where we serve" use case
on city pages.

```tsx
// src/components/maps/CityMap.tsx
interface CityMapProps {
  address: string
  cityName: string
  apiKey: string
}

export function CityMap({ address, cityName, apiKey }: CityMapProps) {
  return (
    <iframe
      title={`Map of ${cityName}`}
      src={`https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent(address)}`}
      width="100%"
      height="400"
      style={{ border: 0 }}
      allowFullScreen
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
    />
  )
}
```

Config integration: add `googleMapsApiKey: ''` to `src/config/site.ts` and gate
rendering behind `features.googleMaps` (existing feature flag system). When key is empty
and feature flag is off, city pages render the existing text-based service area list.

**No new install.**

#### Option B — @vis.gl/react-google-maps@1.7.1 (OPTIONAL, only if interactive markers needed)

| Attribute | Value |
|-----------|-------|
| npm version (verified live) | 1.7.1 |
| React 19 compatible | YES — fixed in v1.4.1, Nov 2024 (GitHub issue #596 closed) |
| Bundle size | ~35 KB gzip |
| Endorsement | Official Google Maps Platform blog post; Google-endorsed |
| TypeScript | Full TypeScript support out of the box; no `@types/` needed |

```bash
npm install @vis.gl/react-google-maps
```

```tsx
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps'

<APIProvider apiKey={apiKey}>
  <Map defaultCenter={{ lat: 40.7128, lng: -74.006 }} defaultZoom={11}>
    <AdvancedMarker position={{ lat: 40.7128, lng: -74.006 }} />
  </Map>
</APIProvider>
```

**Use Option B only if**: custom markers per city, user geolocation, or React-controlled
map state are needed. For a template's city page "service area" map, Option A is
sufficient and preferred (zero bundle cost).

---

## Feature 4: Photo Upload (Quote Wizard Step 3)

### Decision: `react-dropzone@15.0.0` for DX. Formspree multipart as default delivery. Cloudinary unsigned upload as optional enhancement.

#### 4a — Drag-and-Drop Zone: react-dropzone@15.0.0

react-dropzone is the standard React drag-and-drop file input library (4,473+ downstream
packages on npm).

| Attribute | Value |
|-----------|-------|
| npm version (verified live) | 15.0.0 (published Feb 2026) |
| React 19 compatible | YES — peer dep is `>= 16.8` which already includes React 19 (PR #1422, closed Feb 2026 — no action needed) |
| Bundle size | ~8 KB gzip (hook-only, no forced UI) |
| API | `useDropzone` hook — integrates cleanly with RHF `setValue('photos', files)` |

```bash
npm install react-dropzone
```

```tsx
import { useDropzone } from 'react-dropzone'
import { useFormContext } from 'react-hook-form'

export function PhotoUploadStep() {
  const { setValue } = useFormContext()

  const { getRootProps, getInputProps, acceptedFiles } = useDropzone({
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.heic'] },
    maxFiles: 5,
    maxSize: 10 * 1024 * 1024, // 10 MB per file
    onDrop: (files) => setValue('photos', files),
  })

  return (
    <div {...getRootProps()} className="border-2 border-dashed border-brand-blue/30 rounded-2xl p-8 text-center cursor-pointer hover:border-brand-blue/60 transition-colors">
      <input {...getInputProps()} />
      <p>Drag photos here or click to select</p>
      {acceptedFiles.length > 0 && (
        <ul>{acceptedFiles.map(f => <li key={f.name}>{f.name}</li>)}</ul>
      )}
    </div>
  )
}
```

#### 4b — File Delivery: Formspree multipart (DEFAULT)

Formspree natively accepts file uploads via `multipart/form-data`. No backend required.

| Attribute | Value |
|-----------|-------|
| Files per submission | Up to 10 |
| Max file size | 25 MB per file |
| Max request size | 100 MB total |
| Free plan | Files forwarded in email notification as attachments; no persistent dashboard storage |
| Paid plan (Business) | Up to 10 GB stored; viewable in Formspree dashboard |
| enctype required | `multipart/form-data` on the `<form>` element |

**Critical integration note:** The existing `submitForm()` in `src/lib/form-handler.ts`
sends `Content-Type: application/json`. File submissions must use `FormData`
(multipart). Create a separate `submitQuoteForm()` function — do NOT modify the existing
function. The contact form and booking form must remain JSON.

```typescript
// src/lib/form-handler.ts — add new function, do not modify submitForm()
export async function submitQuoteForm(
  data: QuoteFormData,
  files: File[]
): Promise<SubmissionResult> {
  const { formspreeId } = forms.submission

  const formData = new FormData()
  formData.append('service', data.service)
  formData.append('name', `${data.firstName} ${data.lastName}`)
  formData.append('email', data.email)
  formData.append('phone', data.phone)
  formData.append('details', data.details ?? '')
  files.forEach((file) => formData.append('photos', file))

  // Note: Do NOT set Content-Type header — browser sets multipart boundary automatically
  const res = await fetch(`https://formspree.io/f/${formspreeId}`, {
    method: 'POST',
    headers: { Accept: 'application/json' },
    body: formData,
  })
  if (!res.ok) throw new Error('Submission failed')
  return { ok: true }
}
```

#### 4c — Cloudinary Unsigned Upload (OPTIONAL, config-gated)

For buyers who want photos stored on a CDN (not just emailed), Cloudinary unsigned upload
requires zero backend and zero new npm packages (direct fetch REST API).

| Attribute | Value |
|-----------|-------|
| Free plan | 25 monthly credits (1 credit = 1 GB storage OR 1 GB bandwidth OR 1,000 transforms) |
| Image file size limit (free) | 10 MB per file |
| Unsigned upload | No backend needed; upload preset enforces rules |
| Config | `cloudinaryCloudName` + `cloudinaryUploadPreset` in `src/config/site.ts` |
| Feature flag | `features.cloudinaryUpload: true` |

When enabled, the wizard uploads files to Cloudinary first → receives URL array →
submits URLs as plain text fields to Formspree (JSON, no multipart). This also reduces
Formspree payload size.

```typescript
// No SDK needed — direct REST API
async function uploadToCloudinary(file: File, cloudName: string, uploadPreset: string): Promise<string> {
  const form = new FormData()
  form.append('file', file)
  form.append('upload_preset', uploadPreset)
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: form,
  })
  const data = await res.json()
  return data.secure_url as string
}
```

**No new install for Cloudinary path.**

---

## Installation

```bash
# Required for v1.2
npm install react-dropzone

# Optional: only if interactive Google Maps chosen over iframe embed
npm install @vis.gl/react-google-maps
```

---

## Alternatives Considered

| Recommended | Alternative | Why Not |
|-------------|-------------|---------|
| RHF `FormProvider` (native) | rhf-wizard, react-multistep | External libs add 5–15 KB for functionality RHF already provides natively; template ships leaner |
| Native `<input type="range">` | rc-slider, @radix-ui/react-slider | FinancingCalculator already proves the native pattern works; no additional dep justified |
| Maps Embed API iframe | @vis.gl/react-google-maps (default) | React library adds ~35 KB to bundle; iframe is zero-cost, pre-renders cleanly, sufficient for "service area" use case |
| react-dropzone | FilePond, Uppy | react-dropzone is ~8 KB (hook-only, no opinionated UI); FilePond (~50 KB) and Uppy (~130 KB) are far heavier |
| Formspree multipart (native) | Cloudinary as default | Formspree is the existing provider; multipart avoids new external service dependency for core feature; Cloudinary is an opt-in enhancement |

---

## What NOT to Add

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| little-state-machine | RHF official docs mention it for wizard examples but it's unnecessary — local `useState` is sufficient for a 4-step wizard | `useState` + `FormProvider` |
| react-select | Overkill for single service dropdown in wizard step 1 | Native `<select>` styled with Tailwind (already used in ContactForm) |
| google-map-react (old) | Last meaningful update 2022; React 19 peer dep broken | @vis.gl/react-google-maps if interactive map is needed |
| react-google-maps (tomchentw) | Abandoned, peer dep requires React 15/16 | @vis.gl/react-google-maps |
| @cloudinary/react SDK | ~180 KB; requires full SDK for upload-only use case; signed uploads require backend | Direct fetch to REST API with unsigned preset |
| filepond / react-filepond | ~50 KB; imports external CSS that clashes with Tailwind v4 | react-dropzone (hook-only, no CSS) |
| Zod (new install) | Already installed at ^4.3.6 | Use existing installation; add per-step schemas to `src/lib/schemas.ts` |

---

## Stack Patterns by Configuration

**Default config (Formspree free plan, no API keys):**
- Multi-step wizard works; photos emailed as attachments to business owner
- Google Maps section hidden (feature flag off)
- Cost estimator active with config-driven ranges

**Buyer adds Google Maps API key:**
- Set `googleMapsApiKey` in `src/config/site.ts`
- Set `features.googleMaps: true`
- Maps Embed API iframe renders on city pages; zero install
- Upgrade to `@vis.gl/react-google-maps` if custom markers needed

**Buyer upgrades to Formspree paid plan:**
- No code change; Formspree handles free vs. paid transparently
- Photos become accessible in Formspree dashboard with URL links

**Buyer wants Cloudinary CDN photo storage:**
- Set `cloudinaryCloudName` + `cloudinaryUploadPreset` in `src/config/site.ts`
- Set `features.cloudinaryUpload: true`
- Wizard uploads to Cloudinary first, submits URLs to Formspree
- No new npm package; direct fetch REST API

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| react-dropzone@15.0.0 | react@^19.2.4 | Peer dep `>= 16.8` — React 19 included; PR #1422 confirmed (closed Feb 2026) |
| @vis.gl/react-google-maps@1.7.1 | react@^19.2.4 | React 19 support fixed in v1.4.1 (Nov 2024); v1.7.1 is current stable |
| react-hook-form@7.71.2 | react@^19.2.4 | Already installed; multi-step via FormProvider is native |
| zod@4.3.6 | @hookform/resolvers@5.2.2 | Already installed; per-step schemas add zero new deps |

---

## Sources

- npm registry (live query): `npm info react-dropzone version` → `15.0.0`
- npm registry (live query): `npm info @vis.gl/react-google-maps version` → `1.7.1`
- [react-dropzone PR #1422](https://github.com/react-dropzone/react-dropzone/pull/1422) — React 19 peer dep confirmed included; PR closed Feb 2026 — HIGH confidence
- [visgl/react-google-maps issue #596](https://github.com/visgl/react-google-maps/issues/596) — React 19 fixed in v1.4.1; issue closed — HIGH confidence
- [react-hook-form Advanced Usage / Wizard Forms](https://react-hook-form.com/advanced-usage) — FormProvider + useFormContext + trigger() pattern — HIGH confidence
- [Google Maps Embed API overview](https://developers.google.com/maps/documentation/embed/get-started) — free, unlimited usage, API key required — HIGH confidence
- [Formspree file uploads blog](https://formspree.io/blog/file-upload-form/) — multipart/form-data, 10 files / 25 MB each / 100 MB total — HIGH confidence
- [Cloudinary client-side uploading docs](https://cloudinary.com/documentation/client_side_uploading) — unsigned preset, no backend required — HIGH confidence
- [Cloudinary free plan](https://cloudinary.com/pricing) — 25 credits/month, 10 MB image limit — MEDIUM confidence (pricing pages change; verify before quoting to buyers)
- [react-google-maps Docs: Get Started](https://visgl.github.io/react-google-maps/docs/get-started) — APIProvider/Map/AdvancedMarker API confirmed — HIGH confidence

---

*Stack research for: Home Services Template v1.2 Feature Expansion*
*Researched: 2026-03-05*
