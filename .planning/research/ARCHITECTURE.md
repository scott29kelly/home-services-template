# Architecture Patterns

**Domain:** Config-driven premium home services website template
**Researched:** 2026-03-05
**Milestone:** v1.2 — Feature Expansion (multi-step quote wizard, cost estimator, Google Maps embed, photo upload)
**Confidence:** HIGH

---

## Table of Contents

1. [Current Architecture Summary](#current-architecture-summary)
2. [New Feature Integration Map](#new-feature-integration-map)
3. [Feature 1: Multi-Step Quote Wizard](#feature-1-multi-step-quote-wizard)
4. [Feature 2: Project Cost Estimator](#feature-2-project-cost-estimator)
5. [Feature 3: Google Maps Embed](#feature-3-google-maps-embed)
6. [Feature 4: Photo Upload](#feature-4-photo-upload)
7. [System Overview After v1.2](#system-overview-after-v12)
8. [Component Boundaries](#component-boundaries)
9. [Data Flow](#data-flow)
10. [Build Order](#build-order)
11. [Anti-Patterns to Avoid](#anti-patterns-to-avoid)
12. [Sources](#sources)

---

## Current Architecture Summary

The existing system (v1.1) is a **static pre-rendered React Router 7 framework mode app** deployed on Vercel. Key constraints that govern all new feature integration:

- `ssr: false` in `react-router.config.ts` — no server-side code runs at request time
- All routes pre-rendered to HTML at build time via the `prerender()` function
- All interactivity runs client-side after hydration
- Config-first: non-technical users change behavior by editing `src/config/*.ts` files only
- Form submission: `submitForm()` in `src/lib/form-handler.ts` routes to Formspree/webhook/none
- No state management library — local `useState` handles all per-component state
- React Hook Form + Zod used for all form validation (contact, booking)
- Code splitting: `React.lazy` + `Suspense fallback={null}` wraps all page components in routes

**Existing form pipeline:**

```
User fills form
    ↓
React Hook Form (validates with Zod schema)
    ↓
submitForm() in form-handler.ts
    ↓
Formspree / webhook / console.log
    ↓
navigate('/thank-you')
```

---

## New Feature Integration Map

| Feature | New Route | New Config | New Components | Touches Existing |
|---------|-----------|------------|----------------|-----------------|
| Multi-step quote wizard | `src/routes/get-quote.tsx` (NEW) | `src/config/quote.ts` (NEW) | `QuoteWizard`, step components, `StepIndicator` | `routes.ts`, `react-router.config.ts`, `features.ts`, `forms.ts`, `form-handler.ts`, `schemas.ts`, `navigation.ts` |
| Cost estimator | Embedded in `/get-quote` step 2 | `src/config/quote.ts` cost ranges | `CostEstimator` | `financing.ts` (read-only link), `FinancingCalculator` (display only, no code change) |
| Google Maps embed | Embedded in `CityPage.tsx` and optionally `Contact.tsx` | `src/config/maps.ts` (NEW) or field in `company.ts` | `GoogleMapEmbed` | `CityPage.tsx`, `service-areas.ts` (optional embed URL per city), `features.ts` |
| Photo upload | Step 3 of quote wizard | `src/config/quote.ts` | `PhotoUpload` | `form-handler.ts` (multipart), `schemas.ts` (file validation) |

---

## Feature 1: Multi-Step Quote Wizard

### Route and pre-rendering

Add `/get-quote` as a new static route. No dynamic segments — it pre-renders as a single HTML file.

**`src/routes.ts` change:**
```typescript
route('get-quote', 'routes/get-quote.tsx'),
```

**`react-router.config.ts`:** No change required. `getStaticPaths()` auto-discovers routes without dynamic segments. `/get-quote` will be included automatically.

**`src/routes/get-quote.tsx`** follows the same lazy-loading pattern as all other routes:
```typescript
import { lazy, Suspense } from 'react'
const QuoteWizard = lazy(() => import('../pages/QuoteWizard'))

export default function GetQuoteRoute() {
  return (
    <Suspense fallback={null}>
      <QuoteWizard />
    </Suspense>
  )
}
```

### State management pattern

Use a single `useReducer` at the `QuoteWizard` page level — not React Context. The wizard is self-contained on one page; Context is overkill for a 4-step form on a single route. React Hook Form manages field-level validation per step.

```typescript
type WizardState = {
  step: 0 | 1 | 2 | 3
  data: Partial<QuoteFormData>
}

type WizardAction =
  | { type: 'NEXT'; payload: Partial<QuoteFormData> }
  | { type: 'BACK' }
  | { type: 'GO_TO'; step: number }

function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case 'NEXT':
      return { step: Math.min(3, state.step + 1) as 0|1|2|3, data: { ...state.data, ...action.payload } }
    case 'BACK':
      return { ...state, step: Math.max(0, state.step - 1) as 0|1|2|3 }
    case 'GO_TO':
      return { ...state, step: action.step as 0|1|2|3 }
    default:
      return state
  }
}
```

**Why not React Context:** The wizard is a single page component. Context adds indirection without benefit when there is no sibling-to-sibling communication needed across the component tree.

**Why not a single React Hook Form instance across all steps:** Per-step Zod schemas with RHF's `trigger()` work correctly when each step mounts its own `useForm` instance using `defaultValues` seeded from `wizardState.data`. This avoids managing a mega-schema with conditional validation for fields not yet visible.

### Step architecture

Each step is a separate component with its own `useForm` instance:

```
src/
  components/
    forms/
      QuoteWizard/
        index.tsx          ← QuoteWizard (useReducer, step orchestration)
        StepIndicator.tsx  ← Visual step progress bar
        Step1Service.tsx   ← Service selection + service details
        Step2Details.tsx   ← Property details + cost estimator widget
        Step3Photos.tsx    ← Photo upload (optional)
        Step4Contact.tsx   ← Name, email, phone + submit
```

**Step flow:**

```
Step 1: Service Selection
  - Which service? (Roofing / Siding / Storm Damage)
  - Project type? (Repair / Full replacement / Inspection)
  - Zod schema: { service, projectType }

        ↓

Step 2: Property Details + Cost Preview
  - Property address
  - Approximate square footage (optional)
  - CostEstimator widget (read-only display, updates on service selection from Step 1)
  - Zod schema: { address, squareFootage? }

        ↓

Step 3: Photos (Optional)
  - "Upload photos of your damage" (optional, skip allowed)
  - File list preview
  - Up to 5 photos, each ≤ 10MB
  - Zod schema: { photos?: File[] }

        ↓

Step 4: Contact Information
  - First/last name, email, phone
  - Additional notes (optional)
  - Final submit
  - Zod schema: contactSchema subset (firstName, lastName, email, phone, notes?)
```

### Config additions

New file `src/config/quote.ts`:

```typescript
export const quote = {
  wizard: {
    heading: 'Get Your Free Quote',
    subheading: 'Takes less than 2 minutes. No obligation.',
    steps: [
      { label: 'Service', description: 'What do you need?' },
      { label: 'Details', description: 'About your property' },
      { label: 'Photos', description: 'Show us the damage (optional)' },
      { label: 'Contact', description: 'How to reach you' },
    ],
  },
  projectTypes: {
    roofing: ['Full Replacement', 'Repair', 'Inspection', 'Storm Damage'],
    siding: ['Full Replacement', 'Repair', 'Storm Damage'],
    'storm-damage': ['Emergency Inspection', 'Insurance Claim', 'Repair'],
  },
  photos: {
    maxFiles: 5,
    maxSizeMB: 10,
    acceptedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/heic'],
    instructions: 'Upload photos of the damage area. This helps us prepare an accurate estimate.',
  },
  costRanges: {
    roofing: {
      repair: { min: 300, max: 1500, label: 'Typical repair range' },
      replacement: { min: 8000, max: 25000, label: 'Typical replacement range' },
      inspection: { min: 0, max: 0, label: 'Free inspection' },
    },
    siding: {
      repair: { min: 500, max: 3000, label: 'Typical repair range' },
      replacement: { min: 6000, max: 20000, label: 'Typical replacement range' },
    },
    'storm-damage': {
      repair: { min: 1000, max: 15000, label: 'Depends on damage severity' },
      inspection: { min: 0, max: 0, label: 'Free inspection' },
    },
  },
}
```

**Why a new `quote.ts` rather than extending `forms.ts`:** `forms.ts` handles submission config (Formspree ID, webhook URL). `quote.ts` handles wizard UI content and cost ranges — different concerns. `forms.ts` stays backwards-compatible.

### Schema additions to `schemas.ts`

Add a `quoteSchema` that represents the full merged payload at submission:

```typescript
export const quoteSchema = z.object({
  service: z.string().min(1),
  projectType: z.string().min(1),
  address: z.string().min(1),
  squareFootage: z.string().optional(),
  photos: z.array(z.instanceof(File)).max(5).optional(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().regex(phoneRegex),
  notes: z.string().optional(),
  _gotcha: z.string().optional(),
})

export type QuoteFormData = z.infer<typeof quoteSchema>
```

Per-step schemas are subsets of `QuoteFormData` used only for `trigger()` validation.

### Submission: `form-handler.ts` changes

Photos require `multipart/form-data` encoding — the existing `submitForm()` uses `application/json`. Two options exist:

**Option A — Separate `submitQuote()` function (recommended):** Add a new export alongside the existing `submitForm()`. This preserves backwards compatibility and handles the multipart case cleanly.

```typescript
export async function submitQuote(data: QuoteFormData): Promise<SubmissionResult> {
  const { provider, formspreeId, webhookUrl } = forms.submission

  if (data._gotcha) return { ok: true }

  const formData = new FormData()
  // Append text fields
  const { photos, _gotcha, ...textFields } = data
  for (const [key, value] of Object.entries(textFields)) {
    if (value !== undefined) formData.append(key, String(value))
  }
  // Append files
  photos?.forEach((file, i) => formData.append(`photo_${i}`, file))

  if (provider === 'formspree' && formspreeId) {
    const res = await fetch(`https://formspree.io/f/${formspreeId}`, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      // No Content-Type — browser sets multipart boundary automatically
      body: formData,
    })
    if (!res.ok) throw new Error('Submission failed')
    return { ok: true }
  }
  // webhook, netlify, console fallback...
}
```

**Option B — Extend `submitForm()` with a `multipart` flag:** Works but adds complexity to an already clean function. Not recommended.

### Feature flag

Add to `src/config/features.ts`:
```typescript
quoteWizard: true,  // Enables /get-quote route + nav link
```

### Navigation

The quote wizard should be accessible from primary CTAs. Add a CTA link in navigation config if `features.quoteWizard` is true. Consider making "Get a Quote" the primary CTA in the nav, replacing or supplementing the existing `/contact` link.

---

## Feature 2: Project Cost Estimator

### Architecture decision

The cost estimator is NOT a standalone page — it is a **component embedded in Step 2 of the quote wizard**. It reads the service and project type selected in Step 1 and displays a cost range. No route change needed.

**Why not merge with `FinancingCalculator`:** `FinancingCalculator` is a slider that computes monthly payments from a loan amount. The cost estimator provides upfront project cost ranges by service type. They are complementary — the estimator informs what amount to enter into the financing calculator. They remain separate components.

### Component

```
src/components/ui/CostEstimator.tsx
```

```typescript
interface CostEstimatorProps {
  service: string        // 'roofing' | 'siding' | 'storm-damage'
  projectType: string    // 'replacement' | 'repair' | 'inspection' etc.
}
```

The component reads `quote.costRanges[service][projectType]` and renders a visual cost range card. It is purely presentational — no state, no hooks beyond `useScrollReveal`.

**Integration with Financing page:** The estimator stands alone in the wizard. The `Financing` page remains unchanged. A "See financing options" link from the estimator pointing to `/financing` is sufficient cross-linking.

### Config

Cost ranges live in `src/config/quote.ts` (defined above). This keeps all wizard-related configuration in one file. No changes to `financing.ts` needed.

---

## Feature 3: Google Maps Embed

### Two embed strategies

**Strategy A — Maps Embed API (requires API key, free):** Uses `https://www.google.com/maps/embed/v1/place?key=API_KEY&q=ADDRESS`. Fully interactive, supports custom zoom. Unlimited free usage. Requires Google Cloud project + API key in config.

**Strategy B — Share iframe embed (no API key):** Uses the iframe code from Google Maps' "Share > Embed a map" button. Hard-coded URL per location. Simpler but manual — each city would need a manually generated embed URL.

**Recommendation: Strategy A for the headquarters map (Contact page), Strategy B fallback for city pages.**

For city pages, 20 cities × a manually generated embed URL is feasible but tedious. Use the API key approach for all if the user provides one, with a graceful degradation (no map shown) if no key is configured.

### Config

Add `googleMaps` to `src/config/company.ts` (co-located with address data):

```typescript
export const company = {
  // ...existing fields...
  googleMaps: {
    /** Maps Embed API key — get free key at console.cloud.google.com */
    apiKey: '',
    /** Default zoom level for city page maps (1-21, 13 = neighborhood) */
    defaultZoom: 13,
    /** Map type: 'roadmap' | 'satellite' | 'terrain' | 'hybrid' */
    mapType: 'roadmap' as const,
  },
}
```

Feature flag in `features.ts`:
```typescript
googleMaps: false,  // Set to true when apiKey is configured
```

**Why not a separate `maps.ts`:** The Maps API key is infrastructure config related to company identity (address). The `company.ts` file already owns address data. Co-locating the maps API key there is coherent. If maps config grows (custom markers, styles), extract to `maps.ts` then.

### Component

```
src/components/ui/GoogleMapEmbed.tsx
```

```typescript
interface GoogleMapEmbedProps {
  address: string          // "123 Main St, Anytown, TX 78701"
  zoom?: number            // defaults to company.googleMaps.defaultZoom
  height?: string          // Tailwind height class, default 'h-64'
  title?: string           // iframe title for accessibility
}

export default function GoogleMapEmbed({ address, zoom, height = 'h-64', title }: GoogleMapEmbedProps) {
  const { apiKey, defaultZoom, mapType } = company.googleMaps
  if (!apiKey || !features.googleMaps) return null

  const src = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent(address)}&zoom=${zoom ?? defaultZoom}&maptype=${mapType}`

  return (
    <div className={`w-full ${height} rounded-2xl overflow-hidden border border-border`}>
      <iframe
        src={src}
        width="100%"
        height="100%"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title={title ?? `Map showing ${address}`}
        className="border-0"
      />
    </div>
  )
}
```

**`loading="lazy"`:** Critical for performance — city pages have 20 instances if maps are enabled on each. Lazy loading prevents 20 simultaneous iframe loads on the service areas index.

### Integration points

**Contact page (`src/pages/Contact.tsx`):** Add `<GoogleMapEmbed address={company.address.full} />` in the sidebar below the address info block. Conditional on `features.googleMaps`.

**City page (`src/pages/CityPage.tsx`):** Add a map section after the "Services We Offer" section. The city address is `${city.name}, ${city.state}` — no street address exists for city pages, so the search is by city+state which maps correctly.

**CityConfig** (`src/config/service-areas.ts`): Optionally add an `embedUrl` field per city for the no-API-key fallback (Strategy B). Only needed if `apiKey` is empty and the operator wants maps on city pages regardless.

### Static pre-rendering: no impact

`GoogleMapEmbed` renders `null` on the server if `apiKey` is empty (which it is in the template default). After hydration the iframe appears. This is correct behavior — the pre-rendered HTML has no iframe, the client hydrates and conditionally renders it. No pre-rendering config changes needed.

---

## Feature 4: Photo Upload

### Architecture: client-side only, submission via multipart

Photos are selected in the browser using `<input type="file">`, previewed using `URL.createObjectURL()`, and submitted as `File` objects in a `FormData` payload. No server-side storage is involved in the template itself — files go to Formspree (which stores them) or to a webhook endpoint.

**Why `URL.createObjectURL()` over `FileReader.readAsDataURL()`:**
- `createObjectURL()` is synchronous, returns a blob URL immediately
- No memory overhead from base64 encoding (33% larger than binary)
- Must call `URL.revokeObjectURL()` on unmount to prevent memory leaks
- `FileReader` is only needed if storing as base64 (localStorage, JSON payload) — not needed here since we use FormData

### Component

```
src/components/forms/PhotoUpload.tsx
```

```typescript
interface PhotoUploadProps {
  value: File[]
  onChange: (files: File[]) => void
  maxFiles?: number       // from quote.photos.maxFiles
  maxSizeMB?: number      // from quote.photos.maxSizeMB
  acceptedTypes?: string  // MIME types joined as comma string
}
```

Internal state: array of `{ file: File; previewUrl: string }` objects. Preview URLs are created on file add and revoked on file remove or unmount.

```typescript
function PhotoUpload({ value, onChange, maxFiles = 5, maxSizeMB = 10 }: PhotoUploadProps) {
  const [previews, setPreviews] = useState<{ file: File; previewUrl: string }[]>([])

  const addFiles = (newFiles: FileList) => {
    const valid = Array.from(newFiles).filter(f => f.size <= maxSizeMB * 1024 * 1024)
    const withPreviews = valid.map(file => ({ file, previewUrl: URL.createObjectURL(file) }))
    const merged = [...previews, ...withPreviews].slice(0, maxFiles)
    setPreviews(merged)
    onChange(merged.map(p => p.file))
  }

  useEffect(() => {
    return () => previews.forEach(p => URL.revokeObjectURL(p.previewUrl))
  }, [previews])

  // drag-and-drop + click-to-select UI
}
```

### Integration with the wizard

`Step3Photos.tsx` renders `<PhotoUpload>` as a controlled component. The `QuoteWizard` reducer stores `File[]` in `wizardState.data.photos`. When Step 4 submits, `submitQuote()` serializes files via `FormData`.

**Photos are optional.** Step 3 has a "Skip this step" button that calls `dispatch({ type: 'NEXT', payload: {} })` without adding photos. Zod schema: `photos: z.array(z.instanceof(File)).max(5).optional()`.

### Formspree file upload requirements

- Must use `multipart/form-data` (not `application/json`)
- Do NOT set `Content-Type` header manually — let the browser set the boundary
- Each file is a separate form field: `formData.append('photo_0', file)` etc.
- Formspree stores files and includes download links in the submission dashboard
- File upload requires a Formspree Gold plan or higher (verify with operator — template defaults to `none` provider anyway, so the console.log fallback works in demo mode)

**Webhook alternative:** If using a webhook, the same `FormData` approach works. The receiving endpoint must handle `multipart/form-data`. For demo/no-backend mode, files appear in `console.log` as File objects (not serializable — document this limitation).

### Schema update

`z.instanceof(File)` requires careful handling in pre-rendered context. Because the route hydrates client-side, `File` is available when the schema runs. No SSR issue since `ssr: false`. But add a guard:

```typescript
const fileSchema = typeof File !== 'undefined'
  ? z.instanceof(File)
  : z.any()  // Server-side fallback (pre-render context)
```

---

## System Overview After v1.2

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Config Layer (src/config/)                       │
│  company.ts   services.ts   quote.ts (NEW)   features.ts   forms.ts     │
│  financing.ts   service-areas.ts   ...                                   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          Route Layer (src/routes/)                        │
│  home   contact   financing   service-areas/:slug   get-quote (NEW)      │
│  Each: lazy-loaded page component wrapped in Suspense                    │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          Page Layer (src/pages/)                          │
│  QuoteWizard.tsx (NEW)                                                   │
│  Contact.tsx (+ GoogleMapEmbed)   CityPage.tsx (+ GoogleMapEmbed)        │
│  Financing.tsx (unchanged)                                               │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        Component Layer (src/components/)                  │
│  forms/                                                                  │
│    QuoteWizard/                                                          │
│      index.tsx (NEW) — useReducer orchestrator                           │
│      StepIndicator.tsx (NEW)                                             │
│      Step1Service.tsx (NEW)                                              │
│      Step2Details.tsx (NEW) — embeds CostEstimator                       │
│      Step3Photos.tsx (NEW) — embeds PhotoUpload                          │
│      Step4Contact.tsx (NEW)                                              │
│    PhotoUpload.tsx (NEW)                                                 │
│    ContactForm.tsx (unchanged)   BookingForm.tsx (unchanged)             │
│  ui/                                                                     │
│    CostEstimator.tsx (NEW)                                               │
│    GoogleMapEmbed.tsx (NEW)                                              │
│    FinancingCalculator.tsx (unchanged)                                   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          Lib Layer (src/lib/)                             │
│  form-handler.ts — ADD submitQuote() (multipart FormData)                │
│  schemas.ts — ADD quoteSchema + per-step schemas                         │
│  (all other lib files unchanged)                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        External Services                                  │
│  Formspree (multipart) — quote wizard submissions with photos            │
│  Google Maps Embed API — free, API key in company.googleMaps.apiKey      │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Component Boundaries

| Component | Responsibility | Owns State | Communicates With |
|-----------|----------------|------------|-------------------|
| `QuoteWizard` (page) | Step orchestration, accumulated data, final submit | `wizardState` via `useReducer` | All step components (props down), `submitQuote()` |
| `StepIndicator` | Visual progress display | None | Receives `currentStep`, `totalSteps` as props |
| `Step1Service` | Service + project type selection | Own `useForm` | Returns data to parent via `onNext(data)` |
| `Step2Details` | Address, sq footage, cost preview | Own `useForm` | Returns data via `onNext(data)`, reads Step 1 data from props |
| `Step3Photos` | Photo selection and preview | Own `useState` for previews | Returns `File[]` via `onChange`, skip-capable |
| `Step4Contact` | Contact fields + final submit | Own `useForm` | Triggers `submitQuote()` via parent |
| `PhotoUpload` | File input, preview grid, remove | Preview blob URLs in `useState` | Controlled by parent via `value`/`onChange` |
| `CostEstimator` | Display cost range for service+type | None (pure display) | Reads `quote.costRanges` from config |
| `GoogleMapEmbed` | Render iframe conditionally | None | Reads `company.googleMaps`, `features.googleMaps` |

---

## Data Flow

### Quote Wizard Data Flow

```
User selects service (Step 1)
    ↓
Step1Service.useForm validates { service, projectType }
    ↓
onNext(data) → dispatch({ type: 'NEXT', payload: data })
    ↓
wizardState.data = { service, projectType }
    ↓
Step2Details receives wizardState.data.service as prop
  → CostEstimator reads quote.costRanges[service][projectType]
  → Displays price range to user
    ↓
Step2Details.useForm validates { address, squareFootage? }
    ↓
onNext(data) → dispatch({ type: 'NEXT', payload: data })
    ↓
wizardState.data = { service, projectType, address, squareFootage }
    ↓
Step3Photos receives onChange callback
  → User selects files → URL.createObjectURL() previews
  → onNext(files) → dispatch({ type: 'NEXT', payload: { photos: files } })
    ↓
wizardState.data = { ...prev, photos: File[] }
    ↓
Step4Contact.useForm validates { firstName, lastName, email, phone, notes? }
    ↓
handleSubmit → merge wizardState.data + contact fields
    ↓
submitQuote(fullData) → FormData → Formspree (multipart) or webhook
    ↓
navigate('/thank-you')
```

### Google Maps Data Flow

```
Build time: company.googleMaps.apiKey read from config
    ↓
Static HTML pre-rendered (no iframe — apiKey is '' in template)
    ↓
Client hydration: GoogleMapEmbed checks features.googleMaps + apiKey
    ↓
If enabled: renders <iframe src="maps.googleapis.com/maps/embed/v1/place?key=...">
    ↓
Browser loads iframe lazily (loading="lazy")
    ↓
Google Maps tile server serves the interactive map
```

### Cost Estimator Data Flow

```
Step 1 selection: service = 'roofing', projectType = 'replacement'
    ↓
CostEstimator receives { service, projectType } as props
    ↓
Reads: quote.costRanges['roofing']['replacement']
    → { min: 8000, max: 25000, label: 'Typical replacement range' }
    ↓
Renders: "$8,000 – $25,000 typical replacement range"
    ↓
Link: "See financing options →" pointing to /financing
    ↓
No state, no API calls — pure config lookup
```

---

## Build Order

Dependencies flow downward. Build in this order to avoid blocked work:

### Phase A: Foundation (build first, unblocks everything)

1. **`src/config/quote.ts`** — New config file. No deps. Enables cost estimator data and wizard copy.
2. **`src/lib/schemas.ts` additions** — Add `quoteSchema` and per-step schemas. Depends on `quote.ts` for type references.
3. **`src/config/features.ts` additions** — Add `quoteWizard: true` and `googleMaps: false` flags.

### Phase B: Atomic UI components (can build in parallel after Phase A)

4. **`src/components/ui/CostEstimator.tsx`** — Pure display component. Depends on `quote.ts`. No wizard dependency.
5. **`src/components/ui/GoogleMapEmbed.tsx`** — Pure display component. Depends on `company.ts` and `features.ts`.
6. **`src/components/forms/PhotoUpload.tsx`** — Controlled file input component. Depends only on React APIs.

### Phase C: Quote Wizard step components (build sequentially, each depends on prior)

7. **`Step1Service.tsx`** — First step. Depends on `services` config and `quote.ts` projectTypes.
8. **`Step2Details.tsx`** — Depends on Step 1 output shape. Embeds `CostEstimator` (Phase B).
9. **`Step3Photos.tsx`** — Depends on `PhotoUpload` (Phase B) and `quote.photos` config.
10. **`StepIndicator.tsx`** — Visual only. Can build any time after `quote.wizard.steps` config exists.
11. **`Step4Contact.tsx`** — Final step. Depends on `quoteSchema` final fields.

### Phase D: Wizard orchestration (build after Phase C)

12. **`src/components/forms/QuoteWizard/index.tsx`** — Assembles all steps with `useReducer`. Depends on all step components.

### Phase E: Submission pipeline (build after Phase D)

13. **`src/lib/form-handler.ts` — add `submitQuote()`** — Add alongside existing `submitForm()`. Depends on `forms.ts` (reads `provider`, `formspreeId`).

### Phase F: Route and navigation wiring (build last)

14. **`src/pages/QuoteWizard.tsx`** — Page wrapper with `PageMeta`, `Hero` (compact), and the wizard. Depends on the wizard component.
15. **`src/routes/get-quote.tsx`** — Lazy-loading route wrapper. Depends on page.
16. **`src/routes.ts` update** — Add `route('get-quote', ...)`. Immediately enables the route.
17. **Navigation update** — Add "Get a Quote" link to nav config if feature-flagged.

### Phase G: Google Maps integration (independent, can slot after Phase B)

18. **`src/config/company.ts` update** — Add `googleMaps: { apiKey, defaultZoom, mapType }` field.
19. **`src/config/schema.ts` update** — Extend `companySchema` with `googleMaps` Zod shape.
20. **`src/pages/Contact.tsx` update** — Add `<GoogleMapEmbed>` in the sidebar.
21. **`src/pages/CityPage.tsx` update** — Add map section with `<GoogleMapEmbed address={city.name + ', ' + city.state}>`.

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Single `useForm` instance spanning all wizard steps

**What people do:** Create one `useForm` with the full `quoteSchema`, render all fields, hide non-current steps with CSS, validate the whole form on each "Next" click.

**Why it's wrong:** React Hook Form tracks touched/dirty state per field. Hidden fields accumulate errors the user cannot see. Validation on submit fires against all fields including those in hidden steps. CSS-hidden form fields still participate in the DOM which causes accessibility issues (screen readers reach them).

**Do this instead:** Each step owns its own `useForm` instance with only the fields for that step. The wizard orchestrator collects data from each step via `onNext(data)` callbacks and merges into `wizardState.data`. Final submission assembles the merged object.

### Anti-Pattern 2: FileReader.readAsDataURL for photo previews

**What people do:** Use `FileReader.readAsDataURL()` to create base64 preview strings, store them in state, pass them to `<img src={base64}>`.

**Why it's wrong:** Base64 encoding inflates file size by 33%. For 5 × 10MB photos, this means 66MB held in memory as strings. `FileReader` is async and requires callback management. The base64 string also cannot be used with `URL.revokeObjectURL()` so memory leaks are common.

**Do this instead:** `URL.createObjectURL(file)` returns a blob URL synchronously. Revoke it with `URL.revokeObjectURL(url)` on component unmount or file removal.

### Anti-Pattern 3: Sending files via `application/json` with base64 payload

**What people do:** Encode photos as base64, include them in a JSON body, send to Formspree or webhook.

**Why it's wrong:** JSON endpoints (Formspree's JSON handler) reject file payloads. Base64 in JSON bodies blows up payload size. CORS preflight triggers on custom headers. Formspree's file upload feature specifically requires `multipart/form-data`.

**Do this instead:** Use `FormData` with `Content-Type` omitted. The browser auto-sets `multipart/form-data` with the correct boundary string.

### Anti-Pattern 4: Hardcoding Google Maps API key in component

**What people do:** Paste the API key directly in the component: `const API_KEY = 'AIzaSy...'`.

**Why it's wrong:** API key is committed to source control. Cannot be changed without a code deploy. Cannot be feature-flagged.

**Do this instead:** Store in `company.ts` config (as documented above). Read in the component from config. The key is still client-visible (all Maps Embed API keys are, by design), but the config location makes it easy to rotate and is consistent with the project's config-first philosophy.

### Anti-Pattern 5: Using React Context for wizard state

**What people do:** Wrap the wizard in a `QuoteWizardContext.Provider` with all wizard state, so step components can call `useQuoteWizard()` to access and mutate state.

**Why it's wrong:** For a 4-step wizard on a single page, Context adds indirection without benefit. Props + callbacks are explicit and traceable. Context causes all consuming components to re-render on any state change, even if only one field changed. Debugging is harder because data flow is implicit.

**Do this instead:** `useReducer` in the top-level `QuoteWizard` orchestrator component. Pass data down as props, callbacks up as `onNext` / `onBack`. The wizard state is localized to one component.

### Anti-Pattern 6: Adding `/get-quote` to the pre-render path list manually

**What people do:** Add `'/get-quote'` to the `prerender()` function's returned array in `react-router.config.ts`.

**Why it's not needed:** The `getStaticPaths()` helper already auto-discovers all routes defined in `routes.ts` that have no dynamic segments. `/get-quote` has no `:slug` — it will be included automatically. Manual addition causes no harm (RR7 deduplicates) but adds maintenance overhead.

**Do this instead:** Just add the route to `routes.ts`. Pre-rendering picks it up automatically.

---

## Integration Points: New vs Modified

### New files (create from scratch)

| File | Purpose |
|------|---------|
| `src/config/quote.ts` | Wizard UI copy, project types, cost ranges, photo constraints |
| `src/components/forms/QuoteWizard/index.tsx` | Wizard orchestrator with useReducer |
| `src/components/forms/QuoteWizard/StepIndicator.tsx` | Progress indicator |
| `src/components/forms/QuoteWizard/Step1Service.tsx` | Service + project type selection step |
| `src/components/forms/QuoteWizard/Step2Details.tsx` | Property details + cost preview step |
| `src/components/forms/QuoteWizard/Step3Photos.tsx` | Photo upload step |
| `src/components/forms/QuoteWizard/Step4Contact.tsx` | Contact info + submit step |
| `src/components/forms/PhotoUpload.tsx` | Reusable file input + preview component |
| `src/components/ui/CostEstimator.tsx` | Pure config-driven cost range display |
| `src/components/ui/GoogleMapEmbed.tsx` | Conditional iframe wrapper |
| `src/pages/QuoteWizard.tsx` | Page with PageMeta + Hero + QuoteWizard component |
| `src/routes/get-quote.tsx` | Lazy-loading route wrapper |

### Modified files (targeted additions, no rewrites)

| File | Change | Risk |
|------|--------|------|
| `src/routes.ts` | Add one `route('get-quote', ...)` line | Minimal |
| `src/config/features.ts` | Add `quoteWizard: boolean` and `googleMaps: boolean` | Minimal |
| `src/config/company.ts` | Add `googleMaps: { apiKey, defaultZoom, mapType }` field | Low — new field, existing code unaffected |
| `src/config/schema.ts` | Extend `companySchema` with `googleMaps` Zod shape | Low — additive |
| `src/lib/schemas.ts` | Add `quoteSchema`, per-step schemas, export types | Low — additive |
| `src/lib/form-handler.ts` | Add `submitQuote()` export alongside `submitForm()` | Low — additive |
| `src/pages/Contact.tsx` | Add `<GoogleMapEmbed>` in sidebar, conditional on feature flag | Low |
| `src/pages/CityPage.tsx` | Add map section with `<GoogleMapEmbed>`, conditional on feature flag | Low |
| `src/config/index.ts` | Export `quote` from barrel (if quote.ts added to validated exports) | Minimal |

---

## Sources

- [React Router 7 Pre-rendering docs](https://reactrouter.com/how-to/pre-rendering) — HIGH confidence (official)
- [Maps Embed API overview](https://developers.google.com/maps/documentation/embed/get-started) — HIGH confidence (official)
- [Maps Embed API usage and billing](https://developers.google.com/maps/documentation/embed/usage-and-billing) — HIGH confidence (official, free + unlimited)
- [Building reusable multi-step form with RHF and Zod — LogRocket](https://blog.logrocket.com/building-reusable-multi-step-form-react-hook-form-zod/) — MEDIUM confidence (verified against RHF docs)
- [Formspree file upload](https://formspree.io/blog/file-upload-form/) — MEDIUM confidence (official Formspree blog)
- [FileReader vs URL.createObjectURL — react.wiki](https://react.wiki/hooks/file-upload-hook/) — MEDIUM confidence (multiple sources agree)

---

*Architecture research for: v1.2 Feature Expansion — multi-step quote wizard, cost estimator, Google Maps embed, photo upload*
*Researched: 2026-03-05*
