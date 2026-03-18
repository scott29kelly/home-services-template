import { useEffect } from 'react'
import { useLocation } from 'react-router'
import { trackPageView } from '../../lib/analytics'
import { captureAttribution } from '../../lib/attribution'

export function PageTracker() {
  const location = useLocation()

  useEffect(() => {
    captureAttribution(location.pathname, location.search)
    trackPageView(location.pathname + location.search, document.title)
  }, [location.pathname, location.search])

  return null
}
