import { SITE } from '../config/site'

export interface Message {
  role: 'user' | 'assistant'
  content: string
}

const demoResponses: Record<string, string> = {
  storm:
    `If you've noticed damage after a storm, the first step is to call us for a free inspection. We'll document everything and help you understand if you have a valid insurance claim. Call ${SITE.phone} or schedule online!`,
  insurance:
    'Great question! The insurance claims process starts with a free inspection. We document all damage, help you file your claim, meet with the adjuster on your behalf, and then handle all repairs. Most homeowners only pay their deductible.',
  pay:
    "Most of our customers only pay their insurance deductible for covered storm damage repairs. We work directly with your insurance company so there are no surprise costs. Want us to take a look? It's completely free!",
  schedule:
    `I'd love to help you schedule a free inspection! You can call us directly at ${SITE.phone}, or visit our contact page to fill out a form. We typically respond within 24 hours.`,
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

  return "I'd be happy to help! I can answer questions about storm damage, insurance claims, our services, or help you schedule a free inspection. What would you like to know?"
}

export async function sendMessage(messages: Message[]): Promise<{ response: string }> {
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
    })

    if (!res.ok) throw new Error('API error')

    const data = await res.json()
    if (data.response) return data
    throw new Error('No response')
  } catch {
    // Simulate delay for demo mode
    await new Promise((r) => setTimeout(r, 500 + Math.random() * 500))
    return { response: getDemoResponse(messages.at(-1)?.content) }
  }
}
