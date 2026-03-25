import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { fetchBanner, type BannerData } from '../../lib/banner-client'

const DISMISS_KEY = 'banner-dismissed'

const urgencyStyles: Record<BannerData['urgency'], string> = {
  high: 'bg-red-600 text-white',
  medium: 'bg-brand-blue text-white',
  low: 'bg-blue-50 text-navy border-b border-blue-100',
}

export default function AnnouncementBanner() {
  const [bannerData, setBannerData] = useState<BannerData | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Check if already dismissed this session
    if (sessionStorage.getItem(DISMISS_KEY) === 'true') {
      setDismissed(true)
      return
    }

    // Fetch banner data (non-blocking)
    fetchBanner().then((data) => {
      if (data) setBannerData(data)
    })
  }, [])

  const handleDismiss = () => {
    setDismissed(true)
    sessionStorage.setItem(DISMISS_KEY, 'true')
  }

  const show = bannerData && !dismissed

  if (!show) return null

  return (
    <div
      role={bannerData.urgency === 'high' ? 'alert' : 'status'}
      className={`fade-enter visible overflow-hidden ${urgencyStyles[bannerData.urgency]}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-center gap-3 text-sm">
        <p className="text-center flex-1 font-medium">
          {bannerData.text}
          {bannerData.ctaText && bannerData.ctaHref && (
            <>
              {' '}
              <a
                href={bannerData.ctaHref}
                className={`inline-flex items-center font-bold underline underline-offset-2 hover:no-underline ${
                  bannerData.urgency === 'low'
                    ? 'text-brand-blue'
                    : 'text-inherit'
                }`}
              >
                {bannerData.ctaText}
              </a>
            </>
          )}
        </p>
        <button
          onClick={handleDismiss}
          aria-label="Dismiss announcement"
          className={`shrink-0 p-1 rounded-full transition-colors ${
            bannerData.urgency === 'low'
              ? 'hover:bg-blue-100'
              : 'hover:bg-white/20'
          }`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
