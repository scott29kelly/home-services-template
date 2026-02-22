# Domain Pitfalls

**Domain:** Premium home services website template product
**Researched:** 2026-02-21
**Stack:** React 19 + Vite 7 + Tailwind CSS v4 + TypeScript + Framer Motion 12 + React Router 7

---

## Critical Pitfalls

Mistakes that cause rewrites, lost sales, or major customer complaints. Address these first.

---

### Pitfall 1: React SPA Serves Empty HTML to Search Engines

**What goes wrong:** The current app is a pure client-side SPA. When Googlebot visits any page, it receives `<div id="root"></div>` with no content. While Google can execute JavaScript, the Web Rendering Service (WRS) is slow, unreliable, and deprioritized. Pages may take days to weeks to be indexed, or never render correctly. Other search engines (Bing, DuckDuckGo) and social media crawlers (Facebook, Twitter/X, LinkedIn) do not execute JavaScript at all.

**Why it matters:** SEO is a core value proposition of this product ("Content & SEO" is Pillar 3). Template buyers specifically want organic search traffic. A template that cannot be indexed will generate immediate refund requests and 1-star reviews. The auto-generated city pages and blog posts -- the primary SEO features -- will be invisible to search engines.

**Consequences:**
- Blog posts and city pages never appear in Google
- Open Graph meta tags rendered by React are invisible to social media crawlers (the current `PageMeta` component renders OG tags client-side, which is useless for link previews)
- Buyers who check Google Search Console will see zero indexed pages and demand refunds
- Competitors using SSG/SSR will outrank on every query

**Prevention:**
- Implement build-time pre-rendering using either React Router v7 Framework Mode (which supports `prerender: true` in `react-router.config.ts`) or `vite-plugin-prerender` with Puppeteer
- Pre-render all static routes at build time: home, about, contact, services, service pages, testimonials, projects, service areas
- Pre-render all blog post pages and city pages at build time using an async function that reads the content directory
- Ensure the pre-rendered HTML includes all meta tags, OG tags, Schema.org JSON-LD, and visible text content
- Keep the current SPA navigation for client-side transitions after initial load

**Detection:** Run `curl -s https://yoursite.com/ | grep -c "<h1>"` -- if it returns 0, search engines see nothing. Check Google Search Console for "Discovered - currently not indexed" warnings.

**Confidence:** HIGH -- This is a well-documented, fundamental limitation of client-side React SPAs. Google's own documentation states server-rendered content is indexed faster and more reliably.

---

### Pitfall 2: Contact Form Is a No-Op (Zero Lead Generation)

**What goes wrong:** The current contact form (`Contact.tsx` line 56-59) calls `e.preventDefault()` and sets `submitted = true` without sending any data anywhere. Form data is lost. The buyer deploys the template, a potential customer fills out the form, and the lead vanishes into the void.

**Why it matters:** Lead generation is Pillar 2 of the product. The entire purpose of a home services website is to capture leads. A non-functional form is not a missing feature -- it is a broken promise. Template buyers will discover this quickly (the first time someone submits a form and they receive nothing) and it will be catastrophic for trust.

**Consequences:**
- Buyer loses real leads and real revenue
- Immediate support tickets and negative reviews
- Violates the "no broken features" success criterion
- Undermines the entire product positioning

**Prevention:**
- Implement a default email notification backend using a Vercel serverless function (similar to the existing chat API pattern)
- Use a transactional email service (Resend, SendGrid, or Mailgun) rather than raw SMTP to ensure deliverability
- Provide a configurable webhook URL in the site config so buyers can connect to their CRM (HubSpot, Salesforce, etc.)
- Add client-side validation with clear error messages before submission
- Add a honeypot field and rate limiting to prevent spam
- Store form submissions in a simple queue/log as a fallback even if email fails

**Detection:** Test the form on the live site. If no email arrives, it is broken.

**Confidence:** HIGH -- This is directly observable in the current codebase.

---

### Pitfall 3: Auto-Generated City Pages With Duplicate/Thin Content

**What goes wrong:** When generating pages for 20-30 cities from config, the natural approach is to use the same template with just the city name swapped in. Google's September 2025 Spam Update specifically targeted this pattern: "businesses with location landing pages that used identical templates across different cities were flagged for lacking originality." The pages get de-indexed or consolidated, providing zero SEO value.

**Why it matters:** City-specific SEO pages are a major selling point. If they trigger duplicate content filtering, the feature actively hurts the site rather than helping it. Buyers who understand SEO will recognize thin content immediately. Buyers who do not understand SEO will wonder why their city pages never rank.

**Consequences:**
- Google de-indexes or consolidates city pages, treating only one as canonical
- Potential manual spam action for doorway pages (Google classifies auto-generated location pages with no unique content as doorway pages)
- Sitemap bloat with pages that provide no ranking value
- Loss of buyer confidence in the SEO capabilities

**Prevention:**
- Each city page must have genuinely unique content. Use a template structure but require per-city fields in config: unique intro paragraph, local landmarks/references, specific services offered in that area, local testimonials, and a unique meta description
- Implement a content quality gate: if a city config entry lacks a minimum set of unique fields, render a simpler listing page rather than a full city page (avoid the thin content pattern)
- Add `rel="canonical"` tags correctly -- each city page should be self-canonical, not point to a parent
- Include city-specific Schema.org `LocalBusiness` or `ServiceArea` markup
- Provide clear documentation and config examples showing buyers how to add unique content per city
- Consider a "content completeness" indicator in the config that warns when a city page is too thin

**Detection:** Compare any two city pages with a diff tool. If they differ only by city name, they are duplicate content.

**Confidence:** HIGH -- Google's documentation on doorway pages and the September 2025 Spam Update explicitly target this pattern.

---

### Pitfall 4: Framer Motion Animations Destroying Core Web Vitals

**What goes wrong:** The current codebase uses Framer Motion extensively: hero content animations (`initial={{ opacity: 0, y: 40 }}`), scroll-reveal animations on every section, staggered card animations, and chat widget entrance/exit animations. These cause three distinct performance problems:

1. **CLS (Cumulative Layout Shift):** Elements that animate from `y: 40` to `y: 0` cause layout shifts as they move into final position. Scroll-triggered animations are particularly bad because they fire after the page appears stable.
2. **LCP (Largest Contentful Paint):** The hero headline animates from `opacity: 0` to `opacity: 1` over 800ms. If the hero text is the LCP element, Chrome measures LCP after the animation completes, adding 800ms to the LCP score.
3. **INP (Interaction to Next Paint):** Complex animation calculations on the main thread during scroll can delay responses to user interactions.

**Why it matters:** Core Web Vitals directly affect Google rankings (estimated 25-30% weight for competitive queries). Only 47% of websites currently pass CWV thresholds. A premium template that fails CWV is selling a handicap. Template review sites and savvy buyers test Lighthouse scores before purchasing.

**Consequences:**
- LCP exceeds 2.5s threshold due to animation delays on hero content
- CLS exceeds 0.1 threshold from scroll-triggered layout animations
- Lower Google rankings for buyer's site
- Bad Lighthouse scores visible in template reviews

**Prevention:**
- Hero content: Remove the `initial={{ opacity: 0 }}` on above-the-fold elements. The hero headline and subhead should render immediately. Use `animate` only for decorative elements below the fold.
- Scroll animations: Use only `opacity` and `transform` properties (which Framer Motion's `y` prop does use `transform` under the hood, which is correct). However, reserve CSS `will-change: transform` for elements about to animate. Ensure `once: true` is set (already done in `useScrollReveal`).
- CLS prevention: Set explicit dimensions on all animated containers. Use `layout` animations cautiously -- they cause reflows. Avoid animating `height`, `width`, `margin`, or `padding`.
- LCP strategy: The hero `<img>` already has `fetchPriority="high"` (good). But the hero text animation delays the paint. If the text is LCP, remove the animation or make it instant (`duration: 0` for `opacity`, animate only decorative elements).
- Bundle size: Framer Motion is ~32KB gzipped. Use `import { motion } from "framer-motion"` tree-shaking properly. Consider `LazyMotion` with `domAnimation` features for reduced bundle.

**Detection:** Run Lighthouse on the deployed site. Check CLS in Chrome DevTools Performance tab. Use `web-vitals` library to log real-user metrics.

**Confidence:** HIGH -- CLS from animated elements and LCP delays from opacity animations are well-documented and directly observable in the current code.

---

### Pitfall 5: Chat API Key Exposed or Unreliable in Production

**What goes wrong:** The current chat system has multiple reliability issues:

1. **CORS wildcard:** `api/chat.js` sets `Access-Control-Allow-Origin: '*'`, meaning anyone can call the endpoint from any domain, burning through the buyer's Groq API credits.
2. **Groq free tier rate limits:** The free tier allows 14,400 requests/day at the organization level. A moderately trafficked site with an always-visible chat widget could exhaust this in hours during a traffic spike (e.g., after a storm event when home services sites get the most traffic).
3. **No rate limiting on the endpoint:** No per-IP or per-session throttling. A bot or abusive user can drain the API quota in minutes.
4. **Hard failure with no API key:** If `GROQ_API_KEY` is not set, the function returns a 500 error. The client-side fallback to demo mode works, but the initial failed fetch adds latency and error noise.
5. **No conversation length limit:** The client sends the full conversation history on every request. A long conversation sends increasingly large payloads and burns tokens.

**Why it matters:** AI chat is a key differentiator. If it breaks under normal usage, buyers will see it as a liability rather than a feature. Unexpected API bills or exhausted quotas during peak traffic (exactly when leads are most valuable) is the worst-case scenario.

**Consequences:**
- API quota exhaustion during traffic spikes (storms, hail events)
- Unexpected charges if buyer upgrades to paid Groq tier
- Abuse via open CORS endpoint draining credits
- Chat widget shows errors at the worst possible time

**Prevention:**
- Replace `Access-Control-Allow-Origin: '*'` with the actual site domain from config/environment variable
- Implement server-side rate limiting per IP (e.g., 20 requests per hour per IP)
- Add a conversation length cap: only send the last 10 messages to the API, not the full history
- Implement a graceful degradation path: detect quota exhaustion (429 response) and immediately switch to demo mode rather than showing errors
- Document the Groq free tier limitations clearly. Recommend buyers start with free tier and provide instructions for upgrading or switching to alternative providers (OpenAI, Anthropic)
- Add a provider abstraction in config so the backend is not hardcoded to Groq
- Consider adding a simple token bucket or session-based rate limiter in the serverless function

**Detection:** Monitor API response codes in the serverless function logs. Set up alerts for 429 (rate limit) responses.

**Confidence:** HIGH -- The CORS and rate limiting issues are directly visible in the code. Groq free tier limits are documented in their community forums.

---

## Important Pitfalls

Mistakes that cause significant buyer friction, support burden, or product quality issues. Address these in early phases.

---

### Pitfall 6: Configuration System That Is Either Too Rigid or Too Complex

**What goes wrong:** Config-driven templates face a fundamental tension:

- **Too rigid:** Buyer cannot change the number of services, add a page, or modify the navigation without editing component code. They bought a "configurable" product but still need a developer for basic changes.
- **Too complex:** Config file becomes a 500-line nested object with dozens of optional fields, conditional logic, and implicit dependencies. Non-technical buyers (or their hired developers) make typos, miss required fields, or create invalid combinations that produce cryptic runtime errors.

The current `site.ts` config is a single flat file at 97 lines. This works for a simple template but will not scale to the planned features (blog, city pages, booking, forms, navigation, theme, multiple services, testimonials, projects, team members, FAQs per page).

**Why it matters:** "Config-driven customizability" is Pillar 4. The config system is the primary interface between the buyer and the product. If it is frustrating to use, the product fails regardless of how good the design is.

**Consequences:**
- Buyer edits config, introduces a typo, and the entire site crashes with an unhelpful React error boundary
- Config grows to hundreds of lines with no validation, making it fragile
- Buyers need developer help for basic changes, defeating the purpose
- Support burden increases as buyers file tickets for config-related issues

**Prevention:**
- Split config into domain-specific files: `config/business.ts`, `config/services.ts`, `config/testimonials.ts`, `config/blog.ts`, `config/theme.ts`, `config/seo.ts`, etc. Each file is smaller and scoped.
- Use TypeScript's type system as a safety net: define strict interfaces for each config section with required vs. optional fields, literal union types for valid options, and JSDoc comments explaining each field
- Implement runtime validation at app startup (using Zod or a lightweight validator) that gives clear, actionable error messages: "Config error in services.ts: 'services[2].title' is required" rather than "Cannot read property 'title' of undefined"
- Provide a `config.example/` directory with annotated example files
- Keep sensible defaults for optional fields so the minimal config is very short
- Add a `npm run validate-config` script that checks config without starting the dev server

**Detection:** Have a non-developer try to customize the template using only the config files and documentation. Time how long it takes and note every point of confusion.

**Confidence:** MEDIUM -- This is a design pattern judgment call based on template marketplace feedback patterns. The specific recommendation (split files + TypeScript + Zod validation) is well-established in the ecosystem.

---

### Pitfall 7: No `prefers-reduced-motion` Support Causes Accessibility and Legal Risk

**What goes wrong:** The current codebase has Framer Motion animations on nearly every visible element: hero content, scroll-reveal on all sections, card stagger animations, chat widget transitions. None of these respect the `prefers-reduced-motion` media query. Users with vestibular disorders (affecting 70+ million people globally) can experience vertigo, nausea, and migraines from these animations.

**Why it matters:** Beyond the ethical obligation, accessibility failures create legal liability. ADA lawsuits against websites have grown significantly. A premium product sold to businesses should not expose those businesses to accessibility complaints. Additionally, many government and institutional buyers require WCAG 2.1 AA compliance.

**Consequences:**
- Users with vestibular disorders cannot use the site comfortably
- Potential ADA/accessibility lawsuits against the buyer
- Negative reviews from accessibility-conscious buyers
- Failure to meet WCAG 2.1 AA (Success Criterion 2.3.3: Animation from Interactions)

**Prevention:**
- Wrap the app with `<MotionConfig reducedMotion="user">` at the root level. This is a single-line change that makes all Framer Motion components automatically disable `transform` and `layout` animations when the user's OS is set to reduce motion, while preserving `opacity` and `backgroundColor` transitions.
- For custom animations not using Framer Motion, use the CSS media query: `@media (prefers-reduced-motion: reduce) { ... }`
- Add a visible "Reduce Motion" toggle in the footer or settings, because not all affected users know how to change their OS setting
- Test with `prefers-reduced-motion: reduce` enabled in Chrome DevTools (Rendering tab)
- Document in the template README that accessibility is built-in

**Detection:** Enable "Reduce motion" in your OS accessibility settings and verify that the site is still fully usable without any transform animations.

**Confidence:** HIGH -- Framer Motion's `MotionConfig reducedMotion="user"` is documented in their official docs. WCAG 2.1 AA requirements are well-established.

---

### Pitfall 8: Image Handling Destroys Load Performance

**What goes wrong:** The current template serves images from a flat `/images/` directory with no optimization pipeline:

1. **No responsive images:** The hero image is served at full resolution (1920x1080) regardless of device. A mobile user on 3G downloads a 500KB+ image they display at 375px wide.
2. **No AVIF/WebP fallback chain:** Only `.webp` images are referenced. Older browsers get broken images, and there is no fallback to JPEG.
3. **No image dimension attributes on many images:** The hero `<img>` has no explicit `width`/`height` attributes, though it uses `object-cover` with absolute positioning (which mitigates CLS in this specific case). Other images throughout the template likely lack dimensions.
4. **Images copied via build script:** The build command uses `cp -r images dist/images` -- there is no build-time image optimization, compression, or resizing.
5. **All images load eagerly:** No `loading="lazy"` on below-the-fold images.

**Why it matters:** Images are typically 50-80% of page weight. For home services sites with project galleries, before/after photos, team headshots, and testimonial photos, unoptimized images will destroy LCP and total page weight. Mobile performance is critical because many home services customers browse on phones.

**Consequences:**
- LCP > 2.5s on mobile connections due to large hero images
- Total page weight of 5-10MB+ with gallery pages
- Poor Lighthouse performance scores
- Slow experience on mobile, where most home services searches happen

**Prevention:**
- Implement a build-time image optimization pipeline using `vite-imagetools` or `sharp` to generate multiple sizes and formats (WebP + AVIF + JPEG fallback) at build time
- Use responsive `<img>` with `srcset` and `sizes` attributes for all content images
- Set explicit `width` and `height` attributes on all `<img>` elements to prevent CLS
- Hero image: keep `fetchPriority="high"` (already present) and add `<link rel="preload">` (already present in `index.html`). Do NOT lazy-load the hero image.
- All below-the-fold images: add `loading="lazy"` and `decoding="async"`
- Provide clear image size guidelines in documentation (the current README does this, which is good)
- Consider a reusable `<OptimizedImage>` component that handles srcset, lazy loading, and dimensions automatically

**Detection:** Run Lighthouse. Check the "Properly size images" and "Serve images in next-gen formats" audits. Measure total page weight in Network tab.

**Confidence:** HIGH -- The image handling gaps are directly observable in the codebase and build configuration.

---

### Pitfall 9: Email Delivery Failures From Form Submissions

**What goes wrong:** When implementing form submission email notifications, common pitfalls include:

1. **Using raw SMTP from serverless functions:** Emails sent from Vercel/Cloudflare serverless IPs are frequently flagged as spam because these shared IPs have poor reputation.
2. **No SPF/DKIM/DMARC authentication:** Starting November 2025, Gmail actively rejects (not just filters) non-compliant messages at the SMTP protocol level. Microsoft requires DMARC for senders exceeding 5,000 emails/day.
3. **Sending from a generic "noreply@" address:** Hurts deliverability and feels impersonal.
4. **No confirmation to the submitter:** The person who filled out the form has no proof their submission was received, leading to duplicate submissions and phone calls.
5. **No spam protection on the form:** Without honeypot fields, rate limiting, or CAPTCHA, spam bots will submit hundreds of junk leads, polluting the buyer's inbox and potentially getting their email domain flagged.

**Why it matters:** If form submissions do not reach the buyer's inbox reliably, the lead generation feature is broken even if the code works correctly. Email deliverability is invisible -- submissions silently go to spam, and neither the buyer nor the customer knows.

**Consequences:**
- Leads go to spam folder -- buyer thinks the site generates no leads
- Spam bot submissions flood buyer's inbox and damage sender reputation
- Gmail/Microsoft reject emails entirely, creating a silent failure
- Buyer loses trust and requests a refund

**Prevention:**
- Use a transactional email API (Resend is simplest -- single API call, no SMTP complexity, free tier of 100 emails/day). Configure with the buyer's domain for proper SPF/DKIM.
- Implement honeypot field (hidden input that bots fill in, humans don't) and server-side rate limiting per IP
- Send a confirmation email to the submitter acknowledging receipt
- Store submissions in a lightweight persistence layer (even just logging to Vercel logs) as a backup
- Document email setup clearly: buyer must add DNS records (SPF, DKIM) for their domain
- Provide a "test submission" flow in the setup process so buyers verify delivery before going live

**Detection:** Submit the form and check if the email arrives in the inbox (not spam). Test from multiple email providers (Gmail, Outlook, Yahoo).

**Confidence:** HIGH -- Gmail's November 2025 enforcement changes are documented. Email deliverability from serverless IPs is a widely reported issue.

---

### Pitfall 10: Bundle Size Bloat From Feature Creep

**What goes wrong:** As features are added (blog renderer, markdown parser, calendar/date picker, financing calculator, image gallery with lightbox, AI chat, city page generator, form validation library), the JavaScript bundle grows. The planned feature set could easily push the main bundle past 500KB gzipped if not managed carefully. Key contributors:

- Framer Motion: ~32KB gzipped
- React + React DOM: ~42KB gzipped
- React Router: ~15KB gzipped
- Markdown parser (remark/rehype): ~30-50KB gzipped
- Date/calendar library: ~15-30KB gzipped
- Form validation (Zod): ~13KB gzipped
- Syntax highlighting for blog code blocks: ~20-50KB gzipped

Total baseline before any app code: 150-230KB gzipped. With application code and additional libraries, easily 300-500KB+.

**Why it matters:** Large bundles increase Time to Interactive (TTI) and First Input Delay (FID)/INP. On mobile networks, every 100KB adds ~500ms of parse time. A "premium" template should feel fast, not sluggish.

**Consequences:**
- Slow initial page load, especially on mobile
- Poor Lighthouse performance scores
- Bad first impression on the demo site (where buyers evaluate the product)
- SEO impact from slow TTI

**Prevention:**
- Current lazy loading of routes via `React.lazy()` is correct -- continue this pattern for ALL routes except Home
- Use `LazyMotion` with `domAnimation` features instead of importing the full Framer Motion bundle on every page
- Lazy-load the chat widget and its API client (it should not be in the initial bundle since users don't interact with it immediately)
- Lazy-load the markdown renderer and syntax highlighter only on blog pages
- Lazy-load the calendar/date picker only on the booking page
- Use `vite-bundle-analyzer` (or `rollup-plugin-visualizer`) to monitor bundle composition
- Set a bundle budget: main chunk should be under 100KB gzipped, total JS under 300KB gzipped
- Configure manual chunks in `vite.config.ts` for vendor libraries that are used across routes (React, React DOM, React Router in one chunk; Framer Motion in another)

**Detection:** Run `npx vite-bundle-visualizer` after build. Check the sizes of each chunk. Set up CI check that fails if main bundle exceeds budget.

**Confidence:** HIGH -- Bundle sizes are measurable and the library sizes are documented.

---

### Pitfall 11: AI Chat That Annoys Rather Than Converts

**What goes wrong:** Research shows 53% of consumers find chatbots annoying, and 80% prefer human support even with the same outcome. Common failure patterns:

1. **Auto-opening or attention-grabbing:** A chat widget that pops open automatically, bounces, or shows persistent notifications trains users to dismiss it like an ad.
2. **Cannot reach a human:** The biggest frustration (documented across multiple studies) is when users feel trapped with a bot. If the AI cannot answer their question and there is no escalation path, the experience is worse than having no chat at all.
3. **Generic responses:** "I'd be happy to help!" followed by irrelevant information. The current demo mode fallback gives generic responses for unrecognized queries.
4. **Hallucinated information:** LLMs can fabricate pricing, availability, certifications, or make promises the business cannot keep. The system prompt says "Never provide specific dollar estimates" but this depends on the LLM following instructions reliably.
5. **Full conversation sent to API:** The current implementation sends the entire message history with each request, leading to increasingly expensive API calls and potential context window overflow.

**Why it matters:** A bad chatbot experience does not just fail to convert -- it actively drives visitors away. For a home services business where trust is paramount, an AI that makes up information or feels like a barrier is worse than a simple phone number.

**Consequences:**
- Visitors close the chat and leave the site
- AI provides incorrect information, creating liability for the business
- Excessive API costs from long conversations
- Buyer disables the chat feature entirely, losing a differentiator

**Prevention:**
- Default behavior: Widget is visible but closed. No auto-open, no bounce animation, no sound.
- Always provide an escape hatch: After 2-3 exchanges, show a "Talk to a real person" button that links to the phone number or email.
- Limit conversation scope: The system prompt should be tight and focused. Include explicit negative instructions ("Do not discuss pricing, availability dates, or make commitments on behalf of the business").
- Implement response guardrails: Maximum response length, rejection of off-topic queries, and a "I'm not sure about that -- here's how to reach our team directly" fallback.
- Cap conversation length at ~10 messages client-side and show a "For more detailed help, please call us" message.
- Make the chat feature optional in config with a simple boolean toggle.
- Provide clear documentation about AI limitations and recommend the buyer review the system prompt for their specific business.

**Detection:** Have 10 people use the chat with realistic questions. Track how many get a useful answer, how many get frustrated, and how many would have been better served by a phone number.

**Confidence:** MEDIUM -- The user sentiment data is from surveys (multiple sources agree), but the specific UX recommendations are based on established patterns rather than controlled experiments.

---

### Pitfall 12: Template Product With Poor Documentation Gets Bad Reviews

**What goes wrong:** The number one complaint on template marketplace reviews (ThemeForest, Creative Market) is not code quality -- it is documentation and support. Premium templates fail when:

1. **Setup instructions assume developer knowledge:** "Edit `site.ts` and deploy" is not sufficient for a non-technical buyer or a hired freelancer unfamiliar with React/Vite.
2. **No visual documentation:** Buyers cannot map config fields to visual elements on the page.
3. **Missing troubleshooting:** Common issues (build failures, image not showing, form not working, chat not connecting) need specific solutions.
4. **No changelog:** Buyers who update the template have no idea what changed or what might break.

**Why it matters:** Documentation IS the product for template buyers. They evaluate the product based on how quickly they can customize it and go live. Extensive documentation reduces support burden and improves reviews.

**Consequences:**
- Negative reviews citing "hard to customize" or "no support"
- High support ticket volume eating into margins
- Buyers unable to complete setup, leading to refund requests
- Template perceived as "for developers only," limiting the market

**Prevention:**
- Create a comprehensive setup guide with screenshots showing each step
- Map every config field to a visual annotation on the demo site ("This field controls THIS element")
- Include a video walkthrough of initial setup (5-10 minutes)
- Provide a troubleshooting FAQ covering the 10 most common issues
- Maintain a CHANGELOG.md with every release
- Include "quick start" vs. "complete guide" documentation paths for different user skill levels
- Add inline JSDoc comments in config files that explain each field's purpose and valid values

**Detection:** Have a non-developer (or a developer unfamiliar with React) try to set up the template from scratch using only the documentation. Every question they ask is a documentation gap.

**Confidence:** HIGH -- Template marketplace review patterns consistently show documentation as the primary driver of satisfaction.

---

## Moderate Pitfalls

Mistakes that cause friction, quality issues, or technical debt. Address during implementation.

---

### Pitfall 13: Schema.org Markup Hardcoded in index.html

**What goes wrong:** The current `index.html` has Schema.org JSON-LD hardcoded with demo data ("Acme Home Services", "555-123-4567", etc.). When a buyer customizes the `site.ts` config, the Schema.org markup in `index.html` remains stale with demo data. Google reads the JSON-LD and sees conflicting information.

**Prevention:**
- Generate Schema.org JSON-LD dynamically from the config, either at build time (injected during pre-rendering) or as a React component that renders into `<head>`
- For pre-rendered pages, inject correct JSON-LD per page at build time
- Include page-specific schemas: `LocalBusiness` for the homepage, `FAQPage` for FAQ sections, `Service` for service pages, `BlogPosting` for blog posts
- Validate output with Google's Rich Results Test tool

**Confidence:** HIGH -- Directly observable in the current codebase.

---

### Pitfall 14: Google Fonts Render-Blocking Load

**What goes wrong:** The current `index.html` loads Google Fonts synchronously with a `<link>` tag. This is render-blocking: the browser will not paint text until the fonts download. On slow connections, this causes a Flash of Invisible Text (FOIT) of 1-3 seconds.

**Prevention:**
- Add `font-display: swap` to the Google Fonts URL (append `&display=swap`, which is missing from the current URL -- the current URL does have `display=swap` at the end, which is correct)
- Consider self-hosting the fonts (download Inter and Plus Jakarta Sans, include in the build) to eliminate the third-party DNS lookup and connection time
- Use `<link rel="preconnect">` for Google Fonts (already present, which is good)
- For maximum performance, subset the fonts to only the characters used

**Confidence:** HIGH -- Font loading behavior is well-documented. Self-hosting is the established best practice for performance-critical sites.

**Note:** Upon re-reading the index.html, the `display=swap` parameter IS present. The main remaining issue is the third-party dependency and DNS lookup time. Self-hosting would improve LCP by 100-300ms.

---

### Pitfall 15: Markdown Blog Without Frontmatter Validation

**What goes wrong:** File-based blogs with YAML frontmatter are fragile. Common failures:
- Missing required fields (title, date, description) cause blank or broken pages
- Invalid date formats cause sorting errors
- Incorrect image paths cause broken images
- Special characters in YAML values (colons, quotes) cause parse errors
- No slug validation leads to URL conflicts or broken routes

**Prevention:**
- Define a strict TypeScript interface for blog post frontmatter
- Validate frontmatter at build time using Zod, failing the build with clear error messages if any post has invalid metadata
- Provide a blog post template file that buyers copy for new posts
- Implement a `npm run validate-blog` script that checks all posts without building
- Handle gracefully: if a post has invalid frontmatter, exclude it from the blog listing rather than crashing the entire site
- Document the exact frontmatter format with examples

**Confidence:** MEDIUM -- Frontmatter validation patterns are established in SSG ecosystems (Astro, Next.js). The specific risk depends on implementation choices.

---

### Pitfall 16: OG Image Tags With Relative Paths

**What goes wrong:** The current `index.html` has `<meta property="og:image" content="/images/hero-roofing.webp">`. Social media crawlers require absolute URLs for OG images. A relative path will result in no image preview when the URL is shared on Facebook, Twitter/X, or LinkedIn.

**Prevention:**
- Always use absolute URLs for OG image tags: `https://example.com/images/hero-roofing.webp`
- Generate OG image URLs from `SITE.url` + image path in the PageMeta component
- Consider generating dedicated OG images (1200x630px) optimized for social sharing rather than reusing hero images
- Test with Facebook's Sharing Debugger and Twitter's Card Validator

**Confidence:** HIGH -- OG image specification requires absolute URLs. This is directly observable in the current code.

---

### Pitfall 17: No 404 Page Causes Soft 404s and Broken UX

**What goes wrong:** The current React Router configuration has no catch-all route. If a user navigates to a non-existent URL (via broken link, typo, or old bookmark), they see a blank page inside the Layout shell. Google classifies this as a "soft 404" -- the server returns 200 OK for a page with no content, which harms crawl efficiency and SEO.

**Prevention:**
- Add a catch-all `<Route path="*" element={<NotFound />} />` in the router
- The 404 page should include: a clear message, a search suggestion, links to popular pages, and a prominent CTA (phone number, contact form)
- For pre-rendered sites, generate a `404.html` file that hosting providers (Vercel, Netlify) serve for unknown routes
- The 404 page should still include the Layout (header/footer) so users can navigate away

**Confidence:** HIGH -- Missing 404 handling is directly observable in `App.tsx`.

---

### Pitfall 18: Scroll-to-Top Behavior Breaks Browser Expectations

**What goes wrong:** SPAs using React Router do not automatically scroll to the top when navigating between pages. The current codebase has a `ScrollToTop` component. If this is implemented incorrectly (e.g., scrolling on every render rather than only on route changes, or scrolling during back/forward navigation), it breaks the browser's expected scroll restoration behavior.

**Prevention:**
- Use React Router's built-in `<ScrollRestoration>` component (available in framework mode) or ensure the custom `ScrollToTop` component only fires on `pathname` changes (not search params or hash changes)
- Preserve scroll position on back/forward navigation using `history.scrollRestoration`
- Do not animate the scroll-to-top (it should be instant on navigation)
- Test with browser back/forward buttons to verify scroll position is restored

**Confidence:** MEDIUM -- Depends on the specific implementation of `ScrollToTop.tsx`.

---

### Pitfall 19: Chat Widget Loading on Every Page Impacts Performance

**What goes wrong:** The `AvaWidget` component with its Framer Motion animations, message state, and API client is loaded in the Layout component and rendered on every page. Even when closed, it adds to the initial bundle size and renders DOM elements.

**Prevention:**
- Lazy-load the AvaWidget: use `React.lazy()` and only import it after user interaction (e.g., when the floating button is clicked for the first time)
- Alternatively, render only the floating button eagerly (minimal DOM) and lazy-load the full chat panel on first open
- If using Framer Motion's `AnimatePresence`, the exit animation still works with lazy-loaded components as long as the component mounts before animating out
- Idle-load the chat bundle using `requestIdleCallback` or an intersection observer so it is ready when the user scrolls to the bottom of the page

**Confidence:** MEDIUM -- The performance impact depends on bundle analysis. The architectural pattern (lazy chat) is well-established.

---

## Minor Pitfalls

Mistakes that cause minor friction or code quality issues. Address opportunistically.

---

### Pitfall 20: Demo Data Left in Production

**What goes wrong:** Buyers deploy the template without replacing all demo data. "Acme Home Services" appears on their live site. The "555-123-4567" phone number receives calls intended for a real business. Placeholder testimonials ("John D. from Springfield") appear on a live business site. This is embarrassing and damages credibility.

**Prevention:**
- Add a build-time check: if `SITE.name` is still "Acme Home Services" or `SITE.phone` still contains "555", show a prominent development banner ("This site is using demo data -- update your config before going live")
- Use clearly fake placeholder data that is obviously not real (e.g., "Your Company Name Here" rather than a realistic-sounding name)
- The build-time validation script should warn about unchanged default values
- Consider a `npm run preflight` command that checks for demo data before deployment

**Confidence:** HIGH -- This is a universally reported issue with template products.

---

### Pitfall 21: Hardcoded Routes Create Maintenance Burden

**What goes wrong:** The current `App.tsx` has hardcoded route paths (`"roofing"`, `"siding"`, `"storm-damage"`, etc.) and `Header.tsx`/`Footer.tsx` have hardcoded navigation links (noted as a known gap). When the config allows customizing services, the routes and navigation must be dynamically generated. If routes are hardcoded in multiple places (App, Header, Footer, internal links throughout pages), changing one and missing another creates broken links.

**Prevention:**
- Define routes in config and generate them dynamically in `App.tsx`
- Create a `routes.ts` utility that maps config to route objects, used by the router, navigation, footer, and sitemap generator
- Use a single source of truth for all internal links: never hardcode paths like `"/roofing"` in component code; instead, reference the route config
- Add a build-time check that verifies all internal `<Link>` targets resolve to valid routes

**Confidence:** HIGH -- The hardcoded routes are directly visible in the current `App.tsx` and noted as a gap in `PROJECT.md`.

---

### Pitfall 22: TypeScript Config Without Runtime Safety Net

**What goes wrong:** TypeScript types are erased at runtime. If a buyer edits `site.ts` and introduces a type error, `tsc` will catch it. But if the config is moved to JSON, YAML, or a plain JS file (common for non-developer users), there is no type checking. Even with TypeScript, `as const` assertions can mask errors: a misspelled property name on an object literal typed `as const` does not produce an error -- it just adds a new property.

**Prevention:**
- Keep config files as `.ts` files for TypeScript checking, but also validate at runtime with Zod schemas
- Export validated config objects (run through Zod parse at module load time) so that invalid config fails fast with clear messages
- Do not use `as const` for user-edited config objects -- use explicit TypeScript interfaces that enforce the expected shape
- If supporting JSON config files in the future, validate them with the same Zod schemas at build time

**Confidence:** MEDIUM -- TypeScript limitations with `as const` are well-understood but may not manifest depending on how buyers edit the config.

---

### Pitfall 23: Vercel-Specific Deployment Locks Out Other Hosts

**What goes wrong:** The current project has `vercel.json`, Vercel-specific serverless functions (`api/chat.js`), and deployment instructions targeting Vercel. If a buyer uses Netlify, Cloudflare Pages, AWS Amplify, or a traditional VPS, the serverless functions do not work without modification. The chat feature breaks entirely.

**Prevention:**
- Abstract the serverless API into a provider-agnostic pattern
- Provide deployment adapters for the top 3 platforms: Vercel (current), Netlify (functions), and Cloudflare Workers (already partially done with `worker.js`)
- Document how to deploy the API portion to each platform
- Consider offering the form submission and chat API as optional external services that work with any static host
- Ensure the core template works as a pure static site (all features except AI chat) on any host

**Confidence:** MEDIUM -- The Vercel lock-in is visible in the codebase. The severity depends on target market distribution across hosting providers.

---

### Pitfall 24: Accessibility Beyond Animations

**What goes wrong:** Beyond motion sensitivity, common accessibility gaps in template products include:
- Missing or incorrect ARIA labels (the current chat button has a good `aria-label`, but other interactive elements may not)
- Insufficient color contrast (safety-orange on white may fail WCAG AA contrast ratio)
- No keyboard navigation support for custom interactive elements (chat widget, dropdowns, modals)
- Focus trapping not implemented in modal/overlay components
- Form inputs without proper `<label>` associations (the current Contact form uses labels, which is good)

**Prevention:**
- Run axe-core accessibility audit and fix all critical/serious issues
- Verify color contrast ratios for all text/background combinations using WCAG AA standards (4.5:1 for normal text, 3:1 for large text)
- Ensure all interactive elements are keyboard-accessible (Tab, Enter, Escape)
- Implement focus trapping in the chat modal (the current chat opens/closes with Escape, which is good)
- Add `aria-live` regions for dynamic content (chat messages, form success/error states)
- Include accessibility as a product feature in marketing ("WCAG 2.1 AA compliant")

**Confidence:** MEDIUM -- Specific accessibility gaps require auditing with axe-core to quantify. The patterns are well-established.

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Pre-rendering / SSG setup | Breaking existing client-side navigation when adding pre-rendering | Test that SPA navigation still works after hydration; pre-render static HTML but hydrate on the client |
| Config system redesign | Introducing regressions while splitting the monolithic config | Write config migration tests; keep backward compatibility with old `SITE` export during transition |
| Blog implementation | Markdown parsing adding 30-50KB to the bundle | Lazy-load the markdown renderer; only include it in blog route chunks |
| City page generation | Creating 20+ thin pages that dilute site authority | Require minimum content fields per city; validate at build time |
| Form submission backend | Email delivery failures that are invisible | Implement logging/monitoring from day one; add a "test submission" feature |
| Booking calendar | Date/time picker libraries adding bundle weight | Build a lightweight custom picker or use native `<input type="date">` with progressive enhancement |
| Animation polish | CLS regressions from new animations on existing pages | Run Lighthouse before and after each animation addition; set CLS budget of < 0.05 |
| AI chat improvements | Over-engineering the chat when it should stay simple | Keep the scope tight: answer FAQs, provide contact info, book inspection. Not a general-purpose AI. |
| Image optimization pipeline | Build time increasing significantly with image processing | Process images in parallel; cache processed images; only reprocess changed images |
| Template packaging for sale | Including node_modules, .env files, or large assets in the download | Create a packaging script that builds a clean distribution; add a .npmignore or explicit include list |

---

## Sources

### Template Market & Product Quality
- [Trustpilot ThemeForest Reviews](https://www.trustpilot.com/review/www.themeforest.net) -- Template marketplace complaint patterns
- [ThemeForest Review 2026 - Website Planet](https://www.websiteplanet.com/blog/themeforest-review/) -- Template quality analysis

### SEO & Indexing
- [How to fix technical SEO issues on client-side React apps](https://searchengineland.com/how-to-fix-technical-seo-issues-on-client-side-react-apps-455124) -- React SPA SEO challenges
- [React SEO Best Practices](https://www.dheemanthshenoy.com/blogs/react-seo-best-practices-spa) -- SPA optimization for search engines
- [Google Duplicate Content](https://developers.google.com/search/blog/2008/09/demystifying-duplicate-content-penalty) -- Official Google guidance on duplicate content
- [Duplicate Content Ranking Impact 2025](https://www.webapex.com.au/blog/duplicate-content/) -- September 2025 spam update impact on city pages
- [Pre-Rendering with React Router](https://reactrouter.com/how-to/pre-rendering) -- Official React Router pre-rendering documentation

### Performance & Core Web Vitals
- [Core Web Vitals Optimization Guide 2025](https://www.ateamsoftsolutions.com/core-web-vitals-optimization-guide-2025-showing-lcp-inp-cls-metrics-and-performance-improvement-strategies-for-web-applications/) -- CWV metrics and strategies
- [Fix LCP by Optimizing Image Loading - MDN](https://developer.mozilla.org/en-US/blog/fix-image-lcp/) -- LCP image optimization
- [Lazy Loading LCP Hero Images - Google Clarification](https://www.etavrian.com/news/lazy-loading-lcp-hero-images) -- Do not lazy-load hero images
- [Taming Large Chunks in Vite + React](https://www.mykolaaleksandrov.dev/posts/2025/11/taming-large-chunks-vite-react/) -- Bundle splitting strategies
- [Image Optimization 2025: WebP/AVIF, srcset, and Preload](https://aibudwp.com/image-optimization-in-2025-webp-avif-srcset-and-preload/) -- Modern image optimization techniques

### Form & Lead Generation
- [Online Form Statistics 2024 - WPForms](https://wpforms.com/online-form-statistics-facts/) -- Form abandonment rates and causes
- [Simplify B2B Lead Gen Forms](https://www.funnelenvy.com/blog/simplify-your-b2b-lead-gen-forms-to-reduce-abandonment-rates/) -- Form design best practices

### Email Deliverability
- [Email Deliverability 2025 - 1827 Marketing](https://1827marketing.com/smart-thinking/email-deliverability-in-2025-new-rules-higher-standards-and-what-b2b-marketers-should-do/) -- Gmail/Microsoft enforcement changes
- [Email Deliverability Issues 2026 - Mailtrap](https://mailtrap.io/blog/email-deliverability-issues/) -- Common delivery failures

### AI Chat
- [Why Are Some Chatbots Still Bad in 2025 - Forethought](https://forethought.ai/blog/why-are-some-chatbots-still-bad) -- Chatbot failure patterns
- [Customers Still Don't Love AI - CX Dive](https://www.customerexperiencedive.com/news/customers-dislike-ai-customer-service/757711/) -- Consumer sentiment data (53% find chatbots annoying)
- [Hidden Cost of Chatbots - STRYDE](https://www.stryde.com/the-hidden-cost-of-chatbots-why-ai-driven-customer-service-is-killing-your-conversions/) -- Conversion impact

### Accessibility & Animation
- [Motion for React Accessibility](https://motion.dev/docs/react-accessibility) -- Official Framer Motion accessibility guide
- [MotionConfig - Framer Motion](https://motion.dev/docs/react-motion-config?via=cptv8) -- MotionConfig reducedMotion API
- [Accessible Animation and Movement - Pope Tech](https://blog.pope.tech/2025/12/08/design-accessible-animation-and-movement/) -- WCAG animation requirements
- [prefers-reduced-motion - MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion) -- Media query specification

### Groq API
- [Groq Rate Limits](https://console.groq.com/docs/rate-limits) -- Official rate limit documentation
- [Groq Free Tier Limits - Community](https://community.groq.com/t/what-are-the-rate-limits-for-the-groq-api-for-the-free-and-dev-tier-plans/42) -- Free tier specifics

### Markdown & Blog
- [Best Practices for Frontmatter - SSW Rules](https://www.ssw.com.au/rules/best-practices-for-frontmatter-in-markdown) -- Frontmatter validation patterns
