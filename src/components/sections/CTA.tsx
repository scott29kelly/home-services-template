import { m } from 'framer-motion'
import { useScrollReveal } from '../../hooks/useScrollReveal'
import Button from '../ui/Button'
import { SITE } from '../../config/site'

export default function CTA() {
  const { ref, isInView } = useScrollReveal()

  return (
    <section className="py-20 lg:py-28 bg-gradient-to-br from-navy via-slate-800 to-navy" ref={ref}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <m.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4"
        >
          Ready to Protect Your Home?
        </m.h2>
        <m.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-lg text-white/60 mb-8"
        >
          Schedule your free inspection today. No obligation, no pressure – just honest answers.
        </m.p>
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button variant="primary" size="lg" href="/contact">
            Schedule Free Inspection
          </Button>
          <Button variant="outline-white" size="lg" href={`tel:${SITE.phone}`} external>
            Call {SITE.phone}
          </Button>
        </m.div>
      </div>
    </section>
  )
}
