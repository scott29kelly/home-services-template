import { useLocation, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Shield, CheckCircle } from 'lucide-react'
import Hero from '../components/sections/Hero'
import FAQ from '../components/sections/FAQ'
import CTA from '../components/sections/CTA'
import ProcessTimeline from '../components/sections/ProcessTimeline'
import Button from '../components/ui/Button'
import PageMeta from '../components/ui/PageMeta'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { getServiceBySlug } from '../config/services'
import { company } from '../config/company'
import { getIcon } from '../lib/icons'
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
          <div className="text-center mb-14">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-navy mb-4"
            >
              {section.title}
            </motion.h2>
            {section.subtitle && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-lg text-text-secondary max-w-2xl mx-auto"
              >
                {section.subtitle}
              </motion.p>
            )}
          </div>
        )}

        <div className={`grid grid-cols-1 ${cols} gap-6`}>
          {section.cards.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 + i * 0.1 }}
              className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300"
            >
              <img
                src={card.image}
                alt={card.title}
                className="w-full h-48 object-cover"
                loading="lazy"
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
            </motion.div>
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
          <div className="text-center mb-14">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-navy mb-4"
            >
              {section.title}
            </motion.h2>
            {section.subtitle && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-lg text-text-secondary"
              >
                {section.subtitle}
              </motion.p>
            )}
          </div>
        )}

        <div className={`grid grid-cols-1 ${colsClass} gap-6`}>
          {section.cards.map((card, i) => {
            const Icon = getIcon(card.icon)
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.2 + i * 0.1 }}
                className="text-center bg-white rounded-2xl border border-border p-6"
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
              </motion.div>
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
          <div className="text-center mb-14">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="text-3xl sm:text-4xl font-extrabold text-navy mb-4"
            >
              {section.title}
            </motion.h2>
            {section.subtitle && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-lg text-text-secondary"
              >
                {section.subtitle}
              </motion.p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {section.cards.map((mat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 + i * 0.1 }}
              className="bg-white rounded-2xl border border-border p-6"
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
            </motion.div>
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
          <div className="text-center mb-14">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="text-3xl sm:text-4xl font-extrabold text-navy mb-4"
            >
              {section.title}
            </motion.h2>
            {section.subtitle && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-lg text-text-secondary"
              >
                {section.subtitle}
              </motion.p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {section.cards.map((style, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 + i * 0.05 }}
              className="bg-white rounded-2xl border border-border overflow-hidden text-center hover:shadow-lg transition-shadow duration-300"
            >
              <img src={style.image} alt={style.title} className="w-full h-48 object-cover" loading="lazy" />
              <div className="p-5">
                <h4 className="font-bold text-navy mb-1">{style.title}</h4>
                <p className="text-sm text-text-secondary">{style.description}</p>
              </div>
            </motion.div>
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
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
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
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-surface rounded-2xl border border-border p-6 lg:p-8"
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
          </motion.div>
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

/* ── Page component ───────────────────────────────────────────────── */

export default function ServicePage() {
  const location = useLocation()
  const slug = location.pathname.replace(/^\//, '')
  const service = getServiceBySlug(slug)

  if (!service) {
    return <Navigate to="/404" replace />
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
      <Hero
        backgroundImage={service.hero.backgroundImage}
        headline={service.hero.headline}
        highlightText={service.hero.highlightText}
        subhead={service.hero.subhead}
        primaryCTA={service.hero.primaryCTA}
        secondaryCTA={secondaryCTA}
        compact
      />

      {service.sections.map((section, i) => (
        <RenderSection key={i} section={section} />
      ))}

      <FAQ title={service.faqs.title} items={service.faqs.items} />
      <CTA />
    </>
  )
}
