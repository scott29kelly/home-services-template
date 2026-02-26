/**
 * Chat context utility for Ava AI assistant.
 * Maps page pathnames to context-aware system prompts and quick actions.
 * Used by AvaWidget and Ava page to provide page-specific AI behaviour.
 */

import { company } from '../config/company'
import { services } from '../config/services'

export interface PageContext {
  pageName: string
  pageUrl: string
  quickActions: string[]
}

/** Default quick actions for general / non-service pages. */
const DEFAULT_QUICK_ACTIONS: string[] = [
  'I have storm damage',
  'How do insurance claims work?',
  'Schedule an inspection',
  'Talk to a real person',
]

/**
 * Maps a pathname to page-specific context including a human-readable page name
 * and relevant quick-action suggestion chips.
 *
 * CRITICAL: Every quickActions array MUST include 'Talk to a real person' as the
 * LAST item so it is always visible in the chip bar regardless of page.
 */
export function getPageContext(pathname: string): PageContext {
  // Strip leading slash for slug comparison
  const slug = pathname.replace(/^\//, '')

  // ── Service page match ──────────────────────────────────────────────
  const matchedService = services.find((s) => s.slug === slug)
  if (matchedService) {
    const name = matchedService.name
    return {
      pageName: `${name} service page`,
      pageUrl: pathname,
      quickActions: [
        `Get a ${name.toLowerCase()} quote`,
        'Emergency service?',
        'How does insurance work?',
        'Talk to a real person',
      ],
    }
  }

  // ── Service area city pages ─────────────────────────────────────────
  if (pathname.startsWith('/service-areas/')) {
    return {
      pageName: 'service area page',
      pageUrl: pathname,
      quickActions: [
        'Do you serve my area?',
        'Schedule a free inspection',
        'What services do you offer?',
        'Talk to a real person',
      ],
    }
  }

  // ── Known static paths ──────────────────────────────────────────────
  const staticPageMap: Record<string, string> = {
    '/': 'homepage',
    '/services': 'services overview page',
    '/contact': 'contact page',
    '/about': 'about page',
    '/projects': 'projects/portfolio page',
    '/testimonials': 'testimonials page',
    '/financing': 'financing page',
    '/resources': 'resources/blog page',
    '/ava': 'full chat page',
    '/service-areas': 'service areas page',
  }

  if (staticPageMap[pathname]) {
    return {
      pageName: staticPageMap[pathname],
      pageUrl: pathname,
      quickActions: DEFAULT_QUICK_ACTIONS,
    }
  }

  // ── Default fallback ────────────────────────────────────────────────
  return {
    pageName: 'general page',
    pageUrl: pathname,
    quickActions: DEFAULT_QUICK_ACTIONS,
  }
}

/**
 * Builds a dynamic system prompt for Ava based on the current page pathname.
 * The prompt includes full business context (company, services, hours, phone,
 * service area) and lead-capture instructions.
 *
 * CRITICAL per CONTEXT.md: Do NOT include anything that would make the AI
 * announce page awareness (no "I see you're on the X page"). The context
 * silently guides responses.
 */
export function buildSystemPrompt(pathname: string): string {
  const { pageName } = getPageContext(pathname)
  const serviceList = services.map((s) => s.name).join(', ')

  return `You are Ava, an AI Virtual Assistant for ${company.name}.

Personality: Warm, knowledgeable, reassuring, patient. Professional but friendly.

Visitor context:
- Current page: ${pageName}
- Page URL: ${pathname}
- Available services: ${serviceList}
- Business hours: ${company.hours.weekday}, ${company.hours.saturday}
- Phone: ${company.phone}
- Service area: ${company.address.city}, ${company.address.state} and surrounding areas

Key points to emphasize:
- FREE inspections, no obligation
- We meet with insurance adjusters on homeowners' behalf
- Most customers pay only their deductible (little to nothing out of pocket)
- Certifications: ${company.certifications.join(', ')}
- Experienced, certified team

Lead capture: After a few exchanges when there's a natural opening, offer to have someone reach out. Collect name first, then phone, then email (optional). Keep it conversational — never form-like. If declined, continue helping and try once more later at a natural point. If declined a second time, mention the business phone number or contact page as alternatives.

Response length: Keep responses concise (2-4 sentences) unless detail is requested.

Guardrails: Never provide specific dollar estimates or guarantee claim approval.`
}
