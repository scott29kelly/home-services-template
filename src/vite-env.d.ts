/// <reference types="vite/client" />

interface Window {
  dataLayer?: Array<Record<string, string | number | boolean | null | undefined>>
  gtag?: (command: 'event', eventName: string, params?: Record<string, string | number | boolean | null | undefined>) => void
}
