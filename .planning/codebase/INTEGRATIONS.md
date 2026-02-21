# External Integrations

**Analysis Date:** 2026-02-21

## APIs & External Services

**AI Chat Assistant:**
- Groq API - Powers Ava virtual assistant with LLM capabilities
  - SDK/Client: Native `fetch()` API calls
  - Endpoint: `https://api.groq.com/openai/v1/chat/completions`
  - Auth: Bearer token via `GROQ_API_KEY` environment variable
  - Model: `llama-3.3-70b-versatile`
  - Max tokens: 500
  - Temperature: 0.7
  - Status: Primary integration, free tier available
  - Used by: `api/chat.js`, `api/serve.js`, `api/worker-groq.js`

- Anthropic Claude API - Alternative LLM provider
  - SDK/Client: Native `fetch()` API calls
  - Endpoint: `https://api.anthropic.com/v1/messages`
  - Auth: x-api-key header with `ANTHROPIC_API_KEY`
  - Model: `claude-sonnet-4-20250514`
  - Max tokens: 500
  - Status: Fallback option for self-hosted or Cloudflare Workers
  - Used by: `api/server.js`, `api/worker.js`

**Font CDN:**
- Google Fonts
  - Endpoint: `https://fonts.googleapis.com`, `https://fonts.gstatic.com`
  - Resources: Inter (400, 500, 600, 700), Plus Jakarta Sans (600, 700, 800)
  - Location: `index.html` link tags with preconnect optimization

## Data Storage

**Databases:**
- Not applicable - Static site template with no persistent storage

**File Storage:**
- Local filesystem only
- Images in `/images/` directory (copied to `dist/images/` during build)
- No cloud storage integration

**Caching:**
- HTTP caching via Vercel CDN (static assets)
- Browser caching via meta tags

## Authentication & Identity

**Auth Provider:**
- Custom/Demo mode
- Implementation: API requests fall back to demo responses if API is unavailable
- Location: `src/lib/api.ts` `sendMessage()` function with try-catch fallback
- No user authentication required - public website

## Monitoring & Observability

**Error Tracking:**
- None detected - Basic error logging to HTTP response

**Logs:**
- Console logging in API handlers for development
- No external logging service integration

## CI/CD & Deployment

**Hosting:**
- Vercel (primary, recommended)
- Configuration: `vercel.json` at root
- Alternative: Static site hosting (any CDN) + serverless backend for `/api/chat` endpoint

**Build Configuration:**
```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

**CI Pipeline:**
- None detected in repository - Vercel auto-deploys on git push

**Deployment Targets:**
- Vercel serverless functions: `/api/chat` (Node.js)
- Cloudflare Workers: Alternative backend (see `api/worker.js`, `api/worker-groq.js`)
- Static hosting: `dist/` folder contents

## Environment Configuration

**Required env vars:**

| Variable | Service | Required | Usage |
|----------|---------|----------|-------|
| `GROQ_API_KEY` | Groq | Optional* | AI chat via Groq (free) |
| `ANTHROPIC_API_KEY` | Anthropic | Optional* | AI chat via Claude (paid) |

*At least one AI API key recommended; falls back to demo responses if neither is set

**Configuration Locations:**
- Frontend: `src/config/site.ts` - Central config object `SITE` with company branding, contact info, service areas
- API: Environment variables only (no checked-in secrets)

**Secrets Location:**
- Vercel: Settings → Environment Variables
- Cloudflare Workers: Wrangler secrets (see `api/wrangler.toml`)
- Local dev: `.env` file (see `api/serve.js` dotenv usage)

## API Endpoints

**Chat Endpoint:**
- Path: `/api/chat`
- Method: POST
- Content-Type: `application/json`
- Request body:
  ```json
  {
    "messages": [
      { "role": "user", "content": "..." },
      { "role": "assistant", "content": "..." }
    ]
  }
  ```
- Response:
  ```json
  {
    "response": "Assistant response text"
  }
  ```
- CORS: Enabled (Access-Control-Allow-Origin: *)
- Error handling: Returns 500 JSON on API failure, falls back to demo response in frontend

**Implementations:**
- Vercel serverless: `api/chat.js` (uses Groq)
- Local Node.js: `api/serve.js` (uses Groq)
- Cloudflare Workers: `api/worker.js` (Anthropic) or `api/worker-groq.js` (Groq)

## Webhooks & Callbacks

**Incoming:**
- None detected

**Outgoing:**
- None detected

## Frontend API Usage

**Chat Client:**
- Location: `src/lib/api.ts`
- Function: `sendMessage(messages: Message[])`
- Fetches: `POST /api/chat` with message history
- Fallback: Demo mode with keyword-triggered responses (no API call)
- Location: `src/components/ui/AvaWidget.tsx` - AI chat widget component

## Schema & Structured Data

**Markup:**
- Location: `index.html` (inline JSON-LD)
- Type: `HomeAndConstructionBusiness`
- Data: Company name, phone, email, address, rating metadata
- Purpose: SEO enhancement via schema.org

---

*Integration audit: 2026-02-21*
