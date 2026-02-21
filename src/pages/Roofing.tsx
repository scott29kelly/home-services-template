import { motion } from 'framer-motion'
import { Shield, CheckCircle } from 'lucide-react'
import Hero from '../components/sections/Hero'
import FAQ from '../components/sections/FAQ'
import CTA from '../components/sections/CTA'
import { useScrollReveal } from '../hooks/useScrollReveal'
import PageMeta from '../components/ui/PageMeta'

const services = [
  {
    title: 'Roof Replacement',
    image: '/images/roof-replacement.webp',
    description:
      "Complete tear-off and replacement using premium architectural shingles. We don't layer over old roofs – we do it right.",
    features: [
      'Full tear-off and inspection',
      'Premium underlayment',
      'Architectural shingles',
      '50-year warranties available',
    ],
  },
  {
    title: 'Roof Repairs',
    image: '/images/roof-repair.webp',
    description:
      "Fast, reliable repairs for leaks, missing shingles, flashing issues, and storm damage. We'll identify and fix the problem.",
    features: [
      'Leak detection & repair',
      'Shingle replacement',
      'Flashing repairs',
      'Emergency services',
    ],
  },
  {
    title: 'Roof Inspections',
    image: '/images/roof-inspection.webp',
    description:
      "Comprehensive inspections to assess your roof's condition. Perfect after storms or before buying/selling a home.",
    features: [
      'Free storm damage inspections',
      'Detailed condition reports',
      'Photo documentation',
      'Insurance claim support',
    ],
  },
]

const materials = [
  {
    title: 'Asphalt Shingles',
    description:
      'The most popular choice for homeowners. Durable, affordable, and available in many styles and colors.',
    items: [
      '3-tab shingles',
      'Architectural/dimensional shingles',
      'Designer shingles',
      'Impact-resistant options',
    ],
  },
  {
    title: 'Our Partner Brands',
    description: "We're certified installers for the industry's best manufacturers:",
    items: [
      "GAF – America's #1 shingle brand",
      'CertainTeed – Premium quality',
      'Atlas – Innovation leaders',
      'Owens Corning – Trusted performance',
    ],
  },
]

const faqs = [
  {
    question: 'How long does a roof replacement take?',
    answer:
      "Most residential roof replacements are completed in 1-3 days, depending on the size of your home and weather conditions. We work efficiently while maintaining our quality standards.",
  },
  {
    question: 'What warranty do you offer?',
    answer:
      'We offer comprehensive warranties that include both manufacturer warranties (up to 50 years on materials) and our own workmanship warranty. As certified installers, we can offer enhanced warranty options.',
  },
  {
    question: 'Will insurance cover my roof replacement?',
    answer:
      "If your roof has storm damage, your homeowner's insurance may cover the replacement. We specialize in helping homeowners navigate the insurance claims process and will work directly with your adjuster.",
  },
  {
    question: 'How do I know if I need a new roof?',
    answer:
      "Signs you may need a new roof include: shingles that are curling, cracking, or missing; granules in your gutters; daylight visible through the roof boards; sagging roof deck; or a roof that's 20+ years old. Schedule a free inspection and we'll give you an honest assessment.",
  },
]

export default function Roofing() {
  const { ref: servicesRef, isInView: servicesInView } = useScrollReveal()
  const { ref: materialsRef, isInView: materialsInView } = useScrollReveal()

  return (
    <>
      <PageMeta title="Roofing Services" description="Professional roof replacement, repairs, and maintenance. Certified installers with manufacturer warranties. Free inspections." path="/roofing" />
      <Hero
        backgroundImage="/images/hero-roofing.webp"
        headline="Professional"
        highlightText="Roofing Services"
        subhead="Expert roof replacement, repairs, and maintenance backed by industry-leading warranties and certified installation."
        compact
      />

      {/* Certification Bar */}
      <div className="bg-surface border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-center gap-8 flex-wrap">
            {['Licensed & Insured', 'Manufacturer Certified', 'A+ BBB Rated'].map(
              (cert) => (
                <div key={cert} className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-brand-blue" />
                  <span className="text-sm font-medium text-navy/70">{cert}</span>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Services */}
      <section className="py-20 lg:py-28" ref={servicesRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={servicesInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-navy mb-4"
            >
              Our Roofing Services
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={servicesInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-lg text-text-secondary max-w-2xl mx-auto"
            >
              From minor repairs to complete roof replacements, we handle it all with precision and care.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {services.map((service, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={servicesInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.2 + i * 0.1 }}
                className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300"
              >
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-48 object-cover"
                  loading="lazy"
                />
                <div className="p-6">
                  <h3 className="text-xl font-bold text-navy mb-2">{service.title}</h3>
                  <p className="text-text-secondary text-sm mb-4">{service.description}</p>
                  <ul className="space-y-2">
                    {service.features.map((feature) => (
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

      {/* Materials */}
      <section className="py-20 lg:py-28 bg-surface" ref={materialsRef}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={materialsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="text-3xl sm:text-4xl font-extrabold text-navy mb-4"
            >
              Premium Roofing Materials
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={materialsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-lg text-text-secondary"
            >
              We only use top-tier materials from trusted manufacturers.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {materials.map((mat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={materialsInView ? { opacity: 1, y: 0 } : {}}
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

      <FAQ title="Roofing FAQs" items={faqs} />
      <CTA />
    </>
  )
}
