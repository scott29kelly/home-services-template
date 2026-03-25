import { useState, useEffect, useCallback, useRef } from 'react'
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
  const [prevActive, setPrevActive] = useState<number | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const next = useCallback(() => {
    setPrevActive(active)
    setActive((prev) => (prev + 1) % testimonials.length)
  }, [active, testimonials.length])

  const prev = useCallback(() => {
    setPrevActive(active)
    setActive((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }, [active, testimonials.length])

  const goTo = useCallback((i: number) => {
    setPrevActive(active)
    setActive(i)
  }, [active])

  // Autoplay
  useEffect(() => {
    if (autoplay && !isPaused) {
      intervalRef.current = setInterval(next, interval)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [autoplay, isPaused, next, interval])

  // Clear prevActive after transition
  useEffect(() => {
    if (prevActive === null) return
    const timer = setTimeout(() => setPrevActive(null), 500)
    return () => clearTimeout(timer)
  }, [prevActive])

  // Stable rotations for stacked cards
  const rotations = useRef<number[]>(
    testimonials.map((_, i) => {
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
        {testimonials.map((t, i) => {
          const isActive = i === active
          const offset = i - active
          const distance = Math.abs(offset)
          if (!isActive && distance > 2) return null

          const rotation = rotations.current[i]
          const scale = isActive ? 1 : 0.95 - distance * 0.02
          const zIndex = isActive ? 30 : 20 - distance
          const translateY = isActive ? 0 : distance * 8
          const opacity = isActive ? 1 : 0.7

          return (
            <div
              key={t.image + i}
              className="absolute inset-0 origin-bottom"
              style={{
                zIndex,
                opacity,
                transform: `rotate(${isActive ? 0 : rotation}deg) scale(${scale}) translateY(${translateY}px)`,
                transition: 'all 0.5s cubic-bezier(0.25, 0.1, 0.25, 1)',
              }}
            >
              <img
                src={t.image}
                alt={`Completed ${t.service || 'project'} in ${t.location}`}
                width={600}
                height={400}
                loading="lazy"
                decoding="async"
                draggable={false}
                className="w-full h-full object-cover rounded-2xl shadow-xl"
              />
              {/* Subtle gradient overlay for depth */}
              {!isActive && (
                <div className="absolute inset-0 bg-navy/20 rounded-2xl" />
              )}
            </div>
          )
        })}
      </div>

      {/* Text content */}
      <div className="flex flex-col justify-center">
        {/* Quote */}
        <div aria-live="polite" className="min-h-[120px] sm:min-h-[140px]">
          <blockquote
            key={active}
            className="fade-enter visible text-lg sm:text-xl lg:text-2xl text-white/90 leading-relaxed font-light"
            style={{ animationDuration: '0.2s' }}
          >
            <span className="text-safety-orange text-3xl leading-none mr-1">"</span>
            {currentTestimonial.quote}
            <span className="text-safety-orange text-3xl leading-none ml-0.5">"</span>
          </blockquote>
        </div>

        {/* Author info */}
        <div
          key={`author-${active}`}
          className="fade-enter visible mt-6"
        >
          <p className="font-semibold text-white text-lg">{currentTestimonial.name}</p>
          <p className="text-white/50 text-sm">
            {currentTestimonial.location}
            {currentTestimonial.service && (
              <span> &middot; {currentTestimonial.service}</span>
            )}
          </p>
        </div>

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
                onClick={() => goTo(i)}
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
