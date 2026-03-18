import { useEffect } from 'react'
import {
  Links,
  Meta,
  Outlet,
  Scripts,
} from 'react-router'
import './index.css'
import interRegularFont from './fonts/inter-v18-latin-regular.woff2?url'
import interSemiboldFont from './fonts/inter-v18-latin-600.woff2?url'
import jakartaExtraboldFont from './fonts/plus-jakarta-sans-v8-latin-800.woff2?url'
import { company } from './config/company'
import { seo } from './config/seo'

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta
          name="description"
          content={seo.defaultDescription}
        />
        <title>{seo.defaultTitle}</title>

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
        <meta property="og:title" content={seo.defaultTitle} />
        <meta
          property="og:description"
          content={seo.defaultDescription}
        />
        <meta property="og:image" content={seo.ogImage} />

        {/* Schema.org */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'HomeAndConstructionBusiness',
              name: company.name,
              description: seo.defaultDescription,
              telephone: company.phone,
              email: company.email,
              address: {
                '@type': 'PostalAddress',
                streetAddress: company.address.street,
                addressLocality: company.address.city,
                addressRegion: company.address.state,
                postalCode: company.address.zip,
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

        {/* Kill browser scroll restoration before it fires (before hydration) */}
        <script dangerouslySetInnerHTML={{ __html: "history.scrollRestoration='manual'" }} />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}

export default function Root() {
  useEffect(() => {
    document.documentElement.dataset.appHydrated = 'true'

    return () => {
      delete document.documentElement.dataset.appHydrated
    }
  }, [])

  return <Outlet />
}
