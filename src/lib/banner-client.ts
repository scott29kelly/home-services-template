import { banner } from '../config/banner'

export interface BannerData {
  enabled: boolean
  text: string
  ctaText: string
  ctaHref: string
  urgency: 'high' | 'medium' | 'low'
}

/**
 * Fetch banner data from the configured CMS endpoint.
 * Returns null when banner should not be shown.
 *
 * - If no endpoint is configured, returns fallback (if enabled) or null.
 * - Fetch failures are silent -- the banner is non-critical UI.
 * - Only returns data when `enabled` is true in the response.
 */
export async function fetchBanner(): Promise<BannerData | null> {
  // No endpoint configured -- use fallback
  if (!banner.endpoint) {
    return banner.fallback.enabled ? (banner.fallback as BannerData) : null
  }

  try {
    const res = await fetch(banner.endpoint, { method: 'GET' })

    if (!res.ok) {
      return banner.fallback.enabled ? (banner.fallback as BannerData) : null
    }

    const data = await res.json()

    // Validate expected shape
    if (
      typeof data.enabled !== 'boolean' ||
      typeof data.text !== 'string'
    ) {
      return banner.fallback.enabled ? (banner.fallback as BannerData) : null
    }

    if (!data.enabled) return null

    return {
      enabled: data.enabled,
      text: data.text,
      ctaText: data.ctaText || '',
      ctaHref: data.ctaHref || '',
      urgency: ['high', 'medium', 'low'].includes(data.urgency)
        ? data.urgency
        : 'medium',
    }
  } catch {
    // Fetch failed silently -- banner is non-critical
    return banner.fallback.enabled ? (banner.fallback as BannerData) : null
  }
}
