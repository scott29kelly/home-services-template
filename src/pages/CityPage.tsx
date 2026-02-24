import { useParams, Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { m } from 'framer-motion'
import { MapPin, Phone, ArrowRight, Star, ChevronDown, ChevronUp } from 'lucide-react'
import PageMeta from '../components/ui/PageMeta'
import JsonLd from '../components/seo/JsonLd'
import { buildLocalBusinessSchema, buildBreadcrumbSchema, buildFAQSchema } from '../lib/seo'
import Hero from '../components/sections/Hero'
import CTA from '../components/sections/CTA'
import SectionHeading from '../components/ui/SectionHeading'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { getCityBySlug, cityPages } from '../config/service-areas'
import { company } from '../config/company'
import { services } from '../config/services'
import { getTestimonialsByCity } from '../config/testimonials'
import { getIcon } from '../lib/icons'

/* ── FAQ accordion item ───────────────────────────────────────────── */

function FaqItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [open, setOpen] = useState(false)

  return (
    <m.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }}
      className="border border-border rounded-xl overflow-hidden"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left bg-white hover:bg-surface transition-colors"
        aria-expanded={open}
      >
        <span className="font-semibold text-navy text-sm sm:text-base pr-4">{question}</span>
        {open ? (
          <ChevronUp className="w-5 h-5 text-brand-blue shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-brand-blue shrink-0" />
        )}
      </button>
      {open && (
        <div className="px-5 pb-5 pt-1 bg-surface border-t border-border">
          <p className="text-text-secondary text-sm leading-relaxed">{answer}</p>
        </div>
      )}
    </m.div>
  )
}

/* ── Page component ───────────────────────────────────────────────── */

export default function CityPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()

  const { ref: servicesRef, isInView: servicesInView } = useScrollReveal()
  const { ref: testimonialsRef, isInView: testimonialsInView } = useScrollReveal()
  const { ref: faqRef, isInView: faqInView } = useScrollReveal()
  const { ref: nearbyRef, isInView: nearbyInView } = useScrollReveal()

  const city = slug ? getCityBySlug(slug) : undefined

  useEffect(() => {
    if (!city) {
      navigate('/service-areas', { replace: true })
    }
  }, [city, navigate])

  if (!city) return null

  const cityTestimonials = getTestimonialsByCity(city.slug)

  const pageTitle = city.metaTitle ?? `${city.name} Roofing & Siding | ${company.name}`
  const pageDescription = city.metaDescription ?? city.description.slice(0, 160)

  return (
    <>
      <PageMeta
        title={pageTitle}
        description={pageDescription}
        path={`/service-areas/${city.slug}`}
      />
      <JsonLd data={buildLocalBusinessSchema({ cityName: city.name })} />
      <JsonLd data={buildBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Service Areas', url: '/service-areas' },
        { name: city.name, url: `/service-areas/${city.slug}` },
      ])} />
      {city.faqs && city.faqs.length > 0 && (
        <JsonLd data={buildFAQSchema(city.faqs)} />
      )}

      {/* Hero */}
      <Hero
        backgroundImage="/images/service-areas-hero.webp"
        headline={city.name}
        highlightText="Home Services"
        subhead={city.description}
        compact
      />

      {/* Services Section */}
      <section className="py-20 lg:py-28" ref={servicesRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SectionHeading
            title={`Our Services in ${city.name}`}
            subtitle={`Trusted roofing and exterior services for ${city.name} homeowners — backed by local expertise.`}
            className="mb-14"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, i) => {
              const Icon = getIcon(service.icon)
              return (
                <m.div
                  key={service.slug}
                  initial={{ opacity: 0, y: 20 }}
                  animate={servicesInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.1 + i * 0.08 }}
                >
                  <Link
                    to={`/${service.slug}`}
                    className="group flex flex-col h-full bg-white rounded-2xl border border-border p-6 hover:shadow-lg hover:border-brand-blue/30 transition-all duration-300"
                  >
                    <div className="w-12 h-12 bg-brand-blue/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-brand-blue/20 transition-colors">
                      <Icon className="w-6 h-6 text-brand-blue" />
                    </div>
                    <h3 className="text-lg font-bold text-navy mb-2 group-hover:text-brand-blue transition-colors">
                      {service.name}
                    </h3>
                    <p className="text-sm text-text-secondary flex-1 leading-relaxed mb-4">
                      {service.overview.description}
                    </p>
                    <div className="flex items-center gap-1.5 text-brand-blue text-sm font-medium">
                      Learn more
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                </m.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section — only if city has reviews */}
      {cityTestimonials.length > 0 && (
        <section className="py-20 lg:py-28 bg-surface" ref={testimonialsRef}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <SectionHeading
              title={`What ${city.name} Homeowners Say`}
              subtitle="Real reviews from your neighbors."
              className="mb-10"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {cityTestimonials.map((t, i) => (
                <m.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={testimonialsInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.1 + i * 0.1 }}
                  className="bg-white rounded-2xl border border-border p-6"
                >
                  {/* Stars */}
                  <div className="flex gap-0.5 mb-3">
                    {Array.from({ length: t.rating ?? 5 }).map((_, j) => (
                      <Star key={j} className="w-4 h-4 text-safety-orange fill-safety-orange" />
                    ))}
                  </div>
                  {/* Quote */}
                  <p className="text-text-secondary text-sm leading-relaxed mb-4 italic">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  {/* Reviewer */}
                  <div className="flex items-center gap-3 pt-3 border-t border-border">
                    <img
                      src={t.image}
                      alt={t.name}
                      width={40}
                      height={40}
                      loading="lazy"
                      decoding="async"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold text-navy text-sm">{t.name}</p>
                      <p className="text-xs text-text-secondary flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {t.location}
                        {t.service && ` · ${t.service}`}
                      </p>
                    </div>
                  </div>
                </m.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ Section — only if city has FAQs */}
      {city.faqs && city.faqs.length > 0 && (
        <section className="py-20 lg:py-28" ref={faqRef}>
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <SectionHeading
              title={`Frequently Asked Questions in ${city.name}`}
              subtitle={`Common questions from ${city.name} homeowners about our services.`}
              className="mb-10"
            />

            <m.div
              initial={{ opacity: 0 }}
              animate={faqInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.4 }}
              className="space-y-3"
            >
              {city.faqs.map((faq, i) => (
                <FaqItem
                  key={i}
                  question={faq.question}
                  answer={faq.answer}
                  index={i}
                />
              ))}
            </m.div>
          </div>
        </section>
      )}

      {/* Nearby Areas Section */}
      {city.nearby.length > 0 && (
        <section className="py-16 bg-surface" ref={nearbyRef}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <SectionHeading
              title="Also Serving Nearby Areas"
              subtitle="Explore our other local service area pages."
              className="mb-8"
            />

            <m.div
              initial={{ opacity: 0, y: 10 }}
              animate={nearbyInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="flex flex-wrap gap-2 justify-center"
            >
              {city.nearby.map((nearbySlug) => {
                const nearbyCity = cityPages.find(c => c.slug === nearbySlug)
                if (!nearbyCity) return null
                return (
                  <Link
                    key={nearbySlug}
                    to={`/service-areas/${nearbySlug}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-border rounded-full text-sm font-medium text-navy hover:border-brand-blue hover:text-brand-blue hover:shadow-sm transition-all duration-200"
                  >
                    <MapPin className="w-3.5 h-3.5 text-brand-blue" />
                    {nearbyCity.name}
                    {nearbyCity.state !== city.state && (
                      <span className="text-xs text-text-secondary ml-0.5">{nearbyCity.state}</span>
                    )}
                  </Link>
                )
              })}
            </m.div>

            {/* Phone CTA */}
            <m.div
              initial={{ opacity: 0, y: 10 }}
              animate={nearbyInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-8 text-center"
            >
              <p className="text-text-secondary text-sm mb-3">
                Don&apos;t see your city? We likely serve your area — give us a call.
              </p>
              <a
                href={`tel:${company.phone}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-blue text-white rounded-xl font-medium text-sm hover:bg-navy transition-colors"
              >
                <Phone className="w-4 h-4" />
                {company.phone}
              </a>
            </m.div>
          </div>
        </section>
      )}

      <CTA />
    </>
  )
}
