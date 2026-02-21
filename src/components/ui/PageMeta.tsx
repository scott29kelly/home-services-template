/**
 * Per-page SEO metadata using React 19's native <title> and <meta> hoisting.
 * These elements are automatically moved to <head> by React.
 */

import { SITE } from '../../config/site'

interface PageMetaProps {
  title: string
  description: string
  path?: string
}

export default function PageMeta({ title, description, path = '' }: PageMetaProps) {
  const fullTitle = title === SITE.name ? title : `${title} | ${SITE.name}`
  const url = `${SITE.url}${path}`

  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
    </>
  )
}
