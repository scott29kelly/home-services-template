import { z } from 'zod'

const PHONE_REGEX = /^\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const DEFAULT_LEADS_TABLE = 'leads'
const LOCAL_STORAGE_MODE = 'memory'
const PRODUCTION_STORAGE_MODE = 'supabase'

const localLeadStore = []

const optionalString = z.preprocess((value) => {
  if (value === null || value === undefined) return undefined
  return String(value)
}, z.string().trim().optional())

const leadSubmissionSchema = z.object({
  leadType: z.enum(['contact', 'booking', 'chat']),
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
  name: optionalString,
  email: optionalString,
  phone: optionalString,
  address: optionalString,
  service: optionalString,
  referral: optionalString,
  message: optionalString,
  preferredDate: optionalString,
  preferredTime: optionalString,
  notes: optionalString,
  page: optionalString,
  pageContext: optionalString,
  conversationPreview: optionalString,
  source: optionalString,
  _gotcha: optionalString,
}).passthrough().superRefine((value, ctx) => {
  const fullName = getFullName(value)

  if (!fullName) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'A customer name is required.',
      path: ['name'],
    })
  }

  if (!value.phone || !PHONE_REGEX.test(value.phone)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'A valid phone number is required.',
      path: ['phone'],
    })
  }

  if (
    (value.leadType === 'contact' || value.leadType === 'booking') &&
    (!value.email || !EMAIL_REGEX.test(value.email))
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'A valid email address is required.',
      path: ['email'],
    })
  }

  if (
    (value.leadType === 'contact' || value.leadType === 'booking') &&
    !value.service
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'A service selection is required.',
      path: ['service'],
    })
  }

  if (value.leadType === 'booking' && !value.preferredDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'A preferred date is required.',
      path: ['preferredDate'],
    })
  }

  if (value.leadType === 'booking' && !value.preferredTime) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'A preferred time is required.',
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
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
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin',
  }
}

function getFullName(payload) {
  if (payload.name) return payload.name
  return [payload.firstName, payload.lastName].filter(Boolean).join(' ').trim()
}

function splitFullName(fullName) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) {
    return { firstName: '', lastName: '' }
  }
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: '' }
  }
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  }
}

function parseSubmissionTimestamp(value) {
  if (!value) return new Date().toISOString()

  const parsed = new Date(value)
  if (Number.isNaN(parsed.valueOf())) {
    return new Date().toISOString()
  }

  return parsed.toISOString()
}

function createLeadReference(submittedAt) {
  const date = submittedAt.slice(0, 10).replace(/-/g, '')
  const randomPart = (
    globalThis.crypto?.randomUUID?.().replace(/-/g, '').slice(0, 8) ??
    Math.random().toString(36).slice(2, 10)
  ).toUpperCase()

  return `LEAD-${date}-${randomPart}`
}

/**
 * Normalize a multi-source lead payload into one explicit record shape.
 */
function buildLeadRecord(payload) {
  const submittedAt = parseSubmissionTimestamp(payload.submittedAt)
  const fullName = getFullName(payload)
  const nameParts = splitFullName(fullName)
  const sourcePath = payload.sourcePath || payload.page || ''
  const serviceName = payload.service || payload.serviceContext || ''

  return {
    reference_code: createLeadReference(submittedAt),
    lead_type: payload.leadType,
    status: 'new',
    submitted_at: submittedAt,
    source_label: payload.sourceLabel || payload.source || payload.leadType,
    source_path: sourcePath,
    landing_page: payload.landingPage || sourcePath,
    referrer: payload.referrer || '',
    service_name: serviceName,
    first_name: payload.firstName || nameParts.firstName,
    last_name: payload.lastName || nameParts.lastName,
    full_name: fullName,
    email: payload.email || '',
    phone: payload.phone || '',
    address: payload.address || '',
    referral: payload.referral || '',
    message: payload.message || '',
    preferred_date: payload.preferredDate || null,
    preferred_time: payload.preferredTime || '',
    notes: payload.notes || '',
    page_context: payload.pageContext || '',
    conversation_preview: payload.conversationPreview || '',
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

function getSupabaseConfig(env) {
  const url = env.SUPABASE_URL?.trim()
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  const table = env.SUPABASE_LEADS_TABLE?.trim() || DEFAULT_LEADS_TABLE

  return {
    url,
    serviceRoleKey,
    table,
  }
}

function isConfiguredForSupabase(env = process.env) {
  const { url, serviceRoleKey } = getSupabaseConfig(env)
  return Boolean(url && serviceRoleKey)
}

function isProductionRuntime(env = process.env) {
  return env.NODE_ENV === 'production' || env.VERCEL === '1'
}

function buildSupabaseUrl(baseUrl, table) {
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`
  return new URL(`rest/v1/${table}`, normalizedBase).toString()
}

async function insertLeadIntoSupabase(record, env) {
  const { url, serviceRoleKey, table } = getSupabaseConfig(env)

  if (!url || !serviceRoleKey) {
    const error = new Error('Lead pipeline is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.')
    error.code = 'PIPELINE_NOT_CONFIGURED'
    throw error
  }

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
    const error = new Error(`Supabase insert failed (${response.status}): ${details}`)
    error.code = 'SUPABASE_INSERT_FAILED'
    throw error
  }

  const [savedRecord] = await response.json()
  return savedRecord || record
}

async function persistLeadRecord(record, env) {
  if (isConfiguredForSupabase(env)) {
    const savedRecord = await insertLeadIntoSupabase(record, env)
    return {
      storage: PRODUCTION_STORAGE_MODE,
      savedRecord,
    }
  }

  if (isProductionRuntime(env)) {
    const error = new Error('Lead pipeline is not configured. Set Supabase environment variables before deploying forms.')
    error.code = 'PIPELINE_NOT_CONFIGURED'
    throw error
  }

  localLeadStore.unshift(record)
  return {
    storage: LOCAL_STORAGE_MODE,
    savedRecord: record,
  }
}

async function sendLeadNotification(record, env) {
  const webhookUrl = env.LEAD_NOTIFICATION_WEBHOOK_URL?.trim()
  if (!webhookUrl) return

  const payload = {
    text: `New ${record.lead_type} lead ${record.reference_code}`,
    lead: {
      referenceCode: record.reference_code,
      leadType: record.lead_type,
      submittedAt: record.submitted_at,
      fullName: record.full_name,
      phone: record.phone,
      email: record.email,
      service: record.service_name,
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
    console.error('[lead-pipeline] Notification webhook failed', error)
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

function parseRequestBody(body) {
  if (body && typeof body === 'object') return body
  if (typeof body === 'string' && body.length > 0) {
    return JSON.parse(body)
  }
  return {}
}

/**
 * Process a lead request for both local Vite middleware and Vercel functions.
 */
export async function handleLeadRequest({
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

  const parsed = leadSubmissionSchema.safeParse(payload)
  if (!parsed.success) {
    return createResponse(400, {
      ok: false,
      error: 'Please review the form and try again.',
      fieldErrors: buildFieldErrors(parsed.error),
    }, responseHeaders)
  }

  if (parsed.data._gotcha) {
    return createResponse(200, { ok: true, spamFiltered: true }, responseHeaders)
  }

  const record = buildLeadRecord(parsed.data)

  try {
    const { storage, savedRecord } = await persistLeadRecord(record, env)
    await sendLeadNotification(savedRecord, env)

    return createResponse(200, {
      ok: true,
      leadId: savedRecord.id || savedRecord.reference_code,
      referenceCode: savedRecord.reference_code || record.reference_code,
      storage,
    }, responseHeaders)
  } catch (error) {
    console.error('[lead-pipeline] Failed to save lead', error)

    if (error && typeof error === 'object' && error.code === 'PIPELINE_NOT_CONFIGURED') {
      return createResponse(503, {
        ok: false,
        error: 'Lead capture is not configured yet. Please call us directly while we finish setup.',
      }, responseHeaders)
    }

    return createResponse(500, {
      ok: false,
      error: 'We could not save your request right now. Please call us directly.',
    }, responseHeaders)
  }
}

