export type AnalyticsValue = string | number | boolean | null | undefined
export type AnalyticsPayload = Record<string, AnalyticsValue>

interface AnalyticsWindow extends Window {
  dataLayer?: Array<Record<string, AnalyticsValue>>
  gtag?: (command: 'event', eventName: string, params?: AnalyticsPayload) => void
}

function getAnalyticsWindow(): AnalyticsWindow | null {
  if (typeof window === 'undefined') return null
  return window as AnalyticsWindow
}

/**
 * Emit an analytics event in a provider-agnostic way.
 * Supports GTM-style dataLayer pushes, gtag, and a custom browser event.
 */
export function trackEvent(eventName: string, payload: AnalyticsPayload = {}): void {
  const analyticsWindow = getAnalyticsWindow()
  if (!analyticsWindow) return

  const eventPayload = {
    event: eventName,
    timestamp: new Date().toISOString(),
    ...payload,
  }

  analyticsWindow.dataLayer = analyticsWindow.dataLayer ?? []
  analyticsWindow.dataLayer.push(eventPayload)

  if (typeof analyticsWindow.gtag === 'function') {
    analyticsWindow.gtag('event', eventName, payload)
  }

  analyticsWindow.dispatchEvent(
    new CustomEvent('home-services:analytics', { detail: eventPayload }),
  )

  if (import.meta.env.DEV) {
    console.info('[analytics]', eventName, payload)
  }
}

export function trackPageView(pathname: string, title?: string): void {
  trackEvent('page_view', {
    page_path: pathname,
    page_title: title ?? '',
  })
}
