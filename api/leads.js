import { handleLeadRequest } from './_lib/lead-pipeline.js'

export default async function handler(req, res) {
  const response = await handleLeadRequest({
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

