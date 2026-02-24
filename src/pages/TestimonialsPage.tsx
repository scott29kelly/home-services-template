import { m } from 'framer-motion'
import { Star } from 'lucide-react'
import Hero from '../components/sections/Hero'
import CTA from '../components/sections/CTA'
import SectionHeading from '../components/ui/SectionHeading'
import { useScrollReveal } from '../hooks/useScrollReveal'
import PageMeta from '../components/ui/PageMeta'
import { testimonials } from '../config/testimonials'
import { getIcon } from '../lib/icons'

export default function TestimonialsPage() {
  const { ref: badgeRef, isInView: badgeInView } = useScrollReveal()
  const { ref: gridRef, isInView: gridInView } = useScrollReveal()
  const { ref: googleRef, isInView: googleInView } = useScrollReveal()

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
                <m.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={badgeInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="text-center"
                >
                  <Icon className="w-8 h-8 text-brand-blue mx-auto mb-2" />
                  <p className="font-bold text-navy text-sm">{badge.label}</p>
                  <p className="text-xs text-text-secondary">{badge.sublabel}</p>
                </m.div>
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
              <m.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={gridInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.1 + i * 0.05 }}
                className="bg-white rounded-2xl border border-border p-6"
              >
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={t.image}
                    alt={t.name}
                    width={48}
                    height={48}
                    loading="lazy"
                    decoding="async"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-navy">{t.name}</p>
                    <p className="text-xs text-text-secondary">
                      {t.location} &bull; {t.service}
                    </p>
                  </div>
                </div>
                <div className="flex gap-0.5 mb-3">
                  {[...Array(t.rating ?? 5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-safety-orange text-safety-orange" />
                  ))}
                </div>
                <p className="text-text-secondary text-sm leading-relaxed">"{t.quote}"</p>
              </m.div>
            ))}
          </div>
        </div>
      </section>

      {/* Google Reviews Placeholder */}
      <section className="py-20 lg:py-24 bg-surface border-t border-border" ref={googleRef}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <SectionHeading
            title="Google Reviews"
            subtitle="See what customers are saying about us on Google."
          />

          <div className="mt-10 space-y-4">
            {/* Sample placeholder review cards */}
            {[
              {
                name: 'Sarah W.',
                date: '2 weeks ago',
                stars: 5,
                text: 'Excellent service from start to finish. The crew was professional and the results were outstanding.',
              },
              {
                name: 'James P.',
                date: '1 month ago',
                stars: 5,
                text: 'Highly recommend! They handled our insurance claim with ease and the new roof looks great.',
              },
              {
                name: 'Karen L.',
                date: '2 months ago',
                stars: 5,
                text: 'Fast, reliable, and honest pricing. We are so happy with our new siding. Will use again.',
              },
            ].map((review, i) => (
              <m.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={googleInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.1 }}
                className="bg-white rounded-2xl border border-border p-5 flex gap-4"
              >
                {/* Avatar placeholder */}
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-blue/10 flex items-center justify-center">
                  <span className="text-brand-blue font-bold text-sm">{review.name[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="font-semibold text-navy text-sm">{review.name}</p>
                    <p className="text-xs text-text-secondary flex-shrink-0">{review.date}</p>
                  </div>
                  <div className="flex gap-0.5 mb-2">
                    {[...Array(review.stars)].map((_, j) => (
                      <Star key={j} className="w-3.5 h-3.5 fill-[#FBBC05] text-[#FBBC05]" />
                    ))}
                  </div>
                  <p className="text-text-secondary text-sm leading-relaxed">{review.text}</p>
                  {/* Google G badge */}
                  <p className="mt-2 text-xs text-text-secondary/60 font-medium">Google Review</p>
                </div>
              </m.div>
            ))}
          </div>

          {/* Setup instructions callout */}
          <div className="mt-8 rounded-2xl border-2 border-dashed border-brand-blue/30 bg-brand-blue/5 p-6 text-center">
            <p className="font-semibold text-navy mb-2">Replace this section with your Google Reviews widget.</p>
            <p className="text-sm text-text-secondary">
              See your template documentation for setup instructions. Options include the Google Places API widget,
              EmbedSocial, Elfsight, or a similar Google Reviews embed service.
            </p>
          </div>
        </div>
      </section>

      <CTA />
    </>
  )
}
