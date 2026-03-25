# Phase 3: Lead Generation - Research

**Researched:** 2026-02-23
**Domain:** Form submission, validation, date pickers, financial calculators, external CMS integration
**Confidence:** HIGH (core stack), MEDIUM (Google Sheets CMS approach)

## Summary

Phase 3 transforms the existing static contact form into a working lead generation system. The core stack is React Hook Form v7 + Zod v4 (already installed) + `@hookform/resolvers` v5.2.2, which provides type-safe form validation with minimal re-renders. Form data submits to Formspree (free tier, no backend needed) via plain `fetch` POST with JSON body -- the `@formspree/react` library is unnecessary since we control submission via React Hook Form's `handleSubmit`. A honeypot field (`_gotcha`) is Formspree's built-in spam filter.

The booking calendar is a custom-built date picker with time-range selection (Morning/Afternoon/Evening), not a third-party calendar widget. This aligns with the "no third-party embed" acceptance criteria and keeps the design consistent. The financing calculator uses standard amortization math (`P * r * (1+r)^n / ((1+r)^n - 1)`) with config-driven terms for side-by-side comparison.

The announcement banner requires a lightweight external CMS so business owners can toggle/edit without code. The recommended approach is a **Google Apps Script web app** backed by a Google Sheet -- it provides a free, CORS-friendly JSON endpoint that the site fetches on load. The business owner edits a simple spreadsheet; the site reads it via `fetch`. Alternative: the simpler `spreadsheets.google.com/tq?key=KEY&tqx=out:csv` endpoint works for public sheets without CORS issues, but returns CSV requiring client-side parsing.

**Primary recommendation:** Use react-hook-form + zodResolver for all forms, plain fetch to Formspree/webhook, Google Apps Script web app for banner CMS, and build the calendar/calculator as pure React components with config-driven data.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Redirect to a dedicated `/thank-you` page on successful submission (enables conversion tracking with analytics)
- Form lives on Contact page only -- other pages link to /contact with CTAs, no embedded forms elsewhere
- Spam protection: Honeypot field (per roadmap)
- Booking calendar: Date picker + preferred time range (Morning, Afternoon, Evening) -- NOT specific time slots. Business calls to confirm exact time.
- Booking calendar placement: Tab or section on the Contact page -- not a separate /book page. Contact page has two modes: quick message form + booking calendar.
- Financing calculator: Full comparison tool -- multiple financing options side-by-side (e.g., 0% for 12mo vs 5.99% for 60mo) with total cost comparison
- Financing calculator placement: Own page at /financing with calculator, FAQ about financing options, and CTA
- Financing CTA: Estimates only + contact CTA ("Call for financing options" / "Get a free quote") -- no direct lender application link
- Financing config: Business owner configures financing terms (rates, term lengths, option labels) in config
- Announcement banner scope: General-purpose announcement banner -- works for storms, seasonal promos, holiday hours, anything
- Banner dismissible: Yes, with X button -- dismissed for the session (sessionStorage)
- Banner data source: Lightweight external CMS -- business owner must be able to toggle/edit the banner WITHOUT editing code or redeploying
- Template developer sets up the data source connection during initial site setup. Business owner just edits a spreadsheet/form/dashboard to manage the banner.

### Claude's Discretion
- Form validation UX (inline vs on-submit, timing)
- Form field set (within home services best practices)
- Booking calendar availability configuration
- Booking submission handling
- Financing calculator visual design
- Banner placement
- All technical implementation details

### Deferred Ideas (OUT OF SCOPE)
- Calendar integrations (Google Calendar, Housecall Pro, Jobber, ServiceTitan)
- Admin panel for all site settings
- Lightweight CMS for ALL business-owner content (extend banner approach to testimonials, services, pricing, etc.)
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| LEAD-01 | Working Contact Form Submission -- Formspree default, configurable webhook, loading/error/success states, honeypot | React Hook Form `handleSubmit` + `formState.isSubmitting` for loading; plain `fetch` to Formspree endpoint or configurable webhook URL; `_gotcha` honeypot field; redirect to `/thank-you` on success |
| LEAD-02 | Form Validation -- RHF + Zod, inline errors, email/phone validation, accessible error announcements | `zodResolver` with Zod v4 schemas; `mode: 'onTouched'` for inline validation after first interaction; `aria-invalid` + `aria-describedby` for accessibility; `role="alert"` on error messages |
| LEAD-03 | Custom Booking Calendar -- date picker, time range selection, mobile-friendly, keyboard navigable | Custom React calendar grid with `role="grid"`, `role="gridcell"`, arrow key navigation, `tabIndex` management; time range as radio group (Morning/Afternoon/Evening); config-driven blocked dates and available days |
| LEAD-04 | Financing Calculator -- slider/input, configurable rates/terms, real-time display, comparison table | Standard amortization formula; config-driven `financingOptions` array with rate/term/label; `<input type="range">` + number input for loan amount; comparison table rendering all options side-by-side |
| LEAD-05 | Announcement Banner -- config toggle, dismissible, configurable content, high-contrast design | Google Apps Script web app as JSON endpoint backed by Google Sheet; `sessionStorage` for dismissal; urgency level (high/medium/low) maps to color treatment; fetched on app mount in Layout |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-hook-form | ^7.71.2 | Form state management | Uncontrolled components = minimal re-renders; dominant React form library (8500+ dependents on npm) |
| @hookform/resolvers | ^5.2.2 | Bridge RHF to Zod validation | Official adapter; v5.2.2 fixes Zod v4 output types |
| zod | ^4.3.6 (already installed) | Schema validation | Already in project; provides type inference and runtime validation |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| (none -- no @formspree/react) | -- | -- | Plain `fetch` to Formspree is simpler and avoids conflicting `useForm` hook naming with RHF |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Plain fetch to Formspree | @formspree/react | Formspree's `useForm` hook conflicts with RHF's `useForm` naming; their library adds unnecessary weight when we already have RHF handling form state |
| Custom calendar | react-day-picker | Third-party embed contradicts acceptance criteria; custom build ensures design consistency and keeps bundle small |
| Google Apps Script + Sheets | Notion API / Airtable API | Google Sheets is the simplest for non-technical users (no account setup beyond Google); Notion requires integration tokens; Airtable has API limits on free tier |
| Google Apps Script | SheetDB.io / Sheety.co | Third-party services add cost ($9.99+/mo) or request limits (200/mo free); Apps Script is free and unlimited |

**Installation:**
```bash
npm install react-hook-form @hookform/resolvers
```

Note: `zod` is already installed (v4.3.6). No other npm packages needed.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── config/
│   ├── forms.ts              # Extended: submission config, field definitions, validation messages
│   ├── features.ts           # Extended: financingCalculator, onlineBooking flags updated
│   ├── financing.ts          # NEW: financing options (rates, terms, labels)
│   └── banner.ts             # NEW: banner CMS endpoint config (Google Sheet URL/Apps Script URL)
├── lib/
│   ├── form-handler.ts       # NEW: submitForm() -- Formspree/webhook/Netlify abstraction
│   ├── schemas.ts            # NEW: Zod schemas for contact form, booking form
│   └── banner-client.ts      # NEW: fetchBanner() -- fetches banner data from external CMS
├── pages/
│   ├── Contact.tsx            # REFACTORED: RHF + Zod, two-mode UI (message + booking)
│   ├── Financing.tsx          # NEW: calculator + FAQ + CTA
│   └── ThankYou.tsx           # NEW: post-submission page with next steps
├── components/
│   ├── forms/
│   │   ├── ContactForm.tsx    # NEW: extracted form component with RHF
│   │   └── BookingForm.tsx    # NEW: calendar + time range + contact fields
│   ├── ui/
│   │   ├── BookingCalendar.tsx # NEW: custom date picker grid
│   │   ├── FinancingCalculator.tsx # NEW: comparison calculator
│   │   └── AnnouncementBanner.tsx  # NEW: dismissible banner (renamed from EmergencyBanner)
│   └── layout/
│       └── Layout.tsx         # MODIFIED: adds AnnouncementBanner above Header
```

### Pattern 1: Form Handler Abstraction
**What:** A `submitForm()` function that abstracts the submission backend (Formspree, webhook, Netlify Forms, or none/console.log).
**When to use:** Every form submission in the app calls this instead of direct fetch.
**Example:**
```typescript
// src/lib/form-handler.ts
import { forms } from '../config/forms'

type SubmissionResult = { ok: true } | { ok: false; error: string }

export async function submitForm(data: Record<string, unknown>): Promise<SubmissionResult> {
  const { provider, formspreeId, webhookUrl } = forms.submission

  // Honeypot check -- if filled, silently "succeed" (it's a bot)
  if (data._gotcha) {
    return { ok: true }
  }

  const payload = { ...data }
  delete payload._gotcha

  try {
    if (provider === 'formspree' && formspreeId) {
      const res = await fetch(`https://formspree.io/f/${formspreeId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Submission failed')
      return { ok: true }
    }

    if (provider === 'webhook' && webhookUrl) {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Submission failed')
      return { ok: true }
    }

    // Fallback: log to console (dev/demo mode)
    console.log('[Form Submission]', payload)
    return { ok: true }
  } catch {
    return { ok: false, error: 'Something went wrong. Please try again or call us directly.' }
  }
}
```

### Pattern 2: RHF + Zod Contact Form
**What:** React Hook Form with zodResolver for type-safe validation with inline errors.
**When to use:** Every form in the app.
**Example:**
```typescript
// src/lib/schemas.ts
import { z } from 'zod'

export const contactSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().regex(
    /^\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/,
    'Please enter a valid phone number'
  ),
  service: z.string().min(1, 'Please select a service'),
  message: z.string().optional(),
  _gotcha: z.string().optional(), // honeypot
})

export type ContactFormData = z.infer<typeof contactSchema>

// src/components/forms/ContactForm.tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { contactSchema, type ContactFormData } from '../../lib/schemas'

export function ContactForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    mode: 'onTouched', // validate on first blur, then on change
  })

  const onSubmit = async (data: ContactFormData) => {
    const result = await submitForm(data)
    if (result.ok) {
      navigate('/thank-you')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div>
        <label htmlFor="firstName">First Name *</label>
        <input
          id="firstName"
          {...register('firstName')}
          aria-invalid={!!errors.firstName}
          aria-describedby={errors.firstName ? 'firstName-error' : undefined}
        />
        {errors.firstName && (
          <p id="firstName-error" role="alert" className="text-red-600 text-sm">
            {errors.firstName.message}
          </p>
        )}
      </div>
      {/* Honeypot -- hidden from users, visible to bots */}
      <input {...register('_gotcha')} tabIndex={-1} autoComplete="off" className="hidden" />
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  )
}
```

### Pattern 3: Google Apps Script Banner CMS
**What:** A Google Sheet + Apps Script web app that serves banner data as JSON. The site fetches this on mount.
**When to use:** The announcement banner feature.
**Example:**

**Google Apps Script (deployed as web app):**
```javascript
// Code.gs -- attached to the Google Sheet
function doGet() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Banner')
  const enabled = sheet.getRange('B1').getValue()  // TRUE/FALSE
  const text = sheet.getRange('B2').getValue()
  const ctaText = sheet.getRange('B3').getValue()
  const ctaHref = sheet.getRange('B4').getValue()
  const urgency = sheet.getRange('B5').getValue()  // high/medium/low

  const data = { enabled, text, ctaText, ctaHref, urgency }

  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON)
}
```

**Client-side fetch:**
```typescript
// src/lib/banner-client.ts
import { banner as bannerConfig } from '../config/banner'

export interface BannerData {
  enabled: boolean
  text: string
  ctaText: string
  ctaHref: string
  urgency: 'high' | 'medium' | 'low'
}

export async function fetchBanner(): Promise<BannerData | null> {
  if (!bannerConfig.endpoint) return null
  try {
    const res = await fetch(bannerConfig.endpoint)
    if (!res.ok) return null
    const data = await res.json()
    return data.enabled ? data : null
  } catch {
    return null // Fail silently -- banner is non-critical
  }
}
```

### Pattern 4: Custom Calendar Grid with Keyboard Navigation
**What:** An accessible date picker using a grid layout with arrow key navigation.
**When to use:** The booking calendar component.
**Key accessibility requirements:**
- `role="grid"` on the calendar container
- `role="gridcell"` on each day cell
- `aria-label` on each day (e.g., "Monday, March 15, 2026")
- `aria-selected="true"` on the selected date
- `aria-disabled="true"` on blocked/past dates
- Arrow keys navigate between days; Enter/Space selects
- Tab moves focus to the calendar; Shift+Tab moves out
- Single `tabIndex={0}` on the focused date, all others `tabIndex={-1}`

### Anti-Patterns to Avoid
- **Controlled inputs with RHF:** React Hook Form is designed for uncontrolled components. Using controlled inputs (`value` + `onChange`) defeats the performance benefit. Use `register()` instead.
- **Direct Formspree fetch in components:** Always route through `form-handler.ts` so switching backends requires changing only config, not component code.
- **Calendar with exact time slots:** The user explicitly decided against specific time slots. Use radio buttons for Morning/Afternoon/Evening time ranges only.
- **Embedding the financing calculator on the contact page:** User decided financing gets its own page at `/financing`.
- **Using `@formspree/react`:** Its `useForm` hook name conflicts with RHF's `useForm`. Plain `fetch` is cleaner when RHF already handles form state.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Form state management | Custom useState for each field | react-hook-form `useForm` | RHF handles dirty tracking, touched state, submission state, validation timing, focus management |
| Schema validation | Manual if/else validation chains | Zod schemas + zodResolver | Type inference, reusable schemas, consistent error shape, composable |
| Phone number validation | Custom regex per component | Zod `.regex()` in shared schema | Single source of truth; same regex reused across contact + booking forms |
| Amortization calculation | -- | Standard formula (must implement) | No library needed; the formula `P * r * (1+r)^n / ((1+r)^n - 1)` is straightforward. But handle edge case: 0% interest = P / n (avoid division by zero). |
| CSV parsing (if using Sheets CSV) | Custom split/parse | -- | For the banner, use JSON endpoint via Apps Script instead. Avoids CSV parsing entirely. |

**Key insight:** The form state / validation problem is deceptively complex -- tracking touched fields, dirty state, submission state, re-validation timing, focus management, and error mapping all have edge cases that react-hook-form has already solved. Custom `useState`-based forms invariably miss edge cases around re-validation and accessibility.

## Common Pitfalls

### Pitfall 1: Zod v4 Type Inference with zodResolver
**What goes wrong:** TypeScript errors when using `zodResolver(schema)` with Zod v4 schemas in `@hookform/resolvers` v5.x. Error: "No overload matches this call."
**Why it happens:** Zod v4 changed its type system (input vs output types). Earlier versions of `@hookform/resolvers` didn't handle Zod v4's new type shape correctly.
**How to avoid:** Use `@hookform/resolvers@^5.2.2` which includes the Zod v4 output type fix. If type errors persist, use explicit type annotation: `useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) })`. As a last resort, use `standardSchemaResolver` from `@hookform/resolvers/standard-schema` which works with Zod v4's Standard Schema compliance.
**Warning signs:** TypeScript compilation errors mentioning "overload" or "InferOutput" when passing zodResolver to useForm.

### Pitfall 2: Formspree AJAX Requires reCAPTCHA Disabled
**What goes wrong:** Formspree returns an error or shows a reCAPTCHA challenge when submitting via fetch/AJAX.
**Why it happens:** By default, Formspree forms have reCAPTCHA enabled. AJAX submissions cannot render the reCAPTCHA widget.
**How to avoid:** In the Formspree dashboard, go to Settings > Security and either disable reCAPTCHA or provide your own reCAPTCHA key. The honeypot field (`_gotcha`) provides spam protection without reCAPTCHA.
**Warning signs:** Form submission returns 403 or redirects to a captcha page instead of returning JSON.

### Pitfall 3: Honeypot Field Visible to Users
**What goes wrong:** The `_gotcha` honeypot field is visible, causing confusion for real users.
**Why it happens:** Using `display: none` or `visibility: hidden` -- some bots skip fields with these CSS properties.
**How to avoid:** Use `position: absolute; left: -9999px; opacity: 0; height: 0; overflow: hidden` plus `tabIndex={-1}` and `autoComplete="off"`. This hides from visual users and screen readers while remaining in the DOM for bots. Alternatively, use a Tailwind `sr-only`-like class but with additional opacity/height styles.
**Warning signs:** Users report seeing an extra field; or bots still fill out the form (honeypot too easily detectable).

### Pitfall 4: Calendar Keyboard Trap
**What goes wrong:** Keyboard users get trapped inside the calendar grid and cannot Tab out.
**Why it happens:** Each day cell has `tabIndex={0}`, creating a Tab stop for every day (30+ tab stops).
**How to avoid:** Use "roving tabIndex" pattern: only the currently focused date has `tabIndex={0}`. All other dates have `tabIndex={-1}`. Arrow keys move focus between dates. Tab moves focus OUT of the calendar to the next form element.
**Warning signs:** Pressing Tab cycles through every day in the calendar instead of moving to the time range selection.

### Pitfall 5: Division by Zero in Financing Calculator
**What goes wrong:** 0% APR financing option produces NaN or Infinity in the monthly payment calculation.
**Why it happens:** The amortization formula divides by `((1+r)^n - 1)`. When r=0, this becomes `(1^n - 1) = 0`.
**How to avoid:** Special-case 0% interest: `monthlyPayment = principal / numberOfPayments`.
**Warning signs:** NaN or Infinity displayed in the calculator UI.

### Pitfall 6: Google Apps Script CORS with POST
**What goes wrong:** CORS error when the browser sends a preflight OPTIONS request to the Apps Script web app.
**Why it happens:** Google Apps Script web apps only handle GET and POST, not OPTIONS. The browser's preflight for `Content-Type: application/json` POST triggers an OPTIONS request.
**How to avoid:** For the banner, use GET only (reading data, not writing). GET requests don't trigger preflight. If you need POST (e.g., for future form submission to Sheets), send as `text/plain` content type to avoid preflight, or use a simple GET with query parameters.
**Warning signs:** CORS errors in browser console when the banner fetches data.

### Pitfall 7: Banner Fetch Blocking Page Render
**What goes wrong:** The page waits for the banner API call before rendering anything.
**Why it happens:** Fetching banner data synchronously during render or in a blocking useEffect.
**How to avoid:** Fetch banner data in a non-blocking `useEffect`. Render the page immediately; show the banner only after data arrives. Use a loading state that defaults to "hidden" so the banner appears after fetch, not before.
**Warning signs:** Noticeable delay before page content appears; layout shift when banner appears.

## Code Examples

### Formspree JSON Submission
```typescript
// Source: Formspree AJAX docs (https://help.formspree.io/hc/en-us/articles/360013470814)
const response = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    message: 'Hello',
    _gotcha: '', // honeypot -- must be empty for real submissions
  }),
})

if (response.ok) {
  // Success
} else {
  const data = await response.json()
  // data.errors contains field-level errors
}
```

### RHF mode Options
```typescript
// Source: react-hook-form.com/docs/useform
// mode: 'onTouched' is recommended for lead gen forms
// - Validates on first blur (user tabs away from field)
// - Then re-validates on every change (immediate feedback after first error)
// - Best UX: doesn't show errors before user interacts, but gives instant feedback after
const form = useForm({
  resolver: zodResolver(schema),
  mode: 'onTouched',
})
```

### Amortization Formula
```typescript
// Standard amortization: M = P * [r(1+r)^n] / [(1+r)^n - 1]
export function calculateMonthlyPayment(
  principal: number,
  annualRate: number, // e.g., 5.99 for 5.99%
  termMonths: number
): number {
  if (annualRate === 0) return principal / termMonths
  const r = annualRate / 100 / 12 // monthly rate
  const n = termMonths
  return principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
}

// Total cost = monthlyPayment * termMonths
// Total interest = totalCost - principal
```

### Accessible Calendar Day Cell
```tsx
// Source: ARIA APG Date Picker pattern
<td
  role="gridcell"
  aria-label={`${dayName}, ${monthName} ${dayNumber}, ${year}`}
  aria-selected={isSelected}
  aria-disabled={isDisabled}
  tabIndex={isFocused ? 0 : -1}
  onClick={() => !isDisabled && onSelect(date)}
  onKeyDown={handleDayKeyDown}
  className={cn(
    'w-10 h-10 rounded-lg text-center cursor-pointer',
    isSelected && 'bg-brand-blue text-white',
    isDisabled && 'text-gray-300 cursor-not-allowed',
    isToday && !isSelected && 'ring-1 ring-brand-blue',
  )}
>
  {dayNumber}
</td>
```

### Config-Driven Financing Options
```typescript
// src/config/financing.ts
export const financing = {
  defaultLoanAmount: 15000,
  minLoanAmount: 5000,
  maxLoanAmount: 75000,
  step: 500,
  options: [
    { label: '0% for 12 Months', rate: 0, termMonths: 12, featured: true },
    { label: '5.99% for 60 Months', rate: 5.99, termMonths: 60, featured: false },
    { label: '7.99% for 84 Months', rate: 7.99, termMonths: 84, featured: false },
    { label: '9.99% for 120 Months', rate: 9.99, termMonths: 120, featured: false },
  ],
  disclaimer: 'These are estimates only. Actual rates and terms depend on credit approval. Contact us for a personalized quote.',
  faqs: [
    {
      question: 'Do you offer financing?',
      answer: 'Yes! We partner with leading home improvement lenders to offer flexible financing options.',
    },
    // ... more FAQs
  ],
}
```

### Forms Config Extension
```typescript
// src/config/forms.ts -- extended with submission config
export const forms = {
  submission: {
    /** 'formspree' | 'webhook' | 'netlify' | 'none' */
    provider: 'formspree' as const,
    /** Formspree form ID (e.g., 'xwkgpqrd') */
    formspreeId: '',
    /** Webhook URL for CRM integration */
    webhookUrl: '',
  },
  contact: {
    heading: 'Get Your Free Estimate',
    subheading: "Fill out the form below and we'll get back to you within 24 hours.",
    fields: {
      firstName: { label: 'First Name', placeholder: 'John', required: true },
      lastName: { label: 'Last Name', placeholder: 'Smith', required: true },
      email: { label: 'Email', placeholder: 'john@example.com', required: true },
      phone: { label: 'Phone', placeholder: '(555) 123-4567', required: true },
      address: { label: 'Property Address', placeholder: 'Street, City, State ZIP', required: false },
      service: { label: 'Service Needed', placeholder: 'Select a service', required: true },
      referral: { label: 'How did you hear about us?', placeholder: 'Select...', required: false },
      message: { label: 'Additional Details', placeholder: 'Tell us about your project...', required: false },
    },
    submitText: 'Send Message',
    submittingText: 'Sending...',
  },
  booking: {
    heading: 'Schedule an Inspection',
    subheading: "Pick a date and preferred time. We'll call to confirm.",
    submitText: 'Request Appointment',
    submittingText: 'Scheduling...',
    timeRanges: ['Morning (8am-12pm)', 'Afternoon (12pm-4pm)', 'Evening (4pm-7pm)'],
    blockedDays: [0] as number[], // 0 = Sunday
    maxDaysOut: 60, // how far into the future booking is allowed
  },
  thankYou: {
    heading: 'Thank You!',
    subheading: "We've received your request.",
    nextSteps: [
      "We'll review your information and call you within 24 hours.",
      'For emergencies, call us directly.',
      'Check your email for a confirmation.',
    ],
  },
}
```

### Banner Config
```typescript
// src/config/banner.ts
export const banner = {
  /**
   * URL of the Google Apps Script web app that serves banner data.
   * Set to '' to disable external banner fetching.
   * The template developer creates this during site setup.
   *
   * Setup instructions:
   * 1. Create a Google Sheet with columns: enabled, text, ctaText, ctaHref, urgency
   * 2. Create an Apps Script (Extensions > Apps Script)
   * 3. Deploy doGet() function as web app (Execute as: Me, Access: Anyone)
   * 4. Paste the deployment URL here
   */
  endpoint: '',

  /** Fallback banner data when endpoint is empty or fetch fails (for development/demo) */
  fallback: {
    enabled: false,
    text: '',
    ctaText: '',
    ctaHref: '',
    urgency: 'medium' as const,
  },

  /** Cache TTL in milliseconds (default: 5 minutes) */
  cacheTtl: 5 * 60 * 1000,
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Formik + Yup | React Hook Form + Zod | 2023-2024 shift | RHF has ~2x weekly downloads vs Formik; Zod provides TypeScript inference Yup lacks |
| `@hookform/resolvers` Zod v3 path | `@hookform/resolvers` v5 with Zod v4 support | 2025 (v5.1.0+) | Zod v4 is now officially supported; v5.2.2 fixed remaining type issues |
| reCAPTCHA for spam | Honeypot fields | Ongoing trend | Honeypot is invisible to users, no UX friction, no third-party dependency |
| Third-party calendar widgets | Custom accessible date pickers | ARIA APG standard | Custom builds ensure design consistency and avoid heavy dependencies |
| Google Sheets API with API key | Google Apps Script web app | Stable pattern | Apps Script avoids API key management, CORS issues, and quota complexity |

**Deprecated/outdated:**
- `@formspree/react` `useForm` hook: Naming conflict with RHF. Use plain `fetch` when RHF manages form state.
- `zod` v3 `zodResolver` import path: Works but Zod v4 import is `from 'zod'` (not `from 'zod/v4'` -- both work identically).
- Google Sheets `gviz/tq` endpoint for client-side: CORS issues in modern browsers. Use Apps Script web app instead.

## Open Questions

1. **Zod v4 + zodResolver type compatibility at runtime**
   - What we know: `@hookform/resolvers@5.2.2` fixed Zod v4 output types. Multiple sources confirm it works.
   - What's unclear: Whether there are edge cases with complex discriminated unions or transforms in Zod v4 schemas. The project's form schemas are simple objects, so this is likely fine.
   - Recommendation: Install and test. If type errors occur, fall back to `standardSchemaResolver` from `@hookform/resolvers/standard-schema`. **Confidence: MEDIUM-HIGH**

2. **Google Apps Script deployment experience for template users**
   - What we know: Apps Script web apps require a Google account and a few clicks to deploy. The doGet function is ~10 lines.
   - What's unclear: How smooth the experience is for a non-technical business owner setting up the initial deployment. The template developer is expected to do this, but documentation quality matters.
   - Recommendation: Include detailed setup instructions in the config file comments and in a README section. Provide the Apps Script code as a copyable template. **Confidence: MEDIUM**

3. **Formspree free tier limits**
   - What we know: Formspree free tier allows 50 submissions/month. Paid plans start at $10/mo for 1000 submissions.
   - What's unclear: Whether 50/month is sufficient for a typical home services business in early stages.
   - Recommendation: Document the limit clearly in config. The webhook provider option allows switching to any backend when volume grows. This is a config change, not a code change. **Confidence: HIGH**

## Sources

### Primary (HIGH confidence)
- [react-hook-form npm](https://www.npmjs.com/package/react-hook-form) - Version 7.71.2, 8500+ dependents
- [@hookform/resolvers npm](https://www.npmjs.com/package/@hookform/resolvers) - Version 5.2.2, Zod v4 support confirmed
- [@hookform/resolvers releases](https://github.com/react-hook-form/resolvers/releases) - v5.2.2 fixes Zod v4 output types
- [react-hook-form docs: useForm](https://react-hook-form.com/docs/useform) - mode options, formState, register
- [Formspree AJAX submission](https://help.formspree.io/hc/en-us/articles/360013470814) - fetch POST with JSON, Accept header
- [Formspree honeypot filtering](https://help.formspree.io/hc/en-us/articles/360013580813) - `_gotcha` field implementation

### Secondary (MEDIUM confidence)
- [Google Apps Script CORS fix](https://iith.dev/blog/app-script-cors/) - doGet/doPost with ContentService JSON response
- [Google Sheets as JSON database](https://hooshmand.net/google-sheets-json-database/) - gviz/tq endpoint format and Apps Script alternative
- [Google Sheets CSV export](https://yasha.solutions/posts/2025-10-24-how-to-download-google-spreadsheet-as-a-csv-from-a-public-url/) - URL format for CSV export
- [CORS-enabled Google Sheets gist](https://gist.github.com/d46d6dbfcd6f35a3ccda) - `spreadsheets.google.com/tq` endpoint supports CORS
- [Zod v4 + RHF compatibility discussion](https://github.com/colinhacks/zod/issues/4992) - Community reports and workarounds
- [Accessible date picker guide](https://blog.logrocket.com/how-to-build-an-accessible-date-picker-component-in-react/) - ARIA patterns for calendar grid

### Tertiary (LOW confidence)
- [SheetDB.io](https://sheetdb.io/) / [Sheety.co](https://sheety.co/) - Alternatives to Apps Script, not recommended due to cost/limits

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - react-hook-form + Zod is the dominant React form stack; versions verified via npm
- Architecture: HIGH - Patterns follow RHF official docs and established form abstraction patterns
- Pitfalls: HIGH - Zod v4 type issues and Formspree reCAPTCHA are well-documented community issues
- Banner CMS approach: MEDIUM - Google Apps Script works but CORS behavior for GET requests from client-side needs runtime verification
- Calendar accessibility: MEDIUM - ARIA patterns are well-documented but custom calendar implementation is non-trivial

**Research date:** 2026-02-23
**Valid until:** 2026-03-23 (stable libraries, 30-day validity)
