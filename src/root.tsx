import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from 'react-router'
import './index.css'
import interRegularFont from './fonts/inter-v18-latin-regular.woff2?url'
import interSemiboldFont from './fonts/inter-v18-latin-600.woff2?url'
import jakartaExtraboldFont from './fonts/plus-jakarta-sans-v8-latin-800.woff2?url'

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta
          name="description"
          content="Professional roofing, siding, and storm damage repair services. Licensed &amp; insured. Free inspections. Call today for a free estimate."
        />
        <title>Home Services Template | Roofing, Siding &amp; Storm Repair</title>

        {/* Per-route meta tags (title, description, og:*) injected here */}
        <Meta />
        <Links />

        {/* Fonts served from same origin via @font-face in index.css — no Google Fonts external requests */}
        {/* Preload critical woff2 fonts — eliminates CSS-parse-then-discover delay (~200ms LCP improvement) */}
        <link rel="preload" as="font" type="font/woff2" href={interRegularFont} crossOrigin="" />
        <link rel="preload" as="font" type="font/woff2" href={interSemiboldFont} crossOrigin="" />
        <link rel="preload" as="font" type="font/woff2" href={jakartaExtraboldFont} crossOrigin="" />

        {/* Preload LCP hero image — AVIF primary, WebP fallback */}
        <link
          rel="preload"
          as="image"
          type="image/avif"
          imageSrcSet="/images/hero-roofing-768w.avif 768w, /images/hero-roofing-1280w.avif 1280w, /images/hero-roofing.avif 1920w"
          imageSizes="100vw"
        />
        <link
          rel="preload"
          as="image"
          href="/images/hero-roofing.webp"
          imageSrcSet="/images/hero-roofing-768w.webp 768w, /images/hero-roofing-1280w.webp 1280w, /images/hero-roofing.webp 1920w"
          imageSizes="100vw"
          type="image/webp"
        />

        {/* Favicon */}
        <link
          rel="icon"
          type="image/svg+xml"
          href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath fill='%230F172A' d='M50 5L5 45h15v50h60V45h15L50 5z'/%3E%3Cpath fill='%23F97316' d='M50 20L25 42v38h50V42L50 20z'/%3E%3C/svg%3E"
        />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Home Services Template | Roofing, Siding &amp; Storm Repair" />
        <meta
          property="og:description"
          content="Professional roofing, siding, and storm damage repair services. Licensed &amp; insured. Free inspections."
        />
        <meta property="og:image" content="/images/hero-roofing.webp" />

        {/* Schema.org */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'HomeAndConstructionBusiness',
              name: 'Acme Home Services',
              description: 'Professional roofing, siding, and storm damage repair services.',
              telephone: '555-123-4567',
              email: 'info@acmehomeservices.com',
              address: {
                '@type': 'PostalAddress',
                streetAddress: '123 Main St',
                addressLocality: 'Anytown',
                addressRegion: 'TX',
                postalCode: '78701',
                addressCountry: 'US',
              },
              priceRange: '$$',
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '4.9',
                reviewCount: '500',
                bestRating: '5',
              },
            }),
          }}
        />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function Root() {
  return <Outlet />
}
