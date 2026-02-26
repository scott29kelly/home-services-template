import { SITE } from '../config/site'

export interface Message {
  role: 'user' | 'assistant'
  content: string
}

const demoResponses: Record<string, string> = {
  storm:
    `If you've noticed damage after a storm, the first step is to call us for a free inspection. We'll document everything and help you understand if you have a valid insurance claim. Want us to have someone reach out to you? Just leave your name and number and we'll be in touch. Call ${SITE.phone} or schedule online!`,
  insurance:
    'Great question! The insurance claims process starts with a free inspection. We document all damage, help you file your claim, meet with the adjuster on your behalf, and then handle all repairs. Most homeowners only pay their deductible. Want me to have someone call you to walk through the process?',
  pay:
    "Most of our customers only pay their insurance deductible for covered storm damage repairs. We work directly with your insurance company so there are no surprise costs. Want us to take a look? It's completely free — want me to set that up?",
  schedule:
    `I'd love to help you schedule a free inspection! You can call us directly at ${SITE.phone}, or visit our contact page to fill out a form. We typically respond within 24 hours. Want me to have someone reach out to you directly?`,
  roof:
    `Roof damage is one of the most common storm damage claims we handle. We'll do a thorough inspection, document all damage with photos, and help you navigate the insurance process. Most customers only pay their deductible. Want us to have someone take a look? I can set that up.`,
  siding:
    `Storm-damaged siding is typically covered by homeowner's insurance, and we specialize in getting homeowners a fair settlement. We'll document the damage, meet with your adjuster, and handle all the repairs. Want me to have someone reach out to give you a free assessment?`,
  gutter:
    `Gutters are often damaged in storms and the repairs are usually covered by insurance. We inspect and document all gutter damage alongside any roof or siding issues for a comprehensive claim. Interested in a free inspection? I can have someone reach out to set that up.`,
}

function getDemoResponse(message?: string): string {
  if (!message) return demoResponses.schedule

  const lower = message.toLowerCase()
  if (lower.includes('storm') || lower.includes('damage')) return demoResponses.storm
  if (lower.includes('insurance') || lower.includes('claim')) return demoResponses.insurance
  if (lower.includes('pay') || lower.includes('cost') || lower.includes('price'))
    return demoResponses.pay
  if (lower.includes('schedule') || lower.includes('inspection') || lower.includes('appointment'))
    return demoResponses.schedule
  if (lower.includes('roof') || lower.includes('shingle')) return demoResponses.roof
  if (lower.includes('siding')) return demoResponses.siding
  if (lower.includes('gutter')) return demoResponses.gutter

  return "I'd be happy to help! I can answer questions about storm damage, insurance claims, our services, or help you schedule a free inspection. Want me to have someone reach out to you?"
}

export async function sendMessage(
  messages: Message[],
  systemPrompt?: string,
): Promise<{ response: string; demoMode?: boolean }> {
  // Cap history at 10 messages before sending — UI history is never mutated
  const cappedMessages = messages.slice(-10)

  try {
    const body: Record<string, unknown> = { messages: cappedMessages }
    if (systemPrompt) body.systemPrompt = systemPrompt

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    // 429 triggers demo mode instead of throwing — no delay since rate limit is the wait
    if (res.status === 429) {
      return { response: getDemoResponse(messages.at(-1)?.content), demoMode: true }
    }

    if (!res.ok) throw new Error('API error')

    const data = await res.json()
    if (data.response) return data
    throw new Error('No response')
  } catch {
    // Simulate delay for demo mode
    await new Promise((r) => setTimeout(r, 500 + Math.random() * 500))
    return { response: getDemoResponse(messages.at(-1)?.content), demoMode: true }
  }
}
