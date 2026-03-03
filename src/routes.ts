import { type RouteConfig, index, route, layout } from '@react-router/dev/routes'

export default [
  // Layout route wraps all pages with Header, Footer, AvaWidget, StickyMobileCTA
  layout('routes/layout.tsx', [
    index('routes/home.tsx'),

    // Explicit service routes — avoids :serviceSlug collision with /services and other top-level routes
    // Each shares service-page.tsx but needs a unique id to avoid duplicate route id error
    route('roofing', 'routes/service-page.tsx', { id: 'routes/service-page/roofing' }),
    route('siding', 'routes/service-page.tsx', { id: 'routes/service-page/siding' }),
    route('storm-damage', 'routes/service-page.tsx', { id: 'routes/service-page/storm-damage' }),

    route('services', 'routes/services.tsx'),
    route('projects', 'routes/projects.tsx'),
    route('portfolio/:slug', 'routes/portfolio.$slug.tsx'),
    route('testimonials', 'routes/testimonials.tsx'),
    route('about', 'routes/about.tsx'),
    route('contact', 'routes/contact.tsx'),
    route('thank-you', 'routes/thank-you.tsx'),
    route('service-areas', 'routes/service-areas.tsx'),
    route('service-areas/:slug', 'routes/service-areas.$slug.tsx'),
    route('ava', 'routes/ava.tsx'),
    route('financing', 'routes/financing.tsx'),
    route('resources', 'routes/resources.tsx'),
    route('resources/:slug', 'routes/resources.$slug.tsx'),

    // 404 catch-all
    route('*', 'routes/$.tsx'),
  ]),
] satisfies RouteConfig
