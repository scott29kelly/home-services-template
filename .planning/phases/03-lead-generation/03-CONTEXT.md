# Phase 3: Lead Generation - Context

**Gathered:** 2026-02-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Make the contact form actually work, add form validation, build a booking calendar, financing calculator, and announcement banner. These are the conversion-driving features that turn visitors into leads.

</domain>

<decisions>
## Implementation Decisions

### Form Experience & Submission
- Redirect to a dedicated `/thank-you` page on successful submission (enables conversion tracking with analytics)
- Form lives on Contact page only — other pages link to /contact with CTAs, no embedded forms elsewhere
- Validation approach: Claude's discretion (best UX practice for conversion-focused forms)
- Field set: Claude's discretion (optimal fields for home services lead conversion)
- Spam protection: Honeypot field (per roadmap)

### Booking Calendar
- Style: Date picker + preferred time range (Morning, Afternoon, Evening) — NOT specific time slots. Business calls to confirm exact time.
- Placement: Tab or section on the Contact page — not a separate /book page. Contact page has two modes: quick message form + booking calendar.
- Submission destination: Claude's discretion — same Formspree/webhook pipeline as contact form is the likely approach
- Availability restrictions: Claude's discretion (config-driven availability is recommended approach)

### Financing Calculator
- Type: Full comparison tool — multiple financing options side-by-side (e.g., 0% for 12mo vs 5.99% for 60mo) with total cost comparison
- Placement: Own page at /financing with calculator, FAQ about financing options, and CTA
- CTA: Estimates only + contact CTA ("Call for financing options" / "Get a free quote") — no direct lender application link
- Config: Business owner configures financing terms (rates, term lengths, option labels) in config
- Visual treatment: Claude's discretion — premium feel matching rest of site

### Announcement Banner (formerly Emergency Storm Banner)
- Scope: General-purpose announcement banner — works for storms, seasonal promos, holiday hours, anything. Not limited to storms.
- Dismissible: Yes, with X button — dismissed for the session (sessionStorage)
- Placement: Claude's discretion (best practice for announcements)
- Content structure: Config includes text, CTA, urgency level (high/medium/low for color treatment)
- **Data source: Lightweight external CMS** — business owner must be able to toggle/edit the banner WITHOUT editing code or redeploying. Researcher must investigate best lightweight approach (Google Sheets API, Airtable, Notion API, etc.) that is free/cheap and simple for non-technical users.
- The template developer sets up the data source connection during initial site setup. Business owner just edits a spreadsheet/form/dashboard to manage the banner.

### Claude's Discretion
- Form validation UX (inline vs on-submit, timing)
- Form field set (within home services best practices)
- Booking calendar availability configuration
- Booking submission handling
- Financing calculator visual design
- Banner placement
- All technical implementation details

</decisions>

<specifics>
## Specific Ideas

- Thank-you page should be useful — not just "thanks!" but include next steps ("We'll call within 24 hours"), business hours, and maybe emergency contact info
- Financing calculator should feel authoritative — real comparison table, not just a simple slider
- The lightweight CMS for the banner is important: home service business owners typically don't have developers. The Google Sheets approach (edit a cell, site updates) is the kind of simplicity needed.

</specifics>

<deferred>
## Deferred Ideas

- **Calendar integrations** — Sync bookings to Google Calendar, Housecall Pro, Jobber, ServiceTitan. Business owners already use scheduling tools; integration would be valuable. Future phase or milestone.
- **Admin panel for all site settings** — Full admin UI for non-technical business owners to manage all content (testimonials, services, pricing, etc.) without code. Significant new capability.
- **Lightweight CMS for ALL business-owner content** — Extend the banner's external data source approach to testimonials, service descriptions, pricing, and other editable content. Research should note this as a future direction when investigating the banner's data source.

</deferred>

---

*Phase: 03-lead-generation*
*Context gathered: 2026-02-22*
