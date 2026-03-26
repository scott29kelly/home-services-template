import { forms } from '../config/forms'

export type SubmissionResult =
  | {
      ok: true
      leadId?: string
      referenceCode?: string
      storage?: 'memory' | 'supabase'
      spamFiltered?: boolean
    }
  | {
      ok: false
      error: string
    }

/**
 * Submit lead payloads to the shared lead pipeline endpoint.
 * Keeps the client API stable while the backend persists leads centrally.
 */
export async function submitForm(data: Record<string, unknown>): Promise<SubmissionResult> {
  // Honeypot check - if filled, silently return success (it's a bot).
  if (data._gotcha) {
    return { ok: true, spamFiltered: true }
  }

  const payload = { ...data }
  delete payload._gotcha

  try {
    const res = await fetch(forms.submission.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const responseData = (await res.json().catch(() => null)) as
      | {
          ok?: boolean
          error?: string
          leadId?: string
          referenceCode?: string
          storage?: 'memory' | 'supabase'
          spamFiltered?: boolean
        }
      | null

    if (!res.ok || !responseData?.ok) {
      return {
        ok: false,
        error: responseData?.error ?? 'Something went wrong. Please try again or call us directly.',
      }
    }

    return {
      ok: true,
      leadId: responseData.leadId,
      referenceCode: responseData.referenceCode,
      storage: responseData.storage,
      spamFiltered: responseData.spamFiltered,
    }
  } catch {
    return { ok: false, error: 'Something went wrong. Please try again or call us directly.' }
  }
}
