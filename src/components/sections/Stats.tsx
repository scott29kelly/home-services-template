import { useEffect, useState } from 'react'
import { m } from 'framer-motion'
import { useScrollReveal } from '../../hooks/useScrollReveal'
import SectionHeading from '../ui/SectionHeading'
import { SITE } from '../../config/site'

const stats = [
  SITE.stats.homes,
  SITE.stats.years,
  SITE.stats.states,
  SITE.stats.satisfaction,
]

function CountUp({ end, suffix, trigger }: { end: number; suffix: string; trigger: boolean }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!trigger) return
    let frame: number
    const duration = 2000
    const start = performance.now()

    function step(now: number) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * end))
      if (progress < 1) frame = requestAnimationFrame(step)
    }

    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [trigger, end])

  return <>{trigger ? count : 0}{suffix}</>
}

export default function Stats() {
  const { ref, isInView } = useScrollReveal('0px 0px')

  return (
    <section className="py-20 lg:py-28 bg-navy relative overflow-hidden" ref={ref}>
      {/* Background accent */}
      <div className="absolute inset-0 bg-gradient-to-br from-navy via-slate-800 to-navy" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-brand-blue/5 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeading
          title="Why Homeowners Choose Us"
          subtitle="We're not just contractors -- we're your advocates throughout the entire process."
          theme="dark"
          className="mb-14"
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <m.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 + i * 0.1 }}
              className="text-center"
            >
              <div className="text-4xl lg:text-5xl font-extrabold text-brand-blue mb-2">
                <CountUp end={stat.end} suffix={stat.suffix} trigger={isInView} />
              </div>
              <div className="text-sm font-medium text-slate-400 uppercase tracking-wider">
                {stat.label}
              </div>
            </m.div>
          ))}
        </div>
      </div>
    </section>
  )
}
