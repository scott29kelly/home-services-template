import { useState, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { sendMessage, type Message } from '../lib/api'
import { getPageContext, buildSystemPrompt } from '../lib/chat-context'
import { submitForm } from '../lib/form-handler'
import { company } from '../config/company'

/** Lead capture state machine states */
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

/** Client-side rate limit: 1 message per 2 seconds */
const RATE_LIMIT_MS = 2000

/**
 * Shared custom hook encapsulating page context awareness, lead capture state
 * machine, and client-side rate limiting for both AvaWidget and Ava full-page chat.
 */
export default function useChatEnhancements(initialGreeting: string): UseChatEnhancementsReturn {
  const { pathname } = useLocation()

  // Page context is derived on every render — updates automatically on navigation
  const { quickActions } = getPageContext(pathname)

  // Full UI message history — never truncated (API capping happens in sendMessage)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: initialGreeting },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [rateLimited, setRateLimited] = useState(false)

  // Rate limiting: track timestamp of last send
  const lastSendTimeRef = useRef<number>(0)

  // Lead capture state machine
  const leadStateRef = useRef<LeadState>('idle')
  const exchangeCountRef = useRef<number>(0)
  const leadDataRef = useRef<{ name?: string; phone?: string; email?: string }>({})

  /**
   * Attempt to extract name, phone, or email from a user message based on the
   * current lead state. Updates leadDataRef in place. Returns true if we have
   * enough data (name + phone) to submit.
   */
  const tryExtractLeadData = (text: string): boolean => {
    const state = leadStateRef.current

    if (state === 'capturing-name') {
      // Simple heuristic: treat the reply as the name if it's short and doesn't look like a phone/email
      const trimmed = text.trim()
      if (trimmed && trimmed.length < 60 && !trimmed.match(/^\d/) && !trimmed.includes('@')) {
        leadDataRef.current.name = trimmed
        leadStateRef.current = 'capturing-phone'
      }
    } else if (state === 'capturing-phone') {
      // Detect phone-like content: digits and common separators
      const phoneMatch = text.match(/[\d\s\-().+]{7,}/)
      if (phoneMatch) {
        leadDataRef.current.phone = phoneMatch[0].trim()
        leadStateRef.current = 'capturing-email'
      }
    } else if (state === 'capturing-email') {
      // Detect email address
      const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)
      if (emailMatch) {
        leadDataRef.current.email = emailMatch[0]
      }
      // Email is optional — move to captured regardless
      leadStateRef.current = 'captured'
    }

    // Check if we have enough data regardless of current state
    // (AI might collect multiple fields in one response)
    if (
      !leadDataRef.current.name &&
      !leadDataRef.current.phone
    ) {
      // Also detect if the user provided both name and phone in one message
      const phoneMatch = text.match(/[\d\s\-().+]{7,}/)
      const nameBeforePhone = phoneMatch
        ? text.slice(0, text.indexOf(phoneMatch[0])).trim()
        : null
      if (nameBeforePhone && nameBeforePhone.length > 0 && nameBeforePhone.length < 60) {
        leadDataRef.current.name = nameBeforePhone.replace(/[,.\-]+$/, '').trim()
        leadDataRef.current.phone = phoneMatch![0].trim()
        leadStateRef.current = 'captured'
      }
    }

    return !!(leadDataRef.current.name && leadDataRef.current.phone)
  }

  /**
   * Submit captured lead data via submitForm.
   * Called when we have at minimum name + phone.
   */
  const submitLead = async () => {
    const { name, phone, email } = leadDataRef.current
    if (!name || !phone) return

    await submitForm({
      source: 'ava-chat',
      name,
      phone,
      ...(email ? { email } : {}),
      page: pathname,
    })
  }

  /**
   * Check if the AI's response appears to be initiating lead capture.
   * We advance state to 'offered' so subsequent user replies trigger extraction.
   */
  const detectLeadCaptureOffer = (aiResponse: string) => {
    if (leadStateRef.current !== 'idle' && leadStateRef.current !== 'declined-once') return

    const lower = aiResponse.toLowerCase()
    const isOfferingCapture =
      lower.includes("what's a good name") ||
      lower.includes("your name") ||
      lower.includes("who should we ask for") ||
      lower.includes("reach out to you") ||
      lower.includes("have someone call") ||
      lower.includes("have one of our") ||
      lower.includes("best number") ||
      lower.includes("phone number")

    if (isOfferingCapture) {
      if (leadStateRef.current === 'idle') {
        leadStateRef.current = 'offered'
      }
      // Advance to capturing-name if offered state was set
      if (leadStateRef.current === 'offered') {
        leadStateRef.current = 'capturing-name'
      }
    }
  }

  const handleSend = async (text?: string) => {
    const userMessage = (text ?? input).trim()
    if (!userMessage || isLoading) return

    // Rate limit check
    const now = Date.now()
    const elapsed = now - lastSendTimeRef.current
    if (elapsed < RATE_LIMIT_MS) {
      setRateLimited(true)
      setTimeout(() => setRateLimited(false), RATE_LIMIT_MS - elapsed)
      return
    }
    lastSendTimeRef.current = now

    // Increment exchange counter (user message)
    exchangeCountRef.current += 1

    // "Talk to a real person" — local injection, no API call
    if (userMessage === 'Talk to a real person') {
      setInput('')
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

    // Update lead state if AI previously offered capture and user is replying
    if (
      leadStateRef.current === 'capturing-name' ||
      leadStateRef.current === 'capturing-phone' ||
      leadStateRef.current === 'capturing-email'
    ) {
      tryExtractLeadData(userMessage)
    }

    // Add user message to state
    setInput('')
    const newMessages: Message[] = [...messages, { role: 'user', content: userMessage }]
    setMessages(newMessages)
    setIsLoading(true)

    // Build system prompt with current page context
    const systemPrompt = buildSystemPrompt(pathname)

    try {
      const data = await sendMessage(newMessages, systemPrompt)
      const assistantMessage: Message = { role: 'assistant', content: data.response }

      setMessages((prev) => [...prev, assistantMessage])

      // Detect if the AI is initiating lead capture
      detectLeadCaptureOffer(data.response)

      // Submit lead if we captured enough data from user's message
      if (leadDataRef.current.name && leadDataRef.current.phone) {
        if (leadStateRef.current !== 'captured') {
          leadStateRef.current = 'captured'
          await submitLead()
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
    // Escape is intentionally not handled here — component-level responsibility
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
