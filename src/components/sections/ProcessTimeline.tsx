import { useRef } from 'react'
import { m, useScroll, useTransform, useInView } from 'framer-motion'
import { Search, FileText, Users, Hammer } from 'lucide-react'
import Button from '../ui/Button'
import SectionHeading from '../ui/SectionHeading'

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
  const containerRef = useRef(null)
  const isInView = useInView(containerRef, { once: true, margin: '-100px' })

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 0.8', 'end 0.4'],
  })

  const lineHeight = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])

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
            <m.div
              style={{ height: lineHeight }}
              className="w-full bg-gradient-to-b from-brand-blue to-safety-orange rounded-full"
            />
          </div>

          {/* Steps */}
          <div className="space-y-12 lg:space-y-16">
            {steps.map((step, i) => (
              <m.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.2 + i * 0.15 }}
                className={`relative flex items-start gap-6 lg:gap-0 ${
                  i % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                }`}
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
              </m.div>
            ))}
          </div>
        </div>

        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-14"
        >
          <Button variant="primary" size="lg" href="/storm-damage">
            Learn About Our Process
          </Button>
        </m.div>
      </div>
    </section>
  )
}
