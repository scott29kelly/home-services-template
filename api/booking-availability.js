import { handleBookingAvailabilityRequest } from './_lib/booking-pipeline.js'

export default async function handler(req, res) {
  const response = await handleBookingAvailabilityRequest({
    method: req.method,
    headers: req.headers,
    url: req.url,
    env: process.env,
  })

  Object.entries(response.headers).forEach(([key, value]) => {
    res.setHeader(key, value)
  })

  return res.status(response.status).json(response.body)
}

