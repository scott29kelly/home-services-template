import { handleBookingRequest } from './_lib/booking-pipeline.js'

export default async function handler(req, res) {
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

