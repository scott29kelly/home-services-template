import { useLayoutEffect, useEffect } from 'react'
import { useLocation } from 'react-router'

/**
 * Force scroll to top using every available method.
 * Covers browser quirks where window.scrollTo alone can fail
 * (e.g. overflow-x: clip on <html> computing overflow-y to clip).
 */
function forceScrollTop() {
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  document.documentElement.scrollTop = 0
  document.body.scrollTop = 0
}

export default function ScrollToTop() {
  const { pathname } = useLocation()

  // 1. Synchronous — fires after DOM mutation, before browser paint
  useLayoutEffect(() => {
    forceScrollTop()
  }, [pathname])

  // 2. Post-paint — catches anything that overrides scroll between
  //    layout effects and first paint (e.g. browser scroll restoration)
  useEffect(() => {
    forceScrollTop()
  }, [pathname])

  // 3. Next animation frame — catches async overrides like
  //    IntersectionObserver callbacks or deferred React Router internals
  useEffect(() => {
    const id = requestAnimationFrame(() => forceScrollTop())
    return () => cancelAnimationFrame(id)
  }, [pathname])

  return null
}
