import { useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { sendMessage, type Message } from '../lib/api'
import { getPageContext, buildSystemPrompt } from '../lib/chat-context'
import { submitForm } from '../lib/form-handler'
import { company } from '../config/company'
import { services } from '../config/services'
import {
  buildLeadMetadata,
  buildSubmissionSummary,
  persistLastSubmission,
} from '../lib/attribution'
import { trackEvent } from '../lib/analytics'

type LeadState =
  | 'idle'
  | 'offered'
  | 'capturing-name'
  | 'capturing-phone'
  | 'capturing-email'
  | 'captured'
  | 'declined-once'
  | 'declined-final'

export interface UseChatEnhancementsReturn {
  messages: Message[]
  input: string
  setInput: (value: string) => void
  isLoading: boolean
  rateLimited: boolean
  quickActions: string[]
  handleSend: (text?: string) => Promise<void>
  handleKeyDown: (e: React.KeyboardEvent) => void
}

const RATE_LIMIT_MS = 2000

function isBookingAction(text: string): boolean {
  const normalized = text.trim().toLowerCase()
  return (
    normalized === 'book a confirmed inspection' ||
    normalized === 'schedule an inspection' ||
    normalized === 'schedule a free inspection' ||
    normalized.startsWith('book a ') && normalized.endsWith(' inspection')
  )
}

function isPhotoHandoffAction(text: string): boolean {
  const normalized = text.trim().toLowerCase()
  return (
    normalized === 'share damage photos' ||
    normalized === 'send damage photos' ||
    normalized === 'upload damage photos'
  )
}

function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

/**
 * Shared hook for page-aware quick actions, conversational lead capture, and
 * structured handoff into booking or photo-sharing flows.
 */
export default function useChatEnhancements(initialGreeting: string): UseChatEnhancementsReturn {
  const { pathname } = useLocation()
  const { quickActions, pageName } = getPageContext(pathname)
  const matchedService = services.find((service) => pathname === `/${service.slug}`)

  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: initialGreeting },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [rateLimited, setRateLimited] = useState(false)

  const lastSendTimeRef = useRef<number>(0)
  const leadStateRef = useRef<LeadState>('idle')
  const leadDataRef = useRef<{ name?: string; phone?: string; email?: string }>({})
  const leadSubmittedRef = useRef(false)

  const buildBookingUrl = (): string => {
    const params = new URLSearchParams({
      tab: 'booking',
      source: 'ava-booking',
    })

    const serviceLabel = matchedService?.navLabel ?? matchedService?.name
    if (serviceLabel) {
      params.set('service', serviceLabel)
    }

    return `/contact?${params.toString()}`
  }

  const buildPhotoHandoffUrl = (): string => {
    const params = new URLSearchParams({
      source: 'ava-photo-handoff',
      message: matchedService
        ? `I have ${matchedService.name.toLowerCase()} photos to share with the team.`
        : 'I have storm damage photos to share with the team.',
    })

    const serviceLabel = matchedService?.navLabel ?? matchedService?.name
    if (serviceLabel) {
      params.set('service', serviceLabel)
    }

    return `/contact?${params.toString()}`
  }

  const redirectToHandoff = (handoffType: 'booking' | 'photo'): void => {
    if (!isBrowser()) return

    const destination = handoffType === 'booking' ? buildBookingUrl() : buildPhotoHandoffUrl()

    trackEvent('chat_handoff_redirected', {
      handoff_type: handoffType,
      path: pathname,
      page_context: pageName,
      service: matchedService?.name ?? '',
    })

    window.location.assign(destination)
  }

  const tryExtractLeadData = (text: string): boolean => {
    const state = leadStateRef.current

    if (state === 'capturing-name') {
      const trimmed = text.trim()
      if (trimmed && trimmed.length < 60 && !trimmed.match(/^\d/) && !trimmed.includes('@')) {
        leadDataRef.current.name = trimmed
        leadStateRef.current = 'capturing-phone'
      }
    } else if (state === 'capturing-phone') {
      const phoneMatch = text.match(/[\d\s\-().+]{7,}/)
      if (phoneMatch) {
        leadDataRef.current.phone = phoneMatch[0].trim()
        leadStateRef.current = 'capturing-email'
      }
    } else if (state === 'capturing-email') {
      const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)
      if (emailMatch) {
        leadDataRef.current.email = emailMatch[0]
      }
      leadStateRef.current = 'captured'
    }

    if (!leadDataRef.current.name || !leadDataRef.current.phone) {
      const phoneMatch = text.match(/[\d\s\-().+]{7,}/)
      const nameBeforePhone = phoneMatch
        ? text.slice(0, text.indexOf(phoneMatch[0])).trim()
        : null

      if (nameBeforePhone && phoneMatch && nameBeforePhone.length < 60) {
        leadDataRef.current.name = nameBeforePhone.replace(/[,.\-]+$/, '').trim()
        leadDataRef.current.phone = phoneMatch[0].trim()
        leadStateRef.current = 'captured'
      }
    }

    return Boolean(leadDataRef.current.name && leadDataRef.current.phone)
  }

  const submitLead = async (): Promise<boolean> => {
    const { name, phone, email } = leadDataRef.current
    if (!name || !phone) return false

    const metadata = buildLeadMetadata({
      path: pathname,
      formType: 'chat',
      service: matchedService?.name,
      sourceLabel: 'ava-chat',
    })

    const result = await submitForm({
      source: 'ava-chat',
      name,
      phone,
      ...(email ? { email } : {}),
      page: pathname,
      pageContext: pageName,
      conversationPreview: messages.slice(-6).map((message) => `${message.role}: ${message.content}`).join('\n'),
      ...metadata,
    })

    if (!result.ok) {
      trackEvent('chat_lead_submit_failed', {
        path: pathname,
        page_context: pageName,
      })
      return false
    }

    persistLastSubmission(buildSubmissionSummary({
      leadType: 'chat',
      submittedAt: metadata.submittedAt,
      service: matchedService?.name,
      sourceLabel: 'ava-chat',
      referenceCode: result.referenceCode,
      customerName: name,
      path: pathname,
    }))
    trackEvent('chat_lead_submitted', {
      path: pathname,
      page_context: pageName,
      service: matchedService?.name ?? '',
    })
    leadSubmittedRef.current = true
    return true
  }

  const detectLeadCaptureOffer = (aiResponse: string): void => {
    if (leadStateRef.current !== 'idle' && leadStateRef.current !== 'declined-once') return

    const lower = aiResponse.toLowerCase()
    const isOfferingCapture =
      lower.includes("what's a good name") ||
      lower.includes('your name') ||
      lower.includes('who should we ask for') ||
      lower.includes('reach out to you') ||
      lower.includes('have someone call') ||
      lower.includes('have one of our') ||
      lower.includes('best number') ||
      lower.includes('phone number')

    if (!isOfferingCapture) return

    if (leadStateRef.current === 'idle') {
      leadStateRef.current = 'offered'
    }
    if (leadStateRef.current === 'offered') {
      leadStateRef.current = 'capturing-name'
    }
  }

  const handleSend = async (text?: string) => {
    const userMessage = (text ?? input).trim()
    if (!userMessage || isLoading) return

    if (userMessage === 'Talk to a real person') {
      setInput('')
      trackEvent('chat_escalation_requested', {
        path: pathname,
        page_context: pageName,
      })
      const escalationMessage: Message = {
        role: 'assistant',
        content: `Of course! You can reach our team directly at ${company.phone}. They're available ${company.hours.weekday}. I'm still here if you have more questions!`,
      }
      setMessages((prev) => [
        ...prev,
        { role: 'user', content: userMessage },
        escalationMessage,
      ])
      return
    }

    if (isBookingAction(userMessage)) {
      redirectToHandoff('booking')
      return
    }

    if (isPhotoHandoffAction(userMessage)) {
      redirectToHandoff('photo')
      return
    }

    const now = Date.now()
    const elapsed = now - lastSendTimeRef.current
    if (elapsed < RATE_LIMIT_MS) {
      setRateLimited(true)
      setTimeout(() => setRateLimited(false), RATE_LIMIT_MS - elapsed)
      return
    }
    lastSendTimeRef.current = now

    if (
      leadStateRef.current === 'capturing-name' ||
      leadStateRef.current === 'capturing-phone' ||
      leadStateRef.current === 'capturing-email'
    ) {
      tryExtractLeadData(userMessage)
    }

    setInput('')
    const newMessages: Message[] = [...messages, { role: 'user', content: userMessage }]
    setMessages(newMessages)
    setIsLoading(true)

    const systemPrompt = buildSystemPrompt(pathname)

    try {
      trackEvent('chat_message_sent', {
        path: pathname,
        page_context: pageName,
      })

      const data = await sendMessage(newMessages, systemPrompt)
      const assistantMessage: Message = { role: 'assistant', content: data.response }
      setMessages((prev) => [...prev, assistantMessage])

      detectLeadCaptureOffer(data.response)

      if (leadDataRef.current.name && leadDataRef.current.phone && !leadSubmittedRef.current) {
        const submitted = await submitLead()
        if (submitted) {
          setMessages((prev) => [
            ...prev,
            {
              role: 'assistant',
              content: `Thanks ${leadDataRef.current.name}. I've passed your details to our team. If you'd rather reserve a confirmed inspection window right now, tap "Book a confirmed inspection" anytime.`,
            },
          ])
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      void handleSend()
    }
  }

  return {
    messages,
    input,
    setInput,
    isLoading,
    rateLimited,
    quickActions,
    handleSend,
    handleKeyDown,
  }
}
