import type { Route } from './+types/service-page'
import { Link, redirect } from 'react-router'
import { Shield, CheckCircle, ArrowRight, Star } from 'lucide-react'
import Hero from '../components/sections/Hero'
import FAQ from '../components/sections/FAQ'
import CTA from '../components/sections/CTA'
import ProcessTimeline from '../components/sections/ProcessTimeline'
import Button from '../components/ui/Button'
import SectionHeading from '../components/ui/SectionHeading'
import PageMeta from '../components/ui/PageMeta'
import JsonLd from '../components/seo/JsonLd'
import { buildServiceSchema, buildBreadcrumbSchema, buildFAQSchema } from '../lib/seo'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { getServiceBySlug } from '../config/services'
import { company } from '../config/company'
import { testimonials } from '../config/testimonials'
import { getIcon } from '../lib/icons'
import {
  getProjectsForService,
  getRelatedPostsForService,
} from '../lib/content-relationships'
import type {
  ServiceSection,
  CardGridSection,
  IconGridSection,
  MaterialGridSection,
  StyleGallerySection,
  CertBarSection,
  EmergencyBannerSection,
  TrustSection,
} from '../config/services'

/* ── Loader ───────────────────────────────────────────────────────── */

export async function loader({ request }: Route.LoaderArgs) {
  const slug = new URL(request.url).pathname.replace(/^\//, '')
  const service = getServiceBySlug(slug)
  if (!service) throw redirect('/services', { status: 301 })
  return { service }
}

/* ── Section renderers ────────────────────────────────────────────── */

function CertBar({ section }: { section: CertBarSection }) {
  return (
    <div className="bg-surface border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-center gap-8 flex-wrap">
          {section.items.map((cert) => (
            <div key={cert} className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-brand-blue" />
              <span className="text-sm font-medium text-navy/70">{cert}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function EmergencyBanner({ section }: { section: EmergencyBannerSection }) {
  return (
    <div className="bg-safety-orange text-white py-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-center gap-4 flex-wrap text-center">
        <span className="font-bold">{section.text}</span>
        <Button variant="secondary" size="sm" href={section.ctaHref}>
          {section.ctaText}
        </Button>
      </div>
    </div>
  )
}

function CardGrid({ section }: { section: CardGridSection }) {
  const { ref, isInView } = useScrollReveal()
  const cols = section.columns === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'
  const bg = section.bg === 'surface' ? 'bg-surface' : ''

  return (
    <section className={`py-20 lg:py-28 ${bg}`} ref={ref}>
      <div className={section.columns === 2 ? 'max-w-4xl mx-auto px-4 sm:px-6' : 'max-w-7xl mx-auto px-4 sm:px-6'}>
        {section.title && (
          <SectionHeading
            title={section.title}
            subtitle={section.subtitle}
            className="mb-14"
          />
        )}

        <div className={`grid grid-cols-1 ${cols} gap-6`}>
          {section.cards.map((card, i) => (
            <div
              key={i}
              className={`scroll-reveal ${isInView ? 'in-view' : ''} bg-white rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300`}
              style={{ transitionDelay: `${0.2 + i * 0.1}s` }}
            >
              <img
                src={card.image}
                alt={card.title}
                width={800}
                height={384}
                loading="lazy"
                decoding="async"
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-bold text-navy mb-2">{card.title}</h3>
                <p className="text-text-secondary text-sm mb-4">{card.description}</p>
                <ul className="space-y-2">
                  {card.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-text-secondary">
                      <CheckCircle className="w-4 h-4 text-brand-blue shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function IconGrid({ section }: { section: IconGridSection }) {
  const { ref, isInView } = useScrollReveal()
  const isOrange = section.colorScheme === 'orange'
  const colsClass =
    section.columns === 4
      ? 'sm:grid-cols-2 lg:grid-cols-4'
      : section.columns === 2
        ? 'sm:grid-cols-2'
        : 'md:grid-cols-3'
  const bg = section.bg === 'surface' ? 'bg-surface' : ''

  return (
    <section className={`py-20 lg:py-28 ${bg}`} ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {section.title && (
          <SectionHeading
            title={section.title}
            subtitle={section.subtitle}
            className="mb-14"
          />
        )}

        <div className={`grid grid-cols-1 ${colsClass} gap-6`}>
          {section.cards.map((card, i) => {
            const Icon = getIcon(card.icon)
            return (
              <div
                key={i}
                className={`scroll-reveal ${isInView ? 'in-view' : ''} text-center bg-white rounded-2xl border border-border p-6`}
                style={{ transitionDelay: `${0.2 + i * 0.1}s` }}
              >
                <div
                  className={`w-14 h-14 mx-auto mb-4 rounded-xl flex items-center justify-center ${
                    isOrange ? 'bg-safety-orange/10' : 'bg-brand-blue/10'
                  }`}
                >
                  <Icon
                    className={`w-7 h-7 ${isOrange ? 'text-safety-orange' : 'text-brand-blue'}`}
                  />
                </div>
                <h4 className="font-bold text-navy mb-1">{card.title}</h4>
                <p className="text-sm text-text-secondary">{card.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function MaterialGrid({ section }: { section: MaterialGridSection }) {
  const { ref, isInView } = useScrollReveal()
  const bg = section.bg === 'surface' ? 'bg-surface' : ''

  return (
    <section className={`py-20 lg:py-28 ${bg}`} ref={ref}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {section.title && (
          <SectionHeading
            title={section.title}
            subtitle={section.subtitle}
            className="mb-14"
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {section.cards.map((mat, i) => (
            <div
              key={i}
              className={`scroll-reveal ${isInView ? 'in-view' : ''} bg-white rounded-2xl border border-border p-6`}
              style={{ transitionDelay: `${0.2 + i * 0.1}s` }}
            >
              <h3 className="text-lg font-bold text-navy mb-2">{mat.title}</h3>
              <p className="text-text-secondary text-sm mb-4">{mat.description}</p>
              <ul className="space-y-1.5">
                {mat.items.map((item) => (
                  <li key={item} className="text-sm text-text-secondary">
                    &bull; {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function StyleGallery({ section }: { section: StyleGallerySection }) {
  const { ref, isInView } = useScrollReveal()
  const bg = section.bg === 'surface' ? 'bg-surface' : ''

  return (
    <section className={`py-20 lg:py-28 ${bg}`} ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {section.title && (
          <SectionHeading
            title={section.title}
            subtitle={section.subtitle}
            className="mb-14"
          />
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {section.cards.map((style, i) => (
            <div
              key={i}
              className={`scroll-reveal ${isInView ? 'in-view' : ''} bg-white rounded-2xl border border-border overflow-hidden text-center hover:shadow-lg transition-shadow duration-300`}
              style={{ transitionDelay: `${0.2 + i * 0.05}s` }}
            >
              <img src={style.image} alt={style.title} width={800} height={384} loading="lazy" decoding="async" className="w-full h-48 object-cover" />
              <div className="p-5">
                <h4 className="font-bold text-navy mb-1">{style.title}</h4>
                <p className="text-sm text-text-secondary">{style.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function TrustSectionRenderer({ section }: { section: TrustSection }) {
  const { ref, isInView } = useScrollReveal()
  const SidebarIcon = getIcon(section.sidebar.icon)
  const bg = section.bg === 'surface' ? 'bg-surface' : ''

  return (
    <section className={`py-20 lg:py-28 ${bg}`} ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div
            className={`scroll-reveal ${isInView ? 'in-view' : ''}`}
          >
            <h2 className="text-3xl sm:text-4xl font-extrabold text-navy mb-4">
              {section.title}
            </h2>
            <p className="text-text-secondary mb-8">{section.subtitle}</p>

            <ul className="space-y-4 mb-8">
              {section.trustPoints.map((point, i) => (
                <li key={i} className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-safety-orange shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-navy">{point.title}</strong>
                    <p className="text-sm text-text-secondary mt-0.5">{point.description}</p>
                  </div>
                </li>
              ))}
            </ul>

            <Button variant="primary" href={section.ctaHref}>
              {section.ctaText}
            </Button>
          </div>

          <div
            className={`scroll-reveal ${isInView ? 'in-view' : ''} bg-surface rounded-2xl border border-border p-6 lg:p-8`}
            style={{ transitionDelay: '0.2s' }}
          >
            <div className="flex items-center gap-3 mb-4">
              <SidebarIcon className="w-6 h-6 text-safety-orange" />
              <h3 className="text-lg font-bold text-navy">{section.sidebar.title}</h3>
            </div>
            <ul className="space-y-3">
              {section.sidebar.items.map((sign, i) => (
                <li
                  key={i}
                  className="pb-3 border-b border-border last:border-0 text-sm text-text-secondary"
                >
                  {sign}
                </li>
              ))}
            </ul>
            {section.sidebar.footnote && (
              <p className="text-xs text-text-secondary mt-4">
                <strong>Important:</strong> {section.sidebar.footnote}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── Section dispatcher ───────────────────────────────────────────── */

function RenderSection({ section }: { section: ServiceSection }) {
  switch (section.type) {
    case 'certBar':
      return <CertBar section={section} />
    case 'emergencyBanner':
      return <EmergencyBanner section={section} />
    case 'cardGrid':
      return <CardGrid section={section} />
    case 'iconGrid':
      return <IconGrid section={section} />
    case 'materialGrid':
      return <MaterialGrid section={section} />
    case 'styleGallery':
      return <StyleGallery section={section} />
    case 'processTimeline':
      return <ProcessTimeline />
    case 'trustSection':
      return <TrustSectionRenderer section={section} />
    default:
      return null
  }
}

/* ── Route component ──────────────────────────────────────────────── */

export default function ServicePageRoute({ loaderData }: Route.ComponentProps) {
  const { service } = loaderData
  const serviceTestimonials = testimonials.all.filter((item) => item.serviceSlug === service.slug).slice(0, 3)
  const serviceProjects = getProjectsForService(service.slug, 3)
  const relatedPosts = getRelatedPostsForService(service.slug, 3)
  const primaryCTA = {
    text: service.hero.primaryCTA?.text ?? 'Get Free Inspection',
    href: `/contact?service=${encodeURIComponent(service.name)}&source=service-page`,
  }

  const secondaryCTA = service.hero.showEmergencyPhone
    ? { text: `Emergency: ${company.phone}`, href: `tel:${company.phone}`, external: true }
    : undefined

  return (
    <>
      <PageMeta
        title={service.meta.title}
        description={service.meta.description}
        path={`/${service.slug}`}
      />
      <JsonLd data={buildServiceSchema(service)} />
      <JsonLd data={buildBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Services', url: '/services' },
        { name: service.name, url: `/${service.slug}` },
      ])} />
      {service.faqs.items.length > 0 && (
        <JsonLd data={buildFAQSchema(service.faqs.items)} />
      )}
      <Hero
        backgroundImage={service.hero.backgroundImage}
        headline={service.hero.headline}
        highlightText={service.hero.highlightText}
        subhead={service.hero.subhead}
        primaryCTA={primaryCTA}
        secondaryCTA={secondaryCTA}
        compact
      />

      {service.sections.map((section, i) => (
        <RenderSection key={i} section={section} />
      ))}

      {serviceProjects.length > 0 && (
        <section className="py-20 lg:py-28 bg-surface">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <SectionHeading
              title={`Recent ${service.name} Projects`}
              subtitle="Real work from across our service area."
              className="mb-10"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {serviceProjects.map((project) => (
                <Link
                  key={project.slug}
                  to={`/portfolio/${project.slug}`}
                  className="group overflow-hidden rounded-2xl border border-border bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  <img
                    src={project.image}
                    alt={project.title}
                    width={800}
                    height={600}
                    loading="lazy"
                    decoding="async"
                    className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="p-5">
                    <h3 className="font-bold text-navy group-hover:text-brand-blue transition-colors">
                      {project.title}
                    </h3>
                    <p className="mt-1 text-sm text-text-secondary">{project.location}</p>
                    <p className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-brand-blue">
                      View project
                      <ArrowRight className="w-4 h-4" />
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {serviceTestimonials.length > 0 && (
        <section className="py-20 lg:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <SectionHeading
              title={`What Customers Say About Our ${service.name} Work`}
              subtitle="A few highlights from similar projects."
              className="mb-10"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {serviceTestimonials.map((testimonial) => (
                <div key={`${testimonial.name}-${testimonial.location}`} className="rounded-2xl border border-border bg-white p-6 shadow-sm">
                  <div className="mb-3 flex gap-0.5">
                    {Array.from({ length: testimonial.rating ?? 5 }).map((_, index) => (
                      <Star key={index} className="w-4 h-4 fill-safety-orange text-safety-orange" />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed text-text-secondary">&ldquo;{testimonial.quote}&rdquo;</p>
                  <div className="mt-4 border-t border-border pt-4">
                    <p className="font-semibold text-navy">{testimonial.name}</p>
                    <p className="text-xs text-text-secondary">{testimonial.location}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {relatedPosts.length > 0 && (
        <section className="py-20 lg:py-24 bg-surface border-y border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <SectionHeading
              title={`Helpful ${service.name} Resources`}
              subtitle="Guides and answers that pair well with this service."
              className="mb-10"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((post) => (
                <Link
                  key={post.slug}
                  to={`/resources/${post.slug}`}
                  className="rounded-2xl border border-border bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
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

      <FAQ title={service.faqs.title} items={service.faqs.items} />
      <CTA />
    </>
  )
}
