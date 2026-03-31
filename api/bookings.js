import { handleBookingRequest } from './_lib/booking-pipeline.js'
import { checkRateLimit } from './_lib/rate-limit.js'

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress
    const { limited, retryAfter } = checkRateLimit(ip)
    if (limited) {
      res.setHeader('Retry-After', String(retryAfter))
      return res.status(429).json({ ok: false, error: 'Too many requests. Please try again shortly.' })
    }
  }

  const response = await handleBookingRequest({
    method: req.method,
    headers: req.headers,
    body: req.body,
    env: process.env,
  })

  Object.entries(response.headers).forEach(([key, value]) => {
    res.setHeader(key, value)
  })

  return res.status(response.status).json(response.body)
}

