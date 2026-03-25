import { useParams, Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
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
import { getProjectsForCity, getRelatedPostsForCity } from '../lib/content-relationships'

/* ── FAQ accordion item ───────────────────────────────────────────── */

function FaqItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [open, setOpen] = useState(false)

  return (
    <div
      className="scroll-reveal in-view border border-border rounded-xl overflow-hidden"
      style={{ transitionDelay: `${0.1 + index * 0.05}s` }}
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
    </div>
  )
}

/* ── Page component ───────────────────────────────────────────────── */

export default function CityPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()

  const { ref: servicesRef, isInView: servicesInView } = useScrollReveal()
  const { ref: testimonialsRef, isInView: testimonialsInView } = useScrollReveal()
  const { ref: projectsRef, isInView: projectsInView } = useScrollReveal()
  const { ref: resourcesRef, isInView: resourcesInView } = useScrollReveal()
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
  const localProjects = getProjectsForCity(city.name, 3)
  const relatedPosts = getRelatedPostsForCity(city.name, 3)

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
                <div
                  key={service.slug}
                  className={`scroll-reveal ${servicesInView ? 'in-view' : ''}`}
                  style={{ transitionDelay: `${0.1 + i * 0.08}s` }}
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
                </div>
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
                <div
                  key={i}
                  className={`scroll-reveal ${testimonialsInView ? 'in-view' : ''} bg-white rounded-2xl border border-border p-6`}
                  style={{ transitionDelay: `${0.1 + i * 0.1}s` }}
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
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {localProjects.length > 0 && (
        <section className="py-20 lg:py-28" ref={projectsRef}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <SectionHeading
              title={`Recent Projects Near ${city.name}`}
              subtitle="Examples of similar work we have completed nearby."
              className="mb-10"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {localProjects.map((project, index) => (
                <Link
                  key={project.slug}
                  to={`/portfolio/${project.slug}`}
                  className={`scroll-reveal ${projectsInView ? 'in-view' : ''} overflow-hidden rounded-2xl border border-border bg-white shadow-sm hover:shadow-md transition-shadow`}
                  style={{ transitionDelay: `${0.1 + index * 0.1}s` }}
                >
                  <img
                    src={project.image}
                    alt={project.title}
                    width={800}
                    height={600}
                    loading="lazy"
                    decoding="async"
                    className="h-48 w-full object-cover"
                  />
                  <div className="p-5">
                    <h3 className="font-bold text-navy">{project.title}</h3>
                    <p className="mt-1 text-sm text-text-secondary">{project.detail}</p>
                    <p className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-blue">
                      View case study
                      <ArrowRight className="w-4 h-4" />
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {relatedPosts.length > 0 && (
        <section className="py-20 lg:py-24 bg-surface border-y border-border" ref={resourcesRef}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <SectionHeading
              title={`Helpful Resources for ${city.name} Homeowners`}
              subtitle="Guides worth reading before your next inspection or replacement."
              className="mb-10"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((post, index) => (
                <Link
                  key={post.slug}
                  to={`/resources/${post.slug}`}
                  className={`scroll-reveal ${resourcesInView ? 'in-view' : ''} rounded-2xl border border-border bg-white p-6 shadow-sm hover:shadow-md transition-shadow`}
                  style={{ transitionDelay: `${0.1 + index * 0.1}s` }}
                >
                  <div className="mb-3 flex flex-wrap gap-2">
                    {post.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="rounded-full border border-sky-100 bg-sky-50 px-2.5 py-1 text-xs font-medium text-brand-blue">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h3 className="font-bold text-navy">{post.title}</h3>
                  <p className="mt-2 text-sm text-text-secondary">{post.excerpt}</p>
                  <p className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-blue">
                    Read article
                    <ArrowRight className="w-4 h-4" />
                  </p>
                </Link>
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

            <div
              className={`scroll-reveal ${faqInView ? 'in-view' : ''} space-y-3`}
            >
              {city.faqs.map((faq, i) => (
                <FaqItem
                  key={i}
                  question={faq.question}
                  answer={faq.answer}
                  index={i}
                />
              ))}
            </div>
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

            <div
              className={`scroll-reveal ${nearbyInView ? 'in-view' : ''} flex flex-wrap gap-2 justify-center`}
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
            </div>

            {/* Phone CTA */}
            <div
              className={`scroll-reveal ${nearbyInView ? 'in-view' : ''} mt-8 text-center`}
              style={{ transitionDelay: '0.2s' }}
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
            </div>
          </div>
        </section>
      )}

      <CTA />
    </>
  )
}
