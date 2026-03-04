import { useRef, useState, useEffect } from 'react'
import { Search, FileText, Users, Hammer } from 'lucide-react'
import Button from '../ui/Button'
import SectionHeading from '../ui/SectionHeading'
import { useScrollReveal } from '../../hooks/useScrollReveal'

const steps = [
  {
    icon: Search,
    title: 'Free Inspection',
    description: 'We assess storm damage and document everything for your claim.',
  },
  {
    icon: FileText,
    title: 'File Your Claim',
    description: 'We help you file with proper documentation and estimates.',
  },
  {
    icon: Users,
    title: 'Meet the Adjuster',
    description: "We're there with you to ensure fair assessment of damages.",
  },
  {
    icon: Hammer,
    title: 'Restore Your Home',
    description: 'Quality repairs completed with attention to every detail.',
  },
]

export default function ProcessTimeline() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { ref: revealRef, isInView } = useScrollReveal('-100px 0px')
  const [lineProgress, setLineProgress] = useState(0)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const handleScroll = () => {
      const rect = el.getBoundingClientRect()
      const start = window.innerHeight * 0.8
      const end = window.innerHeight * 0.4
      const progress = Math.min(1, Math.max(0, (start - rect.top) / (rect.height - (start - end))))
      setLineProgress(progress)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <section className="py-20 lg:py-28 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeading
          title="How Insurance Claims Work"
          subtitle="We simplify the insurance process so you can focus on what matters most."
          className="mb-14"
        />

        <div ref={containerRef} className="relative max-w-2xl mx-auto">
          {/* Timeline Track */}
          <div className="absolute left-8 lg:left-1/2 lg:-translate-x-px top-0 bottom-0 w-0.5 bg-border">
            <div
              style={{ height: `${lineProgress * 100}%` }}
              className="w-full bg-gradient-to-b from-brand-blue to-safety-orange rounded-full"
            />
          </div>

          {/* Steps */}
          <div
            className="space-y-12 lg:space-y-16"
            ref={revealRef as React.RefObject<HTMLDivElement>}
          >
            {steps.map((step, i) => (
              <div
                key={i}
                className={`scroll-reveal ${isInView ? 'in-view' : ''} relative flex items-start gap-6 lg:gap-0 ${
                  i % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                }`}
                style={{ transitionDelay: `${0.2 + i * 0.15}s` }}
              >
                {/* Node */}
                <div className="absolute left-8 lg:left-1/2 -translate-x-1/2 z-10">
                  <div className="w-16 h-16 rounded-full bg-white border-2 border-brand-blue shadow-lg shadow-brand-blue/20 flex items-center justify-center">
                    <step.icon className="w-7 h-7 text-brand-blue" />
                  </div>
                </div>

                {/* Content */}
                <div
                  className={`ml-24 lg:ml-0 lg:w-[calc(50%-3rem)] ${
                    i % 2 === 0 ? 'lg:pr-8 lg:text-right' : 'lg:pl-8'
                  }`}
                >
                  <span className="inline-block px-2.5 py-1 bg-brand-blue/10 text-brand-blue text-xs font-bold rounded-full mb-2">
                    Step {i + 1}
                  </span>
                  <h3 className="text-xl font-bold text-navy mb-1">{step.title}</h3>
                  <p className="text-text-secondary leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          className={`scroll-reveal ${isInView ? 'in-view' : ''} text-center mt-14`}
          style={{ transitionDelay: '0.8s' }}
        >
          <Button variant="primary" size="lg" href="/storm-damage">
            Learn About Our Process
          </Button>
        </div>
      </div>
    </section>
  )
}
