# Home Services Template

Conversion-focused home services site built with React Router 7, React 19, Vite, TypeScript, Tailwind CSS v4, and Vercel-friendly serverless endpoints.

## Quick Start

```bash
npm install
npm run dev
npm run typecheck
npm run test:run
npm run build
```

Local dev runs on the React Router dev server. Production builds output to `build/client`, which matches [vercel.json](/C:/Users/scott/Documents/home-services-template/vercel.json).

## Stack

- React 19
- React Router 7 framework mode
- Vite 7
- TypeScript
- Tailwind CSS v4
- Playwright smoke tests
- Vercel deployment target with serverless functions in `api/`

## Architecture

The live runtime route tree is defined in [src/routes.ts](/C:/Users/scott/Documents/home-services-template/src/routes.ts) and implemented from [src/routes](/C:/Users/scott/Documents/home-services-template/src/routes.ts).

Key runtime routes:

- [src/routes/service-page.tsx](/C:/Users/scott/Documents/home-services-template/src/routes/service-page.tsx)
- [src/routes/service-areas.$slug.tsx](/C:/Users/scott/Documents/home-services-template/src/routes/service-areas.$slug.tsx)
- [src/routes/resources.$slug.tsx](/C:/Users/scott/Documents/home-services-template/src/routes/resources.$slug.tsx)
- [src/routes/portfolio.$slug.tsx](/C:/Users/scott/Documents/home-services-template/src/routes/portfolio.$slug.tsx)

Shared content and configuration live in:

- [src/config](/C:/Users/scott/Documents/home-services-template/src/config/index.ts): business data and feature flags, validated with Zod
- [src/content/blog](/C:/Users/scott/Documents/home-services-template/src/content/blog): markdown resource articles
- [src/lib/build-routes.ts](/C:/Users/scott/Documents/home-services-template/src/lib/build-routes.ts): build-time sitemap and prerender route discovery
- [api](/C:/Users/scott/Documents/home-services-template/api/chat.js): Vercel serverless endpoints for Ava chat, Google reviews, lead capture, and booking availability

`src/pages` contains presentational page components used by several route files. Route-specific loaders, redirects, and runtime-only behavior belong in `src/routes`.

## Configuration

Most site data is configured through the modular files under [src/config](/C:/Users/scott/Documents/home-services-template/src/config/index.ts):

- `company.ts`: business identity, contact info, URL, hours
- `services.ts`: service definitions and service-page content
- `service-areas.ts`: city pages and service-area coverage
- `projects.ts`: portfolio and before/after content
- `testimonials.ts`: featured and city/service-specific social proof
- `features.ts`: runtime feature flags
- `forms.ts`: contact and booking UI copy plus the live booking/lead submission settings

## Environment Variables

Optional runtime integrations:

- `GROQ_API_KEY`: enables live Ava chat responses through [api/chat.js](/C:/Users/scott/Documents/home-services-template/api/chat.js)
- `ALLOWED_ORIGIN`: restricts chat API CORS in production
- `GOOGLE_PLACES_API_KEY`: enables live Google reviews fetches
- `GOOGLE_PLACE_ID`: target Google Business Profile place id for reviews
- `SUPABASE_URL`: Supabase project URL used by [api/leads.js](/C:/Users/scott/Documents/home-services-template/api/leads.js)
- `SUPABASE_SERVICE_ROLE_KEY`: server-side key for inserting leads and bookings into Supabase
- `SUPABASE_LEADS_TABLE`: optional table override for lead storage, defaults to `leads`
- `LEAD_NOTIFICATION_WEBHOOK_URL`: optional webhook for immediate team alerts after a lead is saved

Without those values, the site still builds. Ava and Google reviews degrade safely, while `/api/leads` uses an in-memory fallback in local development and returns a setup error in production until Supabase is configured.

The SQL migration for the lead table lives at [supabase/migrations/202603250001_create_leads.sql](/C:/Users/scott/Documents/home-services-template/supabase/migrations/202603250001_create_leads.sql).

## Testing and Validation

Use the existing checks before shipping changes:

```bash
npm run typecheck
npm run test:run
npm run build
```

The Playwright smoke suite covers the main conversion paths, including homepage hydration, contact submission, booking submission, resources navigation, service-area routing, and Ava escalation.

## Deployment

This project is configured for Vercel:

- Build command: `npm run build`
- Output directory: `build/client`
- Serverless endpoints: `api/*.js`

The build also generates `sitemap.xml`, `robots.txt`, and optimized image variants during the Vite production build.
