import { motion } from 'framer-motion'
import { Palette, DollarSign, Thermometer, Wrench, CheckCircle } from 'lucide-react'
import Hero from '../components/sections/Hero'
import FAQ from '../components/sections/FAQ'
import CTA from '../components/sections/CTA'
import { useScrollReveal } from '../hooks/useScrollReveal'
import PageMeta from '../components/ui/PageMeta'

const benefits = [
  { icon: Palette, title: 'Enhanced Curb Appeal', description: "Transform your home's look with modern colors and styles." },
  { icon: DollarSign, title: 'Increased Value', description: 'Siding replacement offers one of the best returns on investment.' },
  { icon: Thermometer, title: 'Energy Efficiency', description: 'Insulated siding helps reduce heating and cooling costs.' },
  { icon: Wrench, title: 'Low Maintenance', description: 'No painting required – just occasional cleaning.' },
]

const sidingServices = [
  {
    title: 'Vinyl Siding Installation',
    image: '/images/vinyl-siding.webp',
    description:
      'Our most popular option. Vinyl siding is durable, affordable, and available in countless colors and styles to match any home.',
    features: ['Wide color selection', 'Weather resistant', 'Fade resistant', '25+ year warranties'],
  },
  {
    title: 'Siding Repair',
    image: '/images/siding-repair.webp',
    description:
      "Storm damage or wear and tear? We can repair or replace damaged sections to restore your home's protection and appearance.",
    features: ['Storm damage repair', 'Section replacement', 'Color matching', 'Insurance claims assistance'],
  },
]

const sidingStyles = [
  { title: 'Horizontal Lap Siding', image: '/images/siding-horizontal.webp', description: 'The classic American look. Clean horizontal lines that work with any architectural style.' },
  { title: 'Dutch Lap Siding', image: '/images/siding-dutch.webp', description: 'A decorative groove adds shadow lines and visual interest to your home\'s exterior.' },
  { title: 'Board & Batten', image: '/images/siding-board-batten.webp', description: 'Vertical siding with a farmhouse-inspired look. Perfect for accent areas or full coverage.' },
  { title: 'Shake & Shingle', image: '/images/siding-shake.webp', description: 'The charm of cedar shakes without the maintenance. Great for gables and accent areas.' },
  { title: 'Scallop Siding', image: '/images/siding-scallop.webp', description: 'Decorative scalloped edges for Victorian and cottage-style homes.' },
  { title: 'Insulated Siding', image: '/images/siding-insulated.webp', description: 'Built-in foam backing increases energy efficiency and reduces outside noise.' },
]

const faqs = [
  { question: 'How long does vinyl siding last?', answer: 'Quality vinyl siding can last 25-40 years or more with proper installation. Most manufacturers offer warranties of 25+ years, and some offer lifetime limited warranties.' },
  { question: 'How do I maintain vinyl siding?', answer: "Vinyl siding is virtually maintenance-free. An occasional rinse with a garden hose is usually all that's needed. For tougher dirt, a soft brush and mild detergent work well." },
  { question: 'Can siding be installed over existing siding?', answer: 'In some cases, yes. However, we typically recommend removing old siding to inspect the underlying structure for damage or rot. This ensures the best long-term results.' },
  { question: 'Will insurance cover storm-damaged siding?', answer: "Yes, storm damage to siding is typically covered by homeowner's insurance. We specialize in insurance claims and will help you document the damage and work with your adjuster." },
]

export default function Siding() {
  const { ref: benefitsRef, isInView: benefitsInView } = useScrollReveal()
  const { ref: servicesRef, isInView: servicesInView } = useScrollReveal()
  const { ref: stylesRef, isInView: stylesInView } = useScrollReveal()

  return (
    <>
      <PageMeta title="Siding Services" description="Transform your home with beautiful, durable vinyl siding. Expert installation with lasting results. Free estimates." path="/siding" />
      <Hero
        backgroundImage="/images/siding-hero.webp"
        headline="Transform Your Home with"
        highlightText="New Siding"
        subhead="Beautiful, durable vinyl siding that protects your home and increases curb appeal. Expert installation with lasting results."
        compact
      />

      {/* Benefits */}
      <section className="py-20 lg:py-28" ref={benefitsRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={benefitsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-navy mb-4"
            >
              Why Choose New Siding?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={benefitsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-lg text-text-secondary"
            >
              Upgrade your home's exterior with benefits that last for decades.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((b, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={benefitsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.2 + i * 0.1 }}
                className="text-center bg-white rounded-2xl border border-border p-6"
              >
                <div className="w-14 h-14 mx-auto mb-4 bg-brand-blue/10 rounded-xl flex items-center justify-center">
                  <b.icon className="w-7 h-7 text-brand-blue" />
                </div>
                <h4 className="font-bold text-navy mb-1">{b.title}</h4>
                <p className="text-sm text-text-secondary">{b.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 lg:py-28 bg-surface" ref={servicesRef}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={servicesInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-3xl sm:text-4xl font-extrabold text-navy mb-10 text-center"
          >
            Our Siding Services
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sidingServices.map((service, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={servicesInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.1 + i * 0.1 }}
                className="bg-white rounded-2xl border border-border overflow-hidden"
              >
                <img src={service.image} alt={service.title} className="w-full h-48 object-cover" loading="lazy" />
                <div className="p-6">
                  <h3 className="text-lg font-bold text-navy mb-2">{service.title}</h3>
                  <p className="text-text-secondary text-sm mb-4">{service.description}</p>
                  <ul className="space-y-2">
                    {service.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-text-secondary">
                        <CheckCircle className="w-4 h-4 text-brand-blue shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Siding Styles */}
      <section className="py-20 lg:py-28" ref={stylesRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={stylesInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="text-3xl sm:text-4xl font-extrabold text-navy mb-4"
            >
              Siding Styles & Options
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={stylesInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-lg text-text-secondary"
            >
              Find the perfect look for your home.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sidingStyles.map((style, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={stylesInView ? { opacity: 1, y: 0 } : {}}
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

      <FAQ title="Siding FAQs" items={faqs} />
      <CTA />
    </>
  )
}
