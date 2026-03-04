import { Shield, Trophy, Award } from 'lucide-react'
import { Link } from 'react-router-dom'
import Hero from '../components/sections/Hero'
import CTA from '../components/sections/CTA'
import { useScrollReveal } from '../hooks/useScrollReveal'
import PageMeta from '../components/ui/PageMeta'
import { services } from '../config/services'
import { getIcon } from '../lib/icons'

const certs = [
  { icon: Trophy, title: 'BBB A+ Rating' },
  { icon: Shield, title: 'Licensed & Insured' },
  { icon: Award, title: 'Manufacturer Certified' },
]

const whyUs = [
  'Family-owned and operated',
  'Insurance claims experts',
  'Premium materials with manufacturer warranties',
  'A+ BBB rating with 500+ homes protected',
]

export default function Services() {
  const { ref, isInView } = useScrollReveal()
  const { ref: whyRef, isInView: whyInView } = useScrollReveal()

  return (
    <>
      <PageMeta title="Our Services" description="Expert roofing, siding, and storm damage repair backed by industry-leading certifications and warranties." path="/services" />
      <Hero
        backgroundImage="/images/hero-roofing.webp"
        headline="Our"
        highlightText="Services"
        subhead="Expert roofing, siding, and storm damage repair backed by industry-leading certifications and warranties."
        compact
      />

      {/* Services */}
      <section className="py-20 lg:py-28" ref={ref}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {services.map((service, i) => {
              const Icon = getIcon(service.icon)
              return (
                <div
                  key={service.slug}
                  className={`scroll-reveal ${isInView ? 'in-view' : ''}`}
                  style={{ transitionDelay: `${0.1 + i * 0.1}s` }}
                >
                  <Link
                    to={`/${service.slug}`}
                    className="group block bg-white rounded-2xl border border-border overflow-hidden hover:shadow-xl transition-all duration-300"
                  >
                    <div className="relative h-56 overflow-hidden">
                      <img
                        src={service.overview.image}
                        alt={service.name}
                        width={800}
                        height={448}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-navy/60 to-transparent" />
                      <div className="absolute bottom-4 left-4 flex items-center gap-2">
                        <Icon className="w-6 h-6 text-white" />
                        <h3 className="text-xl font-bold text-white">{service.name}</h3>
                      </div>
                    </div>
                    <div className="p-6">
                      <p className="text-text-secondary text-sm leading-relaxed mb-4">
                        {service.overview.description}
                      </p>
                      <span className="text-sm font-semibold text-safety-orange group-hover:underline">
                        Learn More &rarr;
                      </span>
                    </div>
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 lg:py-28 bg-surface" ref={whyRef}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div
              className={`scroll-reveal ${whyInView ? 'in-view' : ''}`}
            >
              <h2 className="text-3xl sm:text-4xl font-extrabold text-navy mb-6">
                Why Choose Us?
              </h2>
              <ul className="space-y-3">
                {whyUs.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-text-secondary">
                    <div className="w-2 h-2 rounded-full bg-brand-blue shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div
              className={`scroll-reveal ${whyInView ? 'in-view' : ''} grid grid-cols-1 gap-4`}
              style={{ transitionDelay: '0.2s' }}
            >
              {certs.map((cert, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 bg-white rounded-xl border border-border p-4"
                >
                  <cert.icon className="w-8 h-8 text-brand-blue shrink-0" />
                  <p className="font-semibold text-navy text-sm">{cert.title}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <CTA />
    </>
  )
}
