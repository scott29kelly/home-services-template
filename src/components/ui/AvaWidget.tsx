import { useState, useRef, useEffect, useCallback } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import { X, Send, MessageCircle } from 'lucide-react'
import { sendMessage, type Message } from '../../lib/api'
import { SITE } from '../../config/site'

export default function AvaWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: SITE.assistant.greeting,
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const openChat = useCallback(() => setIsOpen(true), [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (isOpen) inputRef.current?.focus()
  }, [isOpen])

  // Listen for open-ava-chat events from StickyMobileCTA
  useEffect(() => {
    window.addEventListener('open-ava-chat', openChat)
    return () => window.removeEventListener('open-ava-chat', openChat)
  }, [openChat])

  const handleSend = async (text?: string) => {
    const userMessage = text || input.trim()
    if (!userMessage || isLoading) return

    setInput('')
    const newMessages: Message[] = [...messages, { role: 'user', content: userMessage }]
    setMessages(newMessages)
    setIsLoading(true)

    const data = await sendMessage(newMessages)
    setMessages((prev) => [...prev, { role: 'assistant', content: data.response }])
    setIsLoading(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
    if (e.key === 'Escape') setIsOpen(false)
  }

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <m.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setIsOpen(true)}
            aria-label={`Open ${SITE.assistant.name} AI chat assistant`}
            className="fixed bottom-20 right-6 md:bottom-6 z-50 group flex items-center gap-2 rounded-full p-[2px] bg-gradient-to-r from-brand-blue to-sky-400 shadow-xl shadow-brand-blue/20 hover:shadow-2xl hover:shadow-brand-blue/30 transition-shadow duration-300"
          >
            <span className="flex items-center gap-2 bg-white rounded-full pl-1 pr-4 py-1">
              <img
                src={SITE.assistant.avatarSmall}
                alt={`${SITE.assistant.name} AI Assistant`}
                width={32}
                height={32}
                loading="lazy"
                decoding="async"
                className="w-8 h-8 rounded-full object-cover"
              />
              <span className="text-sm font-semibold text-navy whitespace-nowrap">
                Ask {SITE.assistant.name}
              </span>
            </span>
          </m.button>
        )}
      </AnimatePresence>

      {/* Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <m.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed bottom-20 right-6 md:bottom-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[560px] max-h-[calc(100vh-6rem)] bg-white rounded-2xl shadow-2xl shadow-navy/15 border border-border flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-surface/50">
              <img
                src={SITE.assistant.avatarSmall}
                alt={SITE.assistant.name}
                width={36}
                height={36}
                loading="lazy"
                decoding="async"
                className="w-9 h-9 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-navy">{SITE.assistant.name}</p>
                <p className="text-xs text-green-600">{SITE.assistant.role}</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-navy/40 hover:text-navy hover:bg-slate-100 transition-colors"
                aria-label="Close chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-brand-blue text-white rounded-br-md'
                        : 'bg-surface text-navy border border-border rounded-bl-md'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-surface border border-border rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 bg-navy/30 rounded-full animate-bounce [animation-delay:0ms]" />
                      <span className="w-2 h-2 bg-navy/30 rounded-full animate-bounce [animation-delay:150ms]" />
                      <span className="w-2 h-2 bg-navy/30 rounded-full animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              {messages.length === 1 && !isLoading && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {SITE.assistant.quickActions.map((action) => (
                    <button
                      key={action}
                      onClick={() => handleSend(action)}
                      className="px-3 py-1.5 bg-brand-blue/10 text-brand-blue text-xs font-medium rounded-full hover:bg-brand-blue/20 transition-colors"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-border bg-white">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about storm damage, claims..."
                  disabled={isLoading}
                  className="flex-1 px-4 py-2.5 bg-surface border border-border rounded-full text-sm text-navy placeholder:text-navy/30 focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue disabled:opacity-50 transition-all"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isLoading}
                  className="p-2.5 bg-brand-blue text-white rounded-full hover:bg-sky-600 disabled:opacity-40 disabled:hover:bg-brand-blue transition-colors"
                  aria-label="Send message"
                >
                  {isLoading ? (
                    <MessageCircle className="w-4 h-4 animate-pulse" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </>
  )
}
