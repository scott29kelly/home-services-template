export interface AttributionSnapshot {
  landingPage: string
  currentPath: string
  referrer: string
  firstSeenAt: string
  lastSeenAt: string
  utmSource: string
  utmMedium: string
  utmCampaign: string
  utmTerm: string
  utmContent: string
  gclid: string
  fbclid: string
  msclkid: string
}

export interface SubmissionSummary {
  leadType: 'contact' | 'booking' | 'chat'
  submittedAt: string
  service?: string
  sourceLabel: string
  customerName?: string
  preferredDate?: string
  landingPage: string
  referrer: string
  utmSource: string
  utmMedium: string
  utmCampaign: string
}

const ATTRIBUTION_STORAGE_KEY = 'home-services:attribution'
const LAST_SUBMISSION_STORAGE_KEY = 'home-services:last-submission'

function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

function readStorage<T>(key: string): T | null {
  if (!isBrowser()) return null

  try {
    const raw = window.sessionStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function writeStorage<T>(key: string, value: T): void {
  if (!isBrowser()) return

  try {
    window.sessionStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Ignore storage failures in private mode or restricted environments.
  }
}

function getParam(searchParams: URLSearchParams, key: string): string {
  return searchParams.get(key)?.trim() ?? ''
}

/**
 * Capture current attribution details and persist the initial landing context.
 */
export function captureAttribution(pathname: string, search: string): AttributionSnapshot | null {
  if (!isBrowser()) return null

  const searchParams = new URLSearchParams(search)
  const now = new Date().toISOString()
  const existing = readStorage<AttributionSnapshot>(ATTRIBUTION_STORAGE_KEY)

  const snapshot: AttributionSnapshot = {
    landingPage: existing?.landingPage || pathname,
    currentPath: pathname,
    referrer: existing?.referrer || document.referrer || '',
    firstSeenAt: existing?.firstSeenAt || now,
    lastSeenAt: now,
    utmSource: getParam(searchParams, 'utm_source') || existing?.utmSource || '',
    utmMedium: getParam(searchParams, 'utm_medium') || existing?.utmMedium || '',
    utmCampaign: getParam(searchParams, 'utm_campaign') || existing?.utmCampaign || '',
    utmTerm: getParam(searchParams, 'utm_term') || existing?.utmTerm || '',
    utmContent: getParam(searchParams, 'utm_content') || existing?.utmContent || '',
    gclid: getParam(searchParams, 'gclid') || existing?.gclid || '',
    fbclid: getParam(searchParams, 'fbclid') || existing?.fbclid || '',
    msclkid: getParam(searchParams, 'msclkid') || existing?.msclkid || '',
  }

  writeStorage(ATTRIBUTION_STORAGE_KEY, snapshot)
  return snapshot
}

export function getAttributionSnapshot(currentPath?: string): AttributionSnapshot | null {
  const stored = readStorage<AttributionSnapshot>(ATTRIBUTION_STORAGE_KEY)
  if (!stored) return null
  return currentPath ? { ...stored, currentPath } : stored
}

/**
 * Flatten attribution and context into submission-friendly fields.
 */
export function buildLeadMetadata(
  context: {
    path: string
    formType: 'contact' | 'booking' | 'chat'
    service?: string
    sourceLabel?: string
  },
): Record<string, string> {
  const attribution = getAttributionSnapshot(context.path)

  return {
    leadType: context.formType,
    sourceLabel: context.sourceLabel ?? context.formType,
    sourcePath: context.path,
    landingPage: attribution?.landingPage ?? context.path,
    referrer: attribution?.referrer ?? '',
    utmSource: attribution?.utmSource ?? '',
    utmMedium: attribution?.utmMedium ?? '',
    utmCampaign: attribution?.utmCampaign ?? '',
    utmTerm: attribution?.utmTerm ?? '',
    utmContent: attribution?.utmContent ?? '',
    gclid: attribution?.gclid ?? '',
    fbclid: attribution?.fbclid ?? '',
    msclkid: attribution?.msclkid ?? '',
    submittedAt: new Date().toISOString(),
    serviceContext: context.service ?? '',
  }
}

/**
 * Persist a compact submission summary so the thank-you page can render lead
 * context without depending on the original form state still being mounted.
 */
export function buildSubmissionSummary(
  summary: {
    leadType: SubmissionSummary['leadType']
    submittedAt: string
    service?: string
    sourceLabel: string
    customerName?: string
    preferredDate?: string
    path: string
  },
): SubmissionSummary {
  const attribution = getAttributionSnapshot(summary.path)

  return {
    leadType: summary.leadType,
    submittedAt: summary.submittedAt,
    service: summary.service,
    sourceLabel: summary.sourceLabel,
    customerName: summary.customerName,
    preferredDate: summary.preferredDate,
    landingPage: attribution?.landingPage ?? summary.path,
    referrer: attribution?.referrer ?? '',
    utmSource: attribution?.utmSource ?? '',
    utmMedium: attribution?.utmMedium ?? '',
    utmCampaign: attribution?.utmCampaign ?? '',
  }
}

export function persistLastSubmission(summary: SubmissionSummary): void {
  writeStorage(LAST_SUBMISSION_STORAGE_KEY, summary)
}

export function getLastSubmission(): SubmissionSummary | null {
  return readStorage<SubmissionSummary>(LAST_SUBMISSION_STORAGE_KEY)
}
