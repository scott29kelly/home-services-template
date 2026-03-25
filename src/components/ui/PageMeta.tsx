/**
 * Per-page SEO metadata using React 19's native <title> and <meta> hoisting.
 * These elements are automatically moved to <head> by React.
 */

import { company } from '../../config/company'
import { seo } from '../../config/seo'

interface PageMetaProps {
  title: string
  description: string
  path?: string
  /** Per-page OG image override — relative path (e.g. /images/page.webp) or absolute URL */
  ogImage?: string
  /** Add noindex, nofollow for pages like thank-you and 404 */
  noindex?: boolean
}

export default function PageMeta({ title, description, path = '', ogImage, noindex }: PageMetaProps) {
  const fullTitle = title === company.name ? title : `${title} | ${company.name}`
  const pageUrl = `${company.url}${path}`

  const imageUrl = (() => {
    const src = ogImage || seo.ogImage
    return src.startsWith('http') ? src : `${company.url}${src}`
  })()

  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Canonical */}
      <link rel="canonical" href={pageUrl} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      {/* Twitter Card */}
      <meta name="twitter:card" content={seo.twitterCardType} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
    </>
  )
}
