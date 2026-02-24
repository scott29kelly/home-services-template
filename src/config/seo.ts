/**
 * SEO defaults. Per-page overrides happen via the PageMeta component.
 */
export const seo = {
  titleTemplate: '%s | Acme Home Services',
  defaultTitle: 'Acme Home Services — Roofing & Siding',
  defaultDescription:
    'Expert roofing, siding, and storm damage repair. Licensed, insured, and manufacturer-certified. Serving the Greater Metro Area.',
  ogImage: '/images/og-default.webp',
  twitterCardType: 'summary_large_image' as const,
}
