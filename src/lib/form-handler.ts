import { forms } from '../config/forms'

type SubmissionResult = { ok: true } | { ok: false; error: string }

/**
 * Backend-agnostic form submission.
 * Routes form data to the configured provider (Formspree, webhook, Netlify, or console).
 * Handles honeypot check and error wrapping.
 */
export async function submitForm(data: Record<string, unknown>): Promise<SubmissionResult> {
  const { provider, formspreeId, webhookUrl } = forms.submission

  // Honeypot check — if filled, silently return success (it's a bot)
  if (data._gotcha) {
    return { ok: true }
  }

  // Remove honeypot from payload before sending
  const payload = { ...data }
  delete payload._gotcha

  try {
    if (provider === 'formspree' && formspreeId) {
      const res = await fetch(`https://formspree.io/f/${formspreeId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Submission failed')
      return { ok: true }
    }

    if (provider === 'webhook' && webhookUrl) {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Submission failed')
      return { ok: true }
    }

    if (provider === 'netlify') {
      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(
          Object.entries(payload).map(([k, v]) => [k, String(v)])
        ).toString(),
      })
      if (!res.ok) throw new Error('Submission failed')
      return { ok: true }
    }

    // Fallback: log to console (dev/demo mode or formspree with empty ID)
    console.log('[Form Submission]', payload)
    return { ok: true }
  } catch {
    return { ok: false, error: 'Something went wrong. Please try again or call us directly.' }
  }
}
