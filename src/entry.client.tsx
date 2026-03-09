import { StrictMode } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { HydratedRouter } from 'react-router/dom'

// Disable browser scroll restoration before React hydrates
history.scrollRestoration = 'manual'

// Intercept every pushState/replaceState call (React Router uses these for <Link>
// navigation). This fires OUTSIDE React's lifecycle — completely independent of
// useEffect/useLayoutEffect timing, context providers, or component rendering.
const scrollToTop = () => {
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  document.documentElement.scrollTop = 0
  document.body.scrollTop = 0
}

for (const method of ['pushState', 'replaceState'] as const) {
  const original = history[method].bind(history)
  history[method] = function (...args: Parameters<typeof original>) {
    original(...args)
    // Immediate + next frame — covers both sync and async render paths
    scrollToTop()
    requestAnimationFrame(scrollToTop)
  }
}
window.addEventListener('popstate', () => {
  scrollToTop()
  requestAnimationFrame(scrollToTop)
})

hydrateRoot(
  document,
  <StrictMode>
    <HydratedRouter />
  </StrictMode>,
)
