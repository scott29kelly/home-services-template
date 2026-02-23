import { m } from 'framer-motion'
import Hero from '../components/sections/Hero'
import FAQ from '../components/sections/FAQ'
import SectionHeading from '../components/ui/SectionHeading'
import Button from '../components/ui/Button'
import FinancingCalculator from '../components/ui/FinancingCalculator'
import PageMeta from '../components/ui/PageMeta'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { financing } from '../config/financing'
import { SITE } from '../config/site'

export default function Financing() {
  const { ref: ctaRef, isInView: ctaInView } = useScrollReveal()

  return (
    <>
      <PageMeta
        title="Financing Options"
        description="Flexible financing options for roofing, siding, and storm damage repairs. Compare monthly payments and find a plan that fits your budget."
        path="/financing"
      />

      <Hero
        backgroundImage="/images/projects-hero.webp"
        headline="Flexible"
        highlightText="Financing Options"
        subhead="Making home improvements affordable. Compare monthly payments across multiple financing plans to find the right fit for your budget."
        primaryCTA={{ text: 'Get a Free Quote', href: '/contact' }}
        secondaryCTA={{ text: `Call ${SITE.phone}`, href: `tel:${SITE.phone}`, external: true }}
        compact
      />

      {/* Financing Calculator */}
      <FinancingCalculator />

      {/* FAQ Section */}
      <FAQ title="Financing FAQ" items={financing.faqs} />

      {/* CTA Section */}
      <section
        className="py-20 lg:py-28 bg-gradient-to-br from-navy via-slate-800 to-navy"
        ref={ctaRef}
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <SectionHeading
            title="Ready to Get Started?"
            subtitle="Contact us for a personalized financing quote. No obligation, no pressure -- just honest answers about making your home improvement project affordable."
            theme="dark"
            className="mb-8"
          />
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={ctaInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button variant="primary" size="lg" href="/contact">
              Get a Free Quote
            </Button>
            <Button
              variant="outline-white"
              size="lg"
              href={`tel:${SITE.phone}`}
              external
            >
              Call {SITE.phone}
            </Button>
          </m.div>
        </div>
      </section>
    </>
  )
}
