import { Building, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'
import Hero from '../components/sections/Hero'
import CTA from '../components/sections/CTA'
import SectionHeading from '../components/ui/SectionHeading'
import { useScrollReveal } from '../hooks/useScrollReveal'
import PageMeta from '../components/ui/PageMeta'
import { SITE } from '../config/site'
import { cityPages } from '../config/service-areas'

export default function ServiceAreas() {
  const { ref, isInView } = useScrollReveal()
  const { ref: statesRef, isInView: statesInView } = useScrollReveal()
  const { ref: allCitiesRef, isInView: allCitiesInView } = useScrollReveal()

  const texasCities = cityPages.filter(c => c.state === 'TX')
  const oklahomaCities = cityPages.filter(c => c.state === 'OK')

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
          <div
            className={`scroll-reveal ${isInView ? 'in-view' : ''} flex items-start gap-4 bg-surface rounded-xl border border-border p-5 max-w-md mx-auto`}
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
          </div>
        </div>
      </section>

      {/* States summary */}
      <section className="py-20 lg:py-28" ref={statesRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SectionHeading title="Service Areas by State" className="mb-10" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SITE.serviceArea.states.map((state, i) => (
              <div
                key={i}
                className={`scroll-reveal ${statesInView ? 'in-view' : ''} bg-white rounded-2xl border border-border p-6`}
                style={{ transitionDelay: `${0.1 + i * 0.05}s` }}
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
                  {state.areas.map((area) => {
                    // Strip the " (HQ)" suffix to find the slug
                    const displayName = area.replace(' (HQ)', '')
                    const match = cityPages.find(c => c.name === displayName)
                    return match ? (
                      <Link
                        key={area}
                        to={`/service-areas/${match.slug}`}
                        className="px-2.5 py-1 bg-surface text-xs text-text-secondary rounded-md hover:bg-brand-blue/10 hover:text-brand-blue transition-colors"
                      >
                        {area}
                      </Link>
                    ) : (
                      <span
                        key={area}
                        className="px-2.5 py-1 bg-surface text-xs text-text-secondary rounded-md"
                      >
                        {area}
                      </span>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* All city pages — grouped by state */}
      <section className="py-20 lg:py-28 bg-surface" ref={allCitiesRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SectionHeading
            title="Browse All Service Areas"
            subtitle="Click any city to see local services, testimonials, and more."
            className="mb-12"
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Texas */}
            <div
              className={`scroll-reveal ${allCitiesInView ? 'in-view' : ''}`}
              style={{ transitionDelay: '0.1s' }}
            >
              <h3 className="text-lg font-bold text-navy mb-4 flex items-center gap-2">
                Texas
                <span className="px-2 py-0.5 bg-brand-blue/10 text-brand-blue text-xs font-bold rounded-full">HQ</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {texasCities.map((city, i) => (
                  <div
                    key={city.slug}
                    className={`scroll-reveal ${allCitiesInView ? 'in-view' : ''}`}
                    style={{ transitionDelay: `${0.15 + i * 0.04}s` }}
                  >
                    <Link
                      to={`/service-areas/${city.slug}`}
                      className="group flex items-start gap-3 bg-white rounded-xl border border-border p-4 hover:border-brand-blue/40 hover:shadow-sm transition-all duration-200"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-navy text-sm group-hover:text-brand-blue transition-colors">
                          {city.name}
                          {city.isHQ && (
                            <span className="ml-1.5 text-xs text-brand-blue font-normal">(HQ)</span>
                          )}
                        </p>
                        <p className="text-xs text-text-secondary mt-0.5 leading-relaxed line-clamp-2">
                          {city.description.split('.')[0]}.
                        </p>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Oklahoma */}
            <div
              className={`scroll-reveal ${allCitiesInView ? 'in-view' : ''}`}
              style={{ transitionDelay: '0.2s' }}
            >
              <h3 className="text-lg font-bold text-navy mb-4">Oklahoma</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {oklahomaCities.map((city, i) => (
                  <div
                    key={city.slug}
                    className={`scroll-reveal ${allCitiesInView ? 'in-view' : ''}`}
                    style={{ transitionDelay: `${0.15 + i * 0.04}s` }}
                  >
                    <Link
                      to={`/service-areas/${city.slug}`}
                      className="group flex items-start gap-3 bg-white rounded-xl border border-border p-4 hover:border-brand-blue/40 hover:shadow-sm transition-all duration-200"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-navy text-sm group-hover:text-brand-blue transition-colors">
                          {city.name}
                        </p>
                        <p className="text-xs text-text-secondary mt-0.5 leading-relaxed line-clamp-2">
                          {city.description.split('.')[0]}.
                        </p>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <CTA />
    </>
  )
}
