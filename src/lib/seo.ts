/**
 * SEO schema builder functions.
 *
 * Each function returns a valid schema.org JSON-LD object.
 * Pass the result directly to <JsonLd data={...} />.
 *
 * All builders are pure functions with no side effects.
 */
import { company } from '../config/company'
import { seo } from '../config/seo'
import { testimonials } from '../config/testimonials'
import type { ServiceConfig } from '../config/services'
import type { BlogPost } from '../lib/blog'

/* ── Types ────────────────────────────────────────────────────────── */

export interface BreadcrumbItem {
  name: string
  url: string
}

export interface FaqItem {
  question: string
  answer: string
}

/* ── Helpers ──────────────────────────────────────────────────────── */

/**
 * Build an absolute URL from a relative path.
 * If the path already starts with 'http', it is returned as-is.
 */
function absoluteUrl(path: string): string {
  if (path.startsWith('http')) return path
  return `${company.url}${path.startsWith('/') ? '' : '/'}${path}`
}

/* ── Schema builders ──────────────────────────────────────────────── */

/**
 * buildLocalBusinessSchema
 *
 * Returns a LocalBusiness schema populated from company config.
 * Pass `options.cityName` to add an `areaServed` field for city pages.
 */
export function buildLocalBusinessSchema(
  options?: { cityName?: string }
): Record<string, unknown> {
  // Compute aggregate rating from testimonials.all
  const ratings = testimonials.all
    .map((t) => t.rating ?? 5)
    .filter((r) => typeof r === 'number')

  const aggregateRating =
    ratings.length > 0
      ? {
          '@type': 'AggregateRating',
          ratingValue: (ratings.reduce((sum, r) => sum + r, 0) / ratings.length).toFixed(1),
          reviewCount: ratings.length,
        }
      : undefined

  // Filter out placeholder '#' social links
  const sameAs = Object.values(company.social).filter((url) => url !== '#')

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: company.name,
    description: seo.defaultDescription,
    url: company.url,
    telephone: company.phone,
    email: company.email,
    logo: absoluteUrl(seo.ogImage),
    image: absoluteUrl(seo.ogImage),
    address: {
      '@type': 'PostalAddress',
      streetAddress: company.address.street,
      addressLocality: company.address.city,
      addressRegion: company.address.state,
      postalCode: company.address.zip,
      addressCountry: 'US',
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '08:00',
        closes: '18:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Saturday'],
        opens: '09:00',
        closes: '14:00',
      },
    ],
  }

  if (sameAs.length > 0) {
    schema.sameAs = sameAs
  }

  if (aggregateRating) {
    schema.aggregateRating = aggregateRating
  }

  if (options?.cityName) {
    schema.areaServed = { '@type': 'City', name: options.cityName }
  }

  return schema
}

/**
 * buildServiceSchema
 *
 * Returns a Service schema for a service page.
 */
export function buildServiceSchema(service: ServiceConfig): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    description: service.meta.description,
    provider: {
      '@type': 'LocalBusiness',
      name: company.name,
    },
    areaServed: {
      '@type': 'State',
      name: company.address.state,
    },
    url: `${company.url}/${service.slug}`,
  }
}

/**
 * buildFAQSchema
 *
 * Returns a FAQPage schema for a list of question/answer pairs.
 */
export function buildFAQSchema(items: FaqItem[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
}

/**
 * buildBreadcrumbSchema
 *
 * Returns a BreadcrumbList schema for a page's breadcrumb trail.
 * URLs are made absolute using company.url.
 *
 * Example:
 *   buildBreadcrumbSchema([
 *     { name: 'Home', url: '/' },
 *     { name: 'Services', url: '/services' },
 *     { name: 'Roofing', url: '/roofing' },
 *   ])
 */
export function buildBreadcrumbSchema(
  crumbs: BreadcrumbItem[]
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.url),
    })),
  }
}

/**
 * buildBlogPostingSchema
 *
 * Returns a BlogPosting schema for a blog post.
 */
export function buildBlogPostingSchema(post: BlogPost): Record<string, unknown> {
  const logoUrl = absoluteUrl(seo.ogImage)

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      '@type': 'Organization',
      name: company.name,
    },
    publisher: {
      '@type': 'Organization',
      name: company.name,
      logo: {
        '@type': 'ImageObject',
        url: logoUrl,
      },
    },
    image: absoluteUrl(post.coverImage),
    url: `${company.url}/resources/${post.slug}`,
    keywords: post.tags,
  }
}
