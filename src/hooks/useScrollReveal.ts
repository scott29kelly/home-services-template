import { useRef, useState, useEffect } from 'react'

export function useScrollReveal(margin = '-100px 0px') {
  const ref = useRef<HTMLElement | null>(null)
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Respect prefers-reduced-motion: skip animation, show immediately
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsInView(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect() // once: true equivalent
        }
      },
      { rootMargin: margin }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [margin])

  return { ref, isInView }
}
