# Pitfalls Research

**Domain:** Premium home services website template — v1.2 Feature Expansion
**Researched:** 2026-03-05
**Confidence:** HIGH (verified against official docs, GitHub issues, and multiple community sources)
**Scope:** Adding multi-step quote wizard, project cost estimator, Google Maps embed, and photo upload to an existing React 19 + RR7 + Vite 7 + Tailwind v4 static pre-rendered template

---

## Critical Pitfalls

---

### Pitfall 1: Quote Wizard State Lost on Browser Back Navigation

**What goes wrong:**
The multi-step wizard lives at a single route (`/get-quote`). Step transitions are controlled by React state — no URL changes. When a user on Step 3 (Photos) hits the browser back button, they expect to go to Step 2 (Details). Instead, they navigate away from `/get-quote` entirely and lose all entered data. The Baymard Institute found 59% of sites get back-button expectations wrong in multi-step flows; this is the most common complaint.

**Why it happens:**
Developers render all wizard steps inside a single component, managing the current step with `useState`. This is the path of least resistance, but the browser history stack has no record of step transitions — only the page navigation to `/get-quote`.

**How to avoid:**
Two options, pick one:

Option A (URL-based steps, recommended): Use query params to encode the step — `/get-quote?step=1`, `/get-quote?step=2`. React Router's `useSearchParams` reads and updates the step. Browser back works naturally, and users can bookmark or share a specific step.

Option B (intercept back navigation): Use `window.history.pushState` on each step transition so the browser has a history entry per step. On `popstate`, decrement the step counter. More complex and fragile than Option A.

Do NOT use URL path segments (`/get-quote/step-1`) — this requires 4 separate routes, 4 pre-rendered HTML files, and complex state handoff across route boundaries.

**Warning signs:**
- Step managed with `useState` only, no URL parameter
- No `useEffect` that syncs step to URL or browser history
- Testing only via clicking the wizard's own Back button, never testing the browser's Back button

**Phase to address:** Quote Wizard phase (implementation start)

---

### Pitfall 2: Google Maps API Key Exposed Without HTTP Referrer Restriction

**What goes wrong:**
The API key for the Maps Embed is placed in the config file (`maps.apiKey`) and rendered into an iframe `src` URL or `<script>` tag. Since this is a static site, the key is visible in the deployed HTML to anyone who views source. An attacker copies the key and uses it to rack up API charges on your billing account. As of 2025, this is even higher risk: if the same Google Cloud project has Gemini enabled, the exposed key can be used for privilege escalation to access AI features and private data.

**Why it happens:**
The Maps Embed API requires the key in the browser request — there is no way to make it server-only. Developers assume "it's just a maps key, not a secret," which was true before Google added AI services to the same credential system. The 2025 Gemini escalation finding (Truffle Security, March 2025) changed the threat model for any Google API key.

**How to avoid:**
1. **Always restrict the key by HTTP referrer** — in the Google Cloud Console, set Application Restrictions to "HTTP referrers (websites)" and add the production domain (e.g., `*.yourdomain.com/*`) plus any staging domains. This ensures the key only works when requests come from your domain.
2. **Restrict the key by API** — under API Restrictions, limit the key to only "Maps Embed API" (or only "Maps JavaScript API" if using the JS SDK). A key scoped only to Maps Embed cannot be used for Gemini, Storage, or other APIs even if someone steals it.
3. **Separate keys per environment** — keep the production key restricted; use a separate unrestricted key for local development (or use the `VITE_` env var pattern so the dev key is never in the repository).
4. **Store in `VITE_GOOGLE_MAPS_KEY` env var** — never hard-code the key in `config/maps.ts`. The config should reference `import.meta.env.VITE_GOOGLE_MAPS_KEY`. Buyers set this in their Vercel environment variables, not in a config file.

Config pattern:
```typescript
// src/config/maps.ts
export const maps = {
  // Never hard-code the key here. Buyers set VITE_GOOGLE_MAPS_KEY in Vercel.
  apiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY ?? '',
  defaultCenter: { lat: 40.7128, lng: -74.006 },
  zoom: 12,
}
```

**Warning signs:**
- API key string appears literally in any `.ts` or `.tsx` file checked into version control
- Key has no HTTP referrer restriction in Google Cloud Console
- Key has access to more APIs than just Maps

**Phase to address:** Google Maps embed phase (before any key is introduced into the codebase)

---

### Pitfall 3: Google Maps Embed Iframe Destroys Lighthouse Performance on City Pages

**What goes wrong:**
A naively embedded Google Maps iframe (`<iframe src="https://www.google.com/maps/embed?...">`) loads approximately 1.2 MB of third-party resources — 342 KB of JavaScript, 417 KB of images, 219 KB of fonts. It initiates 17+ network requests before DOMContentLoaded. On city pages that already have hero images and section content, this kills LCP by an average of 2.8 seconds on 3G (measured), and causes CLS > 0.25 in 89% of cases when no explicit `width`/`height` is set on the iframe. The current template has hard-won desktop Lighthouse scores of 91-99. A bare iframe embed will drop these to the 60s.

**Why it happens:**
The default iframe embed code from Google Maps ("Share > Embed a map") has no `loading`, `width`, or `height` attributes. Copy-paste from the share dialog gives you the naive embed.

**How to avoid:**
Use lazy loading with a static map placeholder pattern:

1. Set `loading="lazy"` on the iframe — defers loading until the user scrolls near the map, saving ~1.2 MB on initial page load.
2. Set explicit `width` and `height` attributes (or equivalent CSS with aspect-ratio) to eliminate CLS.
3. Optional (maximum performance): Replace the iframe with a static placeholder image on initial load. Show a "Click to load map" overlay. On click, swap in the real iframe. This keeps LCP perfect at the cost of a small UX friction.

```tsx
// Minimal viable embed — avoids LCP and CLS regressions
<iframe
  src={`https://www.google.com/maps/embed/v1/place?key=${maps.apiKey}&q=${encodeURIComponent(city.address)}`}
  width="600"
  height="450"
  style={{ border: 0 }}
  loading="lazy"
  referrerPolicy="no-referrer-when-downgrade"
  title={`Map of ${city.name} service area`}
  allowFullScreen
/>
```

**Warning signs:**
- Lighthouse performance score on city pages drops by 15+ points after adding the map
- No `loading="lazy"` on the iframe
- No explicit `width`/`height` on the iframe (CLS will be flagged in PageSpeed)
- City pages are in the Lighthouse test set — test a city page, not just the home page

**Phase to address:** Google Maps embed phase, before shipping city page changes

---

### Pitfall 4: Photo Upload Bypasses Formspree's 4.5 MB Serverless Limit

**What goes wrong:**
Photos are collected in the wizard's Step 3 (Photos). When the form submits, the developer sends the photos as `FormData` to the existing Formspree endpoint. Vercel's serverless function request body limit is 4.5 MB. A single iPhone photo in full resolution is 4-12 MB. The submission silently fails (or returns a 413 error) with no useful message to the user.

**Why it happens:**
The existing contact form submits JSON text fields only — no photos — and works fine under the 4.5 MB limit. The developer carries over the same submission pattern to the quote wizard without accounting for binary file payload size.

**How to avoid:**
Formspree natively supports file uploads when submitted as `multipart/form-data`. The key constraints are: each file is capped at 25 MB, total submission is capped at 100 MB. The 4.5 MB Vercel limit only applies to serverless function request bodies — Formspree's own upload endpoint is not proxied through a Vercel function, so submitting directly to Formspree's endpoint (`https://formspree.io/f/{id}`) avoids the Vercel limit entirely.

Correct implementation:
```typescript
// Submit directly to Formspree, not through a /api/* Vercel function
const formData = new FormData()
formData.append('email', data.email)
formData.append('service', data.service)
// Append each photo file object directly — NOT base64 encoded
data.photos.forEach((file, i) => {
  formData.append(`photo_${i + 1}`, file)
})

await fetch(`https://formspree.io/f/${formspreeId}`, {
  method: 'POST',
  body: formData,
  // Do NOT set Content-Type header — let the browser set multipart/form-data boundary automatically
})
```

Do NOT convert photos to base64 and send as JSON. Base64 encoding inflates file size by ~33%. A 3 MB photo becomes a 4 MB base64 string — easily hitting limits and creating unnecessary memory pressure.

**Warning signs:**
- Form submission goes through a `/api/contact` Vercel serverless function
- Photos are converted to base64 strings before submission
- No client-side file size validation before submit
- No error handling for HTTP 413 responses

**Phase to address:** Quote Wizard photo step and final submission phases

---

### Pitfall 5: Multi-Step Wizard State Not Shared With React Hook Form Properly

**What goes wrong:**
Each wizard step is a separate component. Each step has its own `useForm()` call. When the user moves from Step 1 to Step 2, the Step 1 form instance is unmounted and its state is lost. On the final step, the submission handler only has access to Step 4's form values, not the accumulated data from Steps 1-3.

**Why it happens:**
`useForm()` is scoped to a component. React Hook Form's official multi-step documentation is sparse. The obvious approach — one `useForm` per step — loses data between steps. This is explicitly flagged as a known limitation in React Hook Form issue #3648.

**How to avoid:**
Use a single `useForm()` instance at the wizard root level, passing `control`, `register`, `errors`, and `trigger` down to each step via props (or React Context). Each step renders its fields using the shared `register` and `control`. The submission on the final step has all fields from all steps.

```typescript
// WizardRoot.tsx
const form = useForm<QuoteWizardData>({
  resolver: zodResolver(quoteWizardSchema),
  mode: 'onBlur',
})

// Step validation: trigger only the fields relevant to the current step
const stepFields: Record<number, (keyof QuoteWizardData)[]> = {
  0: ['serviceType', 'projectType'],
  1: ['squareFootage', 'material', 'additionalDetails'],
  2: [], // photos — validated separately
  3: ['firstName', 'lastName', 'email', 'phone', 'address'],
}

const handleNext = async () => {
  const valid = await form.trigger(stepFields[currentStep])
  if (valid) setCurrentStep(s => s + 1)
}
```

**Warning signs:**
- Multiple `useForm()` calls, one per step component
- Step components import `useForm` directly instead of receiving form props
- Console errors about unregistered fields on final submit
- Final submitted data is missing fields from earlier steps

**Phase to address:** Quote Wizard phase (architecture decision at start)

---

### Pitfall 6: Zod Schema `isValid` Checks the Whole Schema, Not the Current Step

**What goes wrong:**
The wizard disables the "Next" button when `formState.isValid` is false. On Step 1, `isValid` is false because Step 3's required fields (firstName, email, phone) have not been filled yet. The Next button is always disabled. Users cannot proceed.

**Why it happens:**
`formState.isValid` reflects the validity of the entire schema. When using a single shared `useForm()` (the correct architecture per Pitfall 5 above), all steps' required fields count toward `isValid` — so the form is never valid until the very last step's final field is filled.

**How to avoid:**
Never use `formState.isValid` to gate step progression. Instead, use `form.trigger(stepFields[currentStep])` to validate only the current step's fields before advancing. This is an async call that resolves to `true` if those specific fields pass validation.

```typescript
// Instead of: disabled={!formState.isValid}
// Use:
const [canProgress, setCanProgress] = useState(false)

const validateStep = async () => {
  const result = await form.trigger(stepFields[currentStep])
  setCanProgress(result)
}
```

Alternatively, use Zod's `.pick()` to create per-step sub-schemas for local validation. But `form.trigger(fields)` is simpler and does not require maintaining parallel schema objects.

**Warning signs:**
- "Next" button is always disabled on Step 1 during testing
- `isValid` used directly in JSX to control step progression
- No `trigger()` calls in the step-advance handler

**Phase to address:** Quote Wizard phase (per-step validation logic)

---

### Pitfall 7: Cost Estimator Sets Unrealistic Price Expectations for Buyers' Customers

**What goes wrong:**
The cost estimator shows ranges like "$8,000 - $15,000 for a 2,000 sq ft roof replacement." A homeowner uses this, expects to pay $8,000, and then receives a quote for $18,000 due to their specific materials, pitch, structural complexity, and local labor market. They feel deceived. The business owner (template buyer) receives complaints, loses the lead, and may blame the template.

**Why it happens:**
Config-driven cost ranges are defined by the template developer using generic industry averages. They are not calibrated to the specific business's local market, materials, or project mix. The estimator looks functional and authoritative, but the data is a demo placeholder.

**How to avoid:**
1. **Ship with conspicuous disclaimer language** — the config schema for each service's cost range should include a required `disclaimer` field. Default text: "These ranges are estimates only. Actual costs depend on your specific project, materials, and local conditions. Request a free on-site estimate for accurate pricing."
2. **Make the disclaimer un-hideable via feature flag** — unlike other UI elements, the disclaimer must always render when the estimator is shown. Make this a hard constraint in the component, not a config option.
3. **Label ranges as starting-from, not exact** — "From $8,000" rather than "$8,000 - $15,000" sets a softer floor expectation.
4. **Document clearly for template buyers** — the README must state that buyers MUST update cost ranges to reflect their actual local pricing before launch. Default values should be obviously wrong (e.g., `minCost: 0, maxCost: 0`) to force buyers to set real values.

**Warning signs:**
- Cost ranges in config default to real-looking numbers (e.g., `8000`)
- No disclaimer text required by config schema (Zod does not enforce it)
- The disclaimer is toggleable via feature flag
- Template ships without documentation warning buyers to update pricing

**Phase to address:** Cost Estimator phase (config schema design and component build)

---

### Pitfall 8: Photo Upload Exposes User Location via EXIF Metadata

**What goes wrong:**
A homeowner uploads a photo of their roof taken on an iPhone. The JPEG contains EXIF metadata with GPS coordinates, device model, and timestamp. The photo is attached to the Formspree submission. The business owner receives the email with the photo. The EXIF data is accessible to anyone who can access the email or Formspree dashboard — including any future data breach of those services.

**Why it happens:**
Browsers do not strip EXIF data from files selected via `<input type="file">`. File objects are passed directly to FormData. The raw file — GPS data and all — is sent to Formspree.

**How to avoid:**
Strip EXIF data client-side before upload. The canvas re-encoding approach is the most reliable: draw the image onto a canvas and export as a new JPEG/PNG. The canvas API does not preserve EXIF metadata.

```typescript
async function stripExifAndResize(file: File, maxWidthPx = 1920): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const scale = Math.min(1, maxWidthPx / img.width)
      canvas.width = img.width * scale
      canvas.height = img.height * scale
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob((blob) => {
        resolve(new File([blob!], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' }))
      }, 'image/jpeg', 0.85)
    }
    img.src = URL.createObjectURL(file)
  })
}
```

This also serves as a client-side resize — limiting to 1920px wide reduces upload size from 8-12 MB to ~500 KB for typical iPhone photos, which prevents hitting Formspree's limits.

**Warning signs:**
- File objects appended directly to FormData without any processing
- No canvas-based re-encoding in the photo upload handler
- No maximum file dimensions enforced client-side

**Phase to address:** Quote Wizard photo upload step

---

### Pitfall 9: Google Maps Embed Breaks When Meta Referrer Policy Is No-Referrer

**What goes wrong:**
The template uses React 19 native metadata hoisting. If any page component renders a `<meta name="referrer" content="no-referrer">` tag — or if Vite/a security plugin adds a `Referrer-Policy: no-referrer` HTTP header — the browser stops sending the `Referer` header to Google's servers. Google's API key restriction (which validates that requests come from your domain) sees no referrer and rejects the request. The map renders with a `RefererNotAllowedMapError` overlay instead of the actual map.

**Why it happens:**
Security-conscious developers (or default security headers in Vercel) set strict referrer policies. This is correct security practice for most resources but breaks the specific mechanism Google uses to validate API key restrictions on Maps Embed.

**How to avoid:**
Add `referrerpolicy="no-referrer-when-downgrade"` directly to the iframe element. This attribute overrides the page-level referrer policy for that specific iframe, allowing the browser to send the full URL as the Referer header to Google while maintaining strict referrer policy for all other requests.

```tsx
<iframe
  src={embedUrl}
  referrerPolicy="no-referrer-when-downgrade"  // Critical — overrides page-level policy
  loading="lazy"
  width="100%"
  height="400"
  style={{ border: 0 }}
  title={`Map of ${city.name}`}
/>
```

Also verify: Vercel project settings do not include a `Referrer-Policy: no-referrer` response header in `vercel.json`.

**Warning signs:**
- Map renders correctly in dev but shows error overlay in production
- `RefererNotAllowedMapError` in browser console on city pages
- `referrerPolicy` attribute absent from the iframe element
- Vercel `vercel.json` includes strict security headers

**Phase to address:** Google Maps embed phase (testing against production domain, not localhost)

---

### Pitfall 10: Tailwind v4 Purges Dynamic Class Names Built From Config Values

**What goes wrong:**
The cost estimator or wizard progress bar builds class names dynamically from config or state — for example, `className={`w-${stepPercent}`}` where `stepPercent` is `"1/4"`, `"2/4"`, etc. In development, Tailwind scans source files and all classes work. In the production build, Tailwind's static scan doesn't see `w-1/4` as a literal string — it sees `w-${stepPercent}` and does not generate the CSS. The progress bar appears unstyled in production.

**Why it happens:**
Tailwind v4 uses a Rust-based build engine with zero-config content detection. It scans files for complete class name strings at build time. Template literals that construct class names are not statically analyzable. This is a design constraint, not a bug — and it affects v4 just as it affected v3.

**How to avoid:**
Never construct Tailwind class names by string interpolation. Use a lookup table mapping values to complete class name strings.

```typescript
// WRONG — purged in production build
className={`w-${Math.round((currentStep / totalSteps) * 100)}%`}

// CORRECT — lookup table with complete class name strings
const progressWidths: Record<number, string> = {
  1: 'w-1/4',
  2: 'w-2/4',
  3: 'w-3/4',
  4: 'w-full',
}
className={progressWidths[currentStep] ?? 'w-0'}
```

For the cost estimator's service-based color themes, define the full class in config data:
```typescript
// src/config/services.ts
{
  slug: 'roofing',
  estimatorColor: 'bg-blue-600',  // Full class name, not 'blue' interpolated later
}
```

**Warning signs:**
- Dynamic className includes template literal with variable: `` `bg-${color}` `` or `` `w-${percent}` ``
- Styles work in `npm run dev` but disappear after `npm run build`
- No safelist entry in Tailwind config for dynamically constructed classes

**Phase to address:** Both Quote Wizard and Cost Estimator phases (any component using dynamic classes)

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Hard-code wizard to 4 steps | Faster to build | Buyers cannot add/remove steps without component changes | Never — use a steps config array |
| Use `localStorage` for wizard state | Survives refresh | State leaks between test users on shared devices; stale data on return visits | Acceptable if cleared after successful submit |
| Inline Google Maps API key in config | Easy setup for buyers | Key stolen if repo is public; no referrer restriction | Never for production key — always use env var |
| Skip canvas EXIF stripping | Fewer moving parts | Privacy liability for buyers' customers | Never — homeowner GPS data must not be transmitted |
| Estimator numbers match real averages | Looks credible in demo | Buyers don't update before launch; customer expectations mismatched | Only if "Example Only" watermark is shown |
| Single Zod schema for all wizard steps | Simpler code | `isValid` always false until final step is complete; blocks all Next buttons | Never — use per-step field triggers |
| Submit wizard photos as base64 JSON | Avoids multipart complexity | 33% file size inflation; hits Vercel body limit; memory pressure | Never |

---

## Integration Gotchas

Common mistakes when connecting to external services.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Formspree (file upload) | Send files through a Vercel `/api/*` function | Submit multipart/form-data directly to `formspree.io/f/{id}` to bypass Vercel's 4.5 MB body limit |
| Formspree (file upload) | Manually set `Content-Type: multipart/form-data` header | Omit Content-Type header entirely — the browser sets the correct boundary automatically |
| Formspree (file upload) | Base64-encode photos before submitting | Append raw `File` objects to FormData — Formspree handles binary uploads natively |
| Google Maps Embed API | Copy iframe from "Share > Embed" without modification | Add `loading="lazy"`, explicit `width`/`height`, and `referrerPolicy="no-referrer-when-downgrade"` |
| Google Maps Embed API | Store API key in config file | Store in `VITE_GOOGLE_MAPS_KEY` env var; reference via `import.meta.env` |
| Google Maps Embed API | Use one unrestricted key for all environments | Separate key per environment; restrict production key to production domain + Maps Embed API only |
| React Hook Form (multi-step) | Call `useForm()` in each step component | One `useForm()` at wizard root; pass `register`, `control`, `trigger` down to steps |

---

## Performance Traps

Patterns that work at small scale but degrade performance for end users.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Naive Google Maps iframe on every city page | LCP +2.8s, CLS > 0.25, Lighthouse drops 15-20 points | `loading="lazy"`, explicit dimensions, static placeholder option | Every city page load for every user |
| Unprocessed phone photos in wizard | 8-12 MB upload per photo; mobile users time out or hit limits | Canvas resize to 1920px max before upload; show progress indicator | Any mobile user submitting more than 1 photo |
| Importing heavy map library (Maps JS API) on city pages | +342 KB JS parse cost on every city page | Use Maps Embed API (iframe) instead of Maps JavaScript API (no JS needed) | City page initial load on mobile |
| Wizard re-renders on every keystroke | Input lag on Step 2 (details/text areas) if parent re-renders | Use `mode: 'onBlur'` in `useForm()`; avoid unnecessary state in wizard root | Noticeable on mid-range Android devices |
| No `loading="lazy"` on wizard step images (service icons, etc.) | Images for hidden steps load eagerly | `loading="lazy"` on any image not visible on the initial wizard step | Low-bandwidth users on mobile |

---

## Security Mistakes

Domain-specific security issues specific to these features.

| Mistake | Risk | Prevention |
|---------|------|------------|
| API key in config file committed to public repo | Unauthorized Maps usage charges; Gemini privilege escalation if other APIs enabled | Env var pattern (`VITE_GOOGLE_MAPS_KEY`); repo scan with TruffleHog before first deploy |
| No HTTP referrer restriction on Maps API key | Key usable from any domain if found | Restrict key to production domain in Google Cloud Console before launch |
| EXIF GPS data transmitted with photos | Homeowner location privacy; potential liability | Canvas-based re-encode strips all EXIF before upload |
| No file type validation on photo input | Users submit PDFs, executables disguised as images | Validate `file.type` against allowlist (`image/jpeg`, `image/png`, `image/webp`, `image/heic`) before processing |
| No file size cap before upload | Denial of service against Formspree endpoint; user frustration | Enforce 10 MB raw file limit before canvas processing; show clear error message |
| Cost estimator with no disclaimer | Implied price guarantee; buyer liability with customers | Disclaimer required by config schema; rendered unconditionally by component |

---

## UX Pitfalls

Common user experience mistakes in multi-step wizard, estimator, and map features.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| No progress indicator showing how many steps remain | Users abandon because they don't know how long the process is | Show step counter ("Step 2 of 4") and visual progress bar from the first step |
| Step validation errors only shown on "Next" click | Users complete the entire step, click Next, then see a wall of errors | Use `mode: 'onBlur'` to show errors as users leave each field |
| Photo upload accepts any format but fails silently on unsupported types | User selects a HEIC (iPhone default) and gets no feedback | Validate file type immediately on selection; list accepted formats in the UI |
| Estimator result shown without prompt to request a quote | User sees the estimate and leaves; no conversion | Estimator result section should include a prominent CTA to the wizard or contact form |
| Map renders at full size on mobile, takes up the entire screen | City page is visually broken on mobile; user cannot see any other content | Cap map height at 300px on mobile (responsive iframe wrapper); test on 375px viewport |
| No step-completed checkmarks or ability to go back to a prior step | Users cannot fix answers from earlier steps without losing current step data | Allow backward navigation with state preserved; show completed indicators |
| Wizard has no keyboard trap management | Screen reader users and keyboard navigators get lost when new step renders | Move focus to the new step's first field or heading when step changes (`useEffect` + `ref.focus()`) |
| Photo upload has no drag-and-drop on desktop | Desktop users expect drag-and-drop for photos | Implement `dragover`/`drop` event handlers alongside `<input type="file">` |

---

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Quote Wizard:** Wizard loads and submits — verify browser Back button at Step 3 returns to Step 2, not to the previous page. Test in both Chrome and Safari.
- [ ] **Quote Wizard:** Final submission email received in Formspree dashboard — verify photo attachments are present as actual files, not base64 strings in the email body.
- [ ] **Quote Wizard:** Step validation tested with empty fields — verify "Next" is blocked when required fields are empty, and the correct per-step fields trigger errors (not all fields at once).
- [ ] **Cost Estimator:** Disclaimer text renders and is visible — verify it is not hidden behind a feature flag or optional CSS toggle.
- [ ] **Cost Estimator:** Estimator config has placeholder-only default values — verify cost ranges are either `0` or obviously demo values so buyers are forced to update them.
- [ ] **Google Maps:** Map renders on production domain, not just localhost — referrer restrictions will cause `RefererNotAllowedMapError` in production if not configured. Test with actual deployed URL.
- [ ] **Google Maps:** API key has HTTP referrer restriction AND API restriction in Google Cloud Console — verify both restrictions are active before launch documentation is written.
- [ ] **Google Maps:** City pages Lighthouse scores tested after map embed — run Lighthouse on a city page after adding the map. Score should not drop more than 5 points with `loading="lazy"`.
- [ ] **Photo Upload:** EXIF stripping verified — upload an iPhone photo, download it from Formspree, check EXIF data with an EXIF viewer. GPS coordinates should be absent.
- [ ] **Photo Upload:** Large file tested — upload a 10 MB raw photo. Verify resize completes, file is accepted, and submission succeeds.
- [ ] **Photo Upload:** HEIC format tested on Safari iOS — iPhone default format. Verify either accepted via canvas API or rejected with clear error message.
- [ ] **All wizard steps:** Mobile viewport tested at 375px — each step should be fully usable without horizontal scroll or overlapping elements.
- [ ] **All wizard steps:** Keyboard navigation tested — Tab through all fields, Enter submits steps, Escape does not accidentally close the wizard.

---

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| API key leaked to public repo | HIGH | Rotate key immediately in Google Cloud Console; create new key with referrer restriction; remove old key; scan git history with `git filter-repo` if repo is public |
| Browser Back loses wizard state | MEDIUM | Add URL-based step encoding (`?step=N`); this requires refactoring the step state management but does not change the UI |
| Lighthouse drops on city pages from map | LOW | Add `loading="lazy"` to iframe; add explicit dimensions; run Lighthouse again. If still failing, switch to static map placeholder |
| Formspree 413 errors on photo upload | LOW | Add client-side canvas resize before upload; cap total payload at 80 MB; add error handling for 4xx responses |
| EXIF data already sent via Formspree | MEDIUM | Add canvas re-encoding; Formspree does not store photos long-term by default but stored submissions should be cleared via dashboard |
| Tailwind classes missing in production | LOW | Add missing class names to safelist in CSS or convert dynamic classes to lookup tables; `npm run build` to verify |
| Cost estimator numbers trusted literally by customers | MEDIUM | Update config values to reflect actual local pricing; add disclaimer; communicate to buyer via support |

---

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Browser Back loses wizard state | Quote Wizard — step 1 (routing architecture) | Test browser Back at each step before calling phase done |
| API key exposed without restriction | Google Maps — step 1 (config/env var setup) | Verify no literal key string in any committed file; verify Cloud Console restrictions |
| Maps iframe kills Lighthouse | Google Maps — embed implementation | Run Lighthouse on city page before and after; delta < 5 points |
| Photo upload hits Vercel 4.5 MB limit | Quote Wizard — photo step | Test 10 MB photo upload end-to-end in production Formspree |
| React Hook Form state across steps | Quote Wizard — architecture decision | Final submission contains all 4 steps' data; console.log before submit to verify |
| `isValid` blocks all Next buttons | Quote Wizard — per-step validation | Step 1 Next is clickable with only Step 1 fields filled |
| Cost estimator sets bad expectations | Cost Estimator — config schema design | Config schema requires disclaimer; default cost values are 0 or clearly placeholder |
| EXIF GPS data transmitted | Quote Wizard — photo step | Upload iPhone photo; verify GPS absent in downloaded copy |
| Referrer policy breaks map in production | Google Maps — production smoke test | Test on actual deployed URL, not localhost |
| Tailwind dynamic class purge | Quote Wizard + Cost Estimator — implementation | `npm run build` + visual check of progress bar and estimator colors in built output |

---

## Sources

- [Baymard Institute: Back Button UX in Multi-Step Flows](https://baymard.com/blog/back-button-expectations) — MEDIUM confidence (industry research)
- [React Hook Form Issue #3648: Multi-step wizard warning](https://github.com/react-hook-form/react-hook-form/issues/3648) — HIGH confidence (official issue tracker)
- [React Hook Form Discussion #11722: Per-step Zod validation](https://github.com/orgs/react-hook-form/discussions/11722) — HIGH confidence
- [Building a reusable multi-step form with React Hook Form and Zod — LogRocket](https://blog.logrocket.com/building-reusable-multi-step-form-react-hook-form-zod/) — MEDIUM confidence
- [Google Maps Platform security guidance](https://developers.google.com/maps/api-security-best-practices) — HIGH confidence (official docs)
- [Truffle Security: Google API Keys and Gemini Privilege Escalation](https://trufflesecurity.com/blog/google-api-keys-werent-secrets-but-then-gemini-changed-the-rules) — HIGH confidence (March 2025 research)
- [Set up the Maps Embed API — Google for Developers](https://developers.google.com/maps/documentation/embed/get-api-key) — HIGH confidence (official docs)
- [Embed a map — referrer policy note](https://developers.google.com/maps/documentation/embed/embedding-map) — HIGH confidence (official docs)
- [Best practices for third-party embeds — web.dev](https://web.dev/articles/embed-best-practices) — HIGH confidence (Google Web Fundamentals)
- [Google Maps 100% PageSpeed — corewebvitals.io](https://www.corewebvitals.io/pagespeed/google-maps-100-percent-pagespeed) — MEDIUM confidence (performance measurements)
- [Vercel body size limit — 4.5 MB](https://vercel.com/kb/guide/how-to-bypass-vercel-body-size-limit-serverless-functions) — HIGH confidence (official Vercel docs)
- [Formspree file upload limits](https://help.formspree.io/hc/en-us/articles/115008380088-File-uploads) — HIGH confidence (official Formspree docs)
- [Formspree system limits](https://help.formspree.io/hc/en-us/articles/7017303616659-System-Limits) — HIGH confidence (official Formspree docs)
- [Uploading images in React, removing EXIF client side — Medium](https://medium.com/@sst.trinath/uploading-images-single-multiple-in-react-js-removing-exif-data-at-client-side-and-display-3c02d94a9594) — MEDIUM confidence
- [Tailwind dynamic class names — GitHub Discussion #18137](https://github.com/tailwindlabs/tailwindcss/discussions/18137) — HIGH confidence (official Tailwind repo)
- [Tailwind CSS safelist — Perficient](https://blogs.perficient.com/2025/08/19/understanding-tailwind-css-safelist-keep-your-dynamic-classes-safe/) — MEDIUM confidence
- [ARIA live regions for multi-step forms — Medium](https://medium.com/@python-javascript-php-html-css/enhancing-multi-step-form-accessibility-with-aria-live-78d2459e415a) — MEDIUM confidence
- [Creating an effective multistep form — Smashing Magazine](https://www.smashingmagazine.com/2024/12/creating-effective-multistep-form-better-user-experience/) — MEDIUM confidence
- [Construction Estimate Disclaimer — FieldPromax](https://www.fieldpromax.com/blog/everything-about-estimate-disclaimers) — MEDIUM confidence (industry guidance)
- [Google Maps Embed API pricing change March 2025](https://developers.google.com/maps/documentation/embed/get-api-key) — HIGH confidence (official docs)
- [React Router 7 pre-rendering hydration pitfalls](https://reactrouter.com/how-to/pre-rendering) — HIGH confidence (official RR7 docs)

---

*Pitfalls research for: v1.2 Feature Expansion — multi-step quote wizard, cost estimator, Google Maps embed, photo upload*
*Researched: 2026-03-05*
