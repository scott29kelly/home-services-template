import { m } from 'framer-motion'
import { Building, Clock } from 'lucide-react'
import Hero from '../components/sections/Hero'
import CTA from '../components/sections/CTA'
import SectionHeading from '../components/ui/SectionHeading'
import { useScrollReveal } from '../hooks/useScrollReveal'
import PageMeta from '../components/ui/PageMeta'
import { SITE } from '../config/site'

export default function ServiceAreas() {
  const { ref, isInView } = useScrollReveal()
  const { ref: statesRef, isInView: statesInView } = useScrollReveal()

  return (
    <>
      <PageMeta title="Service Areas" description={`${SITE.name} serves the greater metro area. Licensed & insured.`} path="/service-areas" />
      <Hero
        backgroundImage="/images/service-areas-hero.webp"
        headline="Areas We"
        highlightText="Serve"
        subhead={`Licensed and serving homeowners across the ${SITE.serviceArea.summary.toLowerCase().replace('serving the ', '')}.`}
        compact
      />

      {/* Office */}
      <section className="py-10 border-b border-border" ref={ref}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="flex items-start gap-4 bg-surface rounded-xl border border-border p-5 max-w-md mx-auto"
          >
            <Building className="w-6 h-6 text-brand-blue shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-navy text-sm">Headquarters</p>
              <p className="text-sm text-text-secondary">{SITE.address.full}</p>
              <div className="flex items-center gap-1.5 mt-1 text-xs text-text-secondary">
                <Clock className="w-3.5 h-3.5" />
                {SITE.hours.weekday}, {SITE.hours.saturday}
              </div>
            </div>
          </m.div>
        </div>
      </section>

      {/* States */}
      <section className="py-20 lg:py-28" ref={statesRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SectionHeading title="Service Areas by State" className="mb-10" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SITE.serviceArea.states.map((state, i) => (
              <m.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={statesInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.05 }}
                className="bg-white rounded-2xl border border-border p-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-lg font-bold text-navy">{state.name}</h3>
                  {state.badge && (
                    <span className="px-2 py-0.5 bg-brand-blue/10 text-brand-blue text-xs font-bold rounded-full">
                      {state.badge}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {state.areas.map((area) => (
                    <span
                      key={area}
                      className="px-2.5 py-1 bg-surface text-xs text-text-secondary rounded-md"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </m.div>
            ))}
          </div>
        </div>
      </section>

      <CTA />
    </>
  )
}
