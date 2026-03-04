import { useRef, useEffect } from 'react'
import { Send, MessageCircle } from 'lucide-react'
import PageMeta from '../components/ui/PageMeta'
import { SITE } from '../config/site'
import useChatEnhancements from '../hooks/useChatEnhancements'

export default function Ava() {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const {
    messages,
    input,
    setInput,
    isLoading,
    rateLimited,
    quickActions,
    handleSend,
    handleKeyDown,
  } = useChatEnhancements(SITE.assistant.pageGreeting)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Show quick actions after the last assistant message when not loading
  const lastMessage = messages[messages.length - 1]
  const showQuickActions = !isLoading && lastMessage?.role === 'assistant'

  return (
    <>
      <PageMeta title={`Ask ${SITE.assistant.name} - AI Virtual Assistant`} description={`Chat with ${SITE.assistant.name}, your AI-powered virtual assistant. Get instant answers about storm damage, claims, and services.`} path="/ava" />
      <section className="py-10 lg:py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="scroll-reveal in-view text-center mb-8">
          <img
            src={SITE.assistant.avatarLarge}
            alt={`${SITE.assistant.name} AI Assistant`}
            width={80}
            height={80}
            loading="lazy"
            decoding="async"
            className="w-20 h-20 rounded-full mx-auto mb-4 object-cover shadow-lg"
          />
          <h1 className="text-3xl sm:text-4xl font-extrabold text-navy mb-2">
            Ask <span className="text-brand-blue">{SITE.assistant.name}</span>
          </h1>
          <p className="text-text-secondary">
            Your AI-powered virtual assistant. Ask anything about storm damage, claims, or our services.
          </p>
        </div>

        {/* Chat Area */}
        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
          {/* Messages */}
          <div className="h-[400px] overflow-y-auto p-6 space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <img
                    src={SITE.assistant.avatarSmall}
                    alt={SITE.assistant.name}
                    width={32}
                    height={32}
                    loading="lazy"
                    decoding="async"
                    className="w-8 h-8 rounded-full mr-3 shrink-0 mt-1"
                  />
                )}
                <div
                  className={`max-w-[85%] sm:max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
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
                <img
                  src={SITE.assistant.avatarSmall}
                  alt={SITE.assistant.name}
                  width={32}
                  height={32}
                  loading="lazy"
                  decoding="async"
                  className="w-8 h-8 rounded-full mr-3 shrink-0"
                />
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

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-6 py-4 border-t border-border bg-surface/50">
            <div className="flex items-center gap-3">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={rateLimited ? 'Please wait...' : 'Ask about storm damage, insurance claims, inspections...'}
                disabled={isLoading || rateLimited}
                className="flex-1 px-4 py-3 bg-white border border-border rounded-full text-sm text-navy placeholder:text-navy/30 focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue disabled:opacity-50 transition-all"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading || rateLimited}
                className="p-3 bg-brand-blue text-white rounded-full hover:bg-sky-600 disabled:opacity-40 transition-colors"
                aria-label="Send message"
              >
                {isLoading ? (
                  <MessageCircle className="w-5 h-5 animate-pulse" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
    </>
  )
}
