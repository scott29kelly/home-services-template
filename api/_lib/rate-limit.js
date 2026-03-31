/**
 * Simple in-memory rate limiter for serverless API endpoints.
 * Uses a sliding window approach per IP address.
 */

const windowMs = 60_000 // 1 minute window
const maxRequests = 10  // max requests per window per IP

const ipHits = new Map()

/**
 * Clean up expired entries to prevent memory growth.
 */
function cleanup() {
  const now = Date.now()
  for (const [ip, timestamps] of ipHits) {
    const valid = timestamps.filter((t) => now - t < windowMs)
    if (valid.length === 0) {
      ipHits.delete(ip)
    } else {
      ipHits.set(ip, valid)
    }
  }
}

// Clean up every 5 minutes
setInterval(cleanup, 5 * 60_000).unref?.()

/**
 * Check if a request from this IP should be rate-limited.
 * Returns { limited: false } if allowed, or { limited: true, retryAfter } if blocked.
 */
export function checkRateLimit(ip) {
  if (!ip) return { limited: false }

  const now = Date.now()
  const timestamps = ipHits.get(ip) || []
  const valid = timestamps.filter((t) => now - t < windowMs)

  if (valid.length >= maxRequests) {
    const oldestValid = valid[0]
    const retryAfter = Math.ceil((oldestValid + windowMs - now) / 1000)
    return { limited: true, retryAfter }
  }

  valid.push(now)
  ipHits.set(ip, valid)
  return { limited: false }
}
