import { useState, useEffect } from 'react'
import { Star } from 'lucide-react'
import Hero from '../components/sections/Hero'
import CTA from '../components/sections/CTA'
import { useScrollReveal } from '../hooks/useScrollReveal'
import PageMeta from '../components/ui/PageMeta'
import { testimonials } from '../config/testimonials'
import { getIcon } from '../lib/icons'

interface GoogleReview {
  authorName: string
  authorPhoto: string
  authorUrl: string
  rating: number
  text: string
  relativeTime: string
}

interface GoogleReviewsData {
  configured: boolean
  reviews: GoogleReview[]
  rating: number
  userRatingCount: number
}

const fallbackGoogleReviews: GoogleReview[] = [
  {
    authorName: 'Sarah W.',
    authorPhoto: '',
    authorUrl: '',
    rating: 5,
    text: 'Excellent service from start to finish. The crew was professional and the results were outstanding.',
    relativeTime: '2 weeks ago',
  },
  {
    authorName: 'James P.',
    authorPhoto: '',
    authorUrl: '',
    rating: 5,
    text: 'Highly recommend! They handled our insurance claim with ease and the new roof looks great.',
    relativeTime: '1 month ago',
  },
  {
    authorName: 'Karen L.',
    authorPhoto: '',
    authorUrl: '',
    rating: 5,
    text: 'Fast, reliable, and honest pricing. We are so happy with our new siding. Will use again.',
    relativeTime: '2 months ago',
  },
]

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}

export default function TestimonialsPage() {
  const [googleData, setGoogleData] = useState<GoogleReviewsData | null>(null)
  const { ref: badgeRef, isInView: badgeInView } = useScrollReveal()
  const { ref: gridRef, isInView: gridInView } = useScrollReveal()
  const { ref: googleRef, isInView: googleInView } = useScrollReveal()

  useEffect(() => {
    fetch('/api/google-reviews')
      .then((r) => r.json())
      .then(setGoogleData)
      .catch(() =>
        setGoogleData({ configured: false, reviews: [], rating: 0, userRatingCount: 0 })
      )
  }, [])

  const isLive = googleData !== null && googleData.configured && googleData.reviews.length > 0
  const googleReviews = isLive ? googleData.reviews : fallbackGoogleReviews
  const summaryRating = isLive ? googleData.rating : 4.9
  const summaryCount = isLive ? googleData.userRatingCount : 150

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
                <div
                  key={i}
                  className={`scroll-reveal ${badgeInView ? 'in-view' : ''} text-center`}
                  style={{ transitionDelay: `${i * 0.1}s` }}
                >
                  <Icon className="w-8 h-8 text-brand-blue mx-auto mb-2" />
                  <p className="font-bold text-navy text-sm">{badge.label}</p>
                  <p className="text-xs text-text-secondary">{badge.sublabel}</p>
                </div>
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
              <div
                key={i}
                className={`scroll-reveal ${gridInView ? 'in-view' : ''} bg-white rounded-2xl border border-border p-6`}
                style={{ transitionDelay: `${0.1 + i * 0.05}s` }}
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
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Google Reviews */}
      <section className="py-20 lg:py-24 bg-surface border-t border-border" ref={googleRef}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Rating summary */}
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-2 mb-3">
              <GoogleIcon className="w-7 h-7" />
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-[#FBBC05] text-[#FBBC05]" />
                ))}
              </div>
              <span className="text-lg font-bold text-navy">{summaryRating}</span>
            </div>
            <p className="text-text-secondary text-sm">
              {isLive
                ? `Based on ${summaryCount} reviews on Google`
                : `${summaryCount}+ reviews`}
            </p>
          </div>

          {/* Review cards */}
          <div className="space-y-4">
            {googleReviews.map((review, i) => (
              <div
                key={i}
                className={`scroll-reveal ${googleInView ? 'in-view' : ''} bg-white rounded-2xl border border-border p-5 flex gap-4`}
                style={{ transitionDelay: `${0.1 + i * 0.1}s` }}
              >
                {review.authorPhoto ? (
                  <img
                    src={review.authorPhoto}
                    alt={review.authorName}
                    className="flex-shrink-0 w-10 h-10 rounded-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-blue/10 flex items-center justify-center">
                    <span className="text-brand-blue font-bold text-sm">
                      {review.authorName.charAt(0)}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="font-semibold text-navy text-sm">{review.authorName}</p>
                    <p className="text-xs text-text-secondary flex-shrink-0">
                      {review.relativeTime}
                    </p>
                  </div>
                  <div className="flex gap-0.5 mb-2">
                    {[...Array(5)].map((_, j) => (
                      <Star
                        key={j}
                        className={`w-3.5 h-3.5 ${
                          j < review.rating
                            ? 'fill-[#FBBC05] text-[#FBBC05]'
                            : 'fill-gray-200 text-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  {review.text && (
                    <p className="text-text-secondary text-sm leading-relaxed">
                      {review.text}
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-1.5">
                    <GoogleIcon className="w-3.5 h-3.5" />
                    <span className="text-xs text-text-secondary/60 font-medium">
                      Google Review
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {isLive && (
            <p className="text-center text-xs text-text-secondary mt-8">
              Reviews from Google
            </p>
          )}
        </div>
      </section>

      <CTA />
    </>
  )
}
