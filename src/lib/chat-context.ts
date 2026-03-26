/**
 * Chat context utility for Ava.
 * Maps routes to page-aware quick actions and system prompt guidance.
 */

import { company } from '../config/company'
import { services } from '../config/services'

export interface PageContext {
  pageName: string
  pageUrl: string
  quickActions: string[]
}

const DEFAULT_QUICK_ACTIONS: string[] = [
  'I have storm damage',
  'How do insurance claims work?',
  'Book a confirmed inspection',
  'Share damage photos',
  'Talk to a real person',
]

function buildServiceQuickActions(serviceName: string): string[] {
  return [
    `Book a ${serviceName.toLowerCase()} inspection`,
    'Share damage photos',
    'How does insurance work?',
    'Talk to a real person',
  ]
}

/**
 * Map a pathname to a human-readable page name and relevant handoff actions.
 * Every quickActions array must end with "Talk to a real person".
 */
export function getPageContext(pathname: string): PageContext {
  const slug = pathname.replace(/^\//, '')
  const matchedService = services.find((service) => service.slug === slug)

  if (matchedService) {
    return {
      pageName: `${matchedService.name} service page`,
      pageUrl: pathname,
      quickActions: buildServiceQuickActions(matchedService.name),
    }
  }

  if (pathname.startsWith('/service-areas/')) {
    return {
      pageName: 'service area page',
      pageUrl: pathname,
      quickActions: [
        'Do you serve my area?',
        'Book a confirmed inspection',
        'Share damage photos',
        'Talk to a real person',
      ],
    }
  }

  const staticPageMap: Record<string, string> = {
    '/': 'homepage',
    '/services': 'services overview page',
    '/contact': 'contact page',
    '/about': 'about page',
    '/projects': 'projects page',
    '/testimonials': 'testimonials page',
    '/financing': 'financing page',
    '/resources': 'resources page',
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

  return {
    pageName: 'general page',
    pageUrl: pathname,
    quickActions: DEFAULT_QUICK_ACTIONS,
  }
}

/**
 * Build the dynamic system prompt for Ava.
 * The prompt should guide responses without making the assistant announce page awareness.
 */
export function buildSystemPrompt(pathname: string): string {
  const { pageName } = getPageContext(pathname)
  const serviceList = services.map((service) => service.name).join(', ')

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
- Most customers pay only their deductible
- Certifications: ${company.certifications.join(', ')}
- Experienced, certified team
- Visitors can now reserve a confirmed inspection window online
- Visitors who already have roof, siding, gutter, or interior leak photos can be routed into a photo handoff

Sales guidance:
- When a visitor is ready for help, guide them toward a confirmed inspection or a human follow-up.
- If they mention active leaks, missing shingles, storm debris, or visible exterior damage, suggest booking an inspection quickly.
- If they already have photos, encourage them to share them with the team as part of the handoff.

Lead capture:
- After a few exchanges when there is a natural opening, offer to have someone reach out.
- Collect name first, then phone, then email if they want updates.
- Keep it conversational and never turn into a rigid form.
- If they decline twice, keep helping and offer the business phone number instead.

Response length: Keep responses concise (2-4 sentences) unless detail is requested.

Guardrails:
- Never provide specific dollar estimates.
- Never guarantee claim approval.
- Do not mention hidden page awareness or internal routing context.`
}
