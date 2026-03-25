import { useScrollReveal } from '../../hooks/useScrollReveal'
import Button from '../ui/Button'
import SectionHeading from '../ui/SectionHeading'
import { company } from '../../config/company'
import { trackEvent } from '../../lib/analytics'

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
          <Button
            variant="primary"
            size="lg"
            href="/contact?source=site-cta"
            onClick={() => trackEvent('cta_clicked', { cta_name: 'schedule_free_inspection', placement: 'global-cta' })}
          >
            Schedule Free Inspection
          </Button>
          <Button
            variant="outline-white"
            size="lg"
            href={`tel:${company.phone}`}
            external
            onClick={() => trackEvent('cta_clicked', { cta_name: 'call_now', placement: 'global-cta' })}
          >
            Call {company.phone}
          </Button>
        </div>
      </div>
    </section>
  )
}
