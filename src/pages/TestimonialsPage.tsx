import { useEffect, useState } from 'react'
import { Star } from 'lucide-react'
import Hero from '../components/sections/Hero'
import CTA from '../components/sections/CTA'
import TestimonialCard from '../components/ui/TestimonialCard'
import { useScrollReveal } from '../hooks/useScrollReveal'
import PageMeta from '../components/ui/PageMeta'
import { company } from '../config/company'
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

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
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
      .then((response) => response.json())
      .then(setGoogleData)
      .catch(() =>
        setGoogleData({ configured: false, reviews: [], rating: 0, userRatingCount: 0 }),
      )
  }, [])

  const isGoogleLive = Boolean(
    googleData && googleData.configured && googleData.reviews.length > 0,
  )
  const summaryRating = isGoogleLive ? googleData?.rating ?? 0 : company.proof.averageRating
  const summaryCount = isGoogleLive
    ? googleData?.userRatingCount ?? 0
    : company.proof.reviewCount

  return (
    <>
      <PageMeta
        title="Customer Testimonials"
        description={`Read reviews from homeowners across the region. ${company.proof.averageRating.toFixed(1)} average rating and ${company.proof.reviewCount}+ homeowner reviews.`}
        path="/testimonials"
      />
      <Hero
        backgroundImage="/images/testimonials-hero.webp"
        headline="What Our"
        highlightText="Customers Say"
        subhead="Read grounded homeowner feedback backed by real projects, warranty coverage, and documented claim support."
        compact
      />

      <section className="border-b border-border py-10" ref={badgeRef}>
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {testimonials.ratingBadges.map((badge, index) => {
              const Icon = getIcon(badge.icon)
              return (
                <div
                  key={badge.label}
                  className={`scroll-reveal ${badgeInView ? 'in-view' : ''} text-center`}
                  style={{ transitionDelay: `${index * 0.1}s` }}
                >
                  <Icon className="mx-auto mb-2 h-8 w-8 text-brand-blue" />
                  <p className="text-sm font-bold text-navy">{badge.label}</p>
                  <p className="text-xs text-text-secondary">{badge.sublabel}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28" ref={gridRef}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-10 text-center">
            <div className="mb-3 flex items-center justify-center gap-2">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} className="h-5 w-5 fill-safety-orange text-safety-orange" />
                ))}
              </div>
              <span className="text-lg font-bold text-navy">{summaryRating.toFixed(1)}</span>
            </div>
            <p className="text-sm text-text-secondary">
              {isGoogleLive
                ? `${summaryCount} live Google reviews plus post-install follow-up feedback.`
                : `${summaryCount}+ homeowner reviews, follow-up surveys, and post-install check-ins.`}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {testimonials.all.map((testimonial, index) => (
              <div
                key={`${testimonial.name}-${testimonial.location}`}
                className={`scroll-reveal ${gridInView ? 'in-view' : ''}`}
                style={{ transitionDelay: `${0.1 + index * 0.05}s` }}
              >
                <TestimonialCard testimonial={testimonial} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {isGoogleLive && googleData && (
        <section className="border-t border-border bg-surface py-20 lg:py-24" ref={googleRef}>
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <div className="mb-10 text-center">
              <div className="mb-3 flex items-center justify-center gap-2">
                <GoogleIcon className="h-7 w-7" />
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} className="h-5 w-5 fill-[#FBBC05] text-[#FBBC05]" />
                  ))}
                </div>
                <span className="text-lg font-bold text-navy">
                  {googleData.rating.toFixed(1)}
                </span>
              </div>
              <p className="text-sm text-text-secondary">
                Live Google Business Profile reviews from {googleData.userRatingCount} customers.
              </p>
            </div>

            <div className="space-y-4">
              {googleData.reviews.map((review, index) => (
                <div
                  key={`${review.authorName}-${index}`}
                  className={`scroll-reveal ${googleInView ? 'in-view' : ''} flex gap-4 rounded-2xl border border-border bg-white p-5`}
                  style={{ transitionDelay: `${0.1 + index * 0.1}s` }}
                >
                  {review.authorPhoto ? (
                    <img
                      src={review.authorPhoto}
                      alt={review.authorName}
                      className="h-10 w-10 shrink-0 rounded-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-blue/10">
                      <span className="text-sm font-bold text-brand-blue">
                        {review.authorName.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center justify-between gap-2">
                      {review.authorUrl ? (
                        <a
                          href={review.authorUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-semibold text-navy hover:text-brand-blue"
                        >
                          {review.authorName}
                        </a>
                      ) : (
                        <p className="text-sm font-semibold text-navy">{review.authorName}</p>
                      )}
                      <p className="shrink-0 text-xs text-text-secondary">{review.relativeTime}</p>
                    </div>
                    <div className="mb-2 flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, starIndex) => (
                        <Star
                          key={starIndex}
                          className={`h-3.5 w-3.5 ${
                            starIndex < review.rating
                              ? 'fill-[#FBBC05] text-[#FBBC05]'
                              : 'fill-gray-200 text-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    {review.text && (
                      <p className="text-sm leading-relaxed text-text-secondary">{review.text}</p>
                    )}
                    <div className="mt-2 flex items-center gap-1.5">
                      <GoogleIcon className="h-3.5 w-3.5" />
                      <span className="text-xs font-medium text-text-secondary/70">
                        Google review
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <CTA />
    </>
  )
}
