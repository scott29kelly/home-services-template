import { useState, useEffect } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { m, AnimatePresence } from 'framer-motion'
import { Phone, MessageSquare, FileText } from 'lucide-react'
import { company } from '../../config/company'

/** Scroll threshold (px) before the sticky CTA bar appears. */
const SCROLL_THRESHOLD = 300

/**
 * StickyMobileCTA -- fixed bottom bar on mobile with phone, quote, and Ava chat actions.
 *
 * - Only visible on mobile (< md breakpoint via `md:hidden`)
 * - Appears after scrolling past the hero fold (~300px)
 * - Hides on the dedicated /ava page
 * - Dispatches `open-ava-chat` CustomEvent for AvaWidget coordination
 * - Frosted glass styling for premium feel
 */
export default function StickyMobileCTA() {
  const [isVisible, setIsVisible] = useState(false)
  const { pathname } = useLocation()
  const isAvaPage = pathname === '/ava'

  useEffect(() => {
    if (isAvaPage) return

    const handleScroll = () => {
      setIsVisible(window.scrollY > SCROLL_THRESHOLD)
    }

    // Check initial scroll position (e.g., if user refreshed while scrolled)
    handleScroll()

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isAvaPage])

  const handleOpenAvaChat = () => {
    window.dispatchEvent(new CustomEvent('open-ava-chat'))
  }

  // Don't render on the dedicated Ava page
  if (isAvaPage) return null

  return (
    <AnimatePresence>
      {isVisible && (
        <m.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 400, damping: 35 }}
          className="fixed bottom-0 left-0 right-0 z-40 md:hidden"
        >
          <div className="bg-white/95 backdrop-blur-md border-t border-border/60 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] rounded-t-2xl pb-[env(safe-area-inset-bottom)]">
            <div className="flex items-center justify-around px-3 py-2.5 max-w-lg mx-auto">
              {/* Phone */}
              <a
                href={`tel:${company.phone}`}
                className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-navy hover:bg-slate-100 active:bg-slate-200 transition-colors min-w-[72px]"
              >
                <Phone className="w-5 h-5 text-brand-blue" />
                <span className="text-[11px] font-semibold text-navy/70">Call</span>
              </a>

              {/* Free Quote -- primary action */}
              <Link
                to="/contact"
                className="flex items-center gap-2 px-5 py-2.5 bg-brand-blue hover:bg-sky-600 active:bg-sky-700 text-white rounded-full shadow-md shadow-brand-blue/25 transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span className="text-sm font-bold whitespace-nowrap">Free Quote</span>
              </Link>

              {/* Ava Chat */}
              <button
                onClick={handleOpenAvaChat}
                className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-navy hover:bg-slate-100 active:bg-slate-200 transition-colors min-w-[72px]"
              >
                <MessageSquare className="w-5 h-5 text-brand-blue" />
                <span className="text-[11px] font-semibold text-navy/70">Chat</span>
              </button>
            </div>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  )
}
