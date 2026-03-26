export interface BookingSlot {
  label: string
  scheduledFor: string
}

export interface BookingAvailabilityResult {
  ok: true
  date: string
  timezone: string
  slots: BookingSlot[]
  message?: string
}

export interface BookingAvailabilityError {
  ok: false
  error: string
}

export type BookingAvailabilityResponse = BookingAvailabilityResult | BookingAvailabilityError

export interface BookingSubmissionResult {
  ok: true
  leadId?: string
  referenceCode?: string
  preferredDate: string
  preferredTime: string
  scheduledFor: string
  storage?: 'memory' | 'supabase'
  timezone: string
  spamFiltered?: boolean
}

export interface BookingSubmissionError {
  ok: false
  error: string
}

export type BookingSubmissionResponse = BookingSubmissionResult | BookingSubmissionError

/**
 * Fetch live appointment windows for a specific booking date.
 */
export async function fetchBookingAvailability(date: string): Promise<BookingAvailabilityResponse> {
  try {
    const response = await fetch(`/api/booking-availability?date=${encodeURIComponent(date)}`, {
      headers: {
        Accept: 'application/json',
      },
    })

    const data = (await response.json().catch(() => null)) as BookingAvailabilityResponse | null
    if (!response.ok || !data?.ok) {
      return {
        ok: false,
        error: data && !data.ok ? data.error : 'We could not load live availability right now.',
      }
    }

    return data
  } catch {
    return {
      ok: false,
      error: 'We could not load live availability right now.',
    }
  }
}

/**
 * Reserve a real inspection window through the booking API.
 */
export async function createBooking(
  payload: Record<string, unknown>,
): Promise<BookingSubmissionResponse> {
  if (payload._gotcha) {
    return {
      ok: true,
      preferredDate: String(payload.preferredDate ?? ''),
      preferredTime: String(payload.preferredTime ?? ''),
      scheduledFor: '',
      timezone: 'America/New_York',
      spamFiltered: true,
    }
  }

  const requestPayload = { ...payload }
  delete requestPayload._gotcha

  try {
    const response = await fetch('/api/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(requestPayload),
    })

    const data = (await response.json().catch(() => null)) as BookingSubmissionResponse | null
    if (!response.ok || !data?.ok) {
      return {
        ok: false,
        error: data && !data.ok ? data.error : 'We could not confirm your appointment right now.',
      }
    }

    return data
  } catch {
    return {
      ok: false,
      error: 'We could not confirm your appointment right now.',
    }
  }
}
