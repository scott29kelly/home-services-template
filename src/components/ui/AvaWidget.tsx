import { useState, useRef, useEffect, useCallback } from 'react'
import { X, Send, MessageCircle } from 'lucide-react'
import { SITE } from '../../config/site'
import useChatEnhancements from '../../hooks/useChatEnhancements'

export default function AvaWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const {
    messages,
    input,
    setInput,
    isLoading,
    rateLimited,
    quickActions,
    handleSend,
    handleKeyDown: hookKeyDown,
  } = useChatEnhancements(SITE.assistant.greeting)

  const openChat = useCallback(() => setIsOpen(true), [])

  useEffect(() => {
    const container = messagesContainerRef.current
    if (container) {
      container.scrollTop = container.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    if (isOpen) inputRef.current?.focus({ preventScroll: true })
  }, [isOpen])

  // Listen for open-ava-chat events from StickyMobileCTA
  useEffect(() => {
    window.addEventListener('open-ava-chat', openChat)
    return () => window.removeEventListener('open-ava-chat', openChat)
  }, [openChat])

  // Wrap handleKeyDown to add Escape handling (widget-specific)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') setIsOpen(false)
    hookKeyDown(e)
  }

  // Show quick actions after the last assistant message when not loading
  const lastMessage = messages[messages.length - 1]
  const showQuickActions = !isLoading && lastMessage?.role === 'assistant'

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
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
        </button>
      )}

      {/* Chat Modal */}
      {isOpen && (
        <div
          className="fade-enter visible fixed bottom-20 right-6 md:bottom-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[560px] max-h-[calc(100vh-6rem)] bg-white rounded-2xl shadow-2xl shadow-navy/15 border border-border flex flex-col overflow-hidden"
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
          <div ref={messagesContainerRef} className="flex-1 overflow-y-auto overscroll-y-contain p-4 space-y-4" style={{ scrollBehavior: 'auto' }}>
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

            {/* Quick Actions — shown after last assistant message */}
            {showQuickActions && (
              <div className="flex flex-wrap gap-2 pt-2">
                {quickActions.map((action) => (
                  <button
                    key={action}
                    onClick={() => handleSend(action)}
                    className={`px-3 py-1.5 bg-brand-blue/10 text-brand-blue text-xs font-medium rounded-full hover:bg-brand-blue/20 transition-colors${
                      action === 'Talk to a real person'
                        ? ' border border-brand-blue/20'
                        : ''
                    }`}
                  >
                    {action}
                  </button>
                ))}
              </div>
            )}

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
                placeholder={rateLimited ? 'Please wait...' : 'Ask about storm damage, claims...'}
                disabled={isLoading || rateLimited}
                className="flex-1 px-4 py-2.5 bg-surface border border-border rounded-full text-sm text-navy placeholder:text-navy/30 focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue disabled:opacity-50 transition-all"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading || rateLimited}
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
        </div>
      )}
    </>
  )
}
