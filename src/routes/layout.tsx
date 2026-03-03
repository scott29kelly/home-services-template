import { Outlet, useLocation } from 'react-router'
import { SpeedInsights } from '@vercel/speed-insights/react'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import ScrollToTop from '../components/layout/ScrollToTop'
import AvaWidget from '../components/ui/AvaWidget'
import StickyMobileCTA from '../components/ui/StickyMobileCTA'
import AnnouncementBanner from '../components/ui/AnnouncementBanner'
import { features } from '../config'

export default function AppLayout() {
  const { pathname } = useLocation()
  // Don't show floating widget on the dedicated Ava page, and only when assistant feature is enabled
  const showAvaWidget = pathname !== '/ava' && features.assistant

  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      {/* Skip to content link — visible on focus for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-navy focus:text-white focus:rounded-lg focus:text-sm focus:font-medium focus:outline-none focus:ring-2 focus:ring-safety-orange"
      >
        Skip to content
      </a>
      <AnnouncementBanner />
      <Header />
      <main id="main-content" className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <StickyMobileCTA />
      {showAvaWidget && <AvaWidget />}
      {import.meta.env.VITE_VERCEL_SPEED_INSIGHTS === 'true' && <SpeedInsights />}
    </div>
  )
}
