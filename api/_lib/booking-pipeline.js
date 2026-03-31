import { z } from 'zod'

const PHONE_REGEX = /^\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const BOOKING_TIMEZONE = 'America/New_York'
const DEFAULT_LEADS_TABLE = 'leads'
const LOCAL_STORAGE_MODE = 'memory'
const PRODUCTION_STORAGE_MODE = 'supabase'
const BLOCKED_DAYS = [0]
const MAX_DAYS_OUT = 60

const WEEKDAY_SLOTS = [
  { label: '8:30 AM - 10:00 AM' },
  { label: '10:30 AM - 12:00 PM' },
  { label: '1:00 PM - 2:30 PM' },
  { label: '3:00 PM - 4:30 PM' },
]

const SATURDAY_SLOTS = [
  { label: '9:00 AM - 10:30 AM' },
  { label: '11:00 AM - 12:30 PM' },
]

const localBookingStore = []

const optionalString = z.preprocess((value) => {
  if (value === null || value === undefined) return undefined
  return String(value)
}, z.string().trim().optional())

const bookingSubmissionSchema = z.object({
  leadType: z.literal('booking'),
  sourceLabel: optionalString,
  sourcePath: optionalString,
  landingPage: optionalString,
  referrer: optionalString,
  utmSource: optionalString,
  utmMedium: optionalString,
  utmCampaign: optionalString,
  utmTerm: optionalString,
  utmContent: optionalString,
  gclid: optionalString,
  fbclid: optionalString,
  msclkid: optionalString,
  submittedAt: optionalString,
  serviceContext: optionalString,
  firstName: optionalString,
  lastName: optionalString,
  email: optionalString,
  phone: optionalString,
  address: optionalString,
  service: optionalString,
  preferredDate: optionalString,
  preferredTime: optionalString,
  notes: optionalString,
  _gotcha: optionalString,
}).passthrough().superRefine((value, ctx) => {
  const fullName = [value.firstName, value.lastName].filter(Boolean).join(' ').trim()

  if (!fullName) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'A customer name is required.',
      path: ['firstName'],
    })
  }

  if (!value.phone || !PHONE_REGEX.test(value.phone)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'A valid phone number is required.',
      path: ['phone'],
    })
  }

  if (!value.email || !EMAIL_REGEX.test(value.email)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'A valid email address is required.',
      path: ['email'],
    })
  }

  if (!value.service) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'A service selection is required.',
      path: ['service'],
    })
  }

  if (!value.preferredDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'A date is required.',
      path: ['preferredDate'],
    })
  }

  if (!value.preferredTime) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'A time window is required.',
      path: ['preferredTime'],
    })
  }
})

function createResponse(status, body, headers) {
  return {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body,
  }
}

function buildCorsHeaders(requestHeaders = {}, env = process.env) {
  const allowedOrigin = env.ALLOWED_ORIGIN
  const requestOrigin = requestHeaders.origin

  // In production, require ALLOWED_ORIGIN to be set — never fall back to wildcard
  if (!allowedOrigin && isProductionRuntime(env)) {
    return {
      'Access-Control-Allow-Origin': requestOrigin || 'null',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      Vary: 'Origin',
    }
  }

  const origin = allowedOrigin
    ? requestOrigin === allowedOrigin
      ? requestOrigin
      : allowedOrigin
    : requestOrigin || '*'

  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin',
  }
}

function parseRequestBody(body) {
  if (body && typeof body === 'object') return body
  if (typeof body === 'string' && body.length > 0) {
    return JSON.parse(body)
  }
  return {}
}

function parseUrl(url) {
  return new URL(url, 'http://localhost')
}

function parseISODate(isoDate) {
  const [year, month, day] = isoDate.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day))
}

function toISODate(date) {
  return date.toISOString().slice(0, 10)
}

function getBusinessToday() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: BOOKING_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

function addDays(isoDate, days) {
  const date = parseISODate(isoDate)
  date.setUTCDate(date.getUTCDate() + days)
  return toISODate(date)
}

function isValidISODate(isoDate) {
  return /^\d{4}-\d{2}-\d{2}$/.test(isoDate)
}

function isBookableDate(isoDate) {
  if (!isValidISODate(isoDate)) return false

  const today = getBusinessToday()
  const maxDate = addDays(today, MAX_DAYS_OUT)
  const date = parseISODate(isoDate)

  if (isoDate < today || isoDate > maxDate) return false
  if (BLOCKED_DAYS.includes(date.getUTCDay())) return false
  return true
}

function getSlotsForDate(isoDate) {
  const dayOfWeek = parseISODate(isoDate).getUTCDay()
  if (dayOfWeek === 6) {
    return SATURDAY_SLOTS
  }
  return WEEKDAY_SLOTS
}

function formatScheduledFor(isoDate, slotLabel) {
  const date = parseISODate(isoDate)
  const dateLabel = date.toLocaleDateString('en-US', {
    timeZone: 'UTC',
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
  return `${dateLabel} during the ${slotLabel} window`
}

function createLeadReference(submittedAt) {
  const date = submittedAt.slice(0, 10).replace(/-/g, '')
  const randomPart = (
    globalThis.crypto?.randomUUID?.().replace(/-/g, '').slice(0, 8) ??
    Math.random().toString(36).slice(2, 10)
  ).toUpperCase()

  return `LEAD-${date}-${randomPart}`
}

function getSupabaseConfig(env = process.env) {
  const url = env.SUPABASE_URL?.trim()
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  const table = env.SUPABASE_LEADS_TABLE?.trim() || DEFAULT_LEADS_TABLE

  return {
    url,
    serviceRoleKey,
    table,
  }
}

function buildSupabaseUrl(baseUrl, table) {
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`
  return new URL(`rest/v1/${table}`, normalizedBase).toString()
}

function isConfiguredForSupabase(env = process.env) {
  const { url, serviceRoleKey } = getSupabaseConfig(env)
  return Boolean(url && serviceRoleKey)
}

function isProductionRuntime(env = process.env) {
  return env.NODE_ENV === 'production' || env.VERCEL === '1'
}

async function getBookedSlotLabels(isoDate, env) {
  if (isConfiguredForSupabase(env)) {
    const { url, serviceRoleKey, table } = getSupabaseConfig(env)
    const requestUrl = new URL(buildSupabaseUrl(url, table))
    requestUrl.searchParams.set('select', 'preferred_time')
    requestUrl.searchParams.set('lead_type', 'eq.booking')
    requestUrl.searchParams.set('status', 'in.(scheduled,confirmed)')
    requestUrl.searchParams.set('preferred_date', `eq.${isoDate}`)
    requestUrl.searchParams.set('order', 'preferred_time.asc')

    const response = await fetch(requestUrl, {
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
    })

    if (!response.ok) {
      const details = await response.text()
      throw new Error(`Supabase availability query failed (${response.status}): ${details}`)
    }

    const records = await response.json()
    return new Set(records.map((record) => record.preferred_time).filter(Boolean))
  }

  return new Set(
    localBookingStore
      .filter((record) => record.preferred_date === isoDate && ['scheduled', 'confirmed'].includes(record.status))
      .map((record) => record.preferred_time),
  )
}

async function saveBookingRecord(record, env) {
  if (isConfiguredForSupabase(env)) {
    const { url, serviceRoleKey, table } = getSupabaseConfig(env)
    const response = await fetch(buildSupabaseUrl(url, table), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        Prefer: 'return=representation',
      },
      body: JSON.stringify(record),
    })

    if (!response.ok) {
      const details = await response.text()
      const error = new Error(`Supabase booking insert failed (${response.status}): ${details}`)
      error.code = response.status === 409 || details.includes('duplicate key') ? 'SLOT_CONFLICT' : 'BOOKING_SAVE_FAILED'
      throw error
    }

    const [savedRecord] = await response.json()
    return {
      storage: PRODUCTION_STORAGE_MODE,
      savedRecord: savedRecord || record,
    }
  }

  if (isProductionRuntime(env)) {
    const error = new Error('Lead pipeline is not configured. Set Supabase environment variables before deploying booking.')
    error.code = 'PIPELINE_NOT_CONFIGURED'
    throw error
  }

  const existing = localBookingStore.find(
    (booking) =>
      booking.preferred_date === record.preferred_date &&
      booking.preferred_time === record.preferred_time &&
      ['scheduled', 'confirmed'].includes(booking.status),
  )

  if (existing) {
    const error = new Error('That appointment window is no longer available.')
    error.code = 'SLOT_CONFLICT'
    throw error
  }

  localBookingStore.unshift(record)
  return {
    storage: LOCAL_STORAGE_MODE,
    savedRecord: record,
  }
}

async function sendBookingNotification(record, env) {
  const webhookUrl = env.LEAD_NOTIFICATION_WEBHOOK_URL?.trim()
  if (!webhookUrl) return

  const payload = {
    text: `New confirmed booking ${record.reference_code}`,
    lead: {
      referenceCode: record.reference_code,
      leadType: record.lead_type,
      submittedAt: record.submitted_at,
      fullName: record.full_name,
      phone: record.phone,
      email: record.email,
      service: record.service_name,
      scheduledFor: formatScheduledFor(record.preferred_date, record.preferred_time),
      landingPage: record.landing_page,
      utmSource: record.utm_source,
      utmCampaign: record.utm_campaign,
    },
  }

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
  } catch (error) {
    console.error('[booking-pipeline] Notification webhook failed', error)
  }
}

function buildFieldErrors(zodError) {
  return Object.fromEntries(
    zodError.issues.map((issue) => [
      issue.path.join('.') || 'form',
      issue.message,
    ]),
  )
}

function buildBookingLeadRecord(payload) {
  const submittedAt = payload.submittedAt && !Number.isNaN(new Date(payload.submittedAt).valueOf())
    ? new Date(payload.submittedAt).toISOString()
    : new Date().toISOString()
  const fullName = [payload.firstName, payload.lastName].filter(Boolean).join(' ').trim()
  const sourcePath = payload.sourcePath || ''

  return {
    reference_code: createLeadReference(submittedAt),
    lead_type: 'booking',
    status: 'scheduled',
    submitted_at: submittedAt,
    source_label: payload.sourceLabel || 'booking-form',
    source_path: sourcePath,
    landing_page: payload.landingPage || sourcePath,
    referrer: payload.referrer || '',
    service_name: payload.service || payload.serviceContext || '',
    first_name: payload.firstName || '',
    last_name: payload.lastName || '',
    full_name: fullName,
    email: payload.email || '',
    phone: payload.phone || '',
    address: payload.address || '',
    referral: '',
    message: '',
    preferred_date: payload.preferredDate,
    preferred_time: payload.preferredTime,
    notes: payload.notes || '',
    page_context: '',
    conversation_preview: '',
    utm_source: payload.utmSource || '',
    utm_medium: payload.utmMedium || '',
    utm_campaign: payload.utmCampaign || '',
    utm_term: payload.utmTerm || '',
    utm_content: payload.utmContent || '',
    gclid: payload.gclid || '',
    fbclid: payload.fbclid || '',
    msclkid: payload.msclkid || '',
    raw_payload: payload,
  }
}

/**
 * Return the open appointment windows for a given booking date.
 */
export async function handleBookingAvailabilityRequest({
  method,
  headers = {},
  url,
  env = process.env,
}) {
  const responseHeaders = buildCorsHeaders(headers, env)

  if (method === 'OPTIONS') {
    return createResponse(200, { ok: true }, responseHeaders)
  }

  if (method !== 'GET') {
    return createResponse(405, { ok: false, error: 'Method not allowed.' }, responseHeaders)
  }

  const requestUrl = parseUrl(url)
  const preferredDate = requestUrl.searchParams.get('date')?.trim() || ''

  if (!isValidISODate(preferredDate)) {
    return createResponse(400, { ok: false, error: 'A valid booking date is required.' }, responseHeaders)
  }

  if (!isBookableDate(preferredDate)) {
    return createResponse(200, {
      ok: true,
      date: preferredDate,
      timezone: BOOKING_TIMEZONE,
      slots: [],
      message: 'No appointment windows are available for that day.',
    }, responseHeaders)
  }

  try {
    const bookedSlots = await getBookedSlotLabels(preferredDate, env)
    const slots = getSlotsForDate(preferredDate)
      .filter((slot) => !bookedSlots.has(slot.label))
      .map((slot) => ({
        label: slot.label,
        scheduledFor: formatScheduledFor(preferredDate, slot.label),
      }))

    return createResponse(200, {
      ok: true,
      date: preferredDate,
      timezone: BOOKING_TIMEZONE,
      slots,
    }, responseHeaders)
  } catch (error) {
    console.error('[booking-pipeline] Failed to load availability', error)

    return createResponse(500, {
      ok: false,
      error: 'We could not load live availability right now.',
    }, responseHeaders)
  }
}

/**
 * Reserve a real appointment window and persist it to the lead pipeline.
 */
export async function handleBookingRequest({
  method,
  headers = {},
  body,
  env = process.env,
}) {
  const responseHeaders = buildCorsHeaders(headers, env)

  if (method === 'OPTIONS') {
    return createResponse(200, { ok: true }, responseHeaders)
  }

  if (method !== 'POST') {
    return createResponse(405, { ok: false, error: 'Method not allowed.' }, responseHeaders)
  }

  let payload
  try {
    payload = parseRequestBody(body)
  } catch {
    return createResponse(400, { ok: false, error: 'Invalid JSON payload.' }, responseHeaders)
  }

  const parsed = bookingSubmissionSchema.safeParse(payload)
  if (!parsed.success) {
    return createResponse(400, {
      ok: false,
      error: 'Please review the booking details and try again.',
      fieldErrors: buildFieldErrors(parsed.error),
    }, responseHeaders)
  }

  if (parsed.data._gotcha) {
    return createResponse(200, { ok: true, spamFiltered: true }, responseHeaders)
  }

  if (!isBookableDate(parsed.data.preferredDate)) {
    return createResponse(400, {
      ok: false,
      error: 'That booking date is not available. Please choose a different day.',
    }, responseHeaders)
  }

  const availableSlots = getSlotsForDate(parsed.data.preferredDate)
  const matchingSlot = availableSlots.find((slot) => slot.label === parsed.data.preferredTime)
  if (!matchingSlot) {
    return createResponse(400, {
      ok: false,
      error: 'That appointment window is no longer available. Please choose another slot.',
    }, responseHeaders)
  }

  try {
    const bookedSlots = await getBookedSlotLabels(parsed.data.preferredDate, env)
    if (bookedSlots.has(parsed.data.preferredTime)) {
      return createResponse(409, {
        ok: false,
        error: 'That appointment window was just booked. Please choose another slot.',
      }, responseHeaders)
    }

    const record = buildBookingLeadRecord(parsed.data)
    const { storage, savedRecord } = await saveBookingRecord(record, env)
    await sendBookingNotification(savedRecord, env)

    return createResponse(200, {
      ok: true,
      leadId: savedRecord.id || savedRecord.reference_code,
      referenceCode: savedRecord.reference_code || record.reference_code,
      preferredDate: savedRecord.preferred_date || record.preferred_date,
      preferredTime: savedRecord.preferred_time || record.preferred_time,
      scheduledFor: formatScheduledFor(
        savedRecord.preferred_date || record.preferred_date,
        savedRecord.preferred_time || record.preferred_time,
      ),
      storage,
      timezone: BOOKING_TIMEZONE,
    }, responseHeaders)
  } catch (error) {
    console.error('[booking-pipeline] Failed to save booking', error)

    if (error && typeof error === 'object' && error.code === 'SLOT_CONFLICT') {
      return createResponse(409, {
        ok: false,
        error: 'That appointment window was just booked. Please choose another slot.',
      }, responseHeaders)
    }

    if (error && typeof error === 'object' && error.code === 'PIPELINE_NOT_CONFIGURED') {
      return createResponse(503, {
        ok: false,
        error: 'Booking is not configured yet. Please call us directly while we finish setup.',
      }, responseHeaders)
    }

    return createResponse(500, {
      ok: false,
      error: 'We could not confirm your appointment right now. Please call us directly.',
    }, responseHeaders)
  }
}

