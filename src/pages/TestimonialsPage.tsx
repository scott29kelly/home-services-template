import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import Hero from '../components/sections/Hero'
import CTA from '../components/sections/CTA'
import { useScrollReveal } from '../hooks/useScrollReveal'
import PageMeta from '../components/ui/PageMeta'
import { testimonials } from '../config/testimonials'
import { getIcon } from '../lib/icons'

export default function TestimonialsPage() {
  const { ref: badgeRef, isInView: badgeInView } = useScrollReveal()
  const { ref: gridRef, isInView: gridInView } = useScrollReveal()

  return (
    <>
      <PageMeta title="Customer Testimonials" description="Read reviews from homeowners across the region. 4.9 star rating, 500+ homes protected." path="/testimonials" />
      <Hero
        backgroundImage="/images/testimonials-hero.webp"
        headline="What Our"
        highlightText="Customers Say"
        subhead="Don't just take our word for it – see why homeowners across the region trust us with their homes."
        compact
      />

      {/* Rating Badges */}
      <section className="py-10 border-b border-border" ref={badgeRef}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {testimonials.ratingBadges.map((badge, i) => {
              const Icon = getIcon(badge.icon)
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={badgeInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="text-center"
                >
                  <Icon className="w-8 h-8 text-brand-blue mx-auto mb-2" />
                  <p className="font-bold text-navy text-sm">{badge.label}</p>
                  <p className="text-xs text-text-secondary">{badge.sublabel}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Grid */}
      <section className="py-20 lg:py-28" ref={gridRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testimonials.all.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={gridInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.1 + i * 0.05 }}
                className="bg-white rounded-2xl border border-border p-6"
              >
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={t.image}
                    alt={t.name}
                    className="w-12 h-12 rounded-full object-cover"
                    loading="lazy"
                  />
                  <div>
                    <p className="font-semibold text-navy">{t.name}</p>
                    <p className="text-xs text-text-secondary">
                      {t.location} &bull; {t.service}
                    </p>
                  </div>
                </div>
                <div className="flex gap-0.5 mb-3">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-safety-orange text-safety-orange" />
                  ))}
                </div>
                <p className="text-text-secondary text-sm leading-relaxed">"{t.quote}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <CTA />
    </>
  )
}
