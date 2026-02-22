import { useState, useEffect, useCallback, useRef } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Testimonial {
  name: string
  location: string
  quote: string
  image: string
  service?: string
}

interface AnimatedTestimonialsProps {
  testimonials: Testimonial[]
  autoplay?: boolean
  interval?: number
}

export default function AnimatedTestimonials({
  testimonials,
  autoplay = true,
  interval = 5000,
}: AnimatedTestimonialsProps) {
  const [active, setActive] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const next = useCallback(() => {
    setActive((prev) => (prev + 1) % testimonials.length)
  }, [testimonials.length])

  const prev = useCallback(() => {
    setActive((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }, [testimonials.length])

  // Autoplay
  useEffect(() => {
    if (autoplay && !isPaused) {
      intervalRef.current = setInterval(next, interval)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [autoplay, isPaused, next, interval])

  // Randomize initial slight rotations for the stacked cards (stable across renders)
  const rotations = useRef<number[]>(
    testimonials.map((_, i) => {
      // Alternate between slight left and right rotations
      const base = i % 2 === 0 ? -1 : 1
      return base * (2 + (i % 3))
    })
  )

  const currentTestimonial = testimonials[active]

  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Image stack */}
      <div className="relative h-72 sm:h-80 md:h-96 w-full max-w-md mx-auto md:mx-0">
        <AnimatePresence>
          {testimonials.map((t, i) => {
            const isActive = i === active
            const offset = i - active
            // Only render the active card and the 2 cards visually behind it
            const distance = Math.abs(offset)
            if (!isActive && distance > 2) return null

            return (
              <m.div
                key={t.image + i}
                initial={{ opacity: 0, scale: 0.9, rotate: rotations.current[i] }}
                animate={{
                  opacity: isActive ? 1 : 0.7,
                  scale: isActive ? 1 : 0.95 - distance * 0.02,
                  rotate: isActive ? 0 : rotations.current[i],
                  zIndex: isActive ? 30 : 20 - distance,
                  y: isActive ? 0 : distance * 8,
                }}
                exit={{ opacity: 0, scale: 0.9, rotate: rotations.current[i] }}
                transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                className="absolute inset-0 origin-bottom"
              >
                <img
                  src={t.image}
                  alt={`Completed ${t.service || 'project'} in ${t.location}`}
                  className="w-full h-full object-cover rounded-2xl shadow-xl"
                  width={600}
                  height={400}
                  draggable={false}
                />
                {/* Subtle gradient overlay for depth */}
                {!isActive && (
                  <div className="absolute inset-0 bg-navy/20 rounded-2xl" />
                )}
              </m.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Text content */}
      <div className="flex flex-col justify-center">
        {/* Quote with word-by-word blur reveal */}
        <div aria-live="polite" className="min-h-[120px] sm:min-h-[140px]">
          <AnimatePresence mode="wait">
            <m.blockquote
              key={active}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="text-lg sm:text-xl lg:text-2xl text-white/90 leading-relaxed font-light"
            >
              <span className="text-safety-orange text-3xl leading-none mr-1">"</span>
              {currentTestimonial.quote.split(' ').map((word, i) => (
                <m.span
                  key={`${active}-${i}`}
                  initial={{ opacity: 0, filter: 'blur(8px)' }}
                  animate={{ opacity: 1, filter: 'blur(0px)' }}
                  transition={{
                    duration: 0.3,
                    delay: 0.1 + i * 0.035,
                    ease: 'easeOut',
                  }}
                  className="inline-block mr-[0.25em]"
                >
                  {word}
                </m.span>
              ))}
              <span className="text-safety-orange text-3xl leading-none ml-0.5">"</span>
            </m.blockquote>
          </AnimatePresence>
        </div>

        {/* Author info */}
        <AnimatePresence mode="wait">
          <m.div
            key={active}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="mt-6"
          >
            <p className="font-semibold text-white text-lg">{currentTestimonial.name}</p>
            <p className="text-white/50 text-sm">
              {currentTestimonial.location}
              {currentTestimonial.service && (
                <span> &middot; {currentTestimonial.service}</span>
              )}
            </p>
          </m.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center gap-3 mt-8">
          <button
            onClick={prev}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={next}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dot indicators */}
          <div className="flex gap-1.5 ml-3">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i === active
                    ? 'bg-safety-orange w-6'
                    : 'bg-white/30 hover:bg-white/50'
                }`}
                aria-label={`Go to testimonial ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
