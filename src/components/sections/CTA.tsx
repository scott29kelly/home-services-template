import { useScrollReveal } from '../../hooks/useScrollReveal'
import Button from '../ui/Button'
import SectionHeading from '../ui/SectionHeading'
import { SITE } from '../../config/site'

export default function CTA() {
  const { ref, isInView } = useScrollReveal()

  return (
    <section className="py-20 lg:py-28 bg-gradient-to-br from-navy via-slate-800 to-navy" ref={ref as React.RefObject<HTMLElement>}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <SectionHeading
          title="Ready to Protect Your Home?"
          subtitle="Schedule your free inspection today. No obligation, no pressure -- just honest answers."
          theme="dark"
          className="mb-8"
        />
        <div
          className={`scroll-reveal ${isInView ? 'in-view' : ''} flex flex-col sm:flex-row gap-4 justify-center`}
          style={{ transitionDelay: '0.2s' }}
        >
          <Button variant="primary" size="lg" href="/contact">
            Schedule Free Inspection
          </Button>
          <Button variant="outline-white" size="lg" href={`tel:${SITE.phone}`} external>
            Call {SITE.phone}
          </Button>
        </div>
      </div>
    </section>
  )
}
